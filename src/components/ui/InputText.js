import View from './View';

class InputText extends View {
  constructor(state) {
    super(state);
    this.value = null;
  }

  render() {
    this.node = document.createElement('input');
    this.node.type = 'text';
    this.node.value = this.value;
    this.node.className = 'vs-inputtext';
    this.node.addEventListener('input', this.input.bind(this));
    return this.node;
  }

  input(event) {
    this.value = this.node.value;
    this.onChange(this.value);
  }

  onChange(value) {
    console.log('onChange', this);
  }
}

export default InputText
