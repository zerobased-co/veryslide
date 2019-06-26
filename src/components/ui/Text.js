import View from './View';

class Text extends View {
  constructor(state) {
    super({
      className: 'vs-text',
      title: 'Text',
    }.update(state));
  }

  on_title(text) {
    if (this.node != null) {
      this.node.innerHTML = this.title;
    }
  }

  render() {
    this.node = document.createElement('p');
    this.node.innerHTML = this.title;
    this.node.className = 'vs-text';
    return this.node;
  }
}

export default Text
