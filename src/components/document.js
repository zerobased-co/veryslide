import List from '../core/List';
import { randomColor, randomInt } from '../core/Util';

let id = 0;

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
  }
}

class Shape extends BaseObject {
  constructor() {
    super();
    this.width = randomInt(100, 300);
    this.height = randomInt(100, 300);
    this.color = randomColor();
    this.name = 'Shape';
  }

  render() {
    super.render();
    return this.node;
  }
}

class ImageList extends Shape {
  constructor() {
    super();
    this.name = 'ImageList';
    this.content = null;
  }

  render() {
    super.render();
    this.node.classList.add('vs-imagelist');
    if (this.content) {
      this.node.innerHTML = this.content;
    }
    return this.node;
  }
}

class TextBox extends Shape {
  constructor() {
    super();
    this.name = 'TextBox';

    this.text = 'Text' + id;
    id += 1;
    this.textColor = '#ffffff';
  }

  setText(text) {
    this.text = text;
    this.node.innerText = this.text;
  }

  setTextColor(color) {
    this.textColor = color;
    this.node.style.color = this.textColor;
  }

  render() {
    super.render();
    this.node.classList.add('vs-textbox');
    this.node.innerText = this.text;
    this.node.style.color = this.textColor;
    return this.node;
  }
}

class Page extends BaseObject {
  constructor() {
    super();
    this.name = 'Page';
    this.objects = new List();
  }

  addObject(type) {
    let object = null;
    switch(type) {
      case 'TextBox':
        object = this.objects.spawn(TextBox);
        break;
      case 'ImageList':
        object = this.objects.spawn(ImageList);
        break;
    }
    object.page = this;
    this.objects.append(object);
    return object;
  }

  removeObject(object) {
    object.node.parentNode.removeChild(object.node);
    this.objects.remove(object);
  }

  reorder() {
    for(var i = 0; i < this.objects.array.length; i++) {
      let object = this.objects.array[i];
      object.node.style.zIndex = object.order;
    }
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-page';
    this.node.style.backgroundColor = this.color;
    this.node.style.width = this.width + 'px';
    this.node.style.height = this.height + 'px';

    for(var i = 0; i < this.objects.array.length; i++) {
      let object = this.objects.array[i];
      this.node.append(object.render());
    }

    return this.node;
  }
}

class Document {
  constructor() {
    this.width = 1024;
    this.height = 768;
    this.pages = new List();
    this.name = 'Document';
  }

  addPage() {
    let page = this.pages.spawn(Page);
    this.pages.append(page);

    page.width = this.width;
    page.height = this.height;

    return page;
  }

  removePage(page) {
    let nextpage = this.pages.remove(page);
    return nextpage;
  }
}

export default Document
