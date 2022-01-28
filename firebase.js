// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBwgjtwHgKWF9wbGtVtxQ95JFevR1SNWus",
  authDomain: "tinder-clone-ecdf6.firebaseapp.com",
  projectId: "tinder-clone-ecdf6",
  storageBucket: "tinder-clone-ecdf6.appspot.com",
  messagingSenderId: "847703685699",
  appId: "1:847703685699:web:e7c4fb78907802924db2f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

export { auth, db }; //Access outside this file