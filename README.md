# GitRefiny — AI README Generator & Repo Documentation Assistant

[![Stars](https://img.shields.io/github/stars/Nisha-Mallick/GitRefiny_AI?style=for-the-badge)](https://github.com/Nisha-Mallick/GitRefiny_AI/stargazers)
[![Forks](https://img.shields.io/github/forks/Nisha-Mallick/GitRefiny_AI?style=for-the-badge)](https://github.com/Nisha-Mallick/GitRefiny_AI/network/members)
[![License](https://img.shields.io/badge/License-MIT-ff69b4?style=for-the-badge)](https://github.com/Nisha-Mallick/GitRefiny_AI/blob/main/LICENSE)

## Description

GitRefiny_AI is a cutting-edge project that leverages the power of artificial intelligence to refine and optimize code quality. By analyzing code patterns, detecting anomalies, and providing actionable insights, GitRefiny_AI helps developers write better, more maintainable code.

The primary purpose of GitRefiny_AI is to assist developers in identifying areas of improvement in their codebase, ensuring that their projects are scalable, efficient, and easy to understand. With its advanced AI-powered algorithms, GitRefiny_AI can help teams streamline their development process, reduce bugs, and improve overall code quality.

GitRefiny_AI is designed for developers, development teams, and organizations seeking to elevate their coding standards and best practices. Whether you're working on a personal project or a large-scale enterprise application, GitRefiny_AI is the perfect tool to help you refine your code and take your development skills to the next level.

## Features

* **Code Analysis**: In-depth analysis of code patterns and structures
* **AI-Powered Insights**: Actionable recommendations for code improvement
* **Code Optimization**: Suggestions for performance enhancements
* **Bug Detection**: Identification of potential bugs and errors
* **Code Metrics**: Detailed metrics on code quality, complexity, and maintainability
* **Code Review**: Automated code review and feedback
* **AI-Driven Refactoring**: Intelligent code refactoring suggestions

## Tech Stack
### Frontend

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Tailwind_CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Backend

![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Fast_API](https://img.shields.io/badge/fastapi-109989?style=for-the-badge&logo=FASTAPI&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
### Database

![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

### DevOps & Tools

![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)

## Architectural-Flow-Diagram

```mermaid
flowchart TD

    Start([User / Developer])
    Frontend([Frontend\nJavaScript / HTML / CSS])
    Backend([Backend\nPython / Node.js])
    AI([AI-Powered Insights\nMachine Learning])

    Start --> |Code Submission| Frontend
    Frontend --> |API Calls| Backend
    Backend --> |Code Analysis| AI
    AI --> |Recommendations| Backend
    Backend --> |Optimized Code| Frontend
    Frontend --> |Refined Code| Start

    style Start fill:#4CAF50,stroke:#2E7D32,color:#fff
    style Frontend fill:#2196F3,stroke:#1565C0,color:#fff
    style Backend fill:#9C27B0,stroke:#6A1B9A,color:#fff
    style AI fill:#FF9800,stroke:#E65100,color:#fff

```

## Project Structure

```plain
├── .env.example
├── .firebaserc
├── .gitignore
├── .kiro
├── .kiro/
├── README.md
├── backend
├── firebase.json
├── firestore.indexes.json
├── firestore.rules
├── frontend
├── frontend/
├── spec.yml
├── test_api_keys.py
├── test_mermaid_diagram.py
├── test_tech_icons.py
```

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

## Contributing

Contributions are welcome! Please submit a pull request with your changes and a brief description of what you've added or fixed.

## License

This project is licensed under the MIT License.

## Contact/Connect with me :

For issues, discussions, or support, please visit my <br>
<br><a href="https://www.linkedin.com/in/nisha-mallick50/" target="blank"><img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/linked-in-alt.svg" alt="nisha mallick" height="30" width="40" /></a>&nbsp;&nbsp;
<a href="https://www.leetcode.com/u/Nisha_Mallick/" target="blank">
  <img align="center" src="https://raw.githubusercontent.com/rahuldkjain/github-profile-readme-generator/master/src/images/icons/Social/leet-code.svg" alt="leetcode" height="30" width="40"/>
</a>

