// Client-side Firebase SDK for writing analytics events directly to Firestore.
//
// This config is PUBLIC by design — Firebase web config isn't a credential.
// Access is gated by Firestore security rules (see firestore.rules), which
// restrict this key to writing visit docs with a specific schema.
//
// The project `nucleus-website-tracker` is separate from the site's GCP
// project; it exists only to hold analytics data.

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAeq8chmflgnWikK1DQ8tR73j6bD8p6yxg",
    authDomain: "nucleus-website-tracker.firebaseapp.com",
    projectId: "nucleus-website-tracker",
    storageBucket: "nucleus-website-tracker.firebasestorage.app",
    messagingSenderId: "951791469097",
    appId: "1:951791469097:web:b8342b5b26b36d75ba1238",
};

// Our Firestore database is named "default" (not the conventional "(default)"),
// so we have to pass it explicitly.
const DATABASE_ID = "default";

let _app: FirebaseApp | null = null;
let _db: Firestore | null = null;

export function getClientDb(): Firestore {
    if (_db) return _db;
    _app = getApps()[0] ?? initializeApp(firebaseConfig);
    // Use initializeFirestore to specify the custom database ID. This has to
    // be called before any other Firestore call, so we do it once here.
    try {
        _db = initializeFirestore(_app, {}, DATABASE_ID);
    } catch {
        // Already initialized — fall through to getFirestore which will reuse it.
        _db = getFirestore(_app, DATABASE_ID);
    }
    return _db;
}
