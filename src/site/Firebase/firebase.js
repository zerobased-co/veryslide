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
import { getDatabase, ref, set, onValue, off } from 'firebase/database';

class Firebase {
  constructor() {
    this.app = initializeApp(process.env.FIREBASE_CONFIG);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
    this.rtdb = getDatabase(this.app);
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

  /* Realtime Database for Remote Control */
  setPresentationState = (pinCode, currentPage, totalPages, ownerId) => {
    return set(ref(this.rtdb, `presentations/${pinCode}`), {
      currentPage,
      totalPages,
      command: null,
      ownerId,
      timestamp: Date.now()
    });
  };

  updatePresentationPage = (pinCode, currentPage) => {
    return set(ref(this.rtdb, `presentations/${pinCode}/currentPage`), currentPage);
  };

  sendRemoteCommand = (pinCode, command) => {
    return set(ref(this.rtdb, `presentations/${pinCode}/command`), command);
  };

  listenToPresentationCommands = (pinCode, callback) => {
    const commandRef = ref(this.rtdb, `presentations/${pinCode}/command`);
    onValue(commandRef, callback);
    return commandRef;
  };

  listenToPresentationState = (pinCode, callback) => {
    const presentationRef = ref(this.rtdb, `presentations/${pinCode}`);
    onValue(presentationRef, callback);
    return presentationRef;
  };

  stopListening = (dbRef) => {
    off(dbRef);
  };

  /* Misc */
  serverTimestamp = () => sts();
}

export default Firebase;