import channel from '../core/Channel';

class DocumentController {
  constructor(doc, editor) {
    this.doc = doc;
    this.editor = editor;
    this.page = null;
    this.object = null;

    channel.bind(this, 'Document:addPage', () => {
      const newPage = this.doc.addPage();
      channel.send('PageList:addPage', newPage);
    });

    channel.bind(this, 'Document:selectPage', (page) => {
      this.page = page;
      this.object = null;
    });

    channel.bind(this, 'Document:removePage', () => {
      if (this.page === null) return;

      channel.send('PageList:removePage', this.page);

      const nextpage = this.doc.removePage(this.page);
      this.page = nextpage;

      if (nextpage === null) {
        channel.send('Viewport:clear', nextpage);
      } else {
        channel.send('PageList:selectPage', nextpage);
      }
    });

    channel.bind(this, 'Document:addObject', (value) => {
      if (this.page === null) return;
      let newObject = this.page.addObject(value);
      channel.send('Viewport:focus', newObject);
    });

    channel.bind(this, 'Document:selectObject', (object) => {
      this.object = object;
    });

    channel.bind(this, 'Document:removeObject', () => {
      if (this.object === null) return;
      this.page.removeObject(this.object);
      this.object = null;

      channel.send('Viewport:blur');
    });

    channel.bind(this, 'Document:orderBack', (object) => {
      if (this.page === null) return;
      this.page.objects.makeHead(object);
      this.page.reorder();
    });

    channel.bind(this, 'Document:orderFront', (object) => {
      if (this.page === null) return;
      this.page.objects.makeLast(object);
      this.page.reorder();
    });

    channel.bind(this, 'Document:orderBackward', (object) => {
      if (this.page === null) return;
      this.page.objects.backward(object);
      this.page.reorder();
    });

    channel.bind(this, 'Document:orderForward', (object) => {
      if (this.page === null) return;
      this.page.objects.forward(object);
      this.page.reorder();
    });
  }
}

export default DocumentController
