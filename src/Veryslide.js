import Editor from './components/Editor';
import Document from './components/Document';
import DocumentController from './components/DocumentController';
import channel from 'core/Channel.js';
import State from 'core/State.js';

import {
  getFirestore,
  collection,
  query,
  where,
  doc,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';

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

  async save() {
    this.editor.loading(true);
    this.editor.setLoadingText('Saving pages...');
    // TBD: On Firestore, we don't have to bake into string and make it back to json object again.
    let data = JSON.parse(this.doc.serialize());
    let editor = this.editor;

    // TBD: only owner can save slide, not by collaborators (future)
    const slideRef = doc(this.firebase.db, 'slides', this.slideId);
    const revRef = await addDoc(collection(slideRef, 'revisions'), {
      data: data,
      timestamp: this.firebase.serverTimestamp(),
    });

    /* Save multiple pages at once */
    let batch = writeBatch(this.firebase.db);
    this.doc.pages.forEach(page => {
      let data = JSON.parse(page.serialize());
      let pageRef = doc(revRef, 'pages', page.paddedOrder());
      batch.set(pageRef, data);
    });

    await batch.commit();

    // update latest revision with thumbnail
    this.info.latestRevision = revRef.id;
    this.info.totalPages = this.doc.pages.length;

    // if there is a thumbnail, then store it for list view
    if (this.doc.pages.length > 0) {
      this.info.thumbnail = this.doc.pages[0].thumbnail;
    }

    await updateDoc(slideRef, {
      data: null, // to remove old data (not used)
      info: this.info
    });

    this.editor.loading(false);
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