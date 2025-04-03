import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, onSnapshot } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-key",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "demo-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Authentication functions
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};

// Firestore helper functions
export const createDocument = async (collectionName: string, id: string, data: any) => {
  try {
    await setDoc(doc(db, collectionName, id), data);
    return { id, ...data };
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw error;
  }
};

export const getDocument = async (collectionName: string, id: string) => {
  try {
    const docSnap = await getDoc(doc(db, collectionName, id));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw error;
  }
};

export const getDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    await updateDoc(doc(db, collectionName, id), data);
    return { id, ...data };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

export const queryDocuments = async (collectionName: string, field: string, operator: any, value: any) => {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw error;
  }
};

export const subscribeToCollection = (
  collectionName: string, 
  callback: (data: any[]) => void,
  field?: string,
  operator?: any,
  value?: any
) => {
  try {
    let q;
    if (field && operator && value !== undefined) {
      q = query(collection(db, collectionName), where(field, operator, value));
    } else {
      q = collection(db, collectionName);
    }
    
    return onSnapshot(q, (querySnapshot) => {
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(documents);
    });
  } catch (error) {
    console.error(`Error subscribing to ${collectionName}:`, error);
    throw error;
  }
};

export const subscribeToDocument = (
  collectionName: string,
  id: string,
  callback: (data: any) => void
) => {
  try {
    return onSnapshot(doc(db, collectionName, id), (docSnapshot) => {
      if (docSnapshot.exists()) {
        callback({ id: docSnapshot.id, ...docSnapshot.data() });
      } else {
        callback(null);
      }
    });
  } catch (error) {
    console.error(`Error subscribing to document in ${collectionName}:`, error);
    throw error;
  }
};

export { db, auth };
