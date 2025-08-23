import View from './View';
import ui from './UI';
import Text from './Text';
import global from '/core/Global';

const options = [
  ['', '----'],
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

      operators: [],
      values: [],
      candidates: [],
      ...state,
    });
  }

  update_candidates() {
    // clear candidates
    let i = 0;
    let candidates = [];
    this.fields.forEach((field) => {
      candidates.push([]);
      i += 1;
    });

    // prepare candidates
    this.items.forEach((row) => {
      let i = 0;
      this.fields.forEach((field) => {
        if (candidates[i].indexOf(row[field]) === -1) {
          candidates[i].push(row[field]);
        }
        i += 1;
      });
    });

    this.candidates = [];
    candidates.forEach((c) => {
      c.sort();
      this.candidates.push(
        [['', '----']].concat(c.map(x => [x, x]))
      );
    });
  }

  on_filter(filter) {
    console.log(filter);
  }

  get_candidates(idx) {
    if (this.candidates.length > idx) {
      return this.candidates[idx];
    } else {
      return [];
    }
  }

  update_filter() {
    let idx = 0;
    let filter = [];

    this.operators.forEach((operator) => {
      if (operator.value === '') {
        this.values[idx].value = '';
      } else {
        filter.push({
          'field': this.fields[idx],
          'operator': operator.value,
          'value': this.values[idx].value,
          'idx': idx,
        });
      }
      idx += 1;
    });
    this.state['filter'] = filter;
    this.onChange(filter);
  }

  get_currentFilter(idx, type) {
    let val = '';
    this.filter.forEach((f) => {
      if (f['idx'] == idx) {
        val = f[type];
      }
    });
    return val;
  }

  render() {
    super.render();

    // We cannot render ambiguous filters
    if (this.fields === global.ambiguous) {
      this.appendChild(
        ui.createText('Cannot be displayed', 'vs-text-140')
      );
    } else {
      this.update_candidates();

      let idx = 0;
      this.fields.forEach((field) => {

        let row = ui.H(
          ui.createText(field, 'vs-text-140'),
          this.operators[idx] = new ui.Select({
            options: options,
            value: this.get_currentFilter(idx, 'operator'),
            onChange: () => { this.update_filter(); },
          }),
          this.values[idx] = new ui.InputText({
            value: this.get_currentFilter(idx, 'value'),
            onChange: () => { this.update_filter(); },
          }),
          new ui.Select({
            filter: this,
            idx: idx,
            options: this.get_candidates(idx),
            value: this.get_currentFilter(idx, 'value'),
            onChange: function (value) {
              this.filter.values[this.idx].value = value;
              this.filter.update_filter();
            },
          }),
        );

        this.appendChild(row);
        idx += 1;
      });
    }
    return this.node;
  }
}

export default Filter