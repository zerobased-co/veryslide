import channel from './core/Channel';
import Editor from './components/Editor';
import Document from './components/Document';
import DocumentController from './components/DocumentController';

class Veryslide {
  constructor(target, options) {
    // TBD: every veryslide uses their own channel, not a singleton.
    channel.cleanup();
    this.target = target;
    this.options = options;

    this.document = new Document();
    this.editor = new Editor();
    this.documentController = new DocumentController(this.document, this.editor);

    this.target.appendChild(this.editor.node);
    console.log('new Veryslide');
  }
}

export default Veryslide;
