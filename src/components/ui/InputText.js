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
    this.input.addEventListener('input', this.handler.bind(this));
    this.node.appendChild(this.input);
    return this.node;
  }

  on_value(text) {
    this.input.value = text;
  }

  handler(/*event*/) {
    this.value = this.input.value;
    this.onChange(this.value);
  }

  onChange(value) {
    console.log('onChange', value, this);
  }
}

export default InputText
