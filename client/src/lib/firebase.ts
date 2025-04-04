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

// Firestore functions with robust error handling
export const createDocument = async (collectionName: string, id: string, data: any) => {
  try {
    return await setDoc(doc(db, collectionName, id), data);
  } catch (error) {
    console.error(`Error creating document in ${collectionName}:`, error);
    throw new Error(`Failed to create ${collectionName} document: ${(error as Error).message}`);
  }
};

export const getDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document from ${collectionName}:`, error);
    throw new Error(`Failed to get ${collectionName} document: ${(error as Error).message}`);
  }
};

export const getDocuments = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw new Error(`Failed to get ${collectionName} documents: ${(error as Error).message}`);
  }
};

export const updateDocument = async (collectionName: string, id: string, data: any) => {
  try {
    const docRef = doc(db, collectionName, id);
    return await updateDoc(docRef, data);
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw new Error(`Failed to update ${collectionName} document: ${(error as Error).message}`);
  }
};

export const deleteDocument = async (collectionName: string, id: string) => {
  try {
    const docRef = doc(db, collectionName, id);
    return await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw new Error(`Failed to delete ${collectionName} document: ${(error as Error).message}`);
  }
};

export const queryDocuments = async (collectionName: string, field: string, operator: any, value: any) => {
  try {
    const q = query(collection(db, collectionName), where(field, operator, value));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Error querying documents from ${collectionName}:`, error);
    throw new Error(`Failed to query ${collectionName} documents: ${(error as Error).message}`);
  }
};

export const subscribeToCollection = (
  collectionName: string,
  callback: (data: any[]) => void
) => {
  try {
    return onSnapshot(
      collection(db, collectionName), 
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
      },
      (error) => {
        console.error(`Error subscribing to ${collectionName} collection:`, error);
        throw new Error(`Failed to subscribe to ${collectionName} collection: ${error.message}`);
      }
    );
  } catch (error) {
    console.error(`Error setting up subscription to ${collectionName}:`, error);
    throw new Error(`Failed to set up subscription to ${collectionName}: ${(error as Error).message}`);
  }
};

export const subscribeToDocument = (
  collectionName: string,
  id: string,
  callback: (data: any) => void
) => {
  try {
    return onSnapshot(
      doc(db, collectionName, id), 
      (doc) => {
        if (doc.exists()) {
          callback({ id: doc.id, ...doc.data() });
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error(`Error subscribing to document ${id} in ${collectionName}:`, error);
        throw new Error(`Failed to subscribe to document in ${collectionName}: ${error.message}`);
      }
    );
  } catch (error) {
    console.error(`Error setting up document subscription in ${collectionName}:`, error);
    throw new Error(`Failed to set up document subscription in ${collectionName}: ${(error as Error).message}`);
  }
};

export { auth, db };