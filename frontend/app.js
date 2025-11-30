/**
 * GitRefiny Frontend Application
 */

// API Configuration
// Use Flask backend on port 5000 for local, PythonAnywhere for production
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000'
    : 'https://gitrefiny.onrender.com';  // Replace 'yourusername' with your actual PythonAnywhere username

// State
let currentAnalysis = null;
let currentMarkdown = null;
let isRecording = false;
let recognition = null;

// Initialize markdown-it
const md = window.markdownit({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
        return `<pre class="language-${lang}"><code>${escapeHtml(str)}</code></pre>`;
    }
});

// Utility: Escape HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Utility: Show/Hide Elements
function show(elementId) {
    document.getElementById(elementId)?.classList.remove('hidden');
}

function hide(elementId) {
    document.getElementById(elementId)?.classList.add('hidden');
}

// Utility: Display Error
function showError(message) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    show('error-message');
    setTimeout(() => hide('error-message'), 5000);
}

// API: Analyze Repository
async function analyzeRepository(repoUrl, token = null) {
    try {
        show('loading-indicator');
        hide('error-message');
        
        const response = await fetch(`${API_BASE}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ repo_url: repoUrl, token })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Analysis failed');
        }
        
        return data;
    } catch (error) {
        throw error;
    } finally {
        hide('loading-indicator');
    }
}

// API: Generate README
async function generateReadme(repoUrl, options = {}) {
    try {
        show('generate-loading');
        
        const response = await fetch(`${API_BASE}/api/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                repo_url: repoUrl,
                tone: options.tone || 'professional',
                model: options.model || 'Auto',
                sections: options.sections
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Generation failed');
        }
        
        return data.markdown;
    } catch (error) {
        throw error;
    } finally {
        hide('generate-loading');
    }
}

// Display Analysis Results
function displayAnalysis(analysis) {
    currentAnalysis = analysis;
    
    // Metadata
    const metadataEl = document.getElementById('repo-metadata');
    metadataEl.innerHTML = `
        <p><strong>Name:</strong> ${analysis.repo_meta.name}</p>
        <p><strong>Owner:</strong> ${analysis.repo_meta.owner}</p>
        <p><strong>Description:</strong> ${analysis.repo_meta.description || 'No description'}</p>
        <p><strong>Stars:</strong> ⭐ ${analysis.repo_meta.stars}</p>
        <p><strong>Forks:</strong> 🍴 ${analysis.repo_meta.forks}</p>
    `;
    
    // Languages
    const languagesEl = document.getElementById('languages-breakdown');
    const sortedLangs = Object.entries(analysis.languages)
        .sort((a, b) => b[1] - a[1]);
    
    languagesEl.innerHTML = sortedLangs.map(([lang, pct]) => `
        <div>
            <div class="flex justify-between text-sm mb-1">
                <span>${lang}</span>
                <span>${pct.toFixed(1)}%</span>
            </div>
            <div class="w-full bg-gray-700 rounded-full h-2">
                <div class="bg-green-accent h-2 rounded-full" style="width: ${pct}%"></div>
            </div>
        </div>
    `).join('');
    
    // Tech Stack
    const techStackEl = document.getElementById('tech-stack');
    techStackEl.innerHTML = analysis.detected_stack.map(tech => `
        <span class="px-3 py-1 bg-green-accent bg-opacity-20 text-green-light rounded-full text-sm border border-green-accent">
            ${tech}
        </span>
    `).join('');
    
    // File Structure
    const fileStructureEl = document.getElementById('file-structure');
    fileStructureEl.innerHTML = `
        <p class="mb-2">Total Files: ${analysis.file_tree_summary.total_files} | Directories: ${analysis.file_tree_summary.total_dirs}</p>
        <pre class="text-xs">${analysis.file_tree_summary.top_level_structure.join('\n')}</pre>
    `;
    
    // Show sections
    show('analysis-card');
    show('generator-panel');
}

// Display README Preview
function displayPreview(markdown) {
    currentMarkdown = markdown;
    
    // Show raw markdown in Edit view by default
    const codeEl = document.getElementById('markdown-code');
    codeEl.textContent = markdown;
    
    // Render HTML for Preview view
    const previewEl = document.getElementById('markdown-preview');
    previewEl.innerHTML = md.render(markdown);
    
    // Show Edit view by default
    show('markdown-edit');
    hide('markdown-preview');
    
    // Reset tabs to Edit
    document.getElementById('edit-tab').classList.add('text-green-accent', 'border-green-accent');
    document.getElementById('edit-tab').classList.remove('text-gray-400', 'border-transparent');
    document.getElementById('preview-tab').classList.remove('text-green-accent', 'border-green-accent');
    document.getElementById('preview-tab').classList.add('text-gray-400', 'border-transparent');
    
    show('preview-panel');
}

