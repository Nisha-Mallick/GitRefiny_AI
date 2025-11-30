# Implementation Plan

- [x] 1. Set up project structure and dependencies


  - Create directory structure: `/frontend`, `/backend`, `/tests`
  - Initialize `package.json` for frontend dependencies (Tailwind CSS, markdown-it)
  - Create `requirements.txt` for backend dependencies (Flask, Firebase Admin SDK, Hypothesis)
  - Set up Tailwind CSS configuration with custom colors and glassmorphism utilities
  - Create `.gitignore` file
  - _Requirements: All_

- [x] 2. Implement URL validation and parsing


  - Create `validators.py` with URL validation function
  - Implement regex pattern matching for GitHub URLs (`https://github.com/{owner}/{repo}` and `github.com/{owner}/{repo}`)
  - Extract owner and repo from valid URLs
  - Return descriptive error messages for invalid formats
  - _Requirements: 1.1, 1.4_

- [ ]* 2.1 Write property test for URL validation
  - **Property 1: URL Validation Consistency**
  - **Validates: Requirements 1.1, 1.4**

- [x] 3. Implement repository analyzer with MCP integration


  - Create `analyzer.py` module
  - Implement `fetch_repo_metadata()` to call GitHub API `/repos/{owner}/{repo}`
  - Implement `fetch_file_tree()` to call `/repos/{owner}/{repo}/git/trees/{branch}?recursive=1`
  - Implement `fetch_languages()` to call `/repos/{owner}/{repo}/languages`
  - Parse file tree to identify package manifests (`package.json`, `requirements.txt`, `pyproject.toml`, `go.mod`)
  - Implement tech stack detection based on file patterns and languages
  - Create `AnalysisResult` dataclass for structured output
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 10.1, 10.2, 10.3, 10.5_

- [ ]* 3.1 Write property test for package manifest detection
  - **Property 3: Package Manifest Detection**
  - **Validates: Requirements 2.4**

- [ ]* 3.2 Write property test for analysis response completeness
  - **Property 4: Analysis Response Completeness**
  - **Validates: Requirements 2.5**

- [x] 4. Implement caching layer


  - Create `cache.py` module
  - Implement in-memory cache with dictionary storage
  - Add timestamp-based TTL (1 hour) for cache entries
  - Implement `get_cached_analysis()` and `cache_analysis()` methods
  - Add cache key generation from repo URL
  - _Requirements: 2.7_

- [ ]* 4.1 Write property test for caching consistency
  - **Property 5: Analysis Caching Consistency**
  - **Validates: Requirements 2.7**

- [x] 5. Implement setup command generation

  - Create `suggest_setup_steps()` function in `analyzer.py`
  - Map manifest files to setup commands:
    - `package.json` → `npm install`
    - `requirements.txt` → `pip install -r requirements.txt`
    - `pyproject.toml` → `poetry install`
    - `go.mod` → `go mod download`
  - Handle multiple manifests
  - _Requirements: 3.3_

- [ ]* 5.1 Write property test for setup command generation
  - **Property 7: Setup Command Generation**
  - **Validates: Requirements 3.3**

- [x] 6. Implement README generator with AI integration


  - Create `generator.py` module
  - Design README template with sections: Title, Description, Features, Architecture, File Structure, Tech Stack, Setup, Usage, API Endpoints, Contributing
  - Implement `build_prompt()` to create AI prompt from analysis data and template
  - Implement `invoke_ai_model()` to call Kiro AI models (Auto/Sonnet)
  - Implement `generate_readme()` orchestration function
  - Add section filtering based on user selection
  - Add tone parameter support (professional/concise/enthusiastic)
  - _Requirements: 3.1, 3.2, 3.6, 3.7_

- [ ]* 6.1 Write property test for README section completeness
  - **Property 6: README Section Completeness**
  - **Validates: Requirements 3.2**

