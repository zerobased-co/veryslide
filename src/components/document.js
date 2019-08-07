import html2canvas from 'html2canvas';

import State from '../core/State.js';
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
      thumbnail: '',
      ...state,
    });

    this.invalidate = false;
    this.thumbnailScale = 0.2;
    this.pagethumb = null;
  }

  addObject(type, states) {
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
    // set default states
    if (states != null) {
      for (const [k, v] of Object.entries(states)) {
        object[k] = v;
      }
    }
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

  updateThumbnail(force) {
    if (this.node == null) return;

    // check invalidation and force update
    if (this.invalidate != true && force != true) return;
    this.invalidate = false;

    const rect = this.node.getBoundingClientRect();
    html2canvas(this.node, {
      allowTaint: true,
      backgroundColor: this.color,
      scale: this.thumbnailScale,
      scrollX: parseInt(window.scrollX),
      scrollY: -parseInt(window.scrollY),
    }).then((canvas) => {
      this.thumbnail = canvas.toDataURL();
      if (this.pagethumb != null) {
        this.pagethumb.updateThumbnail();
      }
    });
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

class Document extends State {
  constructor(state) {
    super({
      width: 1024,
      height: 768,
      pages: new List(),
      assets: new List(),
      type: 'Document',
      ...state,
    });
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
