import View from './View.js';
import global from '/core/Global.js';

class CheckBox extends View {
  constructor(state) {
    super({
      className: 'vs-checkbox',
      title: '',
      checked: false,
      ...state,
    });
  }

  onNotify(value) {
    this.state.checked = value;
    this.on_checked(value);
  }

  on_checked(checked) {
    this.input.checked = checked;
    this.input.indeterminate = (checked === global.ambiguous);
  }

  on_title(title) {
    this.text.nodeValue = title;
  }

  onCheck(event) {
    this.checked = this.input.checked;
    this.onChange(this.checked);
  }

  render() {
    super.render();

    this.input = document.createElement('input');
    this.input.type = 'checkbox';
    this.input.addEventListener('change', this.onCheck.bind(this));

    this.text = document.createTextNode(this.title);

    this.label = document.createElement('label');
    this.label.appendChild(this.input);
    this.label.appendChild(this.text);

    this.node.appendChild(this.label);

    return this.node;
  }
}

export default CheckBox