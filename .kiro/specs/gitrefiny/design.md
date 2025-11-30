# Design Document

## Overview

GitRefiny is a web-based application that automates the generation of professional README.md files for GitHub repositories. The system consists of three main layers:

1. **Frontend Layer**: A single-page application built with vanilla JavaScript, HTML, and Tailwind CSS featuring a glassmorphism dark theme
2. **Backend Layer**: A Flask-based REST API that orchestrates repository analysis, README generation, and chat interactions
3. **Integration Layer**: Kiro MCP for GitHub API access, Firebase for authentication and data persistence, and AI models for content generation

The architecture follows a clear separation of concerns with the frontend handling user interactions and rendering, the backend managing business logic and external integrations, and Firebase providing authentication and persistent storage.

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (SPA)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Input   │  │ Analysis │  │ Preview  │  │   Chat   │   │
│  │  Panel   │  │   Card   │  │  Panel   │  │ Assistant│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                          │                                    │
│                    Fetch API Calls                           │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│                    Flask Backend API                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ /analyze │  │/generate │  │  /chat   │  │  /save   │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │              │              │          │
│  ┌────┴─────────────┴──────────────┴──────────────┴─────┐  │
│  │           Business Logic Layer                        │  │
│  │  - Repository Analyzer                                │  │
│  │  - README Generator                                   │  │
│  │  - Chat Handler                                       │  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┼──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌──────▼──────┐ ┌────────▼────────┐
│  Kiro MCP      │ │  AI Models  │ │    Firebase     │
│  (GitHub API)  │ │  (Auto/     │ │  - Auth         │
│                │ │   Sonnet)   │ │  - Firestore    │
└────────────────┘ └─────────────┘ └─────────────────┘
```

### Data Flow

1. **Analysis Flow**: User submits URL → Frontend calls `/api/analyze` → Backend uses MCP to fetch GitHub data → Parse and analyze → Return Analysis JSON → Frontend displays analysis card
2. **Generation Flow**: User clicks generate → Frontend calls `/api/generate` with analysis context → Backend invokes AI model with template → Return markdown → Frontend renders preview
3. **Chat Flow**: User sends message → Frontend calls `/api/chat` → Backend forwards to AI with context → Return response → Frontend displays in chat → Persist to Firebase if authenticated
4. **Save Flow**: User clicks save → Frontend calls `/api/save` with auth token → Backend validates user → Store in Firestore → Return success

## Components and Interfaces

### Frontend Components

#### 1. Input Panel Component
- **Responsibility**: Accept and validate GitHub repository URLs
- **Interface**:
  - Input field with validation
  - Analyze button
  - Error message display
  - PAT input modal for private repos
- **State**: `repoUrl`, `isAnalyzing`, `error`, `requiresPAT`

#### 2. Analysis Card Component
- **Responsibility**: Display repository analysis results
- **Interface**:
  - Repository metadata display (name, description, stars, forks)
  - Language breakdown visualization
  - File tree summary
  - Detected tech stack badges
  - Setup suggestions
- **State**: `analysisData`, `isVisible`

#### 3. Generator Panel Component
- **Responsibility**: Control README generation options
- **Interface**:
  - Tone selector (professional/concise/enthusiastic)
  - Section checkboxes
  - Generate button
  - Model selector (Auto/Sonnet)
- **State**: `selectedTone`, `selectedSections`, `selectedModel`, `isGenerating`

#### 4. Preview Panel Component
- **Responsibility**: Render and provide actions for generated README
- **Interface**:
  - Markdown preview area (using markdown-it)
  - Copy to clipboard button
  - Download button
  - Save button (if authenticated)
- **State**: `markdown`, `htmlPreview`, `isCopied`

#### 5. Chat Assistant Component
- **Responsibility**: Enable conversational refinement of README
- **Interface**:
  - Message list display with:
    - **User messages**: Aligned to right side with user profile avatar/pic on the right of each message
    - **AI messages**: Aligned to left side with AI bot avatar on the left of each response
  - Input field for text messages
  - Mic button (left side of send button) for voice input
  - Send button
  - Loading indicator
- **Message Display**:
  - User messages: Right-aligned bubble with user avatar on right
  - AI messages: Left-aligned bubble with AI bot avatar on left
  - Timestamps for each message
  - Smooth scroll to latest message
- **Voice Input**:
  - Mic button triggers browser speech recognition API
  - Visual indicator when recording (pulsing animation)
  - Transcribed text populates input field
  - User can edit transcribed text before sending
- **State**: `messages`, `currentMessage`, `sessionId`, `isLoading`, `isRecording`, `transcript`

#### 6. Auth Component
- **Responsibility**: Handle user authentication and registration
- **Interface**:
  - Sign in/Sign up button (triggers modal)
  - Auth popup modal (centered overlay) with two modes:
    - **Sign Up Mode** (for new users):
      - Email input field
      - Password input field
      - Confirm password input field
      - "Create Account" button
      - "Sign up with Google" button (at bottom)
      - "Already have an account? Sign in" link (switches to sign-in mode)
      - Close button (X icon)
    - **Sign In Mode** (for existing users):
      - Email input field
      - Password input field
      - "Sign In" button
      - "Sign in with Google" button (at bottom)
      - "Don't have an account? Sign up" link (switches to sign-up mode)
      - Close button (X icon)
  - User profile display (when authenticated)
  - Sign out button (when authenticated)
- **Logic**:
  - Sign Up: Creates new Firebase user with email/password, stores profile in Firestore
  - Sign In: Authenticates existing Firebase user with email/password
  - Google Auth: Works for both sign-up (creates new user) and sign-in (authenticates existing user)
  - Mode Toggle: Users can switch between sign-up and sign-in modes within the modal
- **Styling**: Modal uses glassmorphism theme with dark background, green accents, blur effects, and translucent panel
- **State**: `user`, `isAuthenticated`, `showAuthModal`, `authMode` (signup/signin), `email`, `password`, `confirmPassword`, `authError`

### Backend Components

#### 1. Repository Analyzer (`analyzer.py`)
- **Responsibility**: Fetch and analyze GitHub repository data
- **Methods**:
  - `analyze_repository(repo_url, token=None) -> AnalysisResult`
  - `fetch_repo_metadata(owner, repo, token) -> dict`
  - `fetch_file_tree(owner, repo, branch, token) -> list`
  - `fetch_languages(owner, repo, token) -> dict`
  - `detect_tech_stack(file_tree) -> list`
  - `identify_package_manifests(file_tree) -> list`
  - `suggest_setup_steps(manifests, languages) -> list`
- **Dependencies**: Kiro MCP, caching layer

#### 2. README Generator (`generator.py`)
- **Responsibility**: Generate README content using AI models
- **Methods**:
  - `generate_readme(analysis, options) -> str`
  - `build_prompt(analysis, sections, tone) -> str`
  - `invoke_ai_model(prompt, model) -> str`
  - `format_markdown(content) -> str`
- **Dependencies**: AI model API, template engine

#### 3. Chat Handler (`chat.py`)
- **Responsibility**: Manage chat conversations with AI assistant
- **Methods**:
  - `handle_chat_message(message, session_id, context) -> ChatResponse`
  - `load_conversation_history(session_id) -> list`
  - `save_message(session_id, message, role) -> None`
  - `build_chat_context(history, analysis) -> str`
- **Dependencies**: AI model API, Firebase Firestore

#### 4. Firebase Service (`firebase_service.py`)
- **Responsibility**: Interface with Firebase services
- **Methods**:
  - `verify_auth_token(token) -> User`
  - `save_readme(uid, repo_url, markdown, meta) -> str`
  - `get_saved_readmes(uid) -> list`
  - `save_conversation(uid, messages) -> str`
  - `get_conversation(session_id) -> dict`
- **Dependencies**: Firebase Admin SDK

#### 5. Cache Manager (`cache.py`)
- **Responsibility**: Cache repository analysis results
- **Methods**:
  - `get_cached_analysis(repo_url) -> AnalysisResult | None`
  - `cache_analysis(repo_url, analysis, ttl=3600) -> None`
  - `invalidate_cache(repo_url) -> None`
- **Implementation**: In-memory dictionary with timestamp-based expiration

### API Endpoints

#### POST /api/analyze
```python
Request:
{
  "repo_url": "https://github.com/owner/repo",
  "token": "optional_pat_token"
}

