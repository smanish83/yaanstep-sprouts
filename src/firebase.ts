import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Web config of the Yaanstep Firebase project. These values identify the project; they are not secrets.
// Access to data is protected by security rules, not by hiding this config.
// Analytics is deliberately NOT started: it must be opt-in and off by default for ages 13 to 17.
const firebaseConfig = {
  apiKey: 'AIzaSyC5tGmlIzSKi88r6QrOdLJNhgIz_jD3DVY',
  authDomain: 'yaanstep.firebaseapp.com',
  projectId: 'yaanstep',
  storageBucket: 'yaanstep.firebasestorage.app',
  messagingSenderId: '767252084723',
  appId: '1:767252084723:web:1021bd51be340f26bd4486',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
