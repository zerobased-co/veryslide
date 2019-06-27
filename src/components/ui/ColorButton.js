import View from './View.js';
import { ColorPicker } from 'codemirror-colorpicker';
import { properTextColor } from '../../core/Util';
import 'codemirror-colorpicker/dist/codemirror-colorpicker.css';

class ColorButton extends View {
  constructor(state) {
    super({
      className: 'vs-colorbutton',
      color: '#ffffff',
    }.update(state));

    this.colorPicker = new ColorPicker({
      color: this.color,
      type : 'ColorPicker',
      outputFormat : 'hex',
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