Response:
{
  "repo_meta": {
    "name": "repo",
    "owner": "owner",
    "description": "...",
    "stars": 123,
    "forks": 45,
    "default_branch": "main"
  },
  "languages": {
    "Python": 75.5,
    "JavaScript": 20.3,
    "CSS": 4.2
  },
  "file_tree_summary": {
    "total_files": 87,
    "total_dirs": 23,
    "top_level_structure": ["src/", "tests/", "README.md", "package.json"]
  },
  "detected_stack": ["Flask", "React", "PostgreSQL"],
  "package_manifests": ["package.json", "requirements.txt"],
  "hints": ["Node.js project", "Python backend detected"]
}
```

#### POST /api/generate
```python
Request:
{
  "repo_url": "https://github.com/owner/repo",
  "analysis_id": "cached_analysis_key",
  "sections": ["title", "description", "setup", "usage"],  # optional
  "tone": "professional",  # optional: professional|concise|enthusiastic
  "model": "Sonnet"  # optional: Auto|Sonnet
}

Response:
{
  "markdown": "# Project Title\n\n...",
  "generated_at": "2025-11-29T10:30:00Z",
  "credits_used": 1500
}
```

#### POST /api/chat
```python
Request:
{
  "uid": "user_firebase_uid",  # optional
  "session_id": "session_uuid",  # optional
  "message": "Can you add more details to the setup section?",
  "context_refs": {
    "analysis": {...},
    "current_readme": "..."
  }
}

