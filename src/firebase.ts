import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBYJq8T7hMP3OsZ0PYqkWe-dDCWB8_b0Ck",
  authDomain: "line-free-4bb96.firebaseapp.com",
  projectId: "line-free-4bb96",
  storageBucket: "line-free-4bb96.firebasestorage.app",
  messagingSenderId: "137966607796",
  appId: "1:137966607796:web:bc84b4884650911d9ea6e1",
  measurementId: "G-6Z6YQ8Z6CC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
export default app;
