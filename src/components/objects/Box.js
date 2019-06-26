import './Box.scss';
import BaseObject from './BaseObject';
import { randomColor, randomInt } from '../../core/Util';

class Box extends BaseObject {
  constructor(state) {
    super({
      name: 'Box',
      class: 'vs-box',
      width: randomInt(100, 300),
      height: randomInt(100, 300),
      color: randomColor(),
    }.update(state));
  }
}

export default Box
