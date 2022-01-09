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
      blur: 0,
      clip: true,
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

  on_blur(blur) {
    this.box.style.filter = 'blur(' + blur + 'px)';
  }

  on_clip(clip) {
    if (clip) {
      this.clipNode.style.overflow = 'hidden';
    } else {
      this.clipNode.style.overflow = 'visible';
    }
  }

  render() {
    super.render();

    this.clipNode = document.createElement('div');
    this.clipNode.className = 'vs-clipnode';
    this.node.appendChild(this.clipNode);

    this.box = document.createElement('div');
    this.box.className = 'vs-innerbox';
    this.clipNode.appendChild(this.box);

    return this.box;
  }
}

export default Box
