/**
 * Firestore Service
 * 
 * Handles all Firestore database operations including:
 * - User profile management
 * - README history management
 * - Chat history management
 */

class FirestoreService {
    constructor() {
        this.db = window.firebaseDb;
        this.auth = window.firebaseAuth;
    }
    
    /**
     * Check if Firestore is available
     */
    isAvailable() {
        return this.db !== null && this.auth !== null;
    }
    
    /**
     * Get current user ID
     * @private
     */
    getCurrentUserId() {
        const user = this.auth?.currentUser;
        if (!user) {
            throw new Error('User must be authenticated to perform this operation');
        }
        return user.uid;
    }
    
    // ==================== USER PROFILE OPERATIONS ====================
    
    /**
     * Create user profile in Firestore
     * 
     * @param {string} userId - User ID
     * @param {Object} userData - User data
     * @param {string} userData.email - User email
     * @param {string} userData.displayName - User display name
     * @param {string|null} userData.photoURL - User photo URL
     * @param {string} userData.provider - Auth provider (email/google)
     * @returns {Promise<void>}
     */
    async createUserProfile(userId, userData) {
        if (!this.isAvailable()) {
            throw new Error('Firestore is not available');
        }
        
        try {
            await this.db.collection('users').doc(userId).set({
                userId: userId,
                email: userData.email,
                displayName: userData.displayName,
                photoURL: userData.photoURL || null,
                provider: userData.provider,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ User profile created:', userId);
        } catch (error) {
            console.error('❌ Error creating user profile:', error);
            throw new Error('Failed to create user profile');
        }
    }
    
    /**
     * Get user profile from Firestore
     * 
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User profile or null if not found
     */
    async getUserProfile(userId) {
        if (!this.isAvailable()) {
            throw new Error('Firestore is not available');
        }
        
        try {
            const doc = await this.db.collection('users').doc(userId).get();
            
            if (doc.exists) {
                return doc.data();
            } else {
                console.warn('⚠️ User profile not found:', userId);
                return null;
            }
        } catch (error) {
            console.error('❌ Error getting user profile:', error);
            throw new Error('Failed to get user profile');
        }
    }
    
    /**
     * Update user profile in Firestore
     * 
     * @param {string} userId - User ID
     * @param {Object} updates - Fields to update
     * @returns {Promise<void>}
     */
    async updateUserProfile(userId, updates) {
        if (!this.isAvailable()) {
            throw new Error('Firestore is not available');
        }
        
        try {
            await this.db.collection('users').doc(userId).update(updates);
            console.log('✅ User profile updated:', userId);
        } catch (error) {
            console.error('❌ Error updating user profile:', error);
            throw new Error('Failed to update user profile');
        }
    }
    
    // ==================== README HISTORY OPERATIONS ====================
    
    /**
     * Save README to history
     * 
     * @param {string} userId - User ID
     * @param {Object} readmeData - README data
     * @param {string} readmeData.repoUrl - Repository URL
     * @param {string} readmeData.repoName - Repository name
     * @param {string} readmeData.repoOwner - Repository owner
     * @param {string} readmeData.markdown - Generated markdown
     * @param {Object} readmeData.metadata - Repository metadata
     * @param {Object} readmeData.generationOptions - Generation options
     * @returns {Promise<string>} Document ID
     */
    async saveReadmeHistory(userId, readmeData) {
        if (!this.isAvailable()) {
            throw new Error('Firestore is not available');
        }
        
        try {
            const docRef = await this.db
                .collection('users')
                .doc(userId)
                .collection('readmeHistory')
                .add({
                    userId: userId,
                    repoUrl: readmeData.repoUrl,
                    repoName: readmeData.repoName,
                    repoOwner: readmeData.repoOwner,
                    markdown: readmeData.markdown,
                    metadata: readmeData.metadata || {},
                    generationOptions: readmeData.generationOptions || {},
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            
            console.log('✅ README saved to history:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error saving README history:', error);
            throw new Error('Failed to save README to history');
        }
    }
    
    /**
     * Get README history for user
     * 
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of items to return (default: 50)
     * @returns {Promise<Array>} Array of README history items
     */
    async getReadmeHistory(userId, limit = 50) {
        if (!this.isAvailable()) {
            throw new Error('Firestore is not available');
        }
        
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(userId)
                .collection('readmeHistory')
                .orderBy('createdAt', 'desc')
                .limit(limit)
                .get();
            
            const history = [];
            snapshot.forEach(doc => {
                history.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ Retrieved ${history.length} README history items`);
            return history;
        } catch (error) {
            console.error('❌ Error getting README history:', error);
            throw new Error('Failed to get README history');
        }
    }
    
    /**
     * Delete README from history
     * 
     * @param {string} userId - User ID
     * @param {string} docId - Document ID
     * @returns {Promise<void>}
     */
    async deleteReadmeHistory(userId, docId) {
        if (!this.isAvailable()) {
            throw new Error('Firestore is not available');
        }
        
        try {
            await this.db
                .collection('users')
                .doc(userId)
                .collection('readmeHistory')
                .doc(docId)
                .delete();
            
            console.log('✅ README deleted from history:', docId);
        } catch (error) {
            console.error('❌ Error deleting README history:', error);
            throw new Error('Failed to delete README from history');
        }
    }
    
    // ==================== CHAT HISTORY OPERATIONS ====================
    
    /**
     * Save chat message to history
     * 
     * @param {string} userId - User ID
     * @param {Object} message - Message data
     * @param {string} message.role - Message role (user/assistant)
     * @param {string} message.content - Message content
     * @param {Object} message.metadata - Optional metadata
     * @returns {Promise<string>} Document ID
     */
    async saveChatMessage(userId, message) {
        if (!this.isAvailable()) {
            throw new Error('Firestore is not available');
        }
        
        try {
            const docRef = await this.db
                .collection('users')
                .doc(userId)
                .collection('chatHistory')
                .add({
                    userId: userId,
                    role: message.role,
                    content: message.content,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    metadata: message.metadata || {}
                });
            
            console.log('✅ Chat message saved:', docRef.id);
            return docRef.id;
        } catch (error) {
            console.error('❌ Error saving chat message:', error);
            throw new Error('Failed to save chat message');
        }
    }
    
    /**
     * Get chat history for user
     * 
     * @param {string} userId - User ID
     * @param {number} limit - Maximum number of messages to return (default: 100)
     * @returns {Promise<Array>} Array of chat messages
     */
    async getChatHistory(userId, limit = 100) {
        if (!this.isAvailable()) {
            throw new Error('Firestore is not available');
        }
        
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(userId)
                .collection('chatHistory')
                .orderBy('timestamp', 'asc')
                .limit(limit)
                .get();
            
            const messages = [];
            snapshot.forEach(doc => {
                messages.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            console.log(`✅ Retrieved ${messages.length} chat messages`);
            return messages;
        } catch (error) {
            console.error('❌ Error getting chat history:', error);
            throw new Error('Failed to get chat history');
        }
    }
    
    /**
     * Clear all chat history for user
     * 
     * @param {string} userId - User ID
     * @returns {Promise<number>} Number of messages deleted
     */
    async clearChatHistory(userId) {
        if (!this.isAvailable()) {
            throw new Error('Firestore is not available');
        }
        
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(userId)
                .collection('chatHistory')
                .get();
            
            const batch = this.db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            
            await batch.commit();
            
            const count = snapshot.size;
            console.log(`✅ Cleared ${count} chat messages`);
            return count;
        } catch (error) {
            console.error('❌ Error clearing chat history:', error);
            throw new Error('Failed to clear chat history');
        }
    }
    
    // ==================== HELPER METHODS ====================
    
    /**
     * Check if user has any README history
     * 
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} True if user has history
     */
    async hasReadmeHistory(userId) {
        if (!this.isAvailable()) {
            return false;
        }
        
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(userId)
                .collection('readmeHistory')
                .limit(1)
                .get();
            
            return !snapshot.empty;
        } catch (error) {
            console.error('❌ Error checking README history:', error);
            return false;
        }
    }
    
    /**
     * Check if user has any chat history
     * 
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} True if user has history
     */
    async hasChatHistory(userId) {
        if (!this.isAvailable()) {
            return false;
        }
        
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(userId)
                .collection('chatHistory')
                .limit(1)
                .get();
            
            return !snapshot.empty;
        } catch (error) {
            console.error('❌ Error checking chat history:', error);
            return false;
        }
    }
    
    /**
     * Get README history count
     * 
     * @param {string} userId - User ID
     * @returns {Promise<number>} Number of README history items
     */
    async getReadmeHistoryCount(userId) {
        if (!this.isAvailable()) {
            return 0;
        }
        
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(userId)
                .collection('readmeHistory')
                .get();
            
            return snapshot.size;
        } catch (error) {
            console.error('❌ Error getting README history count:', error);
            return 0;
        }
    }
    
    /**
     * Get chat message count
     * 
     * @param {string} userId - User ID
     * @returns {Promise<number>} Number of chat messages
     */
    async getChatMessageCount(userId) {
        if (!this.isAvailable()) {
            return 0;
        }
        
        try {
            const snapshot = await this.db
                .collection('users')
                .doc(userId)
                .collection('chatHistory')
                .get();
            
            return snapshot.size;
        } catch (error) {
            console.error('❌ Error getting chat message count:', error);
            return 0;
        }
    }
}

// Create and export singleton instance
const firestoreService = new FirestoreService();
window.firestoreService = firestoreService;

console.log('💾 Firestore Service initialized');
