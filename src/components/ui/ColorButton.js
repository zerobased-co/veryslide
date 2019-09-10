import View from './View.js';
import '@easylogic/colorpicker/dist/colorpicker.css';
import ColorPickerUI from '@easylogic/colorpicker'
import { properTextColor } from 'core/Util';

class ColorButton extends View {
  constructor(state) {
    super({
      className: 'vs-colorbutton',
      color: '#FFFFFF',
      ...state,
    });

    this.colorPicker = ColorPickerUI.create({
      type: 'sketch',
      color: this.color,
      outputFormat : 'hex',
      hideDelay: 2000,
    });

    this.node.addEventListener('click', this.showPicker.bind(this));
  }

  onNotify(value) {
    this.state.color = value;
    this.on_color(value);
  }

  showPicker(event) {
    const color = (this.color === '?') ? '#FFFFFF' : this.color;

    this.colorPicker.show({
      left: event.clientX - 100,
      top: event.clientY + 14,
      hideDelay: 2000,
    }, color, (newColor) => {
      this.color = newColor;
      this.onChange(newColor);
    });
  }

  on_color(color) {
    this.node.style.backgroundColor = color;
    this.node.innerText = color.toUpperCase();
    this.node.style.color = (this.color === '?') ? '#000000' : properTextColor(color);
  }
}

export default ColorButton
