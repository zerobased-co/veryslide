import List from '../core/List';
import BaseObject from './objects/BaseObject';
import TextBox from './objects/TextBox';
import ImageList from './objects/ImageList';

class Page extends BaseObject {
  constructor(state) {
    super({
      name: 'Page',
      class: 'vs-page',
      objects: new List(),
    }.update(state));
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
    this.objects.iter((object) => {
      object.node.style.zIndex = object.order;
    });
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