Response:
{
  "assistant_message": "I'll enhance the setup section...",
  "session_id": "session_uuid"
}
```

#### POST /api/save
```python
Request:
{
  "uid": "user_firebase_uid",
  "repo_url": "https://github.com/owner/repo",
  "markdown": "# Generated README...",
  "meta": {
    "tone": "professional",
    "sections": ["all"]
  }
}

Response:
{
  "success": true,
  "readme_id": "firestore_doc_id"
}
```

#### GET /api/saved/:uid
```python
Response:
{
  "readmes": [
    {
      "id": "doc_id",
      "repo_url": "https://github.com/owner/repo",
      "created_at": "2025-11-29T10:00:00Z",
      "preview": "# Project Title\n\nShort preview..."
    }
  ]
}
```

## Data Models

### AnalysisResult
```python
@dataclass
class AnalysisResult:
    repo_meta: RepoMetadata
    languages: Dict[str, float]
    file_tree_summary: FileTreeSummary
    detected_stack: List[str]
    package_manifests: List[str]
    hints: List[str]
    cached_at: datetime
```

### RepoMetadata
```python
@dataclass
class RepoMetadata:
    name: str
    owner: str
    description: str
    stars: int
    forks: int
    default_branch: str
    url: str
```

### FileTreeSummary
```python
@dataclass
class FileTreeSummary:
    total_files: int
    total_dirs: int
    top_level_structure: List[str]
    max_depth: int
```

### ChatMessage
```python
@dataclass
class ChatMessage:
    role: str  # 'user' | 'assistant'
    content: str
    timestamp: datetime
