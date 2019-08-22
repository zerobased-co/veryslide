import View from './View';

class InputFile extends View {
  constructor(state) {
    super({
      className: 'vs-inputfile',
      value: '',
      ...state,
    });
  }

  render() {
    this.node = super.render();
    this.reset();
    return this.node;
  }

  handler(event) {
    var file = event.target.files[0];
    this.onChange(file);
  }

  reset() {
    this.node.innerHTML = '';

    this.input = document.createElement('input');
    this.input.type = 'file';
    this.input.addEventListener('change', this.handler.bind(this));
    this.node.appendChild(this.input);
  }
}

export default InputFile
