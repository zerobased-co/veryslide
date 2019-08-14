import State from '../../core/State.js';
import List from '../../core/List.js';
import { showLoadingIndicator } from '../../core/Util';

class View extends State {
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

    this.render();
    this.updateState();
  }

  bind(target, key) {
    this.bindingTarget = target;
    this.bindingKey = key;
    target.addBinding(this);

    // for initialize
    this.onBinding(target[key]);
    return this;
  }

  notify(from, key, value) {
    if (from === this.bindingTarget && key === this.bindingKey) {
      this.onBinding(value);
    }
  }

  onChange(value) {
    if (this.bindingTarget) {
      this.bindingTarget[this.bindingKey] = value;
    }
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
      this.target.removeBinding(this);
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
    this.node = document.createElement('div');
    this.node.className = this.className;

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

  loading(isLoading) {
    showLoadingIndicator(this, isLoading);
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
