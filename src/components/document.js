import List from '../core/List';

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
    this.objects = new List(BaseObject);
  }

  addObject(value) {
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
    console.log(nextpage);
    return nextpage;
  }
}

export default Document
