class BaseObject {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.name = 'BaseObject';
    this.node = null;
    this.page = null;
    this.color = '#ffffff';
    this.order = 0;
    this.content = null;
  }

  contain(x, y) {
    return (x >= this.x) && (x < this.x + this.width) && (y >= this.y) && (y < this.y + this.height);
  }

  record() {
    this.content = this.node.innerHTML;
  }

  setColor(color) {
    this.color = color;
    this.node.style.backgroundColor = this.color;
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-object';
    this.node.style.backgroundColor = this.color;
    this.node.style.left = this.x + 'px';
    this.node.style.top = this.y + 'px';
    this.node.style.width = this.width + 'px';
    this.node.style.height = this.height + 'px';
    this.node.style.zIndex = this.order;

    if (this.content) {
      this.node.innerHTML = this.content;
    }
  }
}

export default BaseObject
