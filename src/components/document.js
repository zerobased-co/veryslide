import List from '../core/list';
import channel from '../core/channel';

class BaseObject {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
  }
}

class Shape extends BaseObject {
}

class Page extends BaseObject {
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
    page.number = this.pages.count;

    channel.send(null, 'addPage:done', page);
  }
}

export default Document