```

### SavedReadme (Firestore)
```python
{
  "id": str,
  "uid": str,
  "repo_url": str,
  "generated_md": str,
  "created_at": Timestamp,
  "meta": {
    "tone": str,
    "sections": List[str],
    "model": str
  }
}
```

### Conversation (Firestore)
```python
{
  "id": str,
  "uid": str,
  "repo_url": str,
  "messages": [
    {
      "role": str,
      "content": str,
      "timestamp": Timestamp
    }
  ],
  "created_at": Timestamp,
  "last_updated": Timestamp
}
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: URL Validation Consistency
*For any* string input, the URL validator should accept inputs matching the patterns `https://github.com/{owner}/{repo}` or `github.com/{owner}/{repo}` and reject all other formats with a descriptive error message.
**Validates: Requirements 1.1, 1.4**

### Property 2: Token Storage Security
*For any* Personal Access Token provided by a user, the token should never appear in database records, Firestore documents, or application logs—only in server environment variables.
**Validates: Requirements 1.3**

### Property 3: Package Manifest Detection
*For any* file tree structure, the system should correctly identify all package manifest files (`package.json`, `pyproject.toml`, `requirements.txt`, `go.mod`) present in the tree regardless of their directory depth.
**Validates: Requirements 2.4**

### Property 4: Analysis Response Completeness
*For any* successful repository analysis, the returned Analysis JSON should contain all required fields: `repo_meta`, `languages`, `file_tree_summary`, `detected_stack`, and `hints`.
**Validates: Requirements 2.5**

### Property 5: Analysis Caching Consistency
*For any* repository URL, when analysis is requested twice within a 1-hour window, the second request should return cached results without making additional GitHub API calls.
**Validates: Requirements 2.7**

### Property 6: README Section Completeness
*For any* generated README with default settings, the markdown output should contain section headers for: Title, Description, Features, Architecture, File Structure, Tech Stack, Setup Instructions, Usage, API Endpoints, and Contributing.
**Validates: Requirements 3.2**

### Property 7: Setup Command Generation
*For any* detected package manifest file, the system should generate appropriate setup commands: `npm install` for `package.json`, `pip install -r requirements.txt` for `requirements.txt`, `poetry install` for `pyproject.toml`, and `go mod download` for `go.mod`.
**Validates: Requirements 3.3**

### Property 8: Markdown Syntax Validity
*For any* generated README content, the markdown should be parseable without syntax errors and should render all elements (headers, lists, code blocks, links) correctly.
**Validates: Requirements 3.4**

### Property 9: Section Filtering
*For any* subset of sections selected by the user, the generated README should contain only the requested sections and no others.
**Validates: Requirements 3.7**

### Property 10: Markdown Rendering Completeness
*For any* markdown string containing headers, lists, code blocks, and links, the preview renderer should display all element types correctly in the HTML output.
**Validates: Requirements 4.2**

### Property 11: Firestore Data Model Completeness
*For any* document stored in Firestore (users, saved_readmes, conversations), the document should contain all required fields as specified in the data model for that collection type.
**Validates: Requirements 5.3, 6.2, 7.6**

### Property 12: README Ownership Association
*For any* saved README, the `uid` field should match the authenticated user who created it, and retrieval operations should return only READMEs matching the requesting user's `uid`.
**Validates: Requirements 6.3, 6.5**

### Property 13: Saved README Display Completeness
*For any* saved README displayed in the history list, the UI should show the repository URL, creation date, and a preview snippet of the markdown content.
**Validates: Requirements 6.6**

### Property 14: Conversation Context Preservation
*For any* chat conversation, when processing a new message, the system should include all previous messages from the same session in the context sent to the AI model.
**Validates: Requirements 7.4**

### Property 15: Keyboard Navigation Accessibility
*For any* interactive element in the UI (buttons, inputs, links), the element should be reachable and operable using only keyboard navigation (Tab, Enter, Space keys).
**Validates: Requirements 8.6**

### Property 16: API Response Contract Compliance
*For any* API endpoint response, the JSON structure should contain all required fields as specified in the API contract for that endpoint.
**Validates: Requirements 9.2, 9.4, 9.6**

