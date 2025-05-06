// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCApq4nuPF8-qyO23i9YxKIld8eiW9kux4",
  authDomain: "wally-982c3.firebaseapp.com",
  projectId: "wally-982c3",
  storageBucket: "wally-982c3.firebasestorage.app",
  messagingSenderId: "319670848881",
  appId: "1:319670848881:web:ee4409c2f6302cceef7ad0",
  measurementId: "G-NG0129V6JE",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
// export const auth = getAuth(app);