- [ ]* 6.2 Write property test for section filtering
  - **Property 9: Section Filtering**
  - **Validates: Requirements 3.7**

- [x] 7. Implement markdown validation

  - Create `format_markdown()` function in `generator.py`
  - Validate markdown syntax using markdown parser
  - Ensure all elements (headers, lists, code blocks, links) are valid
  - _Requirements: 3.4_

- [ ]* 7.1 Write property test for markdown syntax validity
  - **Property 8: Markdown Syntax Validity**
  - **Validates: Requirements 3.4**

- [x] 8. Implement Flask API endpoints for analysis and generation


  - Create `app.py` with Flask application setup
  - Implement POST `/api/analyze` endpoint:
    - Accept `repo_url` and optional `token` in request body
    - Call analyzer functions
    - Return Analysis JSON with all required fields
    - Handle errors with descriptive messages
  - Implement POST `/api/generate` endpoint:
    - Accept `repo_url`, `analysis_id`, optional `sections`, `tone`, `model`
    - Call README generator
    - Return markdown string with timestamp
  - Add CORS middleware
  - Add request validation
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 10.4_

- [ ]* 8.1 Write property test for API response contract compliance
  - **Property 16: API Response Contract Compliance**
  - **Validates: Requirements 9.2, 9.4, 9.6**

- [ ]* 8.2 Write property test for error message descriptiveness
  - **Property 17: Error Message Descriptiveness**
  - **Validates: Requirements 10.4**

- [ ] 9. Implement Firebase service integration
  - Create `firebase_service.py` module
  - Initialize Firebase Admin SDK with credentials
  - Implement `verify_auth_token()` for JWT validation
  - Implement `save_readme()` to store README in Firestore `saved_readmes` collection
  - Implement `get_saved_readmes()` to retrieve user's saved READMEs
  - Implement `save_conversation()` to store chat messages in `conversations` collection
  - Implement `get_conversation()` to load conversation history
  - Ensure all documents include required fields per data model
  - _Requirements: 5.11, 6.2, 6.3, 6.4, 6.5, 7.11, 7.12_

- [ ]* 9.1 Write property test for Firestore data model completeness
  - **Property 11: Firestore Data Model Completeness**
  - **Validates: Requirements 5.11, 6.2, 7.12**

- [ ]* 9.2 Write property test for README ownership association
  - **Property 12: README Ownership Association**
  - **Validates: Requirements 6.3, 6.5**

- [ ] 10. Implement chat handler with conversation context
  - Create `chat.py` module
  - Implement `handle_chat_message()` function
  - Load conversation history from Firestore
  - Build chat context including previous messages and analysis data
  - Forward message to AI model with context
  - Save new messages to Firestore if user is authenticated
  - Return AI response with session ID
  - _Requirements: 7.8, 7.10, 7.11_

- [ ]* 10.1 Write property test for conversation context preservation
  - **Property 14: Conversation Context Preservation**
  - **Validates: Requirements 7.10**

- [ ] 11. Implement Flask API endpoints for chat and save
  - Implement POST `/api/chat` endpoint:
    - Accept `uid`, `session_id`, `message`, `context_refs`
    - Call chat handler
    - Return `assistant_message` and `session_id`
  - Implement POST `/api/save` endpoint:
    - Verify authentication token
    - Save README to Firestore
    - Return success response with document ID
  - Implement GET `/api/saved/:uid` endpoint:
    - Verify authentication token
    - Retrieve saved READMEs for user
    - Return list of READMEs with preview snippets
  - _Requirements: 9.5, 9.6, 9.7, 9.8_

- [x] 12. Create frontend HTML structure


  - Create `frontend/index.html` with semantic HTML5 markup
  - Add meta tags for viewport and SEO
  - Create main sections: hero, analysis card, generator panel, preview panel, chat assistant
  - Add authentication modal structure with sign-up and sign-in modes
  - Include Tailwind CSS via CDN for development
  - Link JavaScript modules
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 13. Implement frontend input panel component

  - Create `frontend/components/input-panel.js`
  - Implement URL input field with validation
  - Add analyze button with click handler
  - Display error messages for invalid URLs
  - Show PAT input modal for private repos
  - Call `/api/analyze` endpoint
  - Display loading state during analysis
  - _Requirements: 1.1, 1.2, 1.4, 1.5_

