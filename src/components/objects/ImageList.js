import './ImageList.less';
import Box from './Box';

class ImageList extends Box {
  constructor(state) {
    super({
      name: 'ImageList',
      class: 'vs-object vs-imagelist',
    }.update(state));
  }
}

export default ImageList
