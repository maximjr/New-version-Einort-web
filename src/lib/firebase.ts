import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore, initializeFirestore, Firestore, setLogLevel } from "firebase/firestore";
import { getAnalytics, Analytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBgZkkDSUz-_bPpCA7t2UAd3Qrw1TeY6js",
  authDomain: "new-einort-web.firebaseapp.com",
  projectId: "new-einort-web",
  storageBucket: "new-einort-web.firebasestorage.app",
  messagingSenderId: "80255620883",
  appId: "1:80255620883:web:b422bd14ad45842eedace6",
  measurementId: "G-SCP4L95TFC"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;
const isFirebaseConfigured = true;

try {
  // Set Firestore log level to silent to prevent internal network errors from being intercepted as critical app errors
  setLogLevel('silent');

  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Enforce session persistence to keep auth tokens out of permanent localStorage
    setPersistence(auth, browserSessionPersistence).catch(() => {});
    db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
  } else {
    app = getApp();
    auth = getAuth(app);
    setPersistence(auth, browserSessionPersistence).catch(() => {});
    db = getFirestore(app);
  }
  
  isSupported().then(yes => {
    if (yes && app) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {
    console.warn("Firebase Analytics not supported in this environment");
  });
} catch (error) {
  console.error("Firebase initialization failed:", error);
}

export { app, auth, db, analytics, isFirebaseConfigured };