### Property 17: Error Message Descriptiveness
*For any* failed MCP request or system error, the error response should include a descriptive message explaining what went wrong and, where applicable, suggest corrective actions.
**Validates: Requirements 10.4**

## Error Handling

### Error Categories

#### 1. Input Validation Errors
- **Invalid URL Format**: Return 400 with message "Invalid GitHub URL format. Expected: https://github.com/{owner}/{repo}"
- **Missing Required Fields**: Return 400 with message specifying which fields are missing
- **Invalid Token**: Return 401 with message "Invalid or expired Personal Access Token"

#### 2. GitHub API Errors
- **Repository Not Found**: Return 404 with message "Repository not found. Check URL and access permissions."
- **Rate Limit Exceeded**: Return 429 with message "GitHub API rate limit exceeded. Try again in X minutes."
- **Authentication Required**: Return 403 with message "This repository is private. Please provide a Personal Access Token."
- **Network Timeout**: Return 504 with message "GitHub API request timed out. Please try again."

#### 3. AI Model Errors
- **Generation Timeout**: Return 504 with message "README generation timed out. Try selecting fewer sections."
- **Model Unavailable**: Return 503 with message "AI model temporarily unavailable. Please try again."
- **Context Too Large**: Return 413 with message "Repository too large for analysis. Try a smaller repository."

#### 4. Firebase Errors
- **Authentication Failed**: Return 401 with message "Authentication failed. Please sign in again."
- **Permission Denied**: Return 403 with message "You don't have permission to access this resource."
- **Document Not Found**: Return 404 with message "Requested document not found."
- **Write Failed**: Return 500 with message "Failed to save data. Please try again."

#### 5. Cache Errors
- **Cache Miss**: Silently fetch fresh data (not an error to user)
- **Cache Corruption**: Clear cache and fetch fresh data

### Error Response Format

All API errors follow this structure:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      "field": "additional context"
    }
  }
}
```

### Error Recovery Strategies

1. **Retry with Exponential Backoff**: For transient network errors and rate limits
2. **Fallback to Cache**: If fresh data fetch fails, return stale cached data with warning
3. **Graceful Degradation**: If AI generation fails, return template-based README
4. **User Notification**: Display error messages in UI with actionable suggestions

## Testing Strategy

### Unit Testing

The system will use **pytest** for Python backend unit tests. Unit tests will focus on:

1. **URL Parsing and Validation**
   - Test valid URL formats are accepted
   - Test invalid formats are rejected with appropriate errors
   - Test edge cases (trailing slashes, query parameters, fragments)

2. **File Tree Parsing**
   - Test manifest file detection across various tree structures
   - Test tech stack inference from file patterns
   - Test directory depth calculations

3. **Language Detection**
   - Test language percentage calculations
   - Test primary language identification
   - Test handling of repositories with no language data

4. **Setup Command Generation**
   - Test correct commands for each manifest type
   - Test handling of multiple manifests
   - Test fallback when no manifests detected

5. **Markdown Generation**
   - Test section inclusion/exclusion based on options
   - Test markdown syntax validity
   - Test template variable substitution

6. **Cache Operations**
   - Test cache hit/miss scenarios
   - Test TTL expiration
   - Test cache invalidation

### Property-Based Testing

The system will use **Hypothesis** (Python) for property-based testing. The testing framework is configured to run a minimum of 100 iterations per property test.

Each property-based test must be tagged with a comment explicitly referencing the correctness property from this design document using the format: `# Feature: gitrefiny, Property {number}: {property_text}`

Property-based tests will verify:

1. **Property 1: URL Validation Consistency**
   - Generate random strings and valid/invalid URL patterns
   - Verify consistent accept/reject behavior

2. **Property 3: Package Manifest Detection**
   - Generate random file tree structures with manifests at various depths
   - Verify all manifests are detected

3. **Property 4: Analysis Response Completeness**
   - Generate random analysis data
   - Verify all required fields are present in output

