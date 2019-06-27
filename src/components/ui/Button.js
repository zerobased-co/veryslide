import View from './View.js';

class Button extends View {
  constructor(state) {
    super({
      className: 'vs-button',
      title: '',
    }.update(state));

    this.node.addEventListener('click', this.onClick);
  }

  onClick(/*event*/) {
    console.log('onClick', this);
  }

  on_title(text) {
    this.node.innerHTML = text;
  }
}

export default Button
