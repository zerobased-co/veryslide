import html2canvas from 'html2canvas';

import { uuid } from '../core/Util';
import channel from '../core/Channel';

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

    channel.bind(this, 'Document:addPage', () => {
      const newPage = this.doc.addPage();
      channel.send('PageList:addPage', newPage);
    });

    channel.bind(this, 'Document:selectPage', (page) => {
      this.page = page;
      this.object = null;
    });

    channel.bind(this, 'Document:removePage', () => {
      if (this.page == null) return;
      if (this.page == this.clipboard) { this.clipboard = null };

      channel.send('PageList:removePage', this.page);

      const nextpage = this.doc.removePage(this.page);
      this.page = nextpage;

      if (nextpage == null) {
        channel.send('Viewport:clear', nextpage);
      } else {
        channel.send('PageList:selectPage', nextpage);
      }
    });

    channel.bind(this, 'Document:addObject', (objType, states, file) => {
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

    channel.bind(this, 'Document:selectObject', (object) => {
      this.object = object;
    });

    channel.bind(this, 'Document:removeObject', () => {
      if (this.object == null) return;
      if (this.object == this.clipboard) { this.clipboard = null };
      this.page.removeObject(this.object);
      this.object = null;

      channel.send('Viewport:blur');
    });

    channel.bind(this, 'Document:orderBack', (object) => {
      if (object == null) return;
      if (this.page == null) return;
      this.page.objects.makeHead(object);
      this.page.reorder();
    });

    channel.bind(this, 'Document:orderFront', (object) => {
      if (object == null) return;
      if (this.page == null) return;
      this.page.objects.makeLast(object);
      this.page.reorder();
    });

    channel.bind(this, 'Document:orderBackward', (object) => {
      if (object == null) return;
      if (this.page == null) return;
      this.page.objects.backward(object);
      this.page.reorder();
    });

    channel.bind(this, 'Document:orderForward', (object) => {
      if (object == null) return;
      if (this.page == null) return;
      this.page.objects.forward(object);
      this.page.reorder();
    });

    channel.bind(this, 'Document:copy', () => {
      if (this.object != null) {
        this.clipboard = this.object;
      } else if (this.page != null) {
        this.clipboard = this.page;
      }
    });

    channel.bind(this, 'Document:paste', () => {
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
          newObject = new Page();
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
          this.doc.appendPage(newObject);
          channel.send('PageList:addPage', newObject);
        } else {
          if (this.page != null) {
            this.page.appendObject(newObject);
            if (this.page == this.clipboard.page) {
              newObject.x += 10;
              newObject.y += 10;
            }
            this.clipboard = newObject;
            this.object = newObject;
            channel.send('Handler:connect', newObject);
          }
        }
      }
    });

    channel.bind(this, 'Document:savePage', (format) => {
      if (this.page == null) return;

      // TBD: we have to hide things before capturing
      if (format == 'image') {
        html2canvas(this.page.node, {
          allowTaint: false,
          useCORS: true,
          backgroundColor: this.page.color,
          scrollX: parseInt(window.scrollX),
          scrollY: -parseInt(window.scrollY),
        }).then((canvas) => {
          var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");

          var link = document.createElement("a");
          link.download = 'veryslide' + (this.page.order + 1) + '.png';
          link.href = image;

          document.body.appendChild(link);
          link.click();

          // Cleanup the DOM
          document.body.removeChild(link);
        });
      }
    });

    channel.bind(this, 'Document:addAsset', (type, name, meta) => {
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
      }
      //return this.fileUpload(file);
    });

    channel.bind(this, 'Document:removeAsset', (asset) => {
      this.doc.removeAsset(asset);
    });

    channel.bind(this, 'Document:getAssetList', () => {
      return this.doc.assets;
    });

    channel.bind(this, 'Document:getAsset', (assetName) => {
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
