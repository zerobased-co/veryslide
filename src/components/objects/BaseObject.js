import State from '../../core/State.js';
import './BaseObject.scss';

class Node extends State {
  constructor(state) {
    super({
      name: 'Node',
    }.update(state));

    this.node = document.createElement('div');
    this.updateNode();
  }

  on_class(className) {
    this.node.className = className;
  }

  updateNode() {
    for (const [key, value] of Object.entries(this.state)) {
      let func = this['on_' + key];
      if (func != null) {
        func.bind(this)(value);
      }
    }
  }
}

class BaseObject extends Node {
  constructor(state) {
    super({
      name: 'BaseObject',
      class: 'vs-object',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      color: '#ffffff',
      order: 0,
    }.update(state));

    this.content = null;
    this.page = null;
  }

  contain(x, y) {
    return (x >= this.x) && (x < this.x + this.width) && (y >= this.y) && (y < this.y + this.height);
  }

  record() {
    this.content = this.node.innerHTML;
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
    this.node.style.backgroundColor = this.color;
  }

  render() {
    if (this.content) {
      this.node.innerHTML = this.content;
    }
    return this.node;
  }
}

export default BaseObject
