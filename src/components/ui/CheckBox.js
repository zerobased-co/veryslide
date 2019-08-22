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

  onNotify(value) {
    this.state.checked = value;
    this.on_checked(value);
  }

  on_checked(checked) {
    this.input.checked = checked;
  }

  on_title(title) {
    this.text.nodeValue = title;
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

    this.text = document.createTextNode(this.title);

    this.label = document.createElement('label');
    this.label.appendChild(this.input);
    this.label.appendChild(this.text);

    this.node.appendChild(this.label);

    return this.node;
  }
}

export default CheckBox
