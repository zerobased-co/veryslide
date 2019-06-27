import View from './View.js';

class CheckBox extends View {
  constructor(state) {
    super({
      className: 'vs-checkbox',
      title: '',
      checked: false,
    }.update(state));
  }

  onChange(checked) {
    console.log('onChange', checked, this);
  }

  on_checked(checked) {
    this.input.checked = checked;
  }

  on_title(title) {
    this.label.innerText = title;
  }

  change(/*event*/) {
    this.onChange(this.input.checked);
  }

  render() {
    super.render();

    this.input = document.createElement('input');
    this.input.type = 'checkbox';
    this.input.addEventListener('change', this.change.bind(this));
    this.node.appendChild(this.input);

    this.label = document.createElement('label');
    this.node.appendChild(this.label);

    return this.node;
  }
}

export default CheckBox
