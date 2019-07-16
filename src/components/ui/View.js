import State from '../../core/State.js';
import List from '../../core/List.js';

class View extends State {
  constructor(state) {
    super({
      className: 'vs-view',
      parent: null,
      children: [],
      ...state,
    });

    if (this.parent != null) {
      this.parent.children.push(this);
    }

    this.render();
    this.updateState();
  }

  destroy() {
    super.destroy();

    if (this.children.length > 0) {
      this.children.forEach(child => {
        child.destroy();
      });
    }

    if (this.node != null) {
      if (this.node.parentNode != null) {
        this.node.parentNode.removeChild(this.node);
      }
      this.node = null;
    }
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = this.className;

    this.children.forEach((child) => {
      this.appendChild(child);
    });

    return this.node;
  }

  appendChild(child) {
    // TODO: only View can be added as child
    // TODO: add children at once
    if (child.hasOwnProperty('children') && child.hasOwnProperty('state')) {
      child.parent = this;
      this.children.push(child);
      this.node.appendChild(child.node);
    } else {
      this.node.appendChild(child);
    }
  }
}

class Horizon extends View {
  constructor(state) {
    super({
      className: 'vs-horizon',
      ...state,
    });
  }
}

class Vertical extends View {
  constructor(state) {
    super({
      className: 'vs-vertical',
      ...state,
    });
  }
}

export { View as default, Horizon, Vertical }
