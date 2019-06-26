import View from './View.js';
import { ColorPicker } from 'codemirror-colorpicker';
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
    });
  }

  onChange(color) {
    console.log('onChange', this);
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
    if (this.node != null) {
      this.node.style.backgroundColor = color;
      this.node.innerText = color;
    }
  }

  render() {
    super.render();
    this.node.style.backgroundColor = this.color;
    this.node.innerText = this.color;
    this.node.addEventListener('click', this.showPicker.bind(this));
    return this.node;
  }
}

export default ColorButton
