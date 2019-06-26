import './ImageList.scss';
import Box from './Box';

class ImageList extends Box {
  constructor(state) {
    super({
      name: 'ImageList',
      class: 'vs-imagelist',
    }.update(state));
  }
}

export default ImageList