// Toggle Chat Window
function toggleChatWindow() {
    const chatWindow = document.getElementById('chat-window');
    const chatButton = document.getElementById('chat-bubble-button');
    
    if (chatWindow.classList.contains('hidden')) {
        chatWindow.classList.remove('hidden');
        chatButton.classList.add('scale-0');
    } else {
        chatWindow.classList.add('hidden');
        chatButton.classList.remove('scale-0');
    }
}

// Close Chat Window
function closeChatWindow() {
    const chatWindow = document.getElementById('chat-window');
    const chatButton = document.getElementById('chat-bubble-button');
    
    chatWindow.classList.add('hidden');
    chatButton.classList.remove('scale-0');
}

// Copy to Clipboard
function copyToClipboard() {
    if (!currentMarkdown) return;
    
    navigator.clipboard.writeText(currentMarkdown).then(() => {
        const btn = document.getElementById('copy-button');
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
    }).catch(err => {
        showError('Failed to copy to clipboard');
    });
}

// Download README
function downloadReadme() {
    if (!currentMarkdown) return;
    
    const blob = new Blob([currentMarkdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'README.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Voice Input
function initVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('Speech recognition not supported');
        return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('chat-input').value = transcript;
        isRecording = false;
        hide('recording-indicator');
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        isRecording = false;
        hide('recording-indicator');
    };
    
    recognition.onend = () => {
        isRecording = false;
        hide('recording-indicator');
    };
}

function toggleVoiceInput() {
    if (!recognition) {
        showError('Voice input not supported in this browser');
        return;
    }
    
    if (isRecording) {
        recognition.stop();
        isRecording = false;
        hide('recording-indicator');
    } else {
        recognition.start();
        isRecording = true;
        show('recording-indicator');
    }
}

// Chat Assistant Functions
async function sendChatMessage() {
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const message = chatInput.value.trim();
    
    if (!message) {
        return;
    }
    
    // Limit message length
    const limitedMessage = message.length > 500 ? message.substring(0, 500) + '...' : message;
    
    // Add user message to chat
    addMessageToChat('user', limitedMessage);
    
    // Clear input
    chatInput.value = '';
    chatInput.style.height = '40px';
    
    // Show typing indicator
    const typingId = addTypingIndicator();
    
    try {
        // Get context from current README if available
        const context = currentMarkdown ? currentMarkdown.substring(0, 200) : '';
        
        // Call backend chat API
        const response = await fetch(`${API_BASE}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: limitedMessage,
                context: context
            })
        });
        
        const data = await response.json();
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to get response');
        }
        
        // Add AI response to chat
        addMessageToChat('assistant', data.response);
        
        // Save to Firestore if authenticated
        if (window.authService && window.authService.isAuthenticated() && window.firestoreService) {
            try {
                const user = window.authService.getCurrentUser();
                await window.firestoreService.saveChatMessage(user.uid, {
                    role: 'user',
                    content: limitedMessage
                });
                await window.firestoreService.saveChatMessage(user.uid, {
                    role: 'assistant',
                    content: data.response
                });
            } catch (saveError) {
                console.error('Failed to save chat history:', saveError);
            }
        }
        
    } catch (error) {
        removeTypingIndicator(typingId);
        addMessageToChat('assistant', '❌ Sorry, I encountered an error. Please try again.');
        console.error('Chat error:', error);
    }
}

function addMessageToChat(role, content) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${role === 'user' ? 'justify-end' : 'justify-start'} mb-4`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `max-w-[80%] p-3 rounded-lg ${
        role === 'user' 
            ? 'bg-green-accent bg-opacity-20 text-gray-200' 
            : 'bg-gray-700 bg-opacity-50 text-gray-200'
    }`;
    
    // Format content with line breaks
    bubbleDiv.innerHTML = content.replace(/\n/g, '<br>');
    
    messageDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    const typingId = 'typing-' + Date.now();
    typingDiv.id = typingId;
    typingDiv.className = 'flex justify-start mb-4';
    typingDiv.innerHTML = `
        <div class="bg-gray-700 bg-opacity-50 p-3 rounded-lg">
            <div class="flex gap-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingId;
}

function removeTypingIndicator(typingId) {
    const typingDiv = document.getElementById(typingId);
    if (typingDiv) {
        typingDiv.remove();
    }
}

function loadChatHistory() {
    if (!window.authService || !window.authService.isAuthenticated() || !window.firestoreService) {
        return;
    }
    
    const user = window.authService.getCurrentUser();
    window.firestoreService.getChatHistory(user.uid, 50)
        .then(messages => {
            const chatMessages = document.getElementById('chat-messages');
            chatMessages.innerHTML = ''; // Clear existing messages
            
            messages.forEach(msg => {
                addMessageToChat(msg.role, msg.content);
            });
        })
        .catch(error => {
            console.error('Failed to load chat history:', error);
        });
}

// Auth Modal
function openAuthModal() {
    show('auth-modal');
    clearAuthMessages();
}

function closeAuthModal() {
    hide('auth-modal');
    clearAuthMessages();
    clearAuthForms();
}

function switchToSignup() {
    hide('signin-mode');
    show('signup-mode');
    document.getElementById('auth-modal-title').textContent = 'Sign Up';
    clearAuthMessages();
}

function switchToSignin() {
    hide('signup-mode');
    show('signin-mode');
    document.getElementById('auth-modal-title').textContent = 'Sign In';
    clearAuthMessages();
}

function clearAuthMessages() {
    hide('auth-error');
    hide('auth-success');
}

function clearAuthForms() {
    // Clear sign-in form
    document.getElementById('signin-email').value = '';
    document.getElementById('signin-password').value = '';
    
    // Clear sign-up form
    document.getElementById('signup-name').value = '';
    document.getElementById('signup-email').value = '';
    document.getElementById('signup-password').value = '';
    document.getElementById('signup-confirm').value = '';
}

function showAuthError(message) {
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = message;
    show('auth-error');
    hide('auth-success');
}

function showAuthSuccess(message) {
    const successEl = document.getElementById('auth-success');
    successEl.textContent = message;
    show('auth-success');
    hide('auth-error');
}

function setButtonLoading(buttonId, textId, loadingId, isLoading) {
    const button = document.getElementById(buttonId);
    const text = document.getElementById(textId);
    const loading = document.getElementById(loadingId);
    
    if (isLoading) {
        button.disabled = true;
        button.style.opacity = '0.6';
        button.style.cursor = 'not-allowed';
        hide(textId);
        show(loadingId);
    } else {
        button.disabled = false;
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        show(textId);
        hide(loadingId);
    }
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId, eyeOpenId, eyeClosedId) {
    const input = document.getElementById(inputId);
    const eyeOpen = document.getElementById(eyeOpenId);
    const eyeClosed = document.getElementById(eyeClosedId);
    
    if (input.type === 'password') {
        input.type = 'text';
        eyeOpen.classList.add('hidden');
        eyeClosed.classList.remove('hidden');
    } else {
        input.type = 'password';
        eyeOpen.classList.remove('hidden');
        eyeClosed.classList.add('hidden');
    }
}

// Sign Up Handler
async function handleSignUp() {
    clearAuthMessages();
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm').value;
    
    // Validation
    if (!name) {
        showAuthError('Please enter your display name');
        return;
    }
    
    if (!email) {
        showAuthError('Please enter your email');
        return;
    }
    
    if (!password) {
        showAuthError('Please enter a password');
        return;
    }
    
    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
    }
    
    // Check if Firebase is available
    if (!window.authService || !window.authService.isAvailable()) {
        showAuthError('Authentication service is not available. Please check your Firebase configuration.');
        return;
    }
    
    try {
        setButtonLoading('signup-submit', 'signup-submit-text', 'signup-loading', true);
        
        const user = await window.authService.signUp(email, password, name);
        
        showAuthSuccess('Account created successfully! Welcome to GitRefiny.');
        
        // Close modal after short delay
        setTimeout(() => {
            closeAuthModal();
        }, 1500);
        
    } catch (error) {
        showAuthError(error.message);
    } finally {
        setButtonLoading('signup-submit', 'signup-submit-text', 'signup-loading', false);
    }
}

// Sign In Handler
async function handleSignIn() {
    clearAuthMessages();
    
    const email = document.getElementById('signin-email').value.trim();
    const password = document.getElementById('signin-password').value;
    
    // Validation
    if (!email) {
        showAuthError('Please enter your email');
        return;
    }
    
    if (!password) {
        showAuthError('Please enter your password');
        return;
    }
    
    // Check if Firebase is available
    if (!window.authService || !window.authService.isAvailable()) {
        showAuthError('Authentication service is not available. Please check your Firebase configuration.');
        return;
    }
    
    try {
        setButtonLoading('signin-submit', 'signin-submit-text', 'signin-loading', true);
        
        const user = await window.authService.signIn(email, password);
        
        showAuthSuccess('Signed in successfully! Welcome back.');
        
        // Close modal after short delay
        setTimeout(() => {
            closeAuthModal();
        }, 1500);
        
    } catch (error) {
        // Check if error is due to user not found or invalid credentials
        const isNewUserError = error.code === 'auth/user-not-found' || 
                               error.code === 'auth/wrong-password' ||
                               error.code === 'auth/invalid-credential' ||
                               error.code === 'auth/invalid-login-credentials';
        
        if (isNewUserError) {
            // Show error with clickable sign-up link
            const errorEl = document.getElementById('auth-error');
            errorEl.innerHTML = `${error.message} <a href="#" id="error-signup-link" class="text-green-accent hover:underline font-semibold">Click here to sign up</a>`;
            show('auth-error');
            hide('auth-success');
            
            // Add click handler for sign-up link
            document.getElementById('error-signup-link')?.addEventListener('click', (e) => {
                e.preventDefault();
                switchToSignup();
            });
        } else {
            showAuthError(error.message);
        }
    } finally {
        setButtonLoading('signin-submit', 'signin-submit-text', 'signin-loading', false);
    }
}

// Google Sign-In Handler (for both sign-in and sign-up)
async function handleGoogleSignIn(isSignUp = false) {
    clearAuthMessages();
    
    // Check if Firebase is available
    if (!window.authService || !window.authService.isAvailable()) {
        showAuthError('Authentication service is not available. Please check your Firebase configuration.');
        return;
    }
    
    const buttonId = isSignUp ? 'google-signup' : 'google-signin';
    const textId = isSignUp ? 'google-signup-text' : 'google-signin-text';
    const loadingId = isSignUp ? 'google-signup-loading' : 'google-signin-loading';
    
    try {
        setButtonLoading(buttonId, textId, loadingId, true);
        
        const user = await window.authService.signInWithGoogle();
        
        showAuthSuccess('Signed in with Google successfully!');
        
        // Close modal after short delay
        setTimeout(() => {
            closeAuthModal();
        }, 1500);
        
    } catch (error) {
        if (error.message === 'Sign-in cancelled') {
            // User cancelled, just clear loading state
            clearAuthMessages();
        } else {
            showAuthError(error.message);
        }
    } finally {
        setButtonLoading(buttonId, textId, loadingId, false);
    }
}

// Auth State Management
function updateUIForAuthState(user) {
    const authButton = document.getElementById('auth-button');
    const authLoading = document.getElementById('auth-loading');
    const userProfile = document.getElementById('user-profile');
    
    // Hide loading
    hide('auth-loading');
    
    if (user) {
        // User is signed in
        hide('auth-button');
        show('user-profile');
        
        // Update user info
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userAvatar = document.getElementById('user-avatar');
        
        userName.textContent = user.displayName || 'User';
        userEmail.textContent = user.email || '';
        
        // Set avatar
        if (user.photoURL) {
            userAvatar.src = user.photoURL;
        } else {
            // Use default avatar with user's initial
            const initial = (user.displayName || user.email || 'U')[0].toUpperCase();
            userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=10b981&color=fff&size=128`;
        }
        
        console.log('✅ UI updated for authenticated user:', user.email);
        
        // Update analyze button for authenticated state
        const analyzeButton = document.getElementById('analyze-button');
        if (analyzeButton) {
            analyzeButton.textContent = 'Analyze';
            analyzeButton.title = 'Analyze GitHub repository';
        }
        
        // Load chat history
        loadChatHistory();
    } else {
        // User is signed out
        show('auth-button');
        hide('user-profile');
        hide('user-dropdown');
        
        // Update analyze button for unauthenticated state
        const analyzeButton = document.getElementById('analyze-button');
        if (analyzeButton) {
            analyzeButton.textContent = '🔒 Sign In to Analyze';
            analyzeButton.title = 'Sign in required to analyze repositories';
        }
        
        // Clear chat messages
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
            chatMessages.innerHTML = '<div class="text-center text-gray-400 text-sm">Sign in to save your chat history</div>';
        }
        
        console.log('ℹ️ UI updated for unauthenticated state');
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    if (dropdown.classList.contains('hidden')) {
        // Set high z-index to ensure dropdown appears above all content
        dropdown.style.zIndex = '9999';
        show('user-dropdown');
    } else {
        hide('user-dropdown');
    }
}

async function handleSignOut() {
    if (!window.authService || !window.authService.isAvailable()) {
        console.error('Auth service not available');
        return;
    }
    
    try {
        await window.authService.signOut();
        hide('user-dropdown');
        console.log('✅ User signed out successfully');
    } catch (error) {
        console.error('❌ Sign out error:', error);
        showError('Failed to sign out. Please try again.');
    }
}

function initializeAuthStateListener() {
    // Show loading state initially
    hide('auth-button');
    hide('user-profile');
    show('auth-loading');
    
    // Check if auth service is available
    if (!window.authService || !window.authService.isAvailable()) {
        console.warn('⚠️ Auth service not available, showing sign-in button');
        hide('auth-loading');
        show('auth-button');
        return;
    }
    
    // Listen to auth state changes
    window.authService.onAuthStateChanged((user) => {
        updateUIForAuthState(user);
    });
    
    console.log('🔐 Auth state listener initialized');
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    const userProfile = document.getElementById('user-profile');
    const dropdown = document.getElementById('user-dropdown');
    
    if (userProfile && dropdown && !userProfile.contains(e.target)) {
        hide('user-dropdown');
    }
});

