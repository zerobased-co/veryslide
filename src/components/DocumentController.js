import channel from '../core/Channel';

class DocumentController {
  constructor(doc, editor) {
    this.doc = doc;
    this.editor = editor;
    this.page = null;

    channel.bind(this, 'Document:addPage', (value) => {
      const newPage = this.doc.addPage();
      channel.send('PageList:addPage', newPage);
    });

    channel.bind(this, 'selectPage', (page) => {
      this.page = page;
    });

    channel.bind(this, 'Document:removePage', (value) => {
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
      channel.send('Viewport:addObject', newObject);
      channel.send('Viewport:focus', newObject);
    });
  }
}

export default DocumentController
