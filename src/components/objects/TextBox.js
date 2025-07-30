import './TextBox.scss';
import Box from './Box';
import global from '/core/Global';
import ResizeObserver from 'resize-observer-polyfill';
import { escapeHtml } from '/core/Util';

class TextBox extends Box {
  constructor(state) {
    super({
      type: 'TextBox',
      className: 'vs-textbox',
      fontFamily: 'sans-serif',
      text: 'Very',
      color: '#FFFFFF00',
      textColor: '#000000',
      size: 14,
      lineHeight: 1.4,
      bold: false,
      italic: false,
      underline: false,
      align: 'center',
      verticalAlign: 'middle',
      wordBreak: 'break-all',
      link: '',
      ...state,
    });

    this.addNumberState('size');
  }

  render() {
    super.render();
    this.textNode = document.createElement('div');
    this.textNode.className = 'vs-textnode';
    this.textNode.addEventListener('paste', function (e) {
      e.preventDefault();

      let text = '';
      if (e.clipboardData || e.originalEvent.clipboardData) {
        text = (e.originalEvent || e).clipboardData.getData('text/plain');
      } else if (window.clipboardData) {
        text = window.clipboardData.getData('Text');
      }

      if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
      } else {
        document.execCommand('paste', false, text);
      }
    });
    this.box.appendChild(this.textNode);

    // Set observers for overflow check
    this.observer = new ResizeObserver(this.check_overflow.bind(this));
    this.observer.observe(this.textNode);
    this.observer.observe(this.box);
    return this.node;
  }

  editable() {
    this.textNode.contentEditable = 'true';
    this.textNode.focus();

    this.addEventListener('keydown', this.keydown);
    this.addEventListener('mousedown', this.mousedown, document);
    document.execCommand('selectAll', false, null);

    // TBD: I don't want to use global state here
    global.editingObject = this;
  }

  keydown(event) {
    if (event.metaKey || event.ctrlKey) {
      switch(event.keyCode) {
        case 66: // Bold
        case 98:
        case 73: // Italic
        case 105:
        case 85: // Underline
        case 117:
          event.preventDefault();
          return false;
        case 13: // Enter
          event.preventDefault();
          this.blur();
          this.send('Controller:select', this);
          return false;
      }
    }
    return true;
  }

  mousedown(event) {
    if (event.target !== this.node && event.target !== this.textNode) {
      this.blur();
    }
  }

  blur() {
    this.textNode.contentEditable = 'false';
    this.textNode.blur();
    this.removeEventListener('keydown');
    this.removeEventListener('mousedown', document);
    window.getSelection().removeAllRanges();

    // copy text from node
    this.send('Controller:history', 'Before', [this]);
    this.text = this.textNode.innerText;
    this.send('Controller:history', 'After', [this]);
    this.send('Controller:history', 'Modify');
    // TBD: I don't want to use global state here
    global.editingObject = null;
  }

  on_fontFamily(font) {
    this.textNode.style.fontFamily = font;
  }

  on_size(size) {
    this.textNode.style.fontSize = size + 'px';
  }

  on_lineHeight(height) {
    this.textNode.style.lineHeight = height;
  }

  on_text(text) {
    this.updateText();
  }

  on_link(link) {
    this.updateText();
  }

  updateText() {
    const text = escapeHtml(this.text);
    if (this.link != '') {
      this.textNode.innerHTML = '<a href="' + this.link + '">' + text + '</a>';
    } else {
      this.textNode.innerHTML = text;
    }
  }

  on_textColor(color) {
    this.textNode.style.color = color;
  }

  apply(style) {
    super.apply(style);

    switch(style) {
      case 'Smaller':
        if (this.size > 1) {
          this.size = parseInt(this.size) - 1;
        }
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
      this.textNode.style.fontWeight = 700;
    } else {
      this.textNode.style.fontWeight = 400;
    }
  }

  on_italic(italic) {
    if (italic) {
      this.textNode.style.fontStyle = 'italic';
    } else {
      this.textNode.style.fontStyle = 'normal';
    }
  }

  on_underline(underline) {
    if (underline) {
      this.textNode.style.textDecoration = 'underline';
    } else {
      this.textNode.style.textDecoration = 'none';
    }
  }

  on_align(align) {
    if (align == 'left') {
      this.box.style.textAlign = 'left';
      this.box.style.justifyContent = 'flex-start';
    } else if (align == 'right') {
      this.box.style.textAlign = 'right';
      this.box.style.justifyContent = 'flex-end';
    } else if (align == 'center') {
      this.box.style.textAlign = 'center';
      this.box.style.justifyContent = 'center';
    }
  }

  on_verticalAlign(align) {
    if (align == 'top') {
      this.box.style.alignItems = 'flex-start';
    } else if (align == 'bottom') {
      this.box.style.alignItems = 'flex-end';
    } else if (align == 'middle') {
      this.box.style.alignItems = 'center';
    }
  }

  on_wordBreak(value) {
    this.textNode.style.wordBreak = value;
  }

  is_overflowed() {
    return (this.box.clientWidth < this.textNode.clientWidth)
        || (this.box.clientHeight < this.textNode.clientHeight);
  }

  solve_overflow() {
    if (this.box.clientWidth < this.textNode.clientWidth) {
      this.width = this.textNode.clientWidth + this.padding * 2 + 2;
    }

    if (this.box.clientHeight < this.textNode.clientHeight) {
      this.height = this.textNode.clientHeight + this.padding * 2 + 2;
    }
  }
}

export default TextBox
