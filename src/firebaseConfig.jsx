// firebaseConfig.jsx
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCMb5GFpzdF7H8n1I3W30O4KXfiiuSHHZQ",
  authDomain: "wanderai-43690.firebaseapp.com",
  projectId: "wanderai-43690",
  storageBucket: "wanderai-43690.appspot.com",
  messagingSenderId: "2445898738",
  appId: "1:2445898738:web:f12e499efd514f5ffd716b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);        // Firebase Authentication
const db = getFirestore(app);     // Firestore Database
const storage = getStorage(app);  // Firebase Storage

// Export services for use in the app
export { app, auth, db, storage };
