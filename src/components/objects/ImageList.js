import './ImageList.scss';
import { parse } from 'papaparse';
import Box from './Box';
import { randomInt, getValidUrl } from 'core/Util';
import ResizeObserver from 'resize-observer-polyfill';

function isValidItem(item, filter) {
  let valid = true;
  filter.forEach((f) => {
    let fv = f['value'];
    let ff = item[f['field']];

    // If value is a number, then convert them as numbers
    if (isNaN(f['value']) == false) {
      fv = Number(fv);
      ff = Number(ff);
    }

    switch(f['operator']) {
      case '=':
        if (!(ff == fv)) {
          valid = false;
        }
        break;
      case '!=':
        if (!(ff != fv)) {
          valid = false;
        }
        break;
      case '>':
        if (!(ff > fv)) {
          valid = false;
        }
        break;
      case '>=':
        if (!(ff >= fv)) {
          valid = false;
        }
        break;
      case '<':
        if (!(ff < fv)) {
          valid = false;
        }
        break;
      case '<=':
        if (!(ff <= fv)) {
          valid = false;
        }
        break;
    };
  });
  return valid;
}

class ImageList extends Box {
  constructor(state) {
    super({
      type: 'ImageList',
      className: 'vs-imagelist',
      color: '#FFFFFF',
      borderStyle: 'solid',
      asset: '',
      imageBase: '',
      uidColumn: 'UID',
      linkColumn: 'Homepage',

      filter: [],

      itemDirection: 'row',
      itemAlign: 'space-between',

      itemMaxWidth: 80,
      itemMaxHeight: 40,
      itemMargin: 5,

      ...state,
    });

    this.addNumberState('itemMaxWidth', 'itemMaxHeight', 'itemMargin');
    this.items = [];
    this.fields = [];
    this.selectedItems = [];
    this.loadedCount = 0;
  }

  deserialize(data) {
    // remove duplicated filter items (this was a bug!)
    if (data.hasOwnProperty('filter')) {
      data['filter'] = data['filter'].filter((item, index, self) =>
        index === self.findIndex((t) => (
          t.field === item.field
        ))
      )
    }
    super.deserialize(data);

    // wait until asset is ready
    if (this.asset != '') {
      this.loading(true);
      this.__waitAssetAndApply();
    } else {
      this.apply();
    }
  }

  __waitAssetAndApply() {
    let asset = this.send('Controller:getAsset', this.asset)[0];
    if (asset == null || asset.data == '') {
      setTimeout(this.__waitAssetAndApply.bind(this), 500);
    } else {
      this.update();
      this.apply();
      this.loading(false);
    }
  }

  clear() {
    super.clear();
    this.clipNode.innerHTML = '';
    this.filter = [];
    this.selectedItems = [];
    this.loadedCount = 0;
  }

  render() {
    super.render();
    this.coverNode = document.createElement('div');
    this.coverNode.className = 'vs-covernode';
    this.coverNode.setAttribute('data-render-ignore', 'true');
    this.node.appendChild(this.coverNode);

    this.clipNode = document.createElement('div');
    this.clipNode.className = 'vs-clipnode';
    this.node.appendChild(this.clipNode);

    this.innerNode = document.createElement('div');
    this.innerNode.className = 'vs-imagelist-inner';
    this.clipNode.appendChild(this.innerNode);

    // Set observer and timer for overflow check
    this.observer = new ResizeObserver(this.check_overflow.bind(this));
    this.observer.observe(this.innerNode);
    this.observer.observe(this.clipNode);
    return this.node;
  }

  shuffle() {
    var children = this.innerNode.childNodes;
    var frag = document.createDocumentFragment();
    while (children.length) {
      frag.appendChild(children[Math.floor(Math.random() * children.length)]);
    }
    this.innerNode.appendChild(frag);
  }

  apply() {
    if (this.items.length == 0) return;
    if (this.filter.length == 0) return;

    this.innerNode.innerHTML = '';
    this.selectedItems = [];
    this.loadedCount = 0;
    this.page.invalidate = true;

    let imageBaseAsset = this.send('Controller:getAsset', this.imageBase)[0];
    if (imageBaseAsset == null) return;

    for(let i = 0; i < this.items.length; i++) {
      let item = this.items[i];
      if (isValidItem(item, this.filter)) {
        this.selectedItems.push(item);
      }
    }

    if (this.selectedItems.length > 0) {
      this.loading(true);
      // To prevent infinite loading
      setTimeout(() => {this.loading(false);}, 5000);
    }

    for(let i = 0; i < this.selectedItems.length; i++) {
      let item = this.selectedItems[i];
      let node = document.createElement('a');
      node.className = 'vs-aligner';
      node.href = getValidUrl(item[this.linkColumn]);
      node.target = '_blank';
      node.style.margin = this.itemMargin + 'px';

      let img = document.createElement('img');
      img.src = imageBaseAsset.url + item[this.uidColumn] + '.png';
      img.style.maxHeight = this.itemMaxHeight + 'px';
      img.style.maxWidth = this.itemMaxWidth + 'px';
      img.onload = () => {
        this.loaded();
      }

      node.appendChild(img);
      this.innerNode.appendChild(node);
    }

    this.record();
    this.check_overflow();
  }

  loaded() {
    this.loadedCount += 1;
    if (this.loadedCount >= this.selectedItems.length) {
      this.loading(false);
    }
    this.check_overflow();
  }

  update() {
    let asset = this.send('Controller:getAsset', this.asset)[0];
    // TBD: ???
    if (asset == null) return;

    let csv = asset.data;
    var results = parse(csv, {header: true});

    this.fields = results.meta.fields;
    this.items = results.data;
  }

  on_itemDirection(direction) {
    this.innerNode.style.flexDirection = direction;
  }

  on_itemAlign(align) {
    this.innerNode.style.justifyContent = align;
  }

  on_itemMaxWidth(width) {
    var children = Array.from(this.innerNode.getElementsByClassName('vs-aligner'));
    children.forEach(function(item){
      item.firstChild.style.maxWidth = width + 'px';
    });
  }

  on_itemMaxHeight(height) {
    var children = Array.from(this.innerNode.getElementsByClassName('vs-aligner'));
    children.forEach(function(item){
      item.firstChild.style.maxHeight = height + 'px';
    });
  }

  on_itemMargin(margin) {
    var children = Array.from(this.innerNode.getElementsByClassName('vs-aligner'));
    children.forEach(function(item){
      item.style.margin = margin + 'px';
    });
  }

  is_overflowed() {
    return (this.clipNode.clientWidth < this.innerNode.scrollWidth)
        || (this.clipNode.clientHeight < this.innerNode.scrollHeight);
  }

  solve_overflow() {
    if (this.clipNode.clientWidth < this.innerNode.scrollWidth) {
      this.width = this.innerNode.scrollWidth + this.padding * 2 + 2;
    }

    if (this.clipNode.clientHeight < this.innerNode.scrollHeight) {
      this.height = this.innerNode.scrollHeight + this.padding * 2 + 2;
    }
  }
}

export default ImageList
