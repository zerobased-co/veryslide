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
      path: '',
      ...state,
    });
  }

  on_src(url) {
    if (url === '') return;

    this.imageNode.src = url;

    if (url.startsWith("http")) {
      this.loading(true);
      this.imageNode.onload = () => {
        this.loading(false);
      };
    }
  }

  resetSize() {
    this.width = this.imageNode.naturalWidth;
    this.height = this.imageNode.naturalHeight;
  }

  resetRatio() {
    if (this.imageNode.naturalWidth > this.imageNode.naturalHeight) {
      this.height = parseInt(this.imageNode.naturalHeight * (this.width / this.imageNode.naturalWidth));
    } else {
      this.width = parseInt(this.imageNode.naturalWidth * (this.height / this.imageNode.naturalHeight));
    }
  }

  render() {
    let node = super.render();
    this.imageNode = document.createElement('img');
    //this.imageNode.setAttribute('crossOrigin', 'anonymous');
    node.append(this.imageNode);
    return node;
  }
}

export default ImageBox
