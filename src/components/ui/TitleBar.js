import View from './View';

class TitleBar extends View {
  constructor(state) {
    super({
      className: 'vs-titlebar',
      title: '',
      ...state,
    });
  }

  on_title(text) {
    this.node.innerHTML = text;
  }
}

export default TitleBar
