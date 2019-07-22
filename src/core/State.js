import channel from '../core/Channel';

class State {
  constructor(state) {
    this.state = state;
    this.__TYPE__ = 'State';

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

  serialize() {
    function replacer(k, v) {
      if (v.hasOwnProperty('__TYPE__')) {
        switch(v['__TYPE__']) {
          case 'State':
            return v.state;
          case 'List':
            return v.array;
        }
      }
      return v;
    };
    return JSON.stringify(this.state, replacer);
  }

  deserialize(data) {
    for (const [k, v] of Object.entries(data)) {
      if (v.constructor.name === 'Array') {
        v.forEach((item) => {
          if (k === 'pages') {
            let page = this.addPage();
            // TBD: without using channel
            page.deserialize(item);
            channel.send('PageList:addPage', page);
          } else if (k === 'objects') {
            let obj = this.addObject(item.type);
            obj.deserialize(item);
          } else {
            this[k].push(item);
          }
        }, this);
      } else {
        this[k] = v;
      }
    }
  }

  destroy() {
    channel.unbind(this);
  }
}

export default State
