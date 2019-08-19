import channel from 'core/Channel';
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
      underline: false,
      align: 'center',
      verticalAlign: 'middle',
      wordBreak: 'normal',
      ...state,
    });

    this.addNumberState('size');
  }

  editable() {
    this.node.contentEditable = 'true';
    this.node.focus();
    this.node.addEventListener('keydown', this.keydown.bind(this));
    document.execCommand('selectAll', false, null);
  }

  keydown(event) {
    if (event.keyCode === 13 && event.shiftKey === false) {
      event.preventDefault();
      this.blur();
    }
  }

  blur() {
    this.node.contentEditable = 'false';
    this.node.blur();
    this.node.removeEventListener('keydown', this.keydown.bind(this));
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

  apply(style) {
    super.apply(style);

    switch(style) {
      case 'Smaller':
        this.size = parseInt(this.size) - 1;
        break;
      case 'Bigger':
        this.size = parseInt(this.size) + 1;
        break;
      case 'Bold':
        this.bold = !this.bold;
        break;
      case 'Italic':
        this.italic = !this.italic;
        break;
      case 'Underline':
        this.underline = !this.underline;
        break;
      default:
        return false;
    }
    return true;
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

  on_underline(underline) {
    if (underline) {
      this.node.style.textDecoration = 'underline';
    } else {
      this.node.style.textDecoration = 'none';
    }
  }

  on_align(align) {
    if (align == 'left') {
      this.node.style.textAlign = 'left';
      this.node.style.justifyContent = 'flex-start';
    } else if (align == 'right') {
      this.node.style.textAlign = 'right';
      this.node.style.justifyContent = 'flex-end';
    } else if (align == 'center') {
      this.node.style.textAlign = 'center';
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

  on_wordBreak(value) {
    this.node.style.wordBreak = value;
  }
}

export default TextBox
