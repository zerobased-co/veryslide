import './ImageList.scss';
import Box from './Box';

class ImageList extends Box {
  constructor(state) {
    super({
      type: 'ImageList',
      className: 'vs-imagelist',
      color: '#FFFFFF',
      borderStyle: 'solid',

      itemDirection: 'row',
      itemAlign: 'space-between',

      itemMaxWidth: 80,
      itemMaxHeight: 40,
      itemMargin: 5,
    }.update(state));
  }

  shuffle() {
    var children = this.node.childNodes;
    var frag = document.createDocumentFragment();
    while (children.length) {
      frag.appendChild(children[Math.floor(Math.random() * children.length)]);
    }
    this.node.appendChild(frag);
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
      item.style.maxWidth = width + 'px';
    });
  }

  on_itemMaxHeight(height) {
    var children = Array.from(this.node.childNodes);
    children.forEach(function(item){
      item.style.maxHeight = height + 'px';
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
