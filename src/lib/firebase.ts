import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCdjZABgv3I9IJo2X8xIQeHgJq4wkM-xCQ",
    authDomain: "pyq-saas.firebaseapp.com",
    projectId: "pyq-saas",
    storageBucket: "pyq-saas.firebasestorage.app",
    messagingSenderId: "131385650192",
    appId: "1:131385650192:web:f9ada2110a4bd659a5ae95",
    measurementId: "G-HBWHV2J61X"
  
};
  
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };

