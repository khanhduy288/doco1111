import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAKPBf6jSh5EB_iIrvuXAzCPhCtxcBesZo",
  authDomain: "sendsms-e13ab.firebaseapp.com",
  projectId: "sendsms-e13ab",
  storageBucket: "sendsms-e13ab.appspot.com",
  messagingSenderId: "215268958327",
  appId: "1:215268958327:web:f7b1c32c6d171d2ae2e672",
  measurementId: "G-W3LEWLHM1N"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
