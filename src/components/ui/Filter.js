import View from './View';
import ui from './UI';
import Text from './Text';

const options = [
  ['none', '----'],
  ['=', '='],
  ['!=', '!='],
  ['>', '>'],
  ['>=', '>='],
  ['<', '<'],
  ['<=', '<='],
  ['like', 'like'],
];

class Filter extends View {
  constructor(state) {
    super({
      className: 'vs-filter',
      fields: [],
      items: [],
      filter: [],
    }.update(state));
  }

  render() {
    super.render();
    this.fields.forEach((field) => {
      console.log(field);

      let row = ui.H(
        ui.createText(field, 'vs-text-140'),
        new ui.Select({
          options: options,
          value: 'none',
        }),
        new ui.InputText({
          value: '',
        }),
      );

      this.appendChild(row);
    });
    return this.node;
  }
}

export default Filter
