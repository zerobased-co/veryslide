class Window {
  construct(parent) {
    this.parent = parent;
    this.node = null;
    this.title = '';
  }

  destruct() {
    this.node.parentNode.removeChild(this.node);
  }

  setTitle(title) {
    this.title = title;
  }

  render() {
    this.node = document.createElement('div');
    return this.node;
  }
}

class Col extends Window {
  render() {
    super.render();
    this.node.className = 'vs-col';
    return this.node;
  }
}

class Row extends Window {
  render() {
    super.render();
    this.node.className = 'vs-row';
    return this.node;
  }
}

export { Window as default, Col, Row }
