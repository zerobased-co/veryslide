import View from './View';

class InputText extends View {
  constructor(state) {
    super({
      className: 'vs-inputtext',
      value: '',
      ...state,
    });
  }

  render() {
    super.render();
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.input.addEventListener('keydown', this.handler.bind(this));
    this.input.addEventListener('focus', this.focus.bind(this));
    this.input.addEventListener('blur', this.blur.bind(this));
    this.node.appendChild(this.input);
    return this.node;
  }

  on_value(text) {
    this.input.value = text;
  }

  focus(event) {
    this.input.select();
  }

  blur(event) {
    if (this.value != this.input.value) {
      this.value = this.input.value;
      this.onChange(this.value);
    }
  }

  handler(event) {
    if (event.target !== this.input) {
      return;
    }

    if (event.keyCode === 13) {
      this.value = this.input.value;
      this.input.select();
      this.onChange(this.value);
    }
  }
  
  onBinding(value) {
    this.value = value;
    this.input.value = value;
  }
}

export default InputText
