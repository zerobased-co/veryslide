import View from './View.js';

class Button extends View {
  constructor(state) {
    super({
      className: 'vs-button',
    }.update(state));
  }

  onClick(event) {
    console.log('onClick', this);
  }

  on_title(text) {
    if (this.node != null) {
      this.node.innerHTML = text;
    }
  }

  render() {
    super.render();
    this.node.innerHTML = this.title;
    this.node.addEventListener('click', this.onClick);
    return this.node;
  }
}

export default Button
