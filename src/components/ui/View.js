import Node from '/core/Node';

class View extends Node {
  constructor(state) {
    super({
      className: 'vs-view',
      parent: null,
      children: [],
      eventListeners: [],
      ...state,
    });

    if (this.parent != null) {
      this.parent.children.push(this);
    }
  }

  pair(target, key) {
    this.pairTarget = target;
    this.pairKey = key;
    target.addPairing(this);

    // for initialize
    this.onNotify(target[key]);
    return this;
  }

  notify(from, key, value) {
    if (from === this.pairTarget && key === this.pairKey) {
      this.onNotify(value);
    }
  }

  show(isShow) {
    isShow = (isShow == null) ? true : isShow;
    if (isShow) {
      console.log('show', this.className);
      this.node.classList.remove('vs-hidden');
    } else {
      console.log('hide', this.className);
      this.node.classList.add('vs-hidden');
    }
  }

  hide() {
    return this.show(false);
  }

  afterChange(value) {
  }

  onChange(value) {
    if (this.pairTarget) {
      this.pairTarget[this.pairKey] = value;
    }
    this.afterChange(value);
  }

  addEventListener(eventType, handler, target) {
    if (target == null) {
      target = this.node;
    }

    if (handler.hasOwnProperty('prototype') !== false) {
      handler = handler.bind(this);
    }

    target.addEventListener(eventType, handler);

    this.eventListeners.push({
      eventType,
      handler,
      target,
    });
  }

  removeEventListener(eventType, target) {
    if (target == null) {
      target = this.node;
    }

    this.eventListeners = this.eventListeners.filter(el => {
      if (el['eventType'] == eventType && el['target'] == target) {
        el['target'].removeEventListener(el['eventType'], el['handler']);
        return false;
      } else {
        return true;
      }
    });
  }

  destroy() {
    super.destroy();

    if (this.target != null ) {
      this.target.removePairing(this);
    }

    this.eventListeners.forEach(el => {
      el['target'].removeEventListener(el['eventType'], el['handler']);
    });

    this.children.forEach(child => {
      child.destroy();
    });

    if (this.node != null) {
      if (this.node.parentNode != null) {
        this.node.parentNode.removeChild(this.node);
      }
      this.node = null;
    }
  }

  render() {
    super.render();
    this.children.forEach((child) => {
      this.appendChild(child);
    });
    return this.node;
  }

  appendChild(child) {
    // TBD: only View can be added as child
    // TBD: add children at once
    if (child.hasOwnProperty('children') && child.hasOwnProperty('state')) {
      child.parent = this;
      this.children.push(child);
      this.node.appendChild(child.node);
    } else {
      this.node.appendChild(child);
    }
  }
}

class Horizon extends View {
  constructor(state) {
    super({
      className: 'vs-horizon',
      ...state,
    });
  }
}

class Vertical extends View {
  constructor(state) {
    super({
      className: 'vs-vertical',
      ...state,
    });
  }
}

export { View as default, Horizon, Vertical }
