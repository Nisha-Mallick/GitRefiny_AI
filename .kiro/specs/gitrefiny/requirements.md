# Requirements Document

## Introduction

GitRefiny is an AI-powered README generator and repository documentation assistant that transforms GitHub repository URLs into professional, context-aware README.md files. The system analyzes repository metadata, file structures, and code patterns to generate comprehensive documentation with live preview capabilities and an interactive AI assistant for iterative refinement.

## Glossary

- **GitRefiny System**: The complete application including frontend UI, backend API, and AI integration components
- **Repository Analysis**: The process of fetching and parsing GitHub repository metadata, file trees, languages, and package manifests
- **README Generation**: The AI-powered creation of structured markdown documentation based on repository analysis
- **MCP**: Model Context Protocol - Kiro's integration layer for accessing GitHub API endpoints
- **Firebase**: Google's backend-as-a-service platform providing authentication and Firestore database
- **Glassmorphism**: A UI design style featuring translucent panels with blur effects and soft accents
- **PAT**: Personal Access Token for GitHub API authentication
- **Analysis JSON**: Structured data output containing repository metadata, languages, file tree summary, and detected technology stack

## Requirements

### Requirement 1

**User Story:** As a developer, I want to input a GitHub repository URL, so that I can generate professional documentation for any public or private repository.

#### Acceptance Criteria

1. WHEN a user submits a valid GitHub repository URL, THE GitRefiny System SHALL accept URLs in the format `https://github.com/{owner}/{repo}` or `github.com/{owner}/{repo}`
2. WHEN a user submits a private repository URL, THE GitRefiny System SHALL prompt the user to provide a Personal Access Token
3. WHEN a user provides a Personal Access Token, THE GitRefiny System SHALL store the token only in server environment variables
4. WHEN a user submits an invalid URL format, THE GitRefiny System SHALL display a clear error message indicating the expected format
5. THE GitRefiny System SHALL provide an input field with placeholder text demonstrating valid URL formats

### Requirement 2

**User Story:** As a developer, I want the system to analyze my repository's structure and technology stack, so that I can understand what information will be included in the generated README.

#### Acceptance Criteria

1. WHEN a user initiates repository analysis, THE GitRefiny System SHALL fetch repository metadata using the GitHub API endpoint `/repos/{owner}/{repo}`
2. WHEN fetching repository data, THE GitRefiny System SHALL retrieve the complete file tree using the endpoint `/repos/{owner}/{repo}/git/trees/{branch}?recursive=1`
3. WHEN analyzing the repository, THE GitRefiny System SHALL detect programming languages using the endpoint `/repos/{owner}/{repo}/languages`
4. WHEN parsing the file tree, THE GitRefiny System SHALL identify package manifest files including `package.json`, `pyproject.toml`, `requirements.txt`, and `go.mod`
5. WHEN analysis completes, THE GitRefiny System SHALL return Analysis JSON containing repository metadata, language breakdown, file tree summary, detected technology stack, and setup step suggestions
6. WHEN repository analysis is requested, THE GitRefiny System SHALL complete the analysis and return results within 10 seconds for repositories with fewer than 1000 files
7. WHEN the same repository URL is analyzed within 1 hour, THE GitRefiny System SHALL return cached analysis results

### Requirement 3

**User Story:** As a developer, I want to generate a comprehensive README.md file based on my repository analysis, so that I can quickly create professional documentation.

#### Acceptance Criteria

1. WHEN a user requests README generation, THE GitRefiny System SHALL use the Analysis JSON as context for content generation
2. WHEN generating README content, THE GitRefiny System SHALL include sections for Title, Description, Features, Architecture, File Structure, Tech Stack, Setup Instructions, Usage, API Endpoints, and Contributing guidelines
3. WHEN detecting package manifest files, THE GitRefiny System SHALL populate Setup Instructions with commands derived from the detected package manager
4. WHEN generating the README, THE GitRefiny System SHALL produce valid markdown syntax
5. WHEN README generation completes, THE GitRefiny System SHALL return the complete markdown string within 15 seconds
6. WHERE the user specifies a tone preference, THE GitRefiny System SHALL generate content matching the selected tone (professional, concise, or enthusiastic)
7. WHERE the user selects specific sections, THE GitRefiny System SHALL generate only the requested sections

### Requirement 4

**User Story:** As a developer, I want to preview the generated README in rendered markdown format, so that I can see how it will appear on GitHub before downloading.

