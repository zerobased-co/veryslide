import Editor from './components/Editor';
import Document from './components/Document';
import DocumentController from './components/DocumentController';

class Veryslide {
  constructor(target, options) {
    this.target = target;
    this.options = options;

    this.document = new Document();
    this.editor = new Editor();
    this.documentController = new DocumentController(this.document, this.editor);

    this.target.appendChild(this.editor.node);
  }
}

window.Veryslide = Veryslide;
