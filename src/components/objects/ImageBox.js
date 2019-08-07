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
    this.imageNode.src = url;
  }
  
  render() {
    let node = super.render();
    this.imageNode = document.createElement('img');
    node.append(this.imageNode);
    return node;
  }
}

export default ImageBox
