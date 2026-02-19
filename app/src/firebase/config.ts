import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyACXeaio2Gz-RD1nkVrlJzPnfvdj8DxLUI",
  authDomain: "aa-tracker-86e72.firebaseapp.com",
  projectId: "aa-tracker-86e72",
  storageBucket: "aa-tracker-86e72.firebasestorage.app",
  messagingSenderId: "752279159813",
  appId: "1:752279159813:web:d1a7c716751ae0b306086c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
