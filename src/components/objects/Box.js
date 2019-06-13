import BaseObject from './BaseObject';
import { randomColor, randomInt } from '../../core/Util';

class Box extends BaseObject {
  constructor() {
    super();
    this.width = randomInt(100, 300);
    this.height = randomInt(100, 300);
    this.color = randomColor();
    this.name = 'Shape';
  }

  render() {
    super.render();
    return this.node;
  }
}

export default Box
