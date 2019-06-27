import './Box.scss';
import BaseObject from './BaseObject';
import { randomColor, randomInt } from '../../core/Util';

class Box extends BaseObject {
  constructor(state) {
    super({
      type: 'Box',
      className: 'vs-box',
      width: randomInt(100, 300),
      height: randomInt(100, 300),
      color: randomColor(),
      borderStyle: 'none',
      borderWidth: 1,
      borderColor: '#000000',
      padding: 10,
    }.update(state));
  }

  on_borderStyle(style) {
    this.node.style.borderStyle = style;
  }

  on_borderWidth(size) {
    this.node.style.borderWidth = size + 'px';
  }

  on_borderColor(color) {
    this.node.style.borderColor = color;
  }

  on_padding(padding) {
    this.node.style.padding = padding + 'px';
  }
}

export default Box
