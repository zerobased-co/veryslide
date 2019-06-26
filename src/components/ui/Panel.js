import View from './View';

class Panel extends View {
  constructor(...args) {
    super(...args);
    this.object = null;
  }

  setObject(object) {
    this.object = object;
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-panel';
    return this.node;
  }
}

export default Panel