- [x] 14. Implement frontend analysis card component

  - Create `frontend/components/analysis-card.js`
  - Display repository metadata (name, description, stars, forks)
  - Render language breakdown with visual bars
  - Show file tree summary
  - Display detected tech stack as badges
  - Show setup suggestions
  - Apply glassmorphism styling
  - _Requirements: 2.5_

- [x] 15. Implement frontend generator panel component

  - Create `frontend/components/generator-panel.js`
  - Add tone selector dropdown (professional/concise/enthusiastic)
  - Add section checkboxes for filtering
  - Add model selector (Auto/Sonnet)
  - Implement generate button with click handler
  - Call `/api/generate` endpoint
  - Display loading state during generation
  - _Requirements: 3.6, 3.7_

- [x] 16. Implement frontend preview panel component


  - Create `frontend/components/preview-panel.js`
  - Integrate markdown-it library for rendering
  - Display rendered markdown preview
  - Implement copy-to-clipboard button functionality
  - Implement download button to save as `README.md` file
  - Add save button for authenticated users
  - Apply glassmorphism styling to panel
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ]* 16.1 Write property test for markdown rendering completeness
  - **Property 10: Markdown Rendering Completeness**
  - **Validates: Requirements 4.2**

- [ ] 17. Implement frontend authentication component
  - Create `frontend/components/auth.js`
  - Initialize Firebase SDK in frontend
  - Create authentication modal with glassmorphism styling
  - Implement sign-up mode:
    - Email, password, confirm password input fields
    - "Create Account" button
    - "Sign up with Google" button at bottom
    - "Already have an account? Sign in" toggle link
  - Implement sign-in mode:
    - Email, password input fields
    - "Sign In" button
    - "Sign in with Google" button at bottom
    - "Don't have an account? Sign up" toggle link
  - Implement mode toggle functionality
  - Handle email/password sign-up (create new user)
  - Handle email/password sign-in (authenticate existing user)
  - Handle Google OAuth for both sign-up and sign-in
  - Display user profile when authenticated
  - Implement sign-out functionality
  - Store user profile in Firestore on successful authentication
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12, 5.13, 5.14_

- [ ] 18. Implement save README functionality
  - Add save button to preview panel (visible only when authenticated)
  - Call `/api/save` endpoint with auth token
  - Display success/error messages
  - Implement saved READMEs history view
  - Call `/api/saved/:uid` endpoint to load history
  - Display repository URL, creation date, and preview snippet for each saved README
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 18.1 Write property test for saved README display completeness
  - **Property 13: Saved README Display Completeness**
  - **Validates: Requirements 6.6**

- [ ] 19. Implement frontend chat assistant component
  - Create `frontend/components/chat-assistant.js`
  - Create chat interface with message list
  - Implement message display:
    - User messages: Right-aligned with user profile avatar on right
    - AI messages: Left-aligned with AI bot avatar on left
  - Add input field for text messages
  - Add mic button (left of send button) for voice input
  - Implement speech recognition using Web Speech API:
    - Activate on mic button click
    - Show visual recording indicator (pulsing animation)
    - Transcribe speech to text
    - Populate input field with transcript
    - Allow editing before sending
  - Implement send button functionality
  - Call `/api/chat` endpoint with message and context
  - Display AI responses with avatar
  - Load conversation history for authenticated users
  - Auto-scroll to latest message
  - Apply glassmorphism styling
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.13_

