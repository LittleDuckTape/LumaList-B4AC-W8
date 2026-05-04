// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAUAB0elZK0adq3FttGno9WIaN7B2T-_lM",
    authDomain: "lab8-todolist.firebaseapp.com",
    projectId: "lab8-todolist",
    storageBucket: "lab8-todolist.firebasestorage.app",
    messagingSenderId: "758125943415",
    appId: "1:758125943415:web:91dff4ba03337d80c30472"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);