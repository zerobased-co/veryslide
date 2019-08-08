import './ImageList.scss';
import { parse } from 'papaparse';
import channel from '../../core/Channel';
import Box from './Box';
import { randomInt } from '../../core/Util';

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

      filter: [],

      itemDirection: 'row',
      itemAlign: 'space-between',

      itemMaxWidth: 80,
      itemMaxHeight: 40,
      itemMargin: 5,

      ...state,
    });

    this.items = [];
    this.fields = [];
    this.selectedItems = [];
  }

  deserialize(data) {
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
    let asset = channel.send('Document:getAsset', this.asset)[0];
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
    this.node.innerHTML = '';
    this.filter = [];
    this.selectedItems = [];
  }

  shuffle() {
    var children = this.node.childNodes;
    var frag = document.createDocumentFragment();
    while (children.length) {
      frag.appendChild(children[Math.floor(Math.random() * children.length)]);
    }
    this.node.appendChild(frag);
  }

  apply() {
    if (this.items.length == 0) return;
    if (this.filter.length == 0) return;

    this.node.innerHTML = '';
    this.selectedItems = [];

    for(var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      if (!isValidItem(item, this.filter)) continue;

      this.selectedItems.push(item);

      let node = document.createElement('div');
      node.className = 'aligner';
      //node.href = item['Homepage'];
      node.style.margin = this.itemMargin + 'px';

      let img = document.createElement('img');
      img.src = '/static/logo/' + item['UID'] + '.png';
      img.style.maxHeight = this.itemMaxHeight + 'px';
      img.style.maxWidth = this.itemMaxWidth + 'px';
      node.appendChild(img);

      this.node.appendChild(node);
    }
    this.record();
  }

  update() {
    let asset = channel.send('Document:getAsset', this.asset)[0];
    // TBD: ???
    if (asset == null) return;

    let csv = asset.data;
    var results = parse(csv, {header: true});

    this.fields = results.meta.fields;
    this.items = results.data;
  }

  on_itemDirection(direction) {
    this.node.style.flexDirection = direction;
  }

  on_itemAlign(align) {
    this.node.style.justifyContent = align;
  }

  on_itemMaxWidth(width) {
    var children = Array.from(this.node.childNodes);
    children.forEach(function(item){
      item.firstChild.style.maxWidth = width + 'px';
    });
  }

  on_itemMaxHeight(height) {
    var children = Array.from(this.node.childNodes);
    children.forEach(function(item){
      item.firstChild.style.maxHeight = height + 'px';
    });
  }

  on_itemMargin(margin) {
    var children = Array.from(this.node.childNodes);
    children.forEach(function(item){
      item.style.margin = margin + 'px';
    });
  }
}

export default ImageList
