import Editor from './components/editor';
import Document from './components/document';

class Veryslide {
  constructor(target, options) {
    this.target = target;
    this.options = options;
    this.document = new Document();
    this.editor = new Editor();

    this.target.appendChild(this.editor.render());
  }
}

window.Veryslide = Veryslide;
