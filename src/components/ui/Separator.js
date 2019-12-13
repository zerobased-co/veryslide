import View from './View';

class Separator extends View {
  constructor(state) {
    super({
      className: 'vs-separator',
      ...state,
    });
  }
}

export default Separator
