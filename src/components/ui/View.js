import State from '../../core/State.js';
import List from '../../core/List.js';

class View extends State {
  constructor(state) {
    super({
      className: 'vs-view',
      parent: null,
      children: new List(),
    }.update(state));

    if (this.parent != null) {
      this.parent.children.append(this);
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

    this.children.iter((child) => {
      child.parent = this;
      this.node.appendChild(child.node);
    });

    return this.node;
  }

  appendChild(child) {
    // TODO: only View can be added as child
    // TODO: add children at once
    child.parent = this;
    this.children.append(child);
    this.node.appendChild(child.node);
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
