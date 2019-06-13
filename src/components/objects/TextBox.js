import Box from './Box';

class TextBox extends Box {
  constructor() {
    super();
    this.name = 'TextBox';
    this.text = 'Text';
    this.textColor = '#ffffff';
  }

  setText(text) {
    this.text = text;
    this.node.innerText = this.text;
  }

  setTextColor(color) {
    this.textColor = color;
    this.node.style.color = this.textColor;
  }

  render() {
    super.render();
    this.node.classList.add('vs-textbox');
    this.node.innerText = this.text;
    this.node.style.color = this.textColor;
    return this.node;
  }
}

export default TextBox
