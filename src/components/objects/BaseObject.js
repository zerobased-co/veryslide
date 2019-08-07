import State from '../../core/State';
import { uuid } from '../../core/Util';
import './BaseObject.scss';

class Node extends State {
  constructor(state) {
    super({
      type: 'Node',
      className: 'vs-node',
      ...state,
    });

    this.content = '';
    this.node = this.render();
    this.updateState();
  }

  on_className(className) {
    this.node.className = className;
  }

  on_content(content) {
    if (content != '') {
      this.node.innerHTML = content;
    }
  }

  record() {
    this.content = this.node.innerHTML;
    if (this.page != null) {
      this.page.invalidate = true;
    }
  }

  clear() {
    this.content = '';
  }
  
  render() {
    let node = document.createElement('div');
    return node;
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
      ...state,
    });

    this.page = null;
  }

  contain(x, y) {
    return (x >= this.x) && (x < this.x + this.width) && (y >= this.y) && (y < this.y + this.height);
  }

  loading(isLoading) {
    if (this.loadingNode) {
      this.loadingNode.remove();
      this.loadingNode = null;
    }

    if (isLoading === true) {
      this.loadingNode = document.createElement('div');
      this.loadingNode.className = 'vs-loading';
      this.loadingNode.setAttribute('data-html2canvas-ignore', 'true');

      let icon = document.createElement('img');
      icon.src = '/static/icons/loading.svg';

      this.loadingNode.append(icon);
      this.node.append(this.loadingNode);
    }
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
}

export default BaseObject
