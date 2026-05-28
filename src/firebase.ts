import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyAH_iH886nmvOI86uUCK2w0KS6NkjsTQ3c',
  authDomain: 'drp-31-1c7dd.firebaseapp.com',
  projectId: 'drp-31-1c7dd',
  storageBucket: 'drp-31-1c7dd.firebasestorage.app',
  messagingSenderId: '855981206217',
  appId: '1:855981206217:web:6fe69390483ce434967b18',
  measurementId: 'G-B73ZMWLJZG'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
