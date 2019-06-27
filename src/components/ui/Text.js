import View from './View';

class Text extends View {
  constructor(state) {
    super({
      className: 'vs-text',
      title: 'Text',
    }.update(state));
  }

  on_title(text) {
    this.node.innerHTML = text;
  }
}

export default Text
