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
            return this.state[key];
          },
          set: function(value) {
            this.state[key] = value;

            // find callback and call it
            let func = this['on_' + key];
            if (func != null) {
              return func.bind(this)(value);
            }
          }
        });
      }
    }
  }
}

export default State
