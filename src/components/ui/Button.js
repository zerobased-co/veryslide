import View from './View.js';

class Button extends View {
  constructor(state) {
    super({
      className: 'vs-button',
      title: '',
      ...state,
    });

    this.addEventListener('click', this.click);
  }

  click(event) {
    if (this.enabled) {
      return this.onClick(event);
    }
  }

  onClick(/*event*/) {
    console.log('onClick', this);
  }

  on_title(text) {
    this.node.innerHTML = text;
  }
}

export default Button
