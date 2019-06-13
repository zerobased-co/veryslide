import Window from './Window.js';

class Button extends Window {
  render() {
    super.render();
    this.node.className = 'vs-button';
    this.node.innerHTML = this.title;
    this.node.addEventListener('click', this.onClick.bind(this));
    return this.node;
  }

  setTitle(text) {
    super.setTitle(text);
    if (this.node != null) {
      this.node.innerHTML = text;
    }
  }

  onClick(event) {
  }
}

export default Button
