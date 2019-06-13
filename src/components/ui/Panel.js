import Window from './Window';

class Panel extends Window {
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
    this.node.appendChild(document.createTextNode("Panel"));
    return this.node;
  }
}

export default Panel
