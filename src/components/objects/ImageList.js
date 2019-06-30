import './ImageList.scss';
import Box from './Box';
import { randomInt } from '../../core/Util';

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
    }.update(state));
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

    this.node.innerHTML = '';

    var item_count = randomInt(10, 100);
    var item_start = randomInt(0, this.items.length - item_count);

    for(var i = item_start; i < item_start + item_count; i++) {
      var item = this.items[i];

      let node = document.createElement('a');
      node.className = 'aligner';
      node.href = item['Homepage'];
      node.style.margin = this.itemMargin + 'px';

      let img = document.createElement('img');
      img.src = 'static/logo/' + item['UID'] + '.png';
      img.style.maxHeight = this.itemMaxHeight + 'px';
      img.style.maxWidth = this.itemMaxWidth + 'px';
      node.appendChild(img);

      this.node.appendChild(node);
    }
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