#### Acceptance Criteria

1. WHEN README generation completes, THE GitRefiny System SHALL display a live preview rendering the markdown content
2. WHEN rendering the preview, THE GitRefiny System SHALL display all markdown elements including headers, lists, code blocks, and links
3. THE GitRefiny System SHALL provide a copy-to-clipboard button for the generated markdown
4. WHEN a user clicks the copy button, THE GitRefiny System SHALL copy the raw markdown text to the system clipboard
5. THE GitRefiny System SHALL provide a download button for the generated README
6. WHEN a user clicks the download button, THE GitRefiny System SHALL initiate a file download named `README.md` containing the generated markdown

### Requirement 5

**User Story:** As a developer, I want to create an account or sign in with email/password or my Google account, so that I can save my generated READMEs and conversation history for future reference.

#### Acceptance Criteria

1. THE GitRefiny System SHALL provide a sign-in/sign-up button that opens a centered authentication modal popup
2. WHEN the authentication modal opens, THE GitRefiny System SHALL display the modal in sign-in mode by default with email input, password input, sign-in button, and sign-in with Google button at the bottom
3. WHEN the authentication modal is displayed, THE GitRefiny System SHALL apply glassmorphism styling with dark background, green accents, blur effects, and translucent panel matching the UI theme
4. WHEN a user clicks "Don't have an account? Sign up" link, THE GitRefiny System SHALL switch the modal to sign-up mode displaying email input, password input, confirm password input, create account button, and sign-up with Google button
5. WHEN a user clicks "Already have an account? Sign in" link in sign-up mode, THE GitRefiny System SHALL switch the modal back to sign-in mode
6. WHEN a new user enters email, password, and confirm password and clicks create account, THE GitRefiny System SHALL create a new Firebase user account using email/password authentication
7. WHEN an existing user enters email and password and clicks sign-in, THE GitRefiny System SHALL authenticate the user using Firebase email/password authentication
8. WHEN a user clicks the sign-in with Google or sign-up with Google button, THE GitRefiny System SHALL initiate the Firebase Google OAuth authentication flow
9. WHEN Google authentication completes for a new user, THE GitRefiny System SHALL create a new user account
10. WHEN Google authentication completes for an existing user, THE GitRefiny System SHALL sign in the user
11. WHEN authentication succeeds, THE GitRefiny System SHALL store the user profile in Firestore with fields: uid, displayName, email, photoURL, and createdAt
12. WHEN a user is authenticated, THE GitRefiny System SHALL display the user's profile information in the interface and close the authentication modal
13. THE GitRefiny System SHALL provide a sign-out button for authenticated users
14. WHEN a user signs out, THE GitRefiny System SHALL clear the authentication session

### Requirement 6

**User Story:** As an authenticated developer, I want to save generated READMEs to my account, so that I can access them later and track my documentation history.

#### Acceptance Criteria

1. WHEN an authenticated user generates a README, THE GitRefiny System SHALL provide a save button
2. WHEN a user clicks the save button, THE GitRefiny System SHALL store the README in Firestore with fields: id, uid, repo_url, generated_md, createdAt, and meta
3. WHEN storing saved READMEs, THE GitRefiny System SHALL associate each README with the authenticated user's uid
4. THE GitRefiny System SHALL provide an endpoint to retrieve all saved READMEs for an authenticated user
5. WHEN retrieving saved READMEs, THE GitRefiny System SHALL return only READMEs belonging to the requesting user's uid
6. WHEN displaying saved READMEs, THE GitRefiny System SHALL show the repository URL, creation date, and preview snippet

### Requirement 7

**User Story:** As a developer, I want to interact with an AI chat assistant using text or voice input, so that I can refine specific sections of my README or ask questions about documentation best practices.

#### Acceptance Criteria

