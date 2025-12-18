// firebase_auth.js
import { auth } from './firebaseConfig.jsx';
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

// Create Google auth provider
const provider = new GoogleAuthProvider();

// Sign in with Google
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user; // Logged-in user info
    const token = result.user.accessToken; // Optional: access token
    return { user, token };
  } catch (error) {
    console.error("Google Sign-in error:", error);
    throw error;
  }
};

// Sign out user
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Sign out error:", error);
  }
};
