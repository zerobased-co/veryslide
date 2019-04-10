import List from '../core/list';
import channel from '../core/channel';

class BaseObject {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.name = '';
  }
}

class Shape extends BaseObject {
  constructor() {
    super();
    this.name = 'Shape';
  }
}

class Page extends BaseObject {
  constructor() {
    super();
    this.name = 'Page';
    this.number = null;

    channel.bind(this, 'Page', 'addShape', this.addShape);
  }

  addShape(value) {
    console.log(this.number, value);
  }
}

class Document {
  constructor() {
    this.width = 1024;
    this.height = 768;
    this.pages = new List(Page);
    channel.bind(this, 'Document', 'addPage', this.addPage);
  }

  addPage(value) {
    let page = this.pages.spawn();
    this.pages.append(page);
    page.width = this.width;
    page.height = this.height;
    page.number = this.pages.count;

    channel.send(null, 'addPage:done', page);
  }
}

export default Document
