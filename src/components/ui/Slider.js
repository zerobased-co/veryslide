import View from './View.js';
import global from '/core/Global';

class Slider extends View {
  constructor(state) {
    super({
      className: 'vs-slider',
      value: null,
      min: 0,
      max: 100,
      step: 1,
      ...state,
    });
  }

  onNotify(value) {
    if (value === global.ambiguous) return;

    this.value = value;
  }

  on_value(value) {
    if (value === global.ambiguous) return;

    this.node.value = value;
  }

  change(event) {
    const value = Math.min(Math.max(this.node.value, this.min), this.max);

    this.value = value;
    if (event.type === 'change') { // record changes only for 'change' event
      this.onChange(value);
    } else {
      global.temporary = true; // TBD: do not use global variable
      this.onChange(value);
      global.temporary = false; // TBD: do not use global variable
    }
  }

  render() {
    super.render();

    this.node = document.createElement('input');
    this.node.type = "range";
    this.node.min = this.min;
    this.node.max = this.max;
    this.node.step = this.step;
    this.addEventListener('change', this.change.bind(this));
    this.addEventListener('input', this.change.bind(this));

    return this.node;
  }
}

export default Slider;