1. THE GitRefiny System SHALL provide a chat interface for user messages and assistant responses
2. WHEN displaying user messages, THE GitRefiny System SHALL align messages to the right side with the user's profile avatar displayed on the right of each message
3. WHEN displaying AI assistant responses, THE GitRefiny System SHALL align messages to the left side with an AI bot avatar displayed on the left of each response
4. THE GitRefiny System SHALL provide a mic button positioned to the left of the send button for voice input
5. WHEN a user clicks the mic button, THE GitRefiny System SHALL activate the browser speech recognition API and display a visual recording indicator
6. WHEN speech recognition captures audio, THE GitRefiny System SHALL transcribe the speech to text and populate the input field
7. WHEN transcription completes, THE GitRefiny System SHALL allow the user to edit the transcribed text before sending
8. WHEN a user sends a chat message, THE GitRefiny System SHALL forward the message to the AI model with repository analysis context
9. WHEN the AI assistant responds, THE GitRefiny System SHALL display the response in the chat interface with the AI bot avatar
10. WHEN processing chat messages, THE GitRefiny System SHALL include previous messages in the conversation as context
11. WHERE a user is authenticated, THE GitRefiny System SHALL persist chat messages to Firestore in the conversations collection
12. WHEN storing conversations, THE GitRefiny System SHALL include fields: id, uid, messages array, createdAt, and lastUpdated
13. WHEN an authenticated user returns, THE GitRefiny System SHALL load previous conversation history for the current repository

### Requirement 8

**User Story:** As a developer, I want the interface to follow a dark glassmorphism design theme, so that I have a modern and visually appealing experience.

#### Acceptance Criteria

1. THE GitRefiny System SHALL apply a dark color scheme with black backgrounds and green accents
2. WHEN rendering UI panels, THE GitRefiny System SHALL apply glassmorphism effects including translucency and blur
3. THE GitRefiny System SHALL use rounded, friendly typography for text elements
4. WHEN displaying code blocks, THE GitRefiny System SHALL use monospace fonts
5. WHEN rendering on mobile devices, THE GitRefiny System SHALL stack panels vertically and maintain responsive layouts
6. THE GitRefiny System SHALL ensure all interactive elements are accessible via keyboard navigation aslo the site should have a scroll bar for users to scroll down whenever its needed

### Requirement 9

**User Story:** As a system administrator, I want API endpoints to follow a consistent contract, so that frontend and backend integration is predictable and maintainable.

#### Acceptance Criteria

1. THE GitRefiny System SHALL provide a POST endpoint `/api/analyze` accepting payload with repo_url and optional token
2. WHEN `/api/analyze` is called, THE GitRefiny System SHALL return Analysis JSON containing repo_meta, languages, file_tree_summary, detected_stack, and hints
3. THE GitRefiny System SHALL provide a POST endpoint `/api/generate` accepting repo_url, analysis_id, optional sections array, optional tone, and optional model
4. WHEN `/api/generate` is called, THE GitRefiny System SHALL return a response containing the markdown string, generated_at timestamp, and optional credits_used
5. THE GitRefiny System SHALL provide a POST endpoint `/api/chat` accepting uid, session_id, message, and optional context_refs
6. WHEN `/api/chat` is called, THE GitRefiny System SHALL return assistant_message and session_id
7. THE GitRefiny System SHALL provide a GET endpoint `/api/saved/{uid}` that returns a list of saved READMEs for the specified user
8. THE GitRefiny System SHALL provide a POST endpoint `/api/save` accepting uid, repo_url, markdown, and meta

### Requirement 10

**User Story:** As a developer, I want the system to use Kiro's MCP integration for GitHub access, so that repository data is fetched reliably and efficiently.

#### Acceptance Criteria

1. WHEN accessing GitHub repositories, THE GitRefiny System SHALL use Kiro MCP to call GitHub REST API endpoints
2. WHEN fetching public repositories, THE GitRefiny System SHALL make unauthenticated API requests
3. WHEN fetching private repositories, THE GitRefiny System SHALL include the user-provided Personal Access Token in API requests
4. WHEN MCP requests fail, THE GitRefiny System SHALL return error responses with descriptive messages
5. WHEN fetching repository trees, THE GitRefiny System SHALL request recursive tree data with depth parameter set to retrieve all files

### Requirement 11

**User Story:** As a quality assurance engineer, I want the system to include automated tests, so that core functionality is validated and regressions are prevented.

#### Acceptance Criteria

1. THE GitRefiny System SHALL include unit tests for file tree parsing functions
2. THE GitRefiny System SHALL include unit tests for language detection logic
3. THE GitRefiny System SHALL include unit tests for package manifest identification
4. THE GitRefiny System SHALL include end-to-end smoke tests that call `/api/analyze`, `/api/generate`, and verify preview output
5. WHEN running end-to-end tests, THE GitRefiny System SHALL assert that preview output contains Title and Tech Stack sections
6. THE GitRefiny System SHALL provide a test runner script that executes all unit and integration tests
