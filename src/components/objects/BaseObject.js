import State from '../../core/State.js';
import './BaseObject.scss';

class Node extends State {
  constructor(state) {
    super({
      type: 'Node',
      className: 'vs-node',
      content: '',
    }.update(state));

    this.node = this.render();
    this.updateState();
  }

  on_className(className) {
    this.node.className = className;
  }
  
  render() {
    let node = document.createElement('div');
    return node;
  }
}

class BaseObject extends Node {
  constructor(state) {
    super({
      type: 'BaseObject',
      className: 'vs-object',
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      color: '#FFFFFF',
      order: 0,
    }.update(state));

    this.page = null;
  }

  contain(x, y) {
    return (x >= this.x) && (x < this.x + this.width) && (y >= this.y) && (y < this.y + this.height);
  }

  clear() {
    this.content = '';
  }

  record() {
    this.content = this.node.innerHTML;
  }

  on_content(content) {
    this.node.innerHTML = content;
  }

  on() {
    if (this.page != null) {
      this.page.invalidate = true;
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
}

export default BaseObject
