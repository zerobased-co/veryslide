import View from './View.js';

class CheckBox extends View {
  constructor(state) {
    super({
      className: 'vs-checkbox',
      checked: false,
    }.update(state));
  }

  onChange(event) {
    console.log('onChange', this);
  }

  on_checked(checked) {
    if (this.node != null) {
      this.input.checked = checked;
    }
  }

  on_title(title) {
    if (this.node != null) {
      this.label.innerText = title;
    }
  }

  change(event) {
    this.onChange(this.input.checked);
  }

  render() {
    super.render();

    this.input = document.createElement('input');
    this.input.type = 'checkbox';
    this.input.checked = this.checked;
    this.input.addEventListener('change', this.change.bind(this));
    this.node.appendChild(this.input);

    this.label = document.createElement('label');
    this.label.innerText = this.title;
    this.node.appendChild(this.label);

    return this.node;
  }
}

export default CheckBox
