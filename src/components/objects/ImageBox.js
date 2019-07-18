import './ImageBox.scss';
import BaseObject from './BaseObject';

class ImageBox extends BaseObject {
  constructor(state) {
    super({
      type: 'ImageBox',
      className: 'vs-imagebox',
      width: 100,
      height: 100,
      src: '',
      ...state,
    });
  }

  on_src(url) {
    this.node.src = url;
  }
  
  render() {
    let node = document.createElement('img');
    return node;
  }
}

export default ImageBox
