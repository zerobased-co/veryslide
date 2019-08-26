import Node from '/core/Node';
import { uuid } from 'core/Util';
import './BaseObject.scss';
import Handler from '../Handler';

class BaseObject extends Node {
  constructor(state) {
    super({
      uuid: uuid(),
      type: 'BaseObject',
      className: 'vs-object',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      color: '#FFFFFF',
      order: 0,
      opacity: 1.0,
      ...state,
    });

    this.page = null;
    this.handler = null;
    this.addNumberState('x', 'y', 'width', 'height', 'order', 'opacity');
  }

  select(selected) {
    super.select(selected);

    // Page does not support handler
    if (this.type == 'Page') return;

    this.handler = new Handler({
      object: this,
    });

    this.page.node.appendChild(this.handler.node);
  }

  contain(x, y) {
    return (x >= this.x) && (x < this.x + this.width) && (y >= this.y) && (y < this.y + this.height);
  }

  on(key, value) {
    if (this.page != null) {
      this.page.invalidate = true;
    } else if (this.state.type == 'Page') {
      if (key !== 'thumbnail') {
        this.invalidate = true;
      }
    }
  }

  on_x(x) {
    this.node.style.left = x + 'px';
  }

  on_y(y) {
    this.node.style.top = y + 'px';
  }

  on_width(width) {
    this.node.style.width = width + 'px';
  }

  on_height(height) {
    this.node.style.height = height + 'px';
  }

  on_order(order) {
    this.node.style.zIndex = order;
  }

  on_color(color) {
    this.node.style.backgroundColor = color;
  }

  on_opacity(opacity) {
    this.node.style.opacity = opacity;
  }

  apply(style) {
    switch(style) {
      case 'Left':
        this.x = parseInt(this.x) - 1;
        break;
      case 'Right':
        this.x = parseInt(this.x) + 1;
        break;
      case 'Up':
        this.y = parseInt(this.y) - 1;
        break;
      case 'Down':
        this.y = parseInt(this.y) + 1;
        break;
      case 'BigLeft':
        this.x = parseInt(this.x) - 16;
        break;
      case 'BigRight':
        this.x = parseInt(this.x) + 16;
        break;
      case 'BigUp':
        this.y = parseInt(this.y) - 16;
        break;
      case 'BigDown':
        this.y = parseInt(this.y) + 16;
        break;
      default:
        return false;
    }
    return true;
  }
}

export default BaseObject
