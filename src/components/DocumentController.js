import domtoimage from 'dom-to-image';

import { uuid, defaultDomToImageOption } from 'core/Util';
import State from 'core/State';

import { Page } from './Document';
import TextBox from './objects/TextBox';
import ImageBox from './objects/ImageBox';
import ImageList from './objects/ImageList';

class DocumentController extends State {
  constructor(state) {
    super({
      doc: null,
      editor: null,
      page: null,
      object: null,
      clipboard: null,
      firebase: null,
      slideId: null,
      pasted: 0,
      ...state,
    });

    this.listen(this, 'Controller:addPage', () => {
      const newPage = this.doc.addPage(this.page);
      const pagethumb = this.send('PageList:addPage', newPage, this.doc.pages.find(newPage))[0];
      if (pagethumb != null) {
        pagethumb.select();
      }
    });

    this.listen(this, 'Controller:prevPage', () => {
      let prevPage = this.doc.pages.prev(this.page);
      if (prevPage) {
        this.page = prevPage;
        this.send('PageList:selectPage', this.page);
      } else {
        this.send('Viewport:setPresentationMode', false);
      }
    });

    this.listen(this, 'Controller:nextPage', () => {
      let nextPage = this.doc.pages.next(this.page);
      if (nextPage) {
        this.page = nextPage;
        this.send('PageList:selectPage', this.page);
      } else {
        this.send('Viewport:setPresentationMode', false);
      }
    });

    this.listen(this, 'Controller:selectPage', (page) => {
      this.doc.selectedPageIndex = this.doc.pages.find(page);
      this.page = page;
      this.object = null;
    });

    this.listen(this, 'Controller:removePage', () => {
      if (this.page == null) return;
      if (this.page == this.clipboard) { this.clipboard = null };

      this.send('PageList:removePage', this.page);

      const nextpage = this.doc.removePage(this.page);
      this.page = nextpage;

      if (nextpage == null) {
        this.doc.selectedPageIndex = -1;
        this.send('Viewport:clear', nextpage);
      } else {
        this.send('PageList:selectPage', nextpage);
      }
    });

    this.listen(this, 'Controller:addObject', (objType, states, file) => {
      if (this.page == null) return;
      let newObject = this.page.addObject(objType, states);
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
      this.send('Viewport:focus', newObject);
    });

    this.listen(this, 'Controller:selectObject', (object) => {
      this.object = object;
    });

    this.listen(this, 'Controller:removeObject', () => {
      if (this.object == null) return;
      if (this.object == this.clipboard) { this.clipboard = null };
      this.page.removeObject(this.object);
      this.object = null;

      this.send('Viewport:blur');
    });

    this.listen(this, 'Controller:align', (object, align) => {
      if (object == null) return;
      if (object.page == null) return;

      switch(align) {
        case 'left':
          object.x = 0;
          break;
        case 'center':
          object.x = parseInt((object.page.width - object.width) / 2);
          break;
        case 'right':
          object.x = parseInt(object.page.width - object.width);
          break;
        case 'top':
          object.y = 0;
          break;
        case 'middle':
          object.y = parseInt((object.page.height - object.height) / 2);
          break;
        case 'bottom':
          object.y = parseInt(object.page.height - object.height);
          break;
      }
    });

    this.listen(this, 'Controller:order', (object, order) => {
      if (object == null) return;
      if (object.page == null) return;

      switch(order) {
        case 'back':
          object.page.objects.makeFirst(object);
          break;
        case 'front':
          object.page.objects.makeLast(object);
          break;
        case 'backward':
          object.page.objects.backward(object);
          break;
        case 'forward':
          object.page.objects.forward(object);
          break;
      }
      object.page.reorder();
    });

    this.listen(this, 'Controller:copy', () => {
      if (this.object != null) {
        this.clipboard = this.object;
        this.pasted = 0;
      } else if (this.page != null) {
        this.clipboard = this.page;
      }
    });

    this.listen(this, 'Controller:paste', () => {
      if (this.clipboard == null) return;

      console.log('pasting', this.clipboard);
      let newObject = null;
      let data = this.clipboard.serialize();

      switch(this.clipboard.type) {
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
          newObject = this.doc.addPage(this.page);
          break;
          /*
        case 'Document':
          this.panel = new PanelForDocument({object});
          break;
          */
      }

      if (newObject != null) {
        newObject.deserialize(JSON.parse(data));

        if (newObject.type == 'Page') {
          const pagethumb = this.send('PageList:addPage', newObject, this.doc.pages.find(newObject))[0];
          if (pagethumb != null) {
            pagethumb.select();
          }
        } else {
          if (this.page != null) {
            this.page.appendObject(newObject);
            if (this.page == this.clipboard.page) {
              this.pasted += 1;
              newObject.x += this.pasted * 10;
              newObject.y += this.pasted * 10;
            }
            this.object = newObject;
            this.send('Viewport:focus', newObject);
          }
        }
      }
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

    this.listen(this, 'Controller:savePage', (format) => {
      if (this.page == null) return;
      this.savePage(this.page);
    });

    // TBD: NOT LIKE THIS AT ALL
    this.listen(this, 'Controller:saveAllPage', (format) => {
      this.doc.pages.iter((page, i) => {
        setTimeout(() => {
          this.send('PageList:selectPage', page);
          setTimeout(() => {
            this.savePage(page);
          }, 500);
        }, i * 2000);
      });
    });

    this.listen(this, 'Controller:addAsset', (type, name, meta) => {
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

    this.listen(this, 'Controller:removeAsset', (asset) => {
      this.doc.removeAsset(asset);
    });

    this.listen(this, 'Controller:getAssetList', () => {
      return this.doc.assets;
    });

    this.listen(this, 'Controller:getAsset', (assetName) => {
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
