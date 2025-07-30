import View from './View.js';
import global from '/core/Global';

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
    if (value === global.ambiguous) return;

    this.state.value = value;
    this.select.value = value;
  }

  on_value(value) {
    if (value === global.ambiguous) return;

    this.select.value = value;
  }

  on_options(options) {
    this.select.innerHTML = '';

    // Add an empty tag for ambiguous selection
    let emptyTag = document.createElement('option');
    emptyTag.value = null;
    emptyTag.hidden = true;
    emptyTag.disabled = true;
    emptyTag.selected = true;
    emptyTag.innerText = global.ambiguous;
    this.select.appendChild(emptyTag);

    options.forEach(option => {
      let tag = document.createElement('option');
      if (typeof option === 'string' || typeof option === 'number') {
        tag.value = option;
        tag.innerText = option;
      } else {
        tag.value = option[0];
        tag.innerText = option[((option.length == 2) ? 1 : 0)];
      }

      if (this.value === tag.value) {
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
