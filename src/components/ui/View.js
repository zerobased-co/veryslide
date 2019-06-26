import State from '../../core/State.js';
import List from '../../core/List.js';

class View extends State {
  constructor(state) {
    super({
      className: 'vs-view',
      parent: null,
    }.update(state));

    this.node = null;
    this.children = new List();

    if (this.parent != null) {
      this.parent.children.append(this);
    }
  }

  destruct() {
    this.node.parentNode.removeChild(this.node);
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = this.className;

    this.children.iter((child) => {
      this.node.appendChild(child.render());
    });
    return this.node;
  }
}

class Horizon extends View {
  render() {
    super.render();
    this.node.classList.add('vs-horizon');
    return this.node;
  }
}

class Vertical extends View {
  render() {
    super.render();
    this.node.classList.add('vs-vertical');
    return this.node;
  }
}

export { View as default, Horizon, Vertical }
