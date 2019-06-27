import View from './View.js';

class Select extends View {
  constructor(state) {
    super({
      className: 'vs-checkbox',
      title: '',
      value: null,
      options: [],
    }.update(state));
  }

  onChange(event) {
    console.log('onChange', this);
  }

  on_value(value) {
    if (this.node != null) {
    }
  }

  on_title(title) {
    if (this.node != null) {
      this.label.innerText = title;
    }
  }

  on_options(options) {
  }

  change(event) {
    this.onChange(this.input.checked);
  }

  render() {
    super.render();

    this.label = document.createElement('label');
    this.label.innerText = this.title;
    this.node.appendChild(this.label);

    this.input = document.createElement('select');
    this.input.addEventListener('change', this.change.bind(this));
    this.node.appendChild(this.input);

    return this.node;
  }
}

export default Select
