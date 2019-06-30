import './ImageBox.scss';
import channel from '../../core/Channel';
import BaseObject from './BaseObject';

class ImageBox extends BaseObject {
  constructor(state) {
    super({
      type: 'ImageBox',
      className: 'vs-imagebox',
      width: 100,
      height: 100,
      file: null,
    }.update(state));
  }

  on_file(file) {
    if (file == null) return;

    console.log(file);

    var reader = new FileReader();
    let img = document.createElement('img');
    this.node.append(img);

    reader.addEventListener("load", () => {
      var image = new Image();
      image.src = reader.result;
      image.onload =  () => {
        this.width = image.width;
        this.height = image.height;
        channel.send('Handler:connect', this);
        
        // clear
        this.file = null;
        this.record();
      }
      img.src = reader.result;
    }, false);

    reader.readAsDataURL(file);
  }
}

export default ImageBox
