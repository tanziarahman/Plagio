# Plagio

Plagio is a plagiarism detection tool that supports both text and code.  
It includes AI content detection for text, highlights plagiarized lines, and allows users to view previous analyses for tracking.  

The system is built with Flask (backend), React (frontend), and SQLite (database), and integrates with external APIs for accurate detection.

## Features

- 🔍 Text plagiarism detection with AI content checking (Sapling and Winston)
- 💻 Code plagiarism detection (Mosspy)  
- ✨ Highlighting of plagiarized lines in results  
- 📊 View history of previous analyses  
- 🗄️ Lightweight database storage with SQLite  
- 🔒 Secure authentication with Flask-Login and bcrypt  

## Tech Stack

- **Backend:** Flask, Flask-SQLAlchemy, Flask-Login, Flask-Bcrypt  
- **Frontend:** React  
- **Database:** SQLite  
- **External APIs:** Moss, Sapling and Winston  
- **Libraries:** BeautifulSoup4, RapidFuzz, PyPDF2, python-docx, Mosspy, Requests  

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/tanziarahman/Plagio.git
   cd Plagio

Create and activate a virtual environment:

python -m venv venv
source venv/bin/activate   # On Linux/Mac
venv\Scripts\activate      # On Windows


Install dependencies:

pip install -r requirements.txt


Run the Flask backend:

flask run


Start the React frontend:

cd client
npm install
npm start

## Requirements
See requirements.txt for the full list of dependencies.

#### Key dependencies include:

- Flask 3.1.1
- Flask-SQLAlchemy 3.1.1
- Flask-Login 0.6.3
- Flask-Bcrypt 1.0.1
- React
- SQLite
- Mosspy 1.0.9
- RapidFuzz 3.13.0
- PyPDF2 3.0.1
- python-docx 1.2.0

## Usage
- Upload one or more files (text or code).
- Run the analysis.
- View similarity percentages and highlighted plagiarized lines.
- Access previous analyses from history.

## License
This project is for educational purposes.
You may use or modify it with proper credit.
  

