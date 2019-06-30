import State from '../../core/State.js';
import List from '../../core/List.js';

class View extends State {
  constructor(state) {
    super({
      className: 'vs-view',
      parent: null,
      children: [],
    }.update(state));

    if (this.parent != null) {
      this.parent.children.push(this);
    }

    this.render();
    this.updateState();
  }

  clear() {
    if (this.node != null) {
      if (this.node.parentNode != null) {
        this.node.parentNode.removeChild(this.node);
      }
      this.node = null;
    }
  }

  render() {
    this.clear();

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
    if (child.hasOwnProperty('state')) {
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
      className: 'vs-horizon'
    }.update(state));
  }
}

class Vertical extends View {
  constructor(state) {
    super({
      className: 'vs-vertical'
    }.update(state));
  }
}

export { View as default, Horizon, Vertical }
