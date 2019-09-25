import domtoimage from 'dom-to-image';

import { uuid, defaultDomToImageOption } from 'core/Util';
import A from 'core/Array';
import State from 'core/State';

import { Page } from './Document';
import History from './History';
import TextBox from './objects/TextBox';
import ImageBox from './objects/ImageBox';
import ImageList from './objects/ImageList';

class DocumentController extends State {
  constructor(state) {
    super({
      doc: null,
      editor: null,
      firebase: null,
      slideId: null,
      focusedPage: null,

      selected: [],
      copiedStyle: null,
      clipboard: [],
      pasted: -1,

      history: new History(),
      ...state,
    });

    this.listen('Controller:addPage', (at, states, bypassHistory) => {
      if (at == null && this.focusedPage) {
        at = this.focusedPage.order + 1;
      }

      const newPage = this.doc.addPage(at, states);
      this.send('PageList:addPage', newPage, newPage.order);
      if (bypassHistory !== true) {
        this.send('Controller:select', newPage);
        this.send('Controller:history', 'Add', [newPage]);
      }
      return newPage;
    });

    this.listen('Controller:prevPage', () => {
      let prevPage = this.doc.pages.prev(this.focusedPage);
      if (prevPage) {
        this.send('Controller:select', prevPage);
      } else {
        this.send('Viewport:setPresentationMode', false);
      }
    });

    this.listen('Controller:nextPage', () => {
      let nextPage = this.doc.pages.next(this.focusedPage);
      if (nextPage) {
        this.send('Controller:select', nextPage);
      } else {
        this.send('Viewport:setPresentationMode', false);
      }
    });

    this.listen('Controller:remove', (bypassHistory) => {
      if (this.selected.length == 0) return;

      if (bypassHistory !== true) {
        this.send('Controller:history', 'Remove');
      }

      let nextPage = this.focusedPage;
      this.selected.forEach((item) => {
        if (item.type === 'Page') {
          this.send('PageList:removePage', item);
          nextPage = this.doc.removePage(item);
        } else {
          this.focusedPage.removeObject(item);
        }
      });
      
      this.selected = [];

      if (nextPage == null) {
        this.focusedPage = null;
        this.doc.focusedPageIndex = -1;
        this.send('Viewport:clear');
      } else {
        if (nextPage !== this.focusedPage) {
          this.focusedPage = null;
          this.send('Controller:select', nextPage);
        } else {
          this.send('Property:setPanelFor', this.selected);
        }
      }
    });

    this.listen('Controller:addObject', (objType, at, states, file, bypassHistory) => {
      if (this.focusedPage == null) return;

      let newObject = this.focusedPage.addObject(objType, at, states);
      switch(newObject.type) {
        case 'ImageBox':
          newObject.loading(true);

          let path = this.getFirebaseFilename(file);
          this.fileUpload(file, path).then((url) => {
            newObject.src = url;
            newObject.path = path;
          }).catch((err) => {
            // TBD: Error handling
            console.log(err);
          });
          break;
      }

      if (bypassHistory !== true) {
        this.send('Controller:select', newObject);
        this.send('Controller:history', 'Add', [newObject]);
      }
      return newObject;
    });

    this.listen('Controller:focusPage', (page) => {
      this.doc.focusedPageIndex = this.doc.pages.indexOf(page);
      if (this.focusedPage) {
        this.focusedPage.focus(false);
      }
      this.focusedPage = page;
      page.focus(true);
    });

    this.listen('Controller:getSelection', () => {
      return this.selected;
    });

    this.listen('Controller:select', (item, keepSelection) => {
      if (item == null) return;

      if (keepSelection !== true) {
        this.send('Controller:deselect');
      } else {
        // When different type (page / object) was selected, clear the selection
        if (this.selected.length > 0) {
          if ((item.type === 'Page' && this.selected[0].type !== 'Page') ||
              (item.type !== 'Page' && this.selected[0].type === 'Page')) {
            this.send('Controller:deselect');
          }
        }
      }

      item.select();
      this.selected.push(item);
      this.send('Property:setPanelFor', this.selected);

      if (this.selected.length === 1 && item.type === 'Page') {
        this.send('Controller:focusPage', item);
      }
    });

    this.listen('Controller:deselect', (item) => {
      if (item == null) {
        this.selected.forEach((item) => {
          item.select(false);
        });
        this.selected = [];
      } else {
        item.select(false);
        A.remove(this.selected, item);
      }

      this.send('Property:setPanelFor', this.selected);
    });

    this.listen('Controller:align', (align) => {
      if (this.selected.length == 0) return;

      let getBB = (objects) => {
        let sx = objects[0].x;
        let sy = objects[0].y;
        let ex = objects[0].x + objects[0].width;
        let ey = objects[0].y + objects[0].height;

        for(let i = 1; i < objects.length; i++) {
          if (sx > objects[i].x) { sx = objects[i].x };
          if (sy > objects[i].y) { sy = objects[i].y };
          if (ex < objects[i].x + objects[i].width) { ex = objects[i].x + objects[i].width };
          if (ey < objects[i].y + objects[i].height) { ey = objects[i].y + objects[i].height };
        }
        return {sx, sy, ex, ey};
      }

      let bb;
      if (this.selected.length == 1 ) {
        if (this.focusedPage == null) return;
        bb = getBB([this.focusedPage]);
      } else {
        bb = getBB(this.selected);
      }

      this.send('Controller:history', 'Before');
      for(let i = 0; i < this.selected.length; i++) {
        const obj = this.selected[i];

        switch(align) {
          case 'left':
            obj.x = bb.sx;
            break;
          case 'center':
            obj.x = bb.sx + parseInt((bb.ex - bb.sx - obj.width) / 2);
            break;
          case 'right':
            obj.x = bb.ex - obj.width;
            break;
          case 'top':
            obj.y = bb.sy;
            break;
          case 'middle':
            obj.y = bb.sy + parseInt((bb.ey - bb.sy - obj.height) / 2);
            break;
          case 'bottom':
            obj.y = bb.ey - obj.height;
            break;
        }
      }
      this.send('Controller:history', 'After');
      this.send('Controller:history', 'Modify');
    });

    this.listen('Controller:order', (order) => {
      if (this.focusedPage == null) return;

      this.send('Controller:history', 'Before');
      for(let i = 0; i < this.selected.length; i++) {
        const obj = this.selected[i];

        switch(order) {
          case 'back':
            A.makeFirst(this.focusedPage.objects, obj);
            break;
          case 'front':
            A.makeLast(this.focusedPage.objects, obj);
            break;
          case 'backward':
            A.backward(this.focusedPage.objects, obj);
            break;
          case 'forward':
            A.forward(this.focusedPage.objects, obj);
            break;
        }
      }
      this.focusedPage.reorder();
      this.send('Controller:history', 'After');
      this.send('Controller:history', 'Modify');
    });

    this.listen('Controller:style', (style) => {
      this.send('Controller:history', 'Before');
      for(let i = 0; i < this.selected.length; i++) {
        const obj = this.selected[i];

        if (typeof obj['apply'] !== 'function') continue;
        obj.apply(style);
      }
      this.send('Controller:history', 'After');
      this.send('Controller:history', 'Modify');
    });

    this.listen('Controller:move', (direction) => {
      if (this.isPresentationMode) {
        switch(direction) {
          case 'Left':
          case 'Up':
            this.send('Controller:prevPage');
            break;
          case 'Right':
          case 'Down':
            this.send('Controller:nextPage');
            break;
        }
      } else {
        let isPage = true;
        if (this.selected.length > 0) {
          if (this.selected[0].type !== 'Page') {
            isPage = false;
          }
        }

        if (isPage) {
          switch(direction) {
            case 'Up':
              this.send('Controller:prevPage');
              break;
            case 'Down':
              this.send('Controller:nextPage');
              break;
          }
        } else {
          this.send('Controller:history', 'Before');
          for(let i = 0; i < this.selected.length; i++) {
            const obj = this.selected[i];

            if (typeof obj['apply'] !== 'function') continue;
            obj.apply(direction);
          }
          this.send('Controller:history', 'After');
          this.send('Controller:history', 'Modify');
        }
      }
    });

    this.listen('Controller:copy', () => {
      this.clipboard = [];
      this.selected.sort((a, b) => (a.order > b.order) ? 1 : -1)
      this.selected.forEach((item) => {
        this.clipboard.push(item.serialize());
      });
      this.pasted = 0; //TBD: do not use pasted count, change this to calculate new position
    });

    this.listen('Controller:paste', () => {
      if (this.clipboard == null) return;

      this.send('Controller:deselect');

      this.pasted += 1;
      this.clipboard.forEach((item) => {
        item = JSON.parse(item);
        delete item['uuid']; // remove old uuid before creating new object
        delete item['order']; // remove old order before creating new object

        let newObject = null;
        switch(item.type) {
          case 'Page':
            newObject = this.send('Controller:addPage', item.order + 1, null)[0];
            break;
          default:
            newObject = this.focusedPage.addObject(item.type, null, item);
            break;
        }

        if (newObject != null) {
          if (newObject.type !== 'Page') {
            if (this.focusedPage != null) {
              if (this.pasted >= 0) {
                newObject.x += this.pasted * 10;
                newObject.y += this.pasted * 10;
              }
              this.send('Viewport:focus', newObject);
            }
          }
          this.send('Controller:select', newObject, true);
          this.history.insertAfterList(newObject);
        }
      });
      this.history.record('ADD');
    });

    this.savePage = (page) => {
      // TBD: we have to hide things before capturing
      domtoimage.toPng(page.node.parentElement, Object.assign(defaultDomToImageOption, {
        width: page.width,
        height: page.height,
        style: {
          'transform': 'scale(1)',
        },
      }))
        .then((dataUrl) => {
          // TBD: Why should we get page number here? Too slow.
          let pageNo = this.doc.pages.indexOf(page) + 1;
          let filename = 'veryslide-' + this.slideId + '-' + String(pageNo).padStart(3, '0');

          let link = document.createElement("a");
          link.download = filename + '.png';
          link.href = dataUrl;

          document.body.appendChild(link);
          link.click();

          // Cleanup the DOM
          document.body.removeChild(link);
        }).catch((error) => {
          console.log('Error on while saving:', error);
        });
    }

    this.listen('Controller:savePage', (format) => {
      if (this.focusedPage == null) return;
      this.savePage(this.focusedPage);
    });

    // TBD: NOT LIKE THIS AT ALL
    this.listen('Controller:saveAllPage', (format) => {
      this.doc.pages.forEach((page, i) => {
        setTimeout(() => {
          this.send('PageList:selectPage', page);
          setTimeout(() => {
            this.savePage(page);
          }, 500);
        }, i * 2000);
      });
    });

    this.listen('Controller:addAsset', (type, name, meta) => {
      console.log('addAsset', type, name, meta);
      if (type === 'FILE') {
        let path = this.getFirebaseFilename(meta);

        this.fileUpload(meta, path).then((url) => {
          console.log(url);

          let asset = this.doc.addAsset();
          asset.name = name;
          asset.path = path;
          asset.assetType = this.getExtension(meta);
          asset.url = url;

          this.send('AssetList:addAsset', asset);
        }).catch((err) => {
          // TBD: Error handling
          console.log(err);
        });
      } else if (type === 'URL') {
        let asset = this.doc.addAsset();
        asset.name = name;
        asset.assetType = 'URL';
        asset.url = meta;
        this.send('AssetList:addAsset', asset);
      }
      //return this.fileUpload(file);
    });

    this.listen('Controller:removeAsset', (asset) => {
      this.doc.removeAsset(asset);
    });

    this.listen('Controller:getAssetList', () => {
      return this.doc.assets;
    });

    this.listen('Controller:getAsset', (assetName) => {
      let asset = this.doc.assets.findby((item) => {
        return item.name == assetName;
      });
      return asset;
    });

    this.listen('Controller:history', (type, objects) => {
      if (objects == null) {
        objects = this.selected;
      }

      switch(type) {
        case 'Add':
          objects.forEach((obj) => {
            this.history.insertAfterList(obj);
          });
          this.history.record('ADD');
          break;
        case 'Remove':
          objects.forEach((obj) => {
            this.history.insertBeforeList(obj);
          });
          this.history.record('REMOVE');
          break;
        case 'Modify':
          this.history.record('MODIFY');
          break;
        case 'Before':
          objects.forEach((obj) => {
            this.history.insertBeforeList(obj);
          });
          break;
        case 'After':
          objects.forEach((obj) => {
            this.history.insertAfterList(obj);
          });
          break;
        case 'Prepare':
          this.history.prepare();
          break;
        case 'Undoable':
          return this.history.undoable();
        case 'Redoable':
          return this.history.redoable();
        case 'Undo':
          return this.history.undo();
        case 'Redo':
          return this.history.redo();
      }
    });

    this.listen('Controller:copyStyle', () => {
    });

    this.listen('Controller:pasteStyle', () => {
    });
  }

  getExtension(file) {
    let extension = /(?:\.([^.]+))?$/.exec(file.name)[1];
    extension = extension ? '.' + extension : '';
    return extension;
  }

  getFirebaseFilename(file) {
    return 'slides/' + this.slideId + '/' + uuid() + this.getExtension(file);
  }

  fileUpload(file, path) {
    return new Promise((resolve, reject) => {
      let storageRef = this.firebase.storage.ref();
      let fileRef = storageRef.child(path);
      fileRef.put(file).then((snapshot) => {
        snapshot.ref.getDownloadURL().then(function(downloadURL) {
          resolve(downloadURL);
        });
      }).catch((err) => {
        // TBD: error handling
        console.log(err);
      });;
    });
  }
}

export default DocumentController
