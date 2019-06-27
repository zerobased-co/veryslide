import State from '../../core/State.js';
import List from '../../core/List.js';

class View extends State {
  constructor(state) {
    super({
      className: 'vs-view',
      node: null,
      parent: null,
      children: new List(),
    }.update(state));

    this.node = null;
    if (this.parent != null) {
      this.parent.children.append(this);
    }
  }

  destruct() {
    this.node.parentNode.removeChild(this.node);
  }

  _node() {
    if (this.state['node'] == null) {
      this.node = this.render();
    }
    return this.state['node'];
  }

  render() {
    // Remove previous node
    if (this.state['node'] != null) {
      this.state['node'].parentNode.removeChild(this.state['node']);
      this.state['node'] = null;
    }

    this.node = document.createElement('div');
    this.node.className = this.className;

    this.children.iter((child) => {
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
  render() {
    super.render();
    this.node.className = 'vs-horizon';
    return this.node;
  }
}

class Vertical extends View {
  render() {
    super.render();
    this.node.className = 'vs-vertical';
    return this.node;
  }
}

export { View as default, Horizon, Vertical }
