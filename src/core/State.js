import channel from './Channel';
import List from './List';

class State {
  constructor(state) {
    this.state = state;
    this.__TYPE__ = 'State';
    this.__NUMBER_STATE__ = [];
    this.bindings = new Array();

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
            if (isNaN(value) == false && this.__NUMBER_STATE__.indexOf(key) != -1) {
              value = Number(value);
            }
            this.state[key] = value;
            this.updateState(key, value);
          }
        });
      });
    }
  }

  addNumberState(...keys) {
    this.__NUMBER_STATE__ = this.__NUMBER_STATE__.concat(Array.from(keys));
  }

  addBinding(binding) {
    this.bindings.push(binding);
  }

  removeBinding(binding) {
    this.bindings = this.bindings.filter(el => el !== binding);
  }

  updateState(key, value) { // if key is null, then update all states
    if (key != null) {
      let func = this['on_' + key];
      if (func != null) {
        func.bind(this)(this.state[key]);
      }
      if (this.bindings.length) {
        for(var i = 0; i < this.bindings.length; i++) {
          this.bindings[i].notify(this, key, value);
        }
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
      this['on'].bind(this)(key, value);
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
          } else if (k === 'assets') {
            let asset = this.addAsset();
            asset.deserialize(item);
            channel.send('AssetList:addAsset', asset);
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
