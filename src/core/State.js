class State {
  constructor(state) {
    this.state = state;

    if (this.state != null) {
      Object.getOwnPropertyNames(this.state).forEach(key => {
        Object.defineProperty(this, key, {
          get: function() {
            let func = this['_' + key];
            if (func != null) {
              return func.bind(this)();
            } else {
              return this.state[key];
            }
          },
          set: function(value) {
            this.state[key] = value;
            this.updateState(key);
          }
        });
      });
    }
  }

  static merge(a, b) {
    return Object.assign(a, b);
  }

  updateState(key) { // if key is null, then update all states
    if (key != null) {
      let func = this['on_' + key];
      if (func != null) {
        func.bind(this)(this.state[key]);
      }
    } else {
      for (const [key, value] of Object.entries(this.state)) {
        let func = this['on_' + key];
        if (func != null) {
          func.bind(this)(value);
        }
      }
    }

    if (this['on'] != null) {
      this['on'].bind(this)();
    }
  }
}

export default State
