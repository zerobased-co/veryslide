import View from './View.js';

class HGroup extends View {
  constructor(state) {
    super({
      className: 'vs-hgroup',
      ...state,
    });
  }
}

export default HGroup
