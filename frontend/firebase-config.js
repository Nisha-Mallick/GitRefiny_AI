/**
 * Firebase Configuration and Initialization
 * 
 * This module initializes Firebase with configuration from environment variables
 * and exports Firebase services (auth, firestore) for use throughout the application.
 */

// Firebase configuration object
// These values should be set in your .env file
// See FIREBASE_SETUP.md for instructions on getting these values
const firebaseConfig = {
  apiKey: "AIzaSyBT0pPuGJPCdEYKi59hKnGYSxs61cHM45k",
  authDomain: "gitrefiny-ffb43.firebaseapp.com",
  projectId: "gitrefiny-ffb43",
  storageBucket: "gitrefiny-ffb43.firebasestorage.app",
  messagingSenderId: "404430936934",
  appId: "1:404430936934:web:c541032700d9ee076686a7"
};

// Check if Firebase configuration is properly set
function validateFirebaseConfig() {
    const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missingFields = [];
    
    for (const field of requiredFields) {
        if (!firebaseConfig[field] || firebaseConfig[field].startsWith('FIREBASE_')) {
            missingFields.push(field);
        }
    }
    
    if (missingFields.length > 0) {
        console.error('❌ Firebase configuration is incomplete!');
        console.error('Missing or invalid fields:', missingFields.join(', '));
        console.error('Please update firebase-config.js with your Firebase project credentials.');
        console.error('See FIREBASE_SETUP.md for instructions.');
        return false;
    }
    
    return true;
}

// Initialize Firebase
let app = null;
let auth = null;
let db = null;

try {
    if (validateFirebaseConfig()) {
        // Initialize Firebase app
        app = firebase.initializeApp(firebaseConfig);
        
        // Initialize Firebase services
        auth = firebase.auth();
        db = firebase.firestore();
        
        // Enable Firestore offline persistence for better UX
        db.enablePersistence({ synchronizeTabs: true })
            .catch((err) => {
                if (err.code === 'failed-precondition') {
                    console.warn('⚠️ Firestore persistence failed: Multiple tabs open');
                } else if (err.code === 'unimplemented') {
                    console.warn('⚠️ Firestore persistence not available in this browser');
                } else {
                    console.error('❌ Firestore persistence error:', err);
                }
            });
        
        console.log('✅ Firebase initialized successfully');
        console.log('📦 Project ID:', firebaseConfig.projectId);
    } else {
        console.warn('⚠️ Firebase not initialized due to configuration errors');
        console.warn('The app will work in limited mode without authentication and data persistence');
    }
} catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    console.error('The app will work in limited mode without authentication and data persistence');
}

// Export Firebase services
// These will be null if Firebase initialization failed
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;

// Helper function to check if Firebase is available
window.isFirebaseAvailable = function() {
    return app !== null && auth !== null && db !== null;
};

// Log Firebase availability status
if (window.isFirebaseAvailable()) {
    console.log('🔥 Firebase services ready:');
    console.log('  ✓ Authentication');
    console.log('  ✓ Firestore Database');
} else {
    console.log('⚠️ Firebase services not available');
    console.log('  ✗ Authentication disabled');
    console.log('  ✗ Data persistence disabled');
}
