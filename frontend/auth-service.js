/**
 * Authentication Service
 * 
 * Handles all Firebase Authentication operations including:
 * - Email/password sign-up and sign-in
 * - Google OAuth authentication
 * - Sign-out
 * - Auth state management
 */

class AuthService {
    constructor() {
        this.auth = window.firebaseAuth;
        this.db = window.firebaseDb;
        this.currentUser = null;
        this.authStateListeners = [];
        
        // Initialize auth state listener
        if (this.auth) {
            this.auth.onAuthStateChanged((user) => {
                this.currentUser = user;
                this.notifyAuthStateListeners(user);
            });
        }
    }
    
    /**
     * Check if Firebase Auth is available
     */
    isAvailable() {
        return this.auth !== null && this.db !== null;
    }
    
    /**
     * Sign up with email and password
     * 
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} displayName - User display name
     * @returns {Promise<Object>} User object
     */
    async signUp(email, password, displayName) {
        if (!this.isAvailable()) {
            throw new Error('Firebase Authentication is not available. Please check your configuration.');
        }
        
        try {
            // Create user account
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update user profile with display name
            await user.updateProfile({
                displayName: displayName
            });
            
            // Create user profile in Firestore
            await this.createUserProfile(user.uid, {
                email: email,
                displayName: displayName,
                photoURL: null,
                provider: 'email',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ User signed up successfully:', user.uid);
            
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            };
        } catch (error) {
            console.error('❌ Sign up error:', error);
            throw this.handleAuthError(error);
        }
    }
    
    /**
     * Sign in with email and password
     * 
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} User object
     */
    async signIn(email, password) {
        if (!this.isAvailable()) {
            throw new Error('Firebase Authentication is not available. Please check your configuration.');
        }
        
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Update last login time
            await this.updateUserProfile(user.uid, {
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ User signed in successfully:', user.uid);
            
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            };
        } catch (error) {
            console.error('❌ Sign in error:', error);
            throw this.handleAuthError(error);
        }
    }
    
    /**
     * Sign in with Google OAuth
     * 
     * @returns {Promise<Object>} User object
     */
    async signInWithGoogle() {
        if (!this.isAvailable()) {
            throw new Error('Firebase Authentication is not available. Please check your configuration.');
        }
        
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            provider.addScope('profile');
            provider.addScope('email');
            
            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;
            
            // Check if this is a new user
            const isNewUser = result.additionalUserInfo?.isNewUser;
            
            if (isNewUser) {
                // Create user profile for new Google user
                await this.createUserProfile(user.uid, {
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL,
                    provider: 'google',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                console.log('✅ New Google user profile created:', user.uid);
            } else {
                // Update last login time for existing user
                await this.updateUserProfile(user.uid, {
                    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp(),
                    photoURL: user.photoURL // Update photo in case it changed
                });
                console.log('✅ Existing Google user signed in:', user.uid);
            }
            
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            };
        } catch (error) {
            // Handle popup closed by user
            if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
                console.log('ℹ️ Google sign-in cancelled by user');
                throw new Error('Sign-in cancelled');
            }
            
            console.error('❌ Google sign-in error:', error);
            throw this.handleAuthError(error);
        }
    }
    
    /**
     * Sign out current user
     * 
     * @returns {Promise<void>}
     */
    async signOut() {
        if (!this.isAvailable()) {
            throw new Error('Firebase Authentication is not available.');
        }
        
        try {
            await this.auth.signOut();
            this.currentUser = null;
            console.log('✅ User signed out successfully');
        } catch (error) {
            console.error('❌ Sign out error:', error);
            throw new Error('Failed to sign out. Please try again.');
        }
    }
    
    /**
     * Get current authenticated user
     * 
     * @returns {Object|null} Current user or null
     */
    getCurrentUser() {
        return this.currentUser;
    }
    
    /**
     * Check if user is authenticated
     * 
     * @returns {boolean} True if user is authenticated
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }
    
    /**
     * Listen to authentication state changes
     * 
     * @param {Function} callback - Callback function to call on auth state change
     * @returns {Function} Unsubscribe function
     */
    onAuthStateChanged(callback) {
        this.authStateListeners.push(callback);
        
        // Immediately call with current state
        if (this.currentUser !== undefined) {
            callback(this.currentUser);
        }
        
        // Return unsubscribe function
        return () => {
            const index = this.authStateListeners.indexOf(callback);
            if (index > -1) {
                this.authStateListeners.splice(index, 1);
            }
        };
    }
    
    /**
     * Notify all auth state listeners
     * 
     * @private
     * @param {Object|null} user - Current user or null
     */
    notifyAuthStateListeners(user) {
        this.authStateListeners.forEach(callback => {
            try {
                callback(user);
            } catch (error) {
                console.error('Error in auth state listener:', error);
            }
        });
    }
    
    /**
     * Create user profile in Firestore
     * 
     * @private
     * @param {string} userId - User ID
     * @param {Object} userData - User data
     * @returns {Promise<void>}
     */
    async createUserProfile(userId, userData) {
        try {
            await this.db.collection('users').doc(userId).set({
                userId: userId,
                ...userData
            });
            console.log('✅ User profile created in Firestore');
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            // Don't throw - profile creation failure shouldn't block authentication
        }
    }
    
    /**
     * Update user profile in Firestore
     * 
     * @private
     * @param {string} userId - User ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<void>}
     */
    async updateUserProfile(userId, updates) {
        try {
            await this.db.collection('users').doc(userId).update(updates);
            console.log('✅ User profile updated in Firestore');
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            // Don't throw - profile update failure shouldn't block authentication
        }
    }
    
    /**
     * Handle Firebase Auth errors and return user-friendly messages
     * 
     * @private
     * @param {Error} error - Firebase error
     * @returns {Error} Error with user-friendly message
     */
    handleAuthError(error) {
        const errorMessages = {
            'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
            'auth/invalid-email': 'Please enter a valid email address.',
            'auth/weak-password': 'Password must be at least 6 characters long.',
            'auth/user-not-found': '❌ No account found! Don\'t have an account? Click "Sign up" below to create one.',
            'auth/wrong-password': '❌ Incorrect password. New to GitRefiny? Click "Sign up" below to create an account.',
            'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
            'auth/network-request-failed': 'Network error. Please check your connection.',
            'auth/popup-blocked': 'Popup was blocked. Please allow popups for this site.',
            'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
            'auth/invalid-credential': '❌ Invalid credentials. New user? Click "Sign up" below to create an account.',
            'auth/user-disabled': 'This account has been disabled. Please contact support.',
            'auth/requires-recent-login': 'Please sign in again to complete this action.',
            'auth/invalid-login-credentials': '❌ Invalid email or password. Don\'t have an account? Click "Sign up" below to get started!'
        };
        
        const message = errorMessages[error.code] || error.message || 'An error occurred. Please try again.';
        const newError = new Error(message);
        newError.code = error.code;
        return newError;
    }
}

// Create and export singleton instance
const authService = new AuthService();
window.authService = authService;

console.log('🔐 Authentication Service initialized');