- [ ] 20. Implement frontend styling with Tailwind CSS
  - Create `frontend/styles.css` with custom Tailwind directives
  - Define custom color palette (dark blacks #0a0a0a, #1a1a1a, green accents #10b981, #34d399)
  - Create glassmorphism utility classes (backdrop-blur, bg-opacity, translucent panels)
  - Style all components with dark theme
  - Implement responsive breakpoints for mobile/tablet/desktop
  - Add hover and focus states for interactive elements
  - Ensure monospace fonts for code blocks
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 21. Implement responsive layout and mobile optimization
  - Add media queries for mobile devices
  - Stack panels vertically on small screens
  - Make chat interface swipeable on mobile
  - Ensure touch-friendly button sizes
  - Test on various viewport sizes
  - _Requirements: 8.5_

- [ ] 22. Implement keyboard accessibility
  - Ensure all interactive elements have proper tab order
  - Add keyboard event handlers (Enter, Space, Escape)
  - Implement focus indicators for all focusable elements
  - Test complete keyboard navigation flow
  - Add ARIA labels for screen readers
  - _Requirements: 8.6_

- [ ]* 22.1 Write property test for keyboard navigation accessibility
  - **Property 15: Keyboard Navigation Accessibility**
  - **Validates: Requirements 8.6**

- [ ] 23. Implement error handling and user feedback
  - Add error handling for all API calls
  - Display user-friendly error messages in UI
  - Implement retry logic for transient errors
  - Add loading spinners for async operations
  - Show success notifications for completed actions
  - _Requirements: 10.4_

- [ ] 24. Implement security measures
  - Ensure PAT tokens stored only in server environment variables
  - Validate all user inputs on backend
  - Implement rate limiting (100 req/hour unauthenticated, 1000 authenticated)
  - Sanitize markdown output to prevent XSS
  - Configure CORS to whitelist trusted origins
  - Set up Firestore security rules to restrict access by uid
  - _Requirements: 1.3_

- [ ]* 24.1 Write property test for token storage security
  - **Property 2: Token Storage Security**
  - **Validates: Requirements 1.3**

- [ ] 25. Create unit tests for backend functions
  - Write tests for URL validation
  - Write tests for file tree parsing
  - Write tests for language detection
  - Write tests for manifest identification
  - Write tests for setup command generation
  - Write tests for cache operations
  - Write tests for markdown validation
  - Use pytest framework
  - _Requirements: 11.1, 11.2, 11.3_

- [ ] 26. Create end-to-end smoke test
  - Create `tests/e2e/smoke_test.py`
  - Test complete flow: analyze → generate → preview
  - Use a known public repository for testing
  - Assert that analysis returns all required fields
  - Assert that generated README contains "Title" and "Tech Stack" sections
  - Assert that markdown is valid and parseable
  - _Requirements: 11.4, 11.5_

- [ ] 27. Set up environment configuration
  - Create `.env.example` file with required environment variables
  - Document Firebase configuration steps
  - Document Kiro API key setup
  - Create setup instructions in README
  - Add environment variable validation on startup
  - _Requirements: All_

- [ ] 28. Create project documentation
  - Write comprehensive README.md with:
    - Project description
    - Features list
    - Tech stack
    - Setup instructions
    - Run instructions (backend and frontend)
    - Environment variables
    - Testing instructions
    - Known limitations
  - Add inline code comments for complex logic
  - Document API endpoints with examples
  - _Requirements: All_

- [ ] 29. Final testing and polish
  - Run all unit tests and ensure they pass
  - Run all property-based tests and ensure they pass
  - Run end-to-end smoke test
  - Test complete user flows manually
  - Fix any bugs discovered during testing
  - Optimize performance (caching, lazy loading)
  - Verify accessibility compliance
  - Test on multiple browsers (Chrome, Firefox, Safari)
  - _Requirements: All_

- [ ] 30. Prepare for deployment
  - Set up production environment variables
  - Configure Gunicorn for production
  - Test production build locally
  - Verify Firebase production configuration
  - Create deployment documentation
  - _Requirements: All_
