// Add python-style update method to Object with Object.assign function
if (Object.prototype.update == null) {
  Object.prototype.update = function(obj) {
    return Object.assign(this, obj);
  }
}

class State {
  constructor(state) {
    this.state = state;

    if (state != null) {
      for (const [key, value] of Object.entries(state)) {
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
      }
    }
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
  }
}

export default State
