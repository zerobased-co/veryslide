import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
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
  serverTimestamp as sts ,
} from 'firebase/firestore';
import { getStorage } from "firebase/storage";

class Firebase {
  constructor() {
    this.app = initializeApp(process.env.FIREBASE_CONFIG);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
  }

  /* Auth */
  doCreateUserWithEmailAndPassword = (email, password) =>
    createUserWithEmailAndPassword(this.auth, email, password);

  doSignInWithEmailAndPassword = (email, password) =>
    signInWithEmailAndPassword(this.auth, email, password);

  doSignOut = () =>
    signOut(this.auth);

  doPasswordReset = (email) =>
    sendPasswordResetEmail(this.auth, email);

  doPasswordUpdate = (password) =>
    this.auth.currentUser.updatePassword(password);

  /* Database */
  users = () => collection(this.db, 'users');
  user = (uid) => getDoc(doc(this.db, 'users', uid));
  currentUser = () => this.user(this.auth.currentUser.uid);

  slide = (id) => getDoc(doc(this.db, 'slides', id));
  deleteSlide = (id) => deleteDoc(doc(this.db, 'slides', id));
  mySlides = () => getDocs(query(collection(this.db, 'slides'), where(
    'uid', '==', this.auth.currentUser.uid
  )));
  newSlide = (info) => addDoc(collection(this.db, 'slides'), {
    uid: this.auth.currentUser.uid,
    info: info,
  });

  /* Misc */
  serverTimestamp = () => sts();
}

export default Firebase;
