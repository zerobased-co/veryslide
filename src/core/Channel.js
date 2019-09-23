class Channel {
  constructor() {
    this.cleanup();
  }

  cleanup() {
    this.listeners = new Object();
  }

  listen(listener, type, handler) {
    if (!(type in this.listeners)) {
      this.listeners[type] = new Array();
    }
    this.listeners[type].push({
      'listener': listener,
      'handler': handler,
    });
  }

  dismiss(listener, type) {
    if (type && type in this.listeners) {
      this.listeners[type] = this.listeners[type].filter(function(elem) {
        return elem['listener'] !== listener;
      });
    } else {
      // unbind from all
      Object.keys(this.listeners).forEach(key => {
        this.listeners[key] = this.listeners[key].filter(function(elem) {
          return elem['listener'] !== listener;
        });
      });
    }
  }

  send(type, ...value) {
    //console.debug('Send', type, value);

    let responses = new Array();
    if (type in this.listeners) {
      this.listeners[type].forEach(function(obj) {
        //console.debug('-- Recv', obj['listener']);
        responses.push(obj['handler'].call(obj['listener'], ...value));
      });
    }
    if (responses.length == 0) {
      //console.info('No response', type, value);
    }
    return responses;
  }

  process() {
  }
}

let channel = new Channel();

export default channel
