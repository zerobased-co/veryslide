import View from './View.js';
import InputText from './InputText.js';
import Slider from './Slider.js';
import global from '/core/Global';

class TextSlider extends View {
  constructor(state) {
    super({
      className: 'vs-textslider',
      value: null,
      min: 0,
      max: 100,
      step: 1,
      ...state,
    });
  }

  onNotify(value) {
    this.value = value;
  }

  on_value(value) {
    this.inputtext.value = value;

    if (value !== global.ambiguous) {
      this.slider.value = value;
    }
  }

  change(value) {
    value = Math.min(Math.max(value, this.min), this.max);

    this.value = value;
    this.onChange(this.value);
  }

  render() {
    super.render();

    this.inputtext = new InputText();
    this.inputtext.onChange = this.change.bind(this);
    this.appendChild(this.inputtext);

    this.slider = new Slider({min: this.min, max: this.max, step: this.step});
    this.slider.onChange = this.change.bind(this);
    this.appendChild(this.slider);


    return this.node;
  }
}

export default TextSlider;