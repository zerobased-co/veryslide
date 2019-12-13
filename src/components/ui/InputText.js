import View from './View';

class InputText extends View {
  constructor(state) {
    super({
      className: 'vs-inputtext',
      placeholder: '',
      value: '',
      ...state,
    });
  }

  render() {
    this.node = document.createElement('input');
    this.node.type = 'text';
    this.node.placeholder = this.placeholder;
    this.node.addEventListener('keydown', this.handler.bind(this));
    this.node.addEventListener('focus', this.focus.bind(this));
    this.node.addEventListener('blur', this.blur.bind(this));
    return this.node;
  }

  on_value(text) {
    this.node.value = text;
  }

  focus(event) {
    this.node.select();
  }

  blur(event) {
    if (this.value != this.node.value) {
      this.value = this.node.value;
      this.onChange(this.value);
    }
  }

  handler(event) {
    if (event.target !== this.node) {
      return;
    }

    if (event.keyCode === 13) {
      this.value = this.node.value;
      this.node.select();
      this.onChange(this.value);
    }
  }

  onNotify(value) {
    this.state.value = value;
    this.node.value = value;
  }
}

export default InputText
