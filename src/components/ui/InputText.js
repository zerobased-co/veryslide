import View from './View';

class InputText extends View {
  constructor(state) {
    super({
      className: 'vs-inputtext',
      value: '',
    }.update(state));
  }

  render() {
    this.clear();

    this.node = document.createElement('input');
    this.node.type = 'text';
    this.node.addEventListener('input', this.input.bind(this));
    return this.node;
  }

  on_value(text) {
    this.node.value = text;
  }

  input(/*event*/) {
    this.value = this.node.value;
    this.onChange(this.value);
  }

  onChange(value) {
    console.log('onChange', value, this);
  }
}

export default InputText
