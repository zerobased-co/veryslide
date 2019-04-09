import List from './list.js';

function __key(name, type) {
  return [name, type].join(",");
}

class Message {
  constructor(target, type, value, callback) {
    this.target = target;
    this.type = type;
    this.value = value;
    this.callback = callback;
  }
}

class Channel {
  constructor() {
    this.messages = new List(Message);
    this.listeners = new Object();
  }

  bind(listener, name, type, handler) {
    const key = __key(name, type);
    if (!(key in this.listeners)) {
      this.listeners[key] = new Array();
    }
    this.listeners[key].push({
      'listener': listener,
      'handler': handler,
    });
  }

  unbind(listener, name, type) {
    const key = __key(name, type);
    if (key in this.listeners) {
      this.listeners[key] = this.listeners[key].filter(function(elem) {
        return elem['listener'] === listener;
      });
    }
  }

  post(target, type, value, callback) {
  /*
    msg = new Message(target, type, value, callback);
    this.messages.append(msg);
  */
  }

  send(target, type, value) {
    const key = __key(target, type);
    if (key in this.listeners) {
      this.listeners[key].forEach(function(obj) {
        obj['handler'].call(obj['listener'], value);
      });
    }
  }

  process() {
  }
}

let channel = new Channel();

export default channel
