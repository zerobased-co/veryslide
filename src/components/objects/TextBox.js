import './TextBox.scss';
import Box from './Box';

class TextBox extends Box {
  constructor(state) {
    super({
      name: 'TextBox',
      class: 'vs-textbox',
      text: 'Text',
      textColor: '#ffffff',
    }.update(state));
  }

  editable() {
    this.node.contentEditable = 'true';
    this.node.focus();
    document.execCommand('selectAll', false, null);
  }

  blur() {
    this.node.contentEditable = 'false';
    this.node.blur();

    // copy text from node
    this.text = this.node.innerText;
  }

  on_text(text) {
    this.node.innerText = this.text;
  }

  on_textColor(color) {
    this.node.style.color = this.textColor;
  }
}

export default TextBox
