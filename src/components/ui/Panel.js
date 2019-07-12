import View from './View';

class Panel extends View {
  constructor(state) {
    super({
      className: 'vs-panel',
      object: null,
      ...state,
    });
  }
}

export default Panel
