import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {

  apiKey: "AIzaSyBWMNrCd4xhDKR1DtRQlH6NUQQpM1vKXUM",
  authDomain: "anand-project-3de15.firebaseapp.com",
  projectId: "anand-project-3de15",
  storageBucket: "anand-project-3de15.firebasestorage.app",
  messagingSenderId: "494636004016",
  appId: '1:494636004016:web:b1b10060590b5e9f7e4175',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);