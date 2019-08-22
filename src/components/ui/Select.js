import View from './View.js';

class Select extends View {
  constructor(state) {
    super({
      className: 'vs-select',
      value: null,
      options: [],
      ...state,
    });
  }

  onNotify(value) {
    this.state.value = value;
    this.select.value = value;
  }

  on_value(value) {
    this.select.value = value;
  }

  on_options(options) {
    this.select.innerHTML = '';

    options.forEach(option => {
      let tag = document.createElement('option');
      tag.value = option[0];
      tag.innerText = option[((option.length == 2) ? 1 : 0)];

      if (this.value == tag.value) {
        tag.selected = true;
      }
      this.select.appendChild(tag);
    });
  }

  change(event) {
    if (this.select.value === '') {
      return;
    }

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
