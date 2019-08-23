import List from 'core/List';
import State from 'core/State';

class History extends State {
  constructor(state) {
    super({
      queue: new List(),
      marker: -1,
    });
  }

  record() {
  }

  redo() {
  }

  undo() {
  }
}

export default History
