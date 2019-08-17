import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

class Firebase {
  constructor() {
    app.initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));

    this.auth = app.auth();
    this.db = app.firestore();
    this.storage = app.storage();
  }

  /* Auth */
  doCreateUserWithEmailAndPassword = (email, password) =>
    this.auth.createUserWithEmailAndPassword(email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    this.auth.signInWithEmailAndPassword(email, password);

  doSignOut = () =>
    this.auth.signOut();

  doPasswordReset = (email) =>
    this.auth.sendPasswordResetEmail(email);

  doPasswordUpdate = (password) =>
    this.auth.currentUser.updatePassword(password);

  /* Database */
  users = () => this.db.collection('users');
  user = (uid) => this.db.collection('users').doc(uid);
  currentUser = () => this.user(this.auth.currentUser.uid);

  slide = (id) => this.db.collection('slides').doc(id);
  mySlides = () => this.db.collection('slides').where(
    'uid', '==', this.auth.currentUser.uid
  );
  newSlide = (info) => this.db.collection('slides').add({
    uid: this.auth.currentUser.uid,
    info: info,
  });
}

export default Firebase;
