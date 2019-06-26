import './TextBox.less';
import Box from './Box';

class TextBox extends Box {
  constructor(state) {
    super({
      name: 'TextBox',
      class: 'vs-object vs-textbox',
      text: 'Text',
      textColor: '#ffffff',
    }.update(state));
  }

  on_text(text) {
    this.node.innerText = this.text;
  }

  on_textColor(color) {
    this.node.style.color = this.textColor;
  }
}

export default TextBox
