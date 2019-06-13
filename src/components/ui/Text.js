import Window from './Window';

class Text extends Window {
  constructor(...args) {
    super(...args);
  }

  render() {
    this.node = document.createElement('p');
    this.node.innerHTML = this.title;
    this.node.className = 'vs-text';
    return this.node;
  }
}

export default Text
