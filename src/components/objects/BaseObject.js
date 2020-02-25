import Node from '/core/Node';
import { uuid } from 'core/Util';
import global from 'core/Global';
import './BaseObject.scss';
import Handler from '../Handler';

class OverflowMarker extends Node {
  constructor(state) {
    super({
      className: 'vs-overflow-marker vs-hidden',
      object: null,
      ...state,
    });
    this.addEventListener('mousedown', this.onMouseDown);
  }

  onMouseDown = (event) => {
    if (this.object) {
      event.stopPropagation();
      event.preventDefault();

      if (event.detail >= 2) {
        // Match size not to be overflowed
        this.object.solve_overflow();
      } else {
        this.send('Controller:select', this.object);
        this.object.handler.mousedown(event, true, 5); // pass event to south dot
      }
    }
  }

  render() {
    this.node = super.render();
    this.node.innerHTML = '&#43;'
    this.node.setAttribute('data-render-ignore', 'true');
    return this.node;
  }
}

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
    this.overflowed = false;

    // for supporting legacy objects (before Oct 2019)
    if (typeof this.uuid === 'undefined') {
      console.log('No uuid found.');
      this.uuid = uuid();
    }
  }

  select(selected) {
    super.select(selected);
    // Page does not support handler
    if (this.type == 'Page') return;

    if (selected !== false) {
      if (this.handler === null) {
        this.handler = new Handler({ object: this });
      }
    } else {
      if (this.handler) this.handler.destroy();
      this.handler = null;
    }
  }

  contain(x, y) {
    return this.overlap(x, y, 0, 0);
  }

  overlap(x, y, w, h) {
    return (
         (this.x <= x + w)
      && (this.y <= y + h)
      && (this.x + this.width > x)
      && (this.y + this.height > y)
    );
  }

  destroy() {
    super.destroy();
    if (this.handler) this.handler.destroy();
  }

  on(key, value) {
    if (this.page != null) {
      this.page.invalidate = true;
    } else if (this.state.type == 'Page') {
      if (key !== 'thumbnail') {
        this.invalidate = true;
      }
    }

    // check overflow
    const overflowing = this.is_overflowed();

    if (overflowing !== this.overflowed) {
      if (overflowing) {
        this.overflow_marker.classList.add('overflowed');
      } else {
        this.overflow_marker.classList.remove('overflowed');
      }
      this.overflowed = overflowing;
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

  is_overflowed() {
    return false;
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

  render() {
    this.node = super.render();
    if (global.debug) {
      let debugNode = document.createElement('div');
      debugNode.className = 'vs-debug';
      debugNode.innerHTML = this.uuid;
      this.node.appendChild(debugNode);
    }

    // add overflow marker
    this.overflow_marker = document.createElement('div');
    this.overflow_marker.className = 'vs-overflow-marker';
    this.overflow_marker.innerHTML = '&#43;'
    this.overflow_marker.setAttribute('data-render-ignore', 'true');
    this.node.appendChild(this.overflow_marker);
    return this.node;
  }
}

export default BaseObject
