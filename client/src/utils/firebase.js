import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-bb2d1.firebaseapp.com",
  projectId: "interviewiq-bb2d1",
  storageBucket: "interviewiq-bb2d1.firebasestorage.app",
  messagingSenderId: "1034440589971",
  appId: "1:1034440589971:web:d4469f7c33b58437ebc366"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export {auth, provider}