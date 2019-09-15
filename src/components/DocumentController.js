import domtoimage from 'dom-to-image';

import { uuid, defaultDomToImageOption } from 'core/Util';
import List from 'core/List';
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

      selected: new List(),
      clipboard: [],
      pasted: -1,

      history: new History(),
      ...state,
    });

    this.listen('Controller:addPage', () => {
      const newPage = this.doc.addPage(this.focusedPage);
      this.send('PageList:addPage', newPage, this.doc.pages.find(newPage))[0];
      this.send('Controller:select', newPage);
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

    this.listen('Controller:remove', () => {
      if (this.selected.length == 0) return;

      let nextPage = this.focusedPage;

      this.selected.iter((item) => {
        if (item.type === 'Page') {
          this.send('PageList:removePage', item);
          nextPage = this.doc.removePage(item);
        } else {
          this.focusedPage.removeObject(item);
        }
      });
      
      this.selected.removeAll();

      if (nextPage == null) {
        this.doc.focusedPageIndex = -1;
        this.send('Viewport:clear');
      } else {
        if (nextPage !== this.focusedPage) {
          this.focusedPage = null;
          this.send('Controller:select', nextPage);
        }
      }
    });

    this.listen('Controller:addObject', (objType, states, file) => {
      if (this.focusedPage == null) return;
      this.send('Controller:deselect');

      let newObject = this.focusedPage.addObject(objType, states);
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
      this.send('Controller:select', newObject);
    });

    this.listen('Controller:focusPage', (page) => {
      this.doc.focusedPageIndex = this.doc.pages.find(page);
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
        if (this.selected.length > 0) {
          if ((item.type === 'Page' && this.selected.array[0].type !== 'Page') ||
              (item.type !== 'Page' && this.selected.array[0].type === 'Page')) {
            this.send('Controller:deselect');
          }
        }
      }

      item.select();
      this.selected.append(item);
      this.send('Property:setPanelFor', this.selected.array);

      if (this.selected.length === 1 && item.type === 'Page') {
        this.send('Controller:focusPage', item);
      }
    });

    this.listen('Controller:deselect', (item) => {
      if (item == null) {
        this.selected.iter((item) => {
          item.select(false);
        });
        this.selected.removeAll();
      } else {
        item.select(false);
        this.selected.remove(item);
      }
      this.send('Property:setPanelFor', this.selected.array);
    });

    this.listen('Controller:align', (align) => {
      if (this.selected.length == 0) return;

      // TBD: for multiple object
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
        bb = getBB(this.selected.array);
      }

      for(let i = 0; i < this.selected.length; i++) {
        const obj = this.selected.at(i);

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
    });

    this.listen('Controller:order', (order) => {
      if (this.focusedPage == null) return;

      for(let i = 0; i < this.selected.length; i++) {
        const obj = this.selected.at(i);

        switch(order) {
          case 'back':
            this.focusedPage.objects.makeFirst(obj);
            break;
          case 'front':
            this.focusedPage.objects.makeLast(obj);
            break;
          case 'backward':
            this.focusedPage.objects.backward(obj);
            break;
          case 'forward':
            this.focusedPage.objects.forward(obj);
            break;
        }
      }
      this.focusedPage.reorder();
    });

    this.listen('Controller:style', (style) => {
      // TBD: for multiple objects
      if (typeof this.object['apply'] !== 'function') return;

      this.object.apply(style);
    });

    this.listen('Controller:move', (direction) => {
      // TBD: for multiple objects
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
        if (this.object == null) {
          switch(direction) {
            case 'Up':
              this.send('Controller:prevPage');
              break;
            case 'Down':
              this.send('Controller:nextPage');
              break;
          }
        } else {
          if (typeof this.object['apply'] !== 'function') return;
          this.object.apply(direction);
        }
      }
    });

    this.listen('Controller:copy', () => {
      this.clipboard = [];
      this.selected.iter((item) => {
        this.clipboard.push(item.serialize());
      });
      this.pasted = 0;
    });

    this.listen('Controller:paste', () => {
      if (this.clipboard == null) return;

      this.send('Controller:deselect');

      this.pasted += 1;
      this.clipboard.forEach((item) => {
        item = JSON.parse(item);

        let newObject = null;
        switch(item.type) {
          case 'ImageList':
            newObject = new ImageList();
            break;
          case 'ImageBox':
            newObject = new ImageBox();
            break;
          case 'TextBox':
            newObject = new TextBox();
            break;
          case 'Page':
            newObject = this.doc.addPage(this.focusedPage);
            break;
        }

        if (newObject != null) {
          newObject.deserialize(item);

          if (newObject.type == 'Page') {
            const pagethumb = this.send('PageList:addPage', newObject, this.doc.pages.find(newObject))[0];
          } else {
            if (this.focusedPage != null) {
              this.focusedPage.appendObject(newObject);
              if (this.pasted >= 0) {
                newObject.x += this.pasted * 10;
                newObject.y += this.pasted * 10;
              }
              this.send('Viewport:focus', newObject);
            }
          }
          this.send('Controller:select', newObject, true);
        }
      });
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
          let pageNo = this.doc.pages.find(page) + 1;
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
      this.doc.pages.iter((page, i) => {
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
