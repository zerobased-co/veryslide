import './TextBox.scss';
import Box from './Box';

class TextBox extends Box {
  constructor(state) {
    super({
      type: 'TextBox',
      className: 'vs-textbox',
      fontFamily: 'sans-serif',
      text: 'Text',
      textColor: '#FFFFFF',
      size: 14,
      bold: false,
      italic: false,
      align: 'center',
      verticalAlign: 'middle',
      ...state,
    });
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

  on_fontFamily(font) {
    this.node.style.fontFamily = font;
  }

  on_size(size) {
    this.node.style.fontSize = size + 'px';
  }

  on_text(text) {
    this.node.innerText = text;
  }

  on_textColor(color) {
    this.node.style.color = color;
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
