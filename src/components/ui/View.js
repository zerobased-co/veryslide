import Node from '/core/Node';

class View extends Node {
  constructor(state) {
    super({
      className: 'vs-view',
      parent: null,
      children: [],
      
      enabled: true,
      shown: true,
      ...state,
    });
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
    this.shown = (isShow == null) ? true : isShow;
    if (this.shown) {
      this.node.classList.remove('vs-hidden');
    } else {
      this.node.classList.add('vs-hidden');
    }
  }

  hide() {
    return this.show(false);
  }

  enable(isEnable) {
    this.enabled = (isEnable == null) ? true : isEnable;
    if (this.enabled) {
      this.node.classList.remove('vs-disabled');
    } else {
      this.node.classList.add('vs-disabled');
    }
  }

  disable() {
    return this.enable(false);
  }

  afterChange(value) {
  }

  onChange(value) {
    if (this.pairTarget) {
      this.pairTarget[this.pairKey] = value;
    }
    this.afterChange(value);
  }

  destroy() {
    super.destroy();

    if (this.pairTarget != null) {
      this.pairTarget.removePairing(this);
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
      this.node.appendChild(child.node);
    });
    return this.node;
  }

  appendChild(child) {
    // TBD: only View can be added as child
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
