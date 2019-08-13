import View from './View.js';

class CheckBox extends View {
  constructor(state) {
    super({
      className: 'vs-checkbox',
      title: '',
      checked: false,
      ...state,
    });
  }

  onBinding(value) {
    this.checked = value;
  }

  on_checked(checked) {
    this.input.checked = checked;
  }

  on_title(title) {
    this.label.innerText = title;
  }

  onChange(/*event*/) {
    this.checked = this.input.checked;
    if (this.bindingTarget) {
      this.bindingTarget[this.bindingKey] = this.checked;
    }
  }

  render() {
    super.render();

    this.input = document.createElement('input');
    this.input.type = 'checkbox';
    this.input.addEventListener('change', this.onChange.bind(this));
    this.node.appendChild(this.input);

    this.label = document.createElement('label');
    this.node.appendChild(this.label);

    return this.node;
  }
}

export default CheckBox
