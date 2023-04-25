import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAlnloPLGwc6lryIA3zl3qz8Ztsz_h0hxo",
  authDomain: "chat-app-48ae2.firebaseapp.com",
  projectId: "chat-app-48ae2",
  storageBucket: "chat-app-48ae2.appspot.com",
  messagingSenderId: "706239332656",
  appId: "1:706239332656:web:2e27037b3ca8a74c90c8f5",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
