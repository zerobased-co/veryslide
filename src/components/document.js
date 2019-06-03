import List from '../core/List';
import { randomColor, randomInt } from '../core/Util';

let id = 0;

class BaseObject {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.name = '';
    this.node = null;
    this.backgroundColor = '#ffffff';
  }

  contain(x, y) {
    return (x >= this.x) && (x < this.x + this.width) && (y >= this.y) && (y < this.y + this.height);
  }
}

class Shape extends BaseObject {
  constructor() {
    super();
    this.width = randomInt(100, 300);
    this.height = randomInt(100, 300);
    this.name = 'Shape';

    this.border = 1;
    this.backgroundColor = randomColor();
  }

  render() {
  }
}

class TextBox extends Shape {
  constructor() {
    super();
    this.name = 'TextBox';

    this.text = 'Text' + id;
    id += 1;
    this.color = '#000000';
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-object';
    this.node.style.backgroundColor = this.backgroundColor;
    this.node.style.color = this.color;
    this.node.innerText = this.text;
    this.node.style.left = this.x + 'px';
    this.node.style.top = this.y + 'px';
    this.node.style.width = this.width + 'px';
    this.node.style.height = this.height + 'px';

    return this.node;
  }
}

class Page extends BaseObject {
  constructor() {
    super();
    this.name = 'Page';
    this.objects = new List(BaseObject);
  }

  addObject(type) {
    let object = new TextBox();
    this.objects.append(object);
    return object;
  }

  removeObject(object) {
    this.objects.remove(object);
  }

  render() {
    this.node = document.createElement('div');
    this.node.className = 'vs-page';
    this.node.style.backgroundColor = this.backgroundColor;
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
    this.pages = new List(Page);
  }

  addPage() {
    let page = this.pages.spawn(this);
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
