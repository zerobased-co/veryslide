import './TextBox.scss';
import Box from './Box';

class TextBox extends Box {
  constructor(state) {
    super({
      name: 'TextBox',
      class: 'vs-textbox',
      text: 'Text',
      textColor: '#ffffff',
      size: 14,
      bold: false,
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

  on_size(text) {
    this.node.style.fontSize = this.size + 'px';
  }

  on_text(text) {
    this.node.innerText = this.text;
  }

  on_textColor(color) {
    this.node.style.color = this.textColor;
  }

  on_bold(bold) {
    if (bold) {
      this.node.style.fontWeight = 700;
    } else {
      this.node.style.fontWeight = 400;
    }
  }
}

export default TextBox