4. **Property 5: Analysis Caching Consistency**
   - Generate random repo URLs and timestamps
   - Verify cache behavior within TTL window

5. **Property 6: README Section Completeness**
   - Generate random analysis inputs
   - Verify all required sections appear in output

6. **Property 7: Setup Command Generation**
   - Generate random combinations of manifest files
   - Verify correct commands for each manifest type

7. **Property 8: Markdown Syntax Validity**
   - Generate random README content
   - Parse and verify no syntax errors

8. **Property 9: Section Filtering**
   - Generate random section selections
   - Verify only selected sections appear

9. **Property 11: Firestore Data Model Completeness**
   - Generate random document data
   - Verify all required fields present for each collection type

10. **Property 12: README Ownership Association**
    - Generate random user IDs and README data
    - Verify ownership constraints

11. **Property 14: Conversation Context Preservation**
    - Generate random conversation histories
    - Verify all messages included in context

12. **Property 16: API Response Contract Compliance**
    - Generate random API responses
    - Verify structure matches contract

### Integration Testing

Integration tests will verify end-to-end flows:

1. **Analysis Flow Test**
   - Mock GitHub API responses
   - Call `/api/analyze` endpoint
   - Verify Analysis JSON structure and content

2. **Generation Flow Test**
   - Provide sample analysis data
   - Call `/api/generate` endpoint
   - Verify markdown output contains required sections

3. **Chat Flow Test**
   - Mock AI model responses
   - Send chat messages with context
   - Verify responses and persistence

4. **Save and Retrieve Flow Test**
   - Authenticate test user
   - Save README
   - Retrieve and verify data

### End-to-End Smoke Tests

A smoke test script will:
1. Call `/api/analyze` with a known public repository
2. Verify response contains all required fields
3. Call `/api/generate` with the analysis result
4. Verify generated markdown contains "Title" and "Tech Stack" sections
5. Verify markdown is valid and parseable

### Test Data Generators

For property-based testing, custom generators will be created:

```python
# URL generator
@st.composite
def github_url(draw):
    owner = draw(st.text(min_size=1, max_size=39, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'), whitelist_characters='-')))
    repo = draw(st.text(min_size=1, max_size=100, alphabet=st.characters(whitelist_categories=('Lu', 'Ll', 'Nd'), whitelist_characters='-_.')))
    protocol = draw(st.sampled_from(['https://', '']))
    return f"{protocol}github.com/{owner}/{repo}"

# File tree generator
@st.composite
def file_tree(draw):
    num_files = draw(st.integers(min_value=1, max_value=100))
    manifests = draw(st.lists(st.sampled_from(['package.json', 'requirements.txt', 'pyproject.toml', 'go.mod']), max_size=4))
    # Generate tree structure with manifests at random depths
    ...

# Analysis result generator
@st.composite
def analysis_result(draw):
    return {
        'repo_meta': draw(repo_metadata()),
        'languages': draw(st.dictionaries(st.text(), st.floats(min_value=0, max_value=100))),
        'file_tree_summary': draw(file_tree_summary()),
        'detected_stack': draw(st.lists(st.text())),
        'hints': draw(st.lists(st.text()))
    }
```

### Test Execution

- Unit tests run on every commit via pre-commit hook
- Property-based tests run in CI pipeline
- Integration tests run before deployment
- Smoke tests run post-deployment to verify production health

### Coverage Goals

- Unit test coverage: >80% for business logic
- Property test coverage: All 17 correctness properties
- Integration test coverage: All API endpoints
- E2E coverage: Critical user flows (analyze → generate → preview)


## Technology Stack Details

### Frontend Stack

#### HTML5
- Semantic markup for accessibility
- Meta tags for SEO and social sharing
- Viewport configuration for responsive design

#### Tailwind CSS (Dev Mode)
- JIT (Just-In-Time) compilation for development
- Custom color palette: dark backgrounds (#0a0a0a, #1a1a1a) with green accents (#10b981, #34d399)
- Glassmorphism utilities: `backdrop-blur-lg`, `bg-opacity-10`
- Responsive breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)

