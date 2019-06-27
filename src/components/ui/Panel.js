import View from './View';

class Panel extends View {
  constructor(state) {
    super({
      className: 'vs-panel',
      object: null,
    }.update(state));
  }
}

export default Panel
