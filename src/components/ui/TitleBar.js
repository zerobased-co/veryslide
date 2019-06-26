import View from './View';

class TitleBar extends View {
  constructor(state) {
    super({
      className: 'vs-titlebar',
    }.update(state));
  }

  on_title(text) {
    if (this.node != null) {
      this.node.innerHTML = text;
    }
  }

  render() {
    super.render();
    this.node.innerHTML = this.title;
    return this.node;
  }
}

export default TitleBar
