import domtoimage from 'dom-to-image';

import { uuid } from 'core/Util';
import channel from 'core/Channel';

import { Page } from './Document';
import TextBox from './objects/TextBox';
import ImageBox from './objects/ImageBox';
import ImageList from './objects/ImageList';

class DocumentController {
  constructor(doc, editor) {
    this.doc = doc;
    this.editor = editor;
    this.page = null;
    this.object = null;
    this.clipboard = null;
    this.firebase = null;
    this.slideId = null;
    this.pasted = 0;

    channel.bind(this, 'Controller:addPage', () => {
      const newPage = this.doc.addPage(this.page);
      const pagethumb = channel.send('PageList:addPage', newPage, this.doc.pages.find(newPage))[0];
      if (pagethumb != null) {
        pagethumb.select();
      }
    });

    channel.bind(this, 'Controller:prevPage', () => {
      let prevPage = this.doc.pages.prev(this.page);
      if (prevPage) {
        this.page = prevPage;
        channel.send('PageList:selectPage', this.page);
      } else {
        channel.send('Viewport:setPresentationMode', false);
      }
    });

    channel.bind(this, 'Controller:nextPage', () => {
      let nextPage = this.doc.pages.next(this.page);
      if (nextPage) {
        this.page = nextPage;
        channel.send('PageList:selectPage', this.page);
      } else {
        channel.send('Viewport:setPresentationMode', false);
      }
    });

    channel.bind(this, 'Controller:selectPage', (page) => {
      this.doc.selectedPageIndex = this.doc.pages.find(page);
      this.page = page;
      this.object = null;
    });

    channel.bind(this, 'Controller:removePage', () => {
      if (this.page == null) return;
      if (this.page == this.clipboard) { this.clipboard = null };

      channel.send('PageList:removePage', this.page);

      const nextpage = this.doc.removePage(this.page);
      this.page = nextpage;

      if (nextpage == null) {
        this.doc.selectedPageIndex = -1;
        channel.send('Viewport:clear', nextpage);
      } else {
        channel.send('PageList:selectPage', nextpage);
      }
    });

    channel.bind(this, 'Controller:addObject', (objType, states, file) => {
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
      channel.send('Viewport:focus', newObject);
    });

    channel.bind(this, 'Controller:selectObject', (object) => {
      this.object = object;
    });

    channel.bind(this, 'Controller:removeObject', () => {
      if (this.object == null) return;
      if (this.object == this.clipboard) { this.clipboard = null };
      this.page.removeObject(this.object);
      this.object = null;

      channel.send('Viewport:blur');
    });

    channel.bind(this, 'Controller:align', (object, align) => {
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

    channel.bind(this, 'Controller:order', (object, order) => {
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

    channel.bind(this, 'Controller:copy', () => {
      if (this.object != null) {
        this.clipboard = this.object;
        this.pasted = 0;
      } else if (this.page != null) {
        this.clipboard = this.page;
      }
    });

    channel.bind(this, 'Controller:paste', () => {
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
          const pagethumb = channel.send('PageList:addPage', newObject, this.doc.pages.find(newObject))[0];
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
            channel.send('Viewport:focus', newObject);
          }
        }
      }
    });

    this.savePage = (page) => {
      // TBD: we have to hide things before capturing
      domtoimage.toPng(page.node, {
        imagePlaceholder: '/static/icons/notfound.svg',
      })
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

    channel.bind(this, 'Controller:savePage', (format) => {
      if (this.page == null) return;
      this.savePage(this.page);
    });

    // TBD: NOT LIKE THIS AT ALL
    channel.bind(this, 'Controller:saveAllPage', (format) => {
      this.doc.pages.iter((page, i) => {
        setTimeout(() => {
          channel.send('PageList:selectPage', page);
          setTimeout(() => {
            this.savePage(page);
          }, 500);
        }, i * 2000);
      });
    });

    channel.bind(this, 'Controller:addAsset', (type, name, meta) => {
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

          channel.send('AssetList:addAsset', asset);
        }).catch((err) => {
          // TBD: Error handling
          console.log(err);
        });
      } else if (type === 'URL') {
        let asset = this.doc.addAsset();
        asset.name = name;
        asset.assetType = 'URL';
        asset.url = meta;
        channel.send('AssetList:addAsset', asset);
      }
      //return this.fileUpload(file);
    });

    channel.bind(this, 'Controller:removeAsset', (asset) => {
      this.doc.removeAsset(asset);
    });

    channel.bind(this, 'Controller:getAssetList', () => {
      return this.doc.assets;
    });

    channel.bind(this, 'Controller:getAsset', (assetName) => {
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
