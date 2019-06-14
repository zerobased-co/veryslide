import './ImageList.less';
import Box from './Box';

class ImageList extends Box {
  constructor() {
    super();
    this.name = 'ImageList';
  }

  render() {
    super.render();
    this.node.classList.add('vs-imagelist');
    return this.node;
  }
}

export default ImageList
