import channel from './core/Channel';
import Editor from './components/Editor';
import Document from './components/Document';
import DocumentController from './components/DocumentController';

class Veryslide {
  constructor(target, data) {
    // TBD: every veryslide uses their own channel, not a singleton.
    channel.cleanup();
    this.target = target;

    this.document = new Document();
    this.editor = new Editor();
    this.documentController = new DocumentController(this.document, this.editor);

    this.target.appendChild(this.editor.node);
    console.log('new Veryslide');

    if (data != null) {
      this.deserialize(data);
    }
  }

  destroy() {
    this.editor.destroy();
  }

  serialize() {
    return this.document.serialize();
  }

  deserialize(data) {
    this.document.deserialize(data);
  }
}

export default Veryslide;
