import List from './List.js';

class Message {
  constructor(type, value, callback) {
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

  bind(listener, type, handler) {
    if (!(type in this.listeners)) {
      this.listeners[type] = new Array();
    }
    this.listeners[type].push({
      'listener': listener,
      'handler': handler,
    });
  }

  unbind(listener, type) {
    if (type in this.listeners) {
      this.listeners[type] = this.listeners[type].filter(function(elem) {
        return elem['listener'] === listener;
      });
    }
  }

  post(type, value, callback) {
  /*
    msg = new Message(type, value, callback);
    this.messages.append(msg);
  */
  }

  send(type, value) {
    let responses = new Array();
    if (type in this.listeners) {
      this.listeners[type].forEach(function(obj) {
        responses.push(obj['handler'].call(obj['listener'], value));
      });
    }
    return responses;
  }

  process() {
  }
}

let channel = new Channel();

export default channel
