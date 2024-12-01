import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBkkFF0XhNZeWuDmOfEhsgdfX1VBG7WTas",
  authDomain: "chat-room-demo-xxxxx.firebaseapp.com",
  projectId: "chat-room-demo-xxxxx",
  storageBucket: "chat-room-demo-xxxxx.appspot.com",
  messagingSenderId: "xxxxxxxxxxxxx",
  appId: "1:xxxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxx"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);