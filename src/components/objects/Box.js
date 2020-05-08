import './Box.scss';
import BaseObject from './BaseObject';
import { randomColor, randomInt } from 'core/Util';

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
      borderRadius: 0,
      padding: 5,
      ...state,
    });

    this.addNumberState('borderWidth', 'borderRadius', 'padding');
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

  on_borderRadius(radius) {
    this.node.style.borderRadius = radius + 'px';
  }

  on_padding(padding) {
    this.node.style.padding = padding + 'px';
  }
}

export default Box
