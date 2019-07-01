import View from './View.js';

class Select extends View {
  constructor(state) {
    super({
      className: 'vs-select',
      value: null,
      options: [],
    }.update(state));
  }

  onChange(value) {
    console.log('onChange', value, this);
  }

  on_value(value) {
    this.select.value = value;
  }

  on_options(options) {
    this.select.innerHTML = '';

    options.forEach(option => {
      let tag = document.createElement('option');
      tag.value = option[0];
      tag.innerText = option[1];
      if (this.value == tag.value) {
        tag.selected = true;
      }
      this.select.appendChild(tag);
    });
  }

  change(event) {
    this.value = this.select.value;
    this.onChange(this.select.value);
  }

  render() {
    super.render();

    this.select = document.createElement('select');
    this.select.addEventListener('change', this.change.bind(this));
    this.node.appendChild(this.select);

    return this.node;
  }
}

export default Select
