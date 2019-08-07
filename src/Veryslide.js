import channel from './core/Channel';
import Editor from './components/Editor';
import Document from './components/Document';
import DocumentController from './components/DocumentController';
import State from './core/State.js';

class Veryslide extends State {
  constructor(state) {
    super({
      target: null,
      firebase: null,
      slideId: null,
      data: null,

      document: null,
      editor: null,
      controller: null,

      ...state,
    });

    // TBD: every veryslide uses their own channel, not a singleton.
    channel.cleanup();

    this.document = new Document();
    this.editor = new Editor();
    this.documentController = new DocumentController(this.document, this.editor);
    this.documentController.firebase = this.firebase;
    this.documentController.slideId = this.slideId;

    this.target.appendChild(this.editor.node);
    if (this.data != null) {
      this.deserialize(this.data);
    }

    channel.bind(this, 'Veryslide:save', this.save);
  }

  save() {
    this.editor.loading(true);
    let data = this.document.serialize();
    console.log(data.length);

    // TBD: permission check
    this.firebase.slide(this.slideId).update({data}).then(() => {
      this.editor.loading(false);
      //alert('Successfully saved.');
    }).catch(function(error) {
      this.editor.loading(false);
      console.log("Error saving document:", error);
    });
  }

  destroy() {
    this.editor.destroy();
  }

  deserialize(data) {
    this.document.deserialize(data);
  }
}

export default Veryslide;
