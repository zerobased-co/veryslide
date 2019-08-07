import './ImageList.scss';
import Box from './Box';
import { randomInt } from '../../core/Util';

function isValidItem(item, filter) {
  let valid = true;
  filter.forEach((f) => {
    switch(f['operator']) {
      case '=':
        if (!(f['value'] == item[f['field']])) {
          valid = false;
        }
        break;
      case '!=':
        if (!(f['value'] != item[f['field']])) {
          valid = false;
        }
        break;
      case '>':
        if (!(f['value'] > item[f['field']])) {
          valid = false;
        }
        break;
      case '>=':
        if (!(f['value'] >= item[f['field']])) {
          valid = false;
        }
        break;
      case '<':
        if (!(f['value'] < item[f['field']])) {
          valid = false;
        }
        break;
      case '<=':
        if (!(f['value'] <= item[f['field']])) {
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

      fields: [],
      filter: [],

      items: [],
      selectedItems: [],

      itemDirection: 'row',
      itemAlign: 'space-between',

      itemMaxWidth: 80,
      itemMaxHeight: 40,
      itemMargin: 5,

      ...state,
    });
  }

  deserialize(data) {
    super.deserialize(data);
    this.apply();
  }

  clear() {
    super.clear();
    this.selectedItems = [];
    this.filter = [];
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
    this.loading(true);
    console.log(this.filter);

    this.node.innerHTML = '';
    for(var i = 0; i < this.items.length; i++) {
      var item = this.items[i];
      if (!isValidItem(item, this.filter)) continue;

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
    this.loading(false);
    this.record();
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
