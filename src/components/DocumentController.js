import channel from '../core/Channel';

class DocumentController {
  constructor(doc, editor) {
    this.doc = doc;
    this.editor = editor;
    this.selectedPage = null;

    channel.bind(this, 'Document:addPage', (value) => {
      const page = this.doc.addPage();
      channel.send('PageList:addPage', page);
    });

    channel.bind(this, 'selectPage', (page) => {
      this.selectedPage = page;
      console.log('selectPage:', this.selectedPage.order);
    });

    channel.bind(this, 'Document:removePage', (value) => {
      if (this.selectedPage === null ) return;

      channel.send('PageList:removePage', this.selectedPage);

      const nextpage = this.doc.removePage(this.selectedPage);
      console.log('nextpage', nextpage);
      this.selectedPage = nextpage;

      if (nextpage === null) {
        channel.send('Viewport:clear', nextpage);
      } else {
        channel.send('PageList:selectPage', nextpage);
      }
    });

    channel.bind(this, 'DocumentPage:addShape', (value) => {
    });
  }
}

export default DocumentController
