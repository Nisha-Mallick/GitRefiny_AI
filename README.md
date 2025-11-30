# GitRefiny — AI README Generator & Repo Documentation Assistant

Turn any GitHub repository link into a polished, context-aware README.md with AI-powered analysis and generation.

## Features

- 🔍 **Repository Analysis**: Fetch metadata, languages, file tree, and package manifests
- 🤖 **AI-Powered Generation**: Generate professional READMEs using Claude Sonnet 4.5
- 👁️ **Live Preview**: Real-time markdown rendering with copy/download
- 💬 **Chat Assistant**: Refine documentation with voice or text input
- 🔐 **Authentication**: Save history with Firebase Auth (Google + Email/Password)
- 🎨 **Glassmorphism UI**: Dark theme with green accents and blur effects

## Tech Stack

**Frontend**: HTML5, Tailwind CSS, Vanilla JavaScript, markdown-it, Firebase SDK  
**Backend**: Python 3.11+, Flask, Firebase Admin SDK  
**AI**: Kiro MCP (GitHub API), Auto & Claude Sonnet 4.5 models  
**Database**: Firebase Firestore  

## Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js 18+
- Firebase project with Firestore and Authentication enabled

### Backend Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r backend/requirements.txt
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Firebase and Kiro API credentials
```

4. Run Flask server:
```bash
python backend/app.py
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Build Tailwind CSS:
```bash
npm run dev  # Development with watch mode
# OR
npm run build  # Production build
```

3. Serve frontend (Flask serves static files on http://localhost:5000)

## Usage

1. Open http://localhost:5000 in your browser
2. Enter a GitHub repository URL
3. Click "Analyze" to fetch repository data
4. Review analysis and click "Generate README"
5. Preview, copy, or download the generated README
6. Sign in to save READMEs and use chat assistant

## API Endpoints

- `POST /api/analyze` - Analyze GitHub repository
- `POST /api/generate` - Generate README from analysis
- `POST /api/chat` - Chat with AI assistant
- `POST /api/save` - Save README (authenticated)
- `GET /api/saved/:uid` - Get saved READMEs (authenticated)

## Testing

Run unit tests:
```bash
pytest tests/unit/
```

Run property-based tests:
```bash
pytest tests/property/
```

Run end-to-end smoke test:
```bash
pytest tests/e2e/smoke_test.py
```

## Known Limitations

- Analysis limited to repositories with < 1000 files for performance
- GitHub API rate limits apply (60 req/hour unauthenticated, 5000 authenticated)
- Voice input requires browser support for Web Speech API
- Private repos require Personal Access Token

## License

MIT License - See LICENSE file for details
