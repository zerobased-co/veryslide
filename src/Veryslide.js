import Editor from './components/Editor';
import Document from './components/Document';
import DocumentController from './components/DocumentController';
import channel from 'core/Channel.js';
import State from 'core/State.js';

class Veryslide extends State {
  constructor(state) {
    super({
      target: null,
      firebase: null,
      slideId: null,
      info: null,
      data: null,

      doc: null,
      editor: null,
      controller: null,

      ...state,
    });

    document.body.style.overflow = 'hidden';

    // TBD: every veryslide uses their own channel, not a singleton.
    channel.cleanup();

    const doc = this.doc = new Document(this.info);
    const editor = this.editor = new Editor({ doc });

    this.documentController = new DocumentController({ doc, editor });
    this.documentController.firebase = this.firebase;
    this.documentController.slideId = this.slideId;

    this.target.appendChild(this.editor.node);
    if (this.data != null) {
      this.deserialize(this.data);
      // for supporting legacy documents (no order)
      doc.reorder();
      this.editor.init();
    }
    this.listen('Veryslide:save', this.save);
  }

  rename(title) {
    // TBD
  }

  resize(width, height) {
    // TBD
  }

  save() {
    this.editor.loading(true);
    this.editor.setLoadingText('Saving pages...');
    // TBD: On Firestore, we don't have to bake into string and make it back to json object again.
    let data = JSON.parse(this.doc.serialize());
    let editor = this.editor;

    // TBD: only owner can save slide, not by collaborators (future)
    this.firebase.slide(this.slideId).collection('revisions').add({
      data: data,
      timestamp: this.firebase.serverTimestamp(),
    }).then((docRef) => {
      /* Save multiple pages at once */
      let batch = this.firebase.db.batch();
      this.doc.pages.forEach(page => {
        let data = JSON.parse(page.serialize());
        let pageRef = docRef.collection('pages').doc(page.paddedOrder());
        batch.set(pageRef, data);
      });

      batch.commit().then(() => {
        // update latest revision with thumbnail
        this.info.latestRevision = docRef.id;
        this.info.totalPages = this.doc.pages.length;

        // if there is a thumbnail, then store it for list view
        if (this.doc.pages.length > 0) {
          this.info.thumbnail = this.doc.pages[0].thumbnail;
        }
        this.firebase.slide(this.slideId).update({
          data: null, // to remove old data (not used)
          info: this.info
        }).then((docRef) => {
          this.editor.loading(false);
          // TBD: TOAST THIS MESSAGE
          //alert('Successfully saved.');
        });
      });
    }).catch(function(error) {
      editor.loading(false);
      console.log("Error saving document:", error);
    });
  }

  destroy() {
    document.body.style.overflow = 'auto';
    this.editor.destroy();
  }

  deserialize(data) {
    this.doc.deserialize(data);
  }
}

export default Veryslide;