// Apply custom scrollbar styling via JavaScript
function applyScrollbarStyles() {
    // Create a style element for webkit scrollbar styles
    const style = document.createElement('style');
    style.textContent = `
        /* Custom Scrollbar Styling */
        ::-webkit-scrollbar {
            width: 12px;
            height: 12px;
        }
        
        ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
            background: linear-gradient(180deg, #10b981, #059669);
            border-radius: 10px;
            border: 2px solid rgba(0, 0, 0, 0.3);
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(180deg, #34d399, #10b981);
        }
        
        /* Firefox scrollbar styling */
        * {
            scrollbar-width: thin;
            scrollbar-color: #10b981 rgba(0, 0, 0, 0.3);
        }
    `;
    document.head.appendChild(style);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Apply scrollbar styles
    applyScrollbarStyles();
    
    // Initialize auth state listener
    initializeAuthStateListener();
    
    // User Profile Dropdown
    document.getElementById('user-profile-button')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleUserDropdown();
    });
    
    // Sign Out Button
    document.getElementById('signout-button')?.addEventListener('click', handleSignOut);
    
    // Analyze Button
    document.getElementById('analyze-button').addEventListener('click', async () => {
        // Check if user is authenticated
        if (!window.authService || !window.authService.isAuthenticated()) {
            // Show auth modal if user is not signed in
            openAuthModal();
            return;
        }
        
        const repoUrl = document.getElementById('repo-url-input').value.trim();
        
        if (!repoUrl) {
            showError('Please enter a GitHub repository URL');
            return;
        }
        
        try {
            const analysis = await analyzeRepository(repoUrl);
            displayAnalysis(analysis);
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Generate Button
    document.getElementById('generate-button').addEventListener('click', async () => {
        if (!currentAnalysis) {
            showError('Please analyze a repository first');
            return;
        }
        
        const repoUrl = document.getElementById('repo-url-input').value.trim();
        const tone = document.getElementById('tone-selector').value;
        const model = document.getElementById('model-selector').value;
        
        try {
            const markdown = await generateReadme(repoUrl, { tone, model });
            displayPreview(markdown);
            
            // Save to Firestore if user is authenticated
            if (window.authService && window.authService.isAuthenticated() && window.firestoreService) {
                try {
                    const user = window.authService.getCurrentUser();
                    await window.firestoreService.saveReadmeHistory(user.uid, {
                        repoUrl: repoUrl,
                        repoName: currentAnalysis.repo_meta.name,
                        repoOwner: currentAnalysis.repo_meta.owner,
                        markdown: markdown,
                        metadata: {
                            stars: currentAnalysis.repo_meta.stars,
                            forks: currentAnalysis.repo_meta.forks,
                            languages: currentAnalysis.languages,
                            techStack: currentAnalysis.detected_stack
                        },
                        generationOptions: {
                            tone: tone,
                            model: model
                        }
                    });
                    console.log('✅ README saved to history');
                } catch (saveError) {
                    console.error('Failed to save README history:', saveError);
                    // Don't show error to user - saving history is not critical
                }
            }
        } catch (error) {
            showError(error.message);
        }
    });
    
    // Copy Button
    document.getElementById('copy-button').addEventListener('click', copyToClipboard);
    
    // Download Button
    document.getElementById('download-button').addEventListener('click', downloadReadme);
    
    // Auth Button
    document.getElementById('auth-button').addEventListener('click', openAuthModal);
    
    // Close Modal
    document.getElementById('close-modal').addEventListener('click', closeAuthModal);
    
    // Switch Auth Modes
    document.getElementById('switch-to-signup').addEventListener('click', switchToSignup);
    document.getElementById('switch-to-signin').addEventListener('click', switchToSignin);
    
    // Sign Up Form
    document.getElementById('signup-submit').addEventListener('click', handleSignUp);
    document.getElementById('google-signup').addEventListener('click', () => handleGoogleSignIn(true));
    
    // Sign In Form
    document.getElementById('signin-submit').addEventListener('click', handleSignIn);
    document.getElementById('google-signin').addEventListener('click', () => handleGoogleSignIn(false));
    
    // Password visibility toggles
    document.getElementById('toggle-signin-password').addEventListener('click', () => {
        togglePasswordVisibility('signin-password', 'signin-eye-open', 'signin-eye-closed');
    });
    document.getElementById('toggle-signup-password').addEventListener('click', () => {
        togglePasswordVisibility('signup-password', 'signup-eye-open', 'signup-eye-closed');
    });
    document.getElementById('toggle-signup-confirm').addEventListener('click', () => {
        togglePasswordVisibility('signup-confirm', 'confirm-eye-open', 'confirm-eye-closed');
    });
    
    // Enter key for sign-in
    document.getElementById('signin-password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSignIn();
        }
    });
    
    // Enter key for sign-up
    document.getElementById('signup-confirm').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSignUp();
        }
    });
    
    // Voice Input
    document.getElementById('mic-button').addEventListener('click', toggleVoiceInput);
    
    // Initialize voice recognition
    initVoiceInput();
    
    // Enter key for repo input
    document.getElementById('repo-url-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('analyze-button').click();
        }
    });
    
    // Close modal on outside click
    document.getElementById('auth-modal').addEventListener('click', (e) => {
        if (e.target.id === 'auth-modal') {
            closeAuthModal();
        }
    });
    
    // Edit/Preview Toggle
    document.getElementById('edit-tab').addEventListener('click', () => {
        // Show Edit view
        show('markdown-edit');
        hide('markdown-preview');
        
        // Update tab styles
        document.getElementById('edit-tab').classList.add('text-green-accent', 'border-green-accent');
        document.getElementById('edit-tab').classList.remove('text-gray-400', 'border-transparent');
        document.getElementById('preview-tab').classList.remove('text-green-accent', 'border-green-accent');
        document.getElementById('preview-tab').classList.add('text-gray-400', 'border-transparent');
    });
    
    document.getElementById('preview-tab').addEventListener('click', () => {
        // Show Preview view
        hide('markdown-edit');
        show('markdown-preview');
        
        // Update tab styles
        document.getElementById('preview-tab').classList.add('text-green-accent', 'border-green-accent');
        document.getElementById('preview-tab').classList.remove('text-gray-400', 'border-transparent');
        document.getElementById('edit-tab').classList.remove('text-green-accent', 'border-green-accent');
        document.getElementById('edit-tab').classList.add('text-gray-400', 'border-transparent');
    });
    
    // Chat Bubble Toggle
    document.getElementById('chat-bubble-button').addEventListener('click', toggleChatWindow);
    document.getElementById('close-chat').addEventListener('click', closeChatWindow);
    
    // Auto-expand textarea as user types
    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('input', function() {
        // Reset height to auto to get the correct scrollHeight
        this.style.height = 'auto';
        
        // Set height based on content, with min and max constraints
        const newHeight = Math.min(Math.max(this.scrollHeight, 40), 120);
        this.style.height = newHeight + 'px';
    });
    
    // Send button click handler
    document.getElementById('send-button').addEventListener('click', sendChatMessage);
    
    // Handle Enter key (send on Enter, new line on Shift+Enter)
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('send-button').click();
        }
    });
});
