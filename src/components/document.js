import List from '../core/List';
import BaseObject from './objects/BaseObject';
import TextBox from './objects/TextBox';
import ImageBox from './objects/ImageBox';
import ImageList from './objects/ImageList';

class Page extends BaseObject {
  constructor(state) {
    super({
      type: 'Page',
      className: 'vs-page',
      objects: new List(),
      ...state,
    });

    this.pagethumb = null;
    this.invalidate = false;
  }

  addObject(type) {
    let object = null;
    switch(type) {
      case 'TextBox':
        object = this.objects.spawn(TextBox);
        break;
      case 'ImageBox':
        object = this.objects.spawn(ImageBox);
        break;
      case 'ImageList':
        object = this.objects.spawn(ImageList);
        break;
    }
    object.page = this;
    this.objects.append(object);
    this.node.append(object.node);
    this.invalidate = true;
    return object;
  }

  appendObject(object) {
    object.page = this;
    this.objects.append(object);
    this.node.append(object.node);
    this.invalidate = true;
  }

  findObject(x, y) {
    let found = null;
    this.objects.iter((object) => {
      if (object.contain(x, y) === true) {
        found = object;
      }
    });
    return found;
  }

  removeObject(object) {
    object.node.parentNode.removeChild(object.node);
    this.objects.remove(object);
    this.invalidate = true;
  }

  reorder() {
    this.objects.iter((object) => {
      object.node.style.zIndex = object.order;
    });
    this.invalidate = true;
  }

  render() {
    let node = super.render();
    this.objects.iter((object) => {
      node.append(object.render());
    });
    return node;
  }
}

class Document {
  constructor() {
    this.width = 1024;
    this.height = 768;
    this.pages = new List();
    this.type = 'Document';
  }

  addPage() {
    let page = this.pages.spawn(Page);
    this.pages.append(page);

    page.width = this.width;
    page.height = this.height;

    return page;
  }

  appendPage(page) {
    this.pages.append(page);
  }

  removePage(page) {
    let nextpage = this.pages.remove(page);
    return nextpage;
  }
}

export { Document as default, Page }
