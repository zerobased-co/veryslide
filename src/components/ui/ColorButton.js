import View from './View.js';
import '@easylogic/colorpicker/dist/colorpicker.css';
import ColorPickerUI from '@easylogic/colorpicker'
import { properTextColor } from 'core/Util';
import global from 'core/Global';

let colorPicker = ColorPickerUI.create({
  type: 'sketch',
  color: '#000000',
  outputFormat : 'hex',
  hideDelay: 2000,
});

class ColorButton extends View {
  constructor(state) {
    super({
      className: 'vs-colorbutton',
      color: '#FFFFFF',
      ...state,
    });

    this.node.addEventListener('click', this.showPicker.bind(this));
  }

  onNotify(value) {
    this.state.color = value;
    this.on_color(value);
  }

  showPicker(event) {
    const color = (this.color === global.ambiguous) ? '#FFFFFF' : this.color;

    colorPicker.show({
      color,
      left: event.clientX - 100,
      top: event.clientY + 14,
      hideDelay: 2000,
    }, color, (newColor) => {
      // dragging
      this.color = newColor;
      global.temporary = true;
      this.onChange(newColor);
      global.temporary = false;
    }, () => {}, (newColor) => {
      // finished to choose
      this.color = newColor;
      this.onChange(newColor);
    });
  }

  on_color(color) {
    this.node.style.backgroundColor = color;
    this.node.innerText = color.toUpperCase();
    this.node.style.color = (this.color === global.ambiguous) ? '#000000' : properTextColor(color);
  }
}

export default ColorButton