#### Vanilla JavaScript (ES6 Modules)
- Module-based architecture for code organization
- Async/await for API calls
- Event delegation for dynamic content
- LocalStorage for client-side caching

#### markdown-it
- Client-side markdown rendering
- Plugins: syntax highlighting, emoji support, task lists
- Sanitization to prevent XSS attacks

### Backend Stack

#### Python 3.11+
- Type hints for better code quality
- Dataclasses for data models
- Async support for concurrent operations

#### Flask
- Lightweight WSGI framework
- Blueprint-based route organization
- CORS middleware for cross-origin requests
- JSON request/response handling

#### Gunicorn (Production)
- WSGI HTTP server
- Worker process management
- Graceful restarts
- Request timeout configuration

### AI Integration

#### Kiro Agent Models
- **Auto Model**: Fast, cost-effective for scaffolding and iterations
- **Claude Sonnet 4.5**: High-quality output for final README generation
- Model selection via API parameter

#### Kiro MCP (Model Context Protocol)
- GitHub API integration
- Authenticated and unauthenticated requests
- Rate limit handling
- Response caching

### Database & Authentication

#### Firebase Authentication
- Google OAuth 2.0 provider
- Email/password authentication
- Login modal popup interface with:
  - Email/password input fields
  - Sign in with Google button
  - Glassmorphism styling matching UI theme
- JWT token validation
- Session management

#### Firebase Firestore
- NoSQL document database
- Real-time synchronization
- Security rules for data access control
- Automatic indexing

### Development Tools

- **npm**: Package management for frontend dependencies
- **pip**: Python package management
- **pytest**: Python testing framework
- **hypothesis**: Property-based testing library
- **black**: Python code formatting
- **eslint**: JavaScript linting

## Security Considerations

### Authentication & Authorization

1. **Firebase Auth Tokens**: Validated on every authenticated API request
2. **Firestore Security Rules**: Enforce uid-based access control
3. **PAT Storage**: Personal Access Tokens stored only in server environment, never persisted to database
4. **CORS Configuration**: Whitelist only trusted origins

### Input Validation

1. **URL Validation**: Strict regex matching for GitHub URLs
2. **Request Size Limits**: Max 10MB for API requests
3. **Rate Limiting**: 100 requests per hour per IP for unauthenticated users, 1000 for authenticated
4. **SQL Injection Prevention**: N/A (using Firestore NoSQL)
5. **XSS Prevention**: Sanitize markdown output before rendering

### Data Privacy

1. **User Data**: Store only necessary profile information (uid, email, displayName)
2. **Repository Data**: Cache analysis results for 1 hour, then purge
3. **Conversation History**: Accessible only to owning user
4. **Logging**: Exclude sensitive data (tokens, passwords) from logs

### API Security

1. **HTTPS Only**: Enforce TLS for all API communication
2. **Token Expiration**: Firebase tokens expire after 1 hour
3. **Error Messages**: Avoid leaking system information in error responses
4. **Dependency Scanning**: Regular updates for security patches

## Performance Optimization

### Caching Strategy

1. **Analysis Cache**: In-memory cache with 1-hour TTL
2. **GitHub API Cache**: Reduce redundant API calls
3. **Browser Cache**: Static assets cached with versioned URLs
4. **CDN**: Serve static files from CDN in production

### Response Time Targets

- `/api/analyze`: < 10 seconds for repos with < 1000 files
- `/api/generate`: < 15 seconds for standard README
- `/api/chat`: < 5 seconds for chat responses
- Frontend load time: < 2 seconds on 3G connection

### Scalability Considerations

1. **Stateless Backend**: Enable horizontal scaling
2. **Connection Pooling**: Reuse Firebase connections
3. **Async Operations**: Non-blocking I/O for API calls
4. **Queue System**: Optional background job processing for large repos

