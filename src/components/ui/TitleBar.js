import Window from './Window';

class TitleBar extends Window {
  constructor(...args) {
    super(...args);
    this.title = '';
  }

  setTitle(title) {
    super.setTitle(title);
    if (this.node != null) {
      this.node.innerText = title;
    }
  }

  render() {
    super.render();
    this.node.className = 'vs-titlebar';
    this.node.innerText = this.title;
    return this.node;
  }
}

export default TitleBar
