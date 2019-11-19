import channel from './Channel';
import A from './Array';

class State {
  constructor(state) {
    this.state = state;
    this.__TYPE__ = 'State';
    this.__NUMBER_STATE__ = [];
    this.__IGNORE_STATE__ = [];
    this.pairings = [];

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

  listen() {
    var args = Array.prototype.slice.call(arguments);
    args.unshift(this);
    return channel.listen.apply(channel, args);
  }

  send() {
    return channel.send.apply(channel, arguments);
  }

  dismiss() {
    return channel.dismiss.apply(channel, arguments);
  }

  addNumberState(...keys) {
    this.__NUMBER_STATE__ = this.__NUMBER_STATE__.concat(Array.from(keys));
  }

  addIgnoreState(...keys) {
    this.__IGNORE_STATE__ = this.__IGNORE_STATE__.concat(Array.from(keys));
  }

  addPairing(pair) {
    this.pairings.push(pair);
  }

  removePairing(pair) {
    this.pairings = this.pairings.filter(el => el !== pair);
  }

  updateState(key, value) { // if key is null, then update all states
    if (key != null) {
      let func = this['on_' + key];
      if (func != null) {
        func.bind(this)(this.state[key]);
      }
      this.pairings.forEach((pair) => {
        pair.notify(this, key, value);
      });
    } else {
      for (const [key, value] of Object.entries(this.state)) {
        let func = this['on_' + key];
        if (func != null) {
          func.bind(this)(value);
        }
        this.pairings.forEach((pair) => {
          pair.notify(this, key, value);
        });
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
        }
      }
      return v;
    };

    let ignored = {};

    // Backup values
    this.__IGNORE_STATE__.forEach((k) => {
      ignored[k] = this.state[k];
      delete this.state[k];
    });

    const str = JSON.stringify(this.state, replacer);

    // Restore values
    this.__IGNORE_STATE__.forEach((k) => {
      this.state[k] = ignored[k];
    });

    return str;
  }

  deserialize(data) {
    for (const [k, v] of Object.entries(data)) {
      if (v.constructor.name === 'Array') {
        v.forEach((item) => {
          if (k === 'pages') {
            let page = this.addPage(null, {'uuid': item.uuid});
            item['uuid'] = page.uuid; // TBD: for legacy duplicated objects
            page.deserialize(item);
            this.send('PageList:addPage', page);
          } else if (k === 'objects') {
            let obj = this.addObject(item.type, null, item);
          } else if (k === 'assets') {
            let asset = this.addAsset();
            asset.deserialize(item);
            this.send('AssetList:addAsset', asset);
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
    channel.dismiss(this);
  }
}

export default State
