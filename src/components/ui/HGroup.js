import View from './View.js';

class HGroup extends View {
  constructor(state) {
    super({
      className: 'vs-hgroup',
    }.update(state));
  }
}

export default HGroup
