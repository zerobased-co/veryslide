import domtoimage from 'dom-to-image';

import { defaultDomToImageOption, lpad, uuid } from 'core/Util';
import State from 'core/State';
import A from 'core/Array';
import BaseObject from './objects/BaseObject';
import TextBox from './objects/TextBox';
import ImageBox from './objects/ImageBox';
import ImageList from './objects/ImageList';

class Page extends BaseObject {
  constructor(state) {
    super({
      type: 'Page',
      className: 'vs-page',
      objects: [],
      thumbnail: '',
      ...state,
    });

    this.invalidate = false;
    this.thumbnailScale = 0.2;
    this.doc = null;
    this.pagethumb = null;
  }

  paddedOrder() {
    return lpad(this.order, 4, '0');
  }

  addObject(type, at, states) {
    let object = null;
    states = states || {};

    // set default states
    let init_state = {};
    // for supporting legacy documents (has duplicated uuids)
    if ('uuid' in states) {
      init_state = {uuid: states['uuid']};
      if (states['uuid'] in this.doc.objects) {
        init_state['uuid'] = uuid(); // give new uuid
      }
    }

    switch(type) {
      case 'TextBox':
        object = new TextBox(init_state);
        break;
      case 'ImageBox':
        object = new ImageBox(init_state);
        break;
      case 'ImageList':
        object = new ImageList(init_state);
        break;
    }
    object.page = this;
    object.deserialize(states);

    if (at == null) {
      this.objects.push(object);
      object.order = this.objects.length;
    } else {
      A.insert(this.objects, object, at - 1); // order is one-based index
      this.reorder(at);
    }
    this.node.append(object.node);
    this.invalidate = true;

    this.send('Document:keep', object);
    return object;
  }

  findObjects(x, y, w, h) {
    let found = [];
    w = w || 0;
    h = h || 0;

    this.objects.forEach((object) => {
      if (object.overlap(x, y, w, h) === true) {
        found.push(object);
      }
    });
    return found;
  }

  on_thumbnail(thumbnail) {
    if (this.pagethumb != null) {
      this.pagethumb.updateThumbnail();
    }
  }

  updateThumbnail(force) {
    if (this.node == null) return;

    // check invalidation and force update
    if (this.invalidate != true && force != true) return;
    this.invalidate = false;

    domtoimage.toJpeg(this.node.parentElement, Object.assign(defaultDomToImageOption, {
      quality: 0.5,
      width: parseInt(this.width * this.thumbnailScale),
      height: parseInt(this.height * this.thumbnailScale),
      style: {
        'transform': 'scale(' + this.thumbnailScale + ')',
        'transform-origin': 'top left',
        'background-color': this.color,
      },
    }))
      .then((dataUrl) => {
        this.thumbnail = dataUrl;
        if (this.pagethumb != null) {
          this.pagethumb.updateThumbnail();
        }
      }).catch((error) => {
        console.log('Error on while creating thumbnail:', error);
      });
  }

  removeObject(object) {
    this.send('Document:wipe', object);
    object.node.parentNode.removeChild(object.node);
    A.remove(this.objects, object);
    object.destroy();

    this.reorder(object.order);
  }

  reorder(from) {  // TBD: reorder only after `from` position
    let order = 1;
    this.objects.forEach((object) => {
      object.order = order;
      order += 1;
    });
    this.invalidate = true;
  }

  rebuild() {
    let newObjects = new Array(this.objects.length);
    this.objects.forEach((object) => {
      newObjects[object.order - 1] = object;
    });
    this.objects = newObjects;
  }

  select(selected) {
    super.select(selected);
    if (this.pagethumb) {
      this.pagethumb.select(selected);
    }
  }

  focus(focused, ...value) {
    super.focus(focused, value);
    if (this.pagethumb) {
      this.pagethumb.focus(focused, value);
    }
  }

  render() {
    let node = super.render();
    if (this.objects.length > 0) {
      this.objects.forEach((object) => {
        node.append(object.render());
      });
    }
    return node;
  }
}

class Asset extends State {
  constructor(state) {
    super({
      type: 'Asset',
      name: '',
      path: '',
      assetType: '',
      url: '',
      ...state,
    });

    this.node = null;
    this.data = '';
  }

  update() {
    if (this.assetType !== 'URL') {
      const options = {
        method: 'GET',
        headers: {},
      }
      fetch(this.url, options).then((response) => {
        if (response.ok) {
          response.text().then((text) => {
            this.data = text;
            console.log(this.name, this.data.length);
            if (this.node != null) {
              this.node.loading(false);
            }
          });
        }
      });
    }
  }
}

class Document extends State {
  constructor(state) {
    super({
      title: '',
      width: 1024,
      height: 768,
      pages: [],
      assets: [],
      type: 'Document',
      focusedPageIndex: -1,
      ...state,
    });
    this.objects = {};
    this.addIgnoreState('pages');

    this.listen('Document:keep', (object) => {
      this.objects[object.uuid] = object;
    });

    this.listen('Document:wipe', (object) => {
      delete this.objects[object.uuid];
    });

    this.listen('Document:find', (uuid) => {
      return this.objects[uuid];
    });
  }

  addPage(at, states) {
    // for supporting legacy documents (has duplicated uuids)
    if (states) {
      if ('uuid' in states) {
        if (states['uuid'] in this.objects) {
          states['uuid'] = uuid(); // give new uuid
        }
      }
    }

    let page = new Page(states);
    page.doc = this;
    page.width = this.width;
    page.height = this.height;

    if (at == null) {
      page.order = this.pages.length;
      A.append(this.pages, page);
    } else {
      A.insert(this.pages, page, at);
      this.reorder(at);
    }

    this.send('Document:keep', page);
    return page;
  }

  removePage(page) {
    this.send('Document:wipe', page);
    page.objects.forEach((object) => {
      this.send('Document:wipe', object);
    });

    let nextpage = A.remove(this.pages, page);
    this.reorder();
    return nextpage;
  }

  addAsset() {
    let asset = new Asset();
    A.append(this.assets, asset);
    return asset;
  }

  removeAsset(asset) {
    let nextasset = A.remove(this.assets, asset);
    return nextasset;
  }

  deserialize(data) {
    super.deserialize(data);

    // for legacy document
    if (this.focusedPageIndex == -1 && this.pages.length > 0) {
      this.focusedPageIndex = 0;
    }
  }

  reorder(from) {  // TBD: reorder only after `from` position
    let order = 0;
    this.pages.forEach((page) => {
      page.order = order;
      order += 1;
    });
  }
}

export { Document as default, Asset, Page }
