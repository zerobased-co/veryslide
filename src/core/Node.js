import State from 'core/State';
import { showLoadingIndicator } from 'core/Util';

class Node extends State {
  constructor(state) {
    super({
      type: 'Node',
      className: 'vs-node',
      ...state,
    });

    this.content = '';
    this.selected = false;
    this.focused = false;

    this.render();
    this.updateState();
  }

  on_className(className) {
    this.node.className = className;
  }

  on_content(content) {
    if (content != '') {
      this.node.innerHTML = content;
    }
  }

  record() {
    this.content = this.node.innerHTML;
    if (this.page != null) {
      this.page.invalidate = true;
    }
  }

  clear() {
    this.content = '';
  }

  select(selected) {
    // TBD: Add handler
    this.selected = selected;
    if (selected === false) {
      this.node.classList.remove('select');
    } else {
      this.node.classList.add('select');
    }
  }

  focus(focused) {
    this.focused = focused;
    if (focused === false) {
      this.node.classList.remove('focus');
    } else {
      this.node.classList.add('focus');
    }
  }

  loading(isLoading) {
    showLoadingIndicator(this, isLoading);
  }
  
  render() {
    this.node = document.createElement('div');
    return this.node;
  }
}

export default Node
