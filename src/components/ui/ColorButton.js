import View from './View.js';
import '@easylogic/colorpicker/dist/colorpicker.css';
import ColorPickerUI from '@easylogic/colorpicker'
import { properTextColor } from '../../core/Util';

class ColorButton extends View {
  constructor(state) {
    super({
      className: 'vs-colorbutton',
      color: '#ffffff',
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

  onChange(color) {
    console.log('onChange', color, this);
  }

  showPicker(event) {
    this.colorPicker.show({
      left: event.clientX - 100,
      top: event.clientY + 14,
      hideDelay: 2000,
    }, this.color, (newColor) => {
      this.color = newColor;
      this.onChange(newColor);
    });
  }

  on_color(color) {
    this.node.style.backgroundColor = color;
    this.node.innerText = color;
    this.node.style.color = properTextColor(color);
  }
}

export default ColorButton
