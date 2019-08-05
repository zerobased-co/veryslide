import './ImageBox.scss';
import Box from './Box';

class ImageBox extends Box {
  constructor(state) {
    super({
      type: 'ImageBox',
      className: 'vs-imagebox',
      padding: 0,
      borderWidth: 0,
      width: 100,
      height: 100,
      color: '#00000000',
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
