import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithRedirect, 
  GoogleAuthProvider,
  signOut as firebaseSignOut
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs,
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  onSnapshot
} from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  return signInWithRedirect(auth, provider);
};

export const logOut = async () => {
  return firebaseSignOut(auth);
};

// Firestore functions
export const createDocument = async (collectionName: string, id: string, data: any) => {
  return setDoc(doc(db, collectionName, id), data);
};

export const getDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    return null;
  }
};

export const getDocuments = async (collectionName: string) => {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  const docRef = doc(db, collectionName, id);
  return updateDoc(docRef, data);
};

export const deleteDocument = async (collectionName: string, id: string) => {
  const docRef = doc(db, collectionName, id);
  return deleteDoc(docRef);
};

export const queryDocuments = async (collectionName: string, field: string, operator: any, value: any) => {
  const q = query(collection(db, collectionName), where(field, operator, value));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToCollection = (
  collectionName: string,
  callback: (data: any[]) => void
) => {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
};

export const subscribeToDocument = (
  collectionName: string,
  id: string,
  callback: (data: any) => void
) => {
  return onSnapshot(doc(db, collectionName, id), (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

export { auth, db };