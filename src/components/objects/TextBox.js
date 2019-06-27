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
      italic: false,
      align: 'center',
      verticalAlign: 'center',
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
    window.getSelection().removeAllRanges();

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

  on_italic(italic) {
    if (italic) {
      this.node.style.fontStyle = 'italic';
    } else {
      this.node.style.fontStyle = 'normal';
    }
  }

  on_align(align) {
    if (align == 'left') {
      this.node.style.justifyContent = 'flex-start';
    } else if (align == 'right') {
      this.node.style.justifyContent = 'flex-end';
    } else if (align == 'center') {
      this.node.style.justifyContent = 'center';
    }
  }

  on_verticalAlign(align) {
    if (align == 'top') {
      this.node.style.alignItems = 'flex-start';
    } else if (align == 'bottom') {
      this.node.style.alignItems = 'flex-end';
    } else if (align == 'middle') {
      this.node.style.alignItems = 'center';
    }
  }
}

export default TextBox