## Deployment Architecture

### Development Environment

```
Frontend: Live reload with Tailwind JIT
Backend: Flask development server (port 5000)
Database: Firebase emulator (optional)
```

### Production Environment

```
Frontend: Static files served by Flask or CDN
Backend: Gunicorn with 4 worker processes
Database: Firebase production project
Monitoring: Error tracking and performance monitoring
```

### Environment Variables

```bash
# Flask
FLASK_APP=backend/app.py
FLASK_ENV=production
SECRET_KEY=<random-secret>

# Firebase
FIREBASE_PROJECT_ID=<project-id>
FIREBASE_PRIVATE_KEY=<service-account-key>
FIREBASE_CLIENT_EMAIL=<service-account-email>

# GitHub (for private repos)
GITHUB_PAT=<user-provided-token>

# AI Models
KIRO_API_KEY=<kiro-api-key>
```

## File Structure

```
gitrefiny/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── components/
│   │   ├── input-panel.js
│   │   ├── analysis-card.js
│   │   ├── generator-panel.js
│   │   ├── preview-panel.js
│   │   ├── chat-assistant.js
│   │   └── auth.js
│   └── utils/
│       ├── api-client.js
│       ├── markdown-renderer.js
│       └── validators.js
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── analyzer.py
│   ├── generator.py
│   ├── chat.py
│   ├── firebase_service.py
│   ├── cache.py
│   ├── models.py
│   └── utils.py
├── tests/
│   ├── unit/
│   │   ├── test_analyzer.py
│   │   ├── test_generator.py
│   │   ├── test_cache.py
│   │   └── test_validators.py
│   ├── property/
│   │   ├── test_properties.py
│   │   └── generators.py
│   ├── integration/
│   │   ├── test_api_endpoints.py
│   │   └── test_firebase.py
│   └── e2e/
│       └── smoke_test.py
├── .kiro/
│   └── specs/
│       └── gitrefiny/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── spec.yml
├── tailwind.config.js
├── package.json
├── README.md
└── .gitignore
```

## Implementation Notes

### Phase 1: Core Analysis (Priority 1)
- Implement `/api/analyze` endpoint
- MCP integration for GitHub API
- File tree parsing and manifest detection
- Language detection and tech stack inference
- Basic caching layer

### Phase 2: README Generation (Priority 1)
- Implement `/api/generate` endpoint
- AI model integration (Auto and Sonnet)
- Template-based README structure
- Section filtering and tone support
- Markdown validation

### Phase 3: Frontend UI (Priority 1)
- Input panel with URL validation
- Analysis card display
- Generator panel with options
- Preview panel with markdown rendering
- Copy and download functionality

### Phase 4: Authentication & Persistence (Priority 2)
- Firebase Auth integration
- Sign in/sign out flow
- Save README functionality
- Retrieve saved READMEs
- User profile display

### Phase 5: Chat Assistant (Priority 2)
- Chat UI component
- `/api/chat` endpoint
- Conversation context management
- Firebase persistence for authenticated users
- Message history loading

### Phase 6: Polish & Testing (Priority 3)
- Unit test suite
- Property-based tests
- Integration tests
- E2E smoke tests
- Error handling improvements
- Performance optimization
- Accessibility audit
- Documentation

## Future Enhancements (Out of Scope for MVP)

1. **Batch Processing**: Generate READMEs for multiple repos
2. **Custom Templates**: User-defined README templates
3. **Collaboration**: Share and collaborate on README drafts
4. **Version History**: Track changes to generated READMEs
5. **Export Formats**: Export to PDF, HTML, or other formats
6. **AI Suggestions**: Proactive suggestions for improving documentation
7. **Integration**: GitHub App for automatic README updates
8. **Analytics**: Track README generation patterns and popular repos
9. **Localization**: Multi-language README generation
10. **Premium Features**: Advanced AI models, priority processing, unlimited saves

