# 🎓 AI Classroom Management System

An intelligent classroom management system powered by AI that helps educators manage assignments, analyze student submissions, and provide automated feedback with advanced formatting compliance checks.

## ✨ Features

### 📚 Core Features
- **Classroom Management**: Create and manage multiple classrooms with student enrollment
- **Assignment System**: Create assignments with detailed formatting requirements
- **Submission Tracking**: Students can submit assignments with automatic status tracking
- **Real-time Notifications**: Stay updated with assignment submissions and announcements
- **AI-Powered Analysis**: Automatic analysis of student submissions

### 🤖 AI-Powered Features

#### **AI Intelligence**
- **Plagiarism Detection**: Similarity score analysis using advanced NLP
- **Spelling & Grammar Check**: Comprehensive error detection and correction
- **Formatting Compliance**: Validates documents against specific formatting requirements
- **Readability Analysis**: Flesch Reading Ease score calculation

#### **Auto-Fix AI** ✨
- **Standalone Auto-Fix Tool**: Upload any document for instant AI correction
- **Assignment Auto-Fix**: Automatically correct student submissions
- **Error Analysis Dashboard**: 
  - Spelling errors detection and listing
  - Grammar issues identification
  - Formatting compliance validation
- **Smart Formatting Application**:
  - Font name and size (Times New Roman, Arial, Calibri)
  - Text alignment (Left, Center, Right, Justified)
  - Line spacing (Single, 1.5, Double)
  - Margins (1 inch, custom sizes)
  - Headers and footers
  - Page numbering
  - Title formatting (Bold, Underline, Centered)
  - Table formatting
- **Format Preservation**: Download corrected files in original format (DOCX, PDF→DOCX, TXT)
- **Side-by-side Comparison**: View original vs corrected text
- **Expandable Error Lists**: Click to view all detected errors

### 📊 Analytics & Reporting
- **Submission Analytics**: Track submission rates and patterns
- **Performance Metrics**: Monitor student performance across assignments
- **Formatting Compliance Reports**: Detailed breakdown of formatting issues

## 🛠️ Technology Stack

### Backend
- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: SQLite (development) / PostgreSQL (production ready)
- **AI/ML**: 
  - Groq API (LLaMA 3.3 70B) for text correction
  - spaCy for NLP processing
  - PySpellChecker for spelling validation
  - python-docx for document generation
- **File Processing**: pdfplumber, python-docx for document parsing

### Frontend
- **Framework**: React 18+ with Vite
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom glassmorphism design
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **HTTP Client**: Axios
- **Authentication**: JWT (JSON Web Tokens)

## 📋 Prerequisites

### For macOS:
- **Python**: 3.8 or higher
- **Node.js**: 16.x or higher
- **npm**: 8.x or higher
- **Git**: Latest version

### For Windows:
- **Python**: 3.8 or higher (from [python.org](https://www.python.org/downloads/))
- **Node.js**: 16.x or higher (from [nodejs.org](https://nodejs.org/))
- **Git**: Latest version (from [git-scm.com](https://git-scm.com/))

## 🚀 Installation & Setup

**Choose your operating system for detailed setup instructions:**

### 🍎 [macOS Setup Guide](SETUP_MACOS.md)
Complete step-by-step instructions for macOS users with Terminal commands.

### 🪟 [Windows Setup Guide](SETUP_WINDOWS.md)
Complete step-by-step instructions for Windows users with Command Prompt commands.

---

### Quick Start Summary

Both platforms require:
1. **Clone the repository**
2. **Backend setup**: Python virtual environment, install dependencies, run migrations
3. **Frontend setup**: Install npm packages, configure environment
4. **Start both servers**: Backend on port 8000, Frontend on port 5173

**Default URLs:**
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- Admin Panel: `http://localhost:8000/admin`

## 🔑 Environment Variables

### Backend (.env file in backend directory)
Create a `.env` file in the `backend` directory:

```env
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database (for production)
DATABASE_URL=postgresql://user:password@localhost:5432/ai_classroom

# Groq API (for AI features)
GROQ_API_KEY=your-groq-api-key-here

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (.env file in frontend directory)
Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:8000/api
```

## 🎯 Getting Started

### Default Demo Accounts (if using seed_data)

**Teacher Account:**
- Email: `prof_smith@example.com`
- Password: `password123`

**Student Account:**
- Email: `alice_student@example.com`
- Password: `password123`

### First Steps

1. **Access the Application**: Open `http://localhost:5173` in your browser
2. **Login**: Use demo credentials or create a new account
3. **For Teachers**:
   - Create a classroom
   - Add assignments with formatting requirements
   - Review student submissions
   - Use AI analysis features
4. **For Students**:
   - Enroll in classrooms
   - Submit assignments
   - Use Auto-Fix AI to improve submissions
   - View AI feedback and analysis

## 📖 Usage Guide

### Using Auto-Fix AI

#### Standalone Auto-Fix:
1. Click **"Auto-Fix AI"** in the sidebar
2. Upload your document (TXT, PDF, or DOCX)
3. Enter formatting instructions (e.g., "Font: Times New Roman, Size: 12, Double spaced")
4. Click **"Fix with AI"**
5. Review detected errors (spelling, grammar, formatting)
6. Download the corrected file with applied formatting

#### Assignment Auto-Fix:
1. Navigate to an assignment submission
2. Click **"✨ Auto-Fix with AI"** button
3. Review the comparison and error analysis
4. Download the corrected file (automatically applies assignment formatting requirements)

### Formatting Instructions Examples

```
Font: Times New Roman, Size: 12, Double spaced, 1 inch margins, 
Title bold and centered, Page numbers in footer, Justified alignment, 
Header with name, Table borders
```

Supported formatting options:
- **Font**: Times New Roman, Arial, Calibri
- **Size**: Any point size (e.g., 11pt, 12pt)
- **Spacing**: Single, 1.5, Double
- **Alignment**: Left, Center, Right, Justified
- **Margins**: Specify in inches (e.g., 1 inch margins)
- **Title**: Bold, Underline, Centered
- **Headers/Footers**: Custom headers and footers
- **Page Numbers**: Automatic page numbering
- **Tables**: Borders and alignment

## 🏗️ Project Structure

```
ai-classroom-main/
├── backend/
│   ├── core/                    # Main Django app
│   │   ├── models.py           # Database models
│   │   ├── views.py            # API endpoints
│   │   ├── serializers.py      # DRF serializers
│   │   ├── urls.py             # URL routing
│   │   └── file_analysis.py    # AI analysis logic
│   ├── academic_bloom/         # Django project settings
│   ├── manage.py               # Django management script
│   └── requirements.txt        # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/              # Page components
│   │   │   ├── AutoFix.jsx    # Standalone Auto-Fix page
│   │   │   ├── AssignmentDetail.jsx
│   │   │   └── ...
│   │   ├── api/                # API configuration
│   │   ├── App.jsx             # Main app component
│   │   └── main.jsx            # Entry point
│   ├── package.json            # Node dependencies
│   └── vite.config.js          # Vite configuration
│
└── README.md                   # This file
```

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

### Database Management
```bash
# Create new migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (WARNING: Deletes all data)
python manage.py flush
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: `ModuleNotFoundError: No module named 'X'`
- **Solution**: Ensure virtual environment is activated and run `pip install -r requirements.txt`

**Issue**: Frontend can't connect to backend
- **Solution**: Check that backend is running on port 8000 and CORS settings are correct

**Issue**: NLTK/spaCy data not found
- **Solution**: Run `python -m spacy download en_core_web_sm`

**Issue**: SSL Certificate errors with NLTK
- **Solution**: This is a known issue and won't affect core functionality

**Issue**: Port already in use
- **macOS/Linux**: `lsof -ti:8000 | xargs kill -9`
- **Windows**: `netstat -ano | findstr :8000` then `taskkill /PID <PID> /F`

## 📝 API Documentation

The API is available at `http://localhost:8000/api/`

### Key Endpoints:
- `POST /api/token/` - Obtain JWT token
- `GET /api/classrooms/` - List classrooms
- `GET /api/assignments/` - List assignments
- `POST /api/submissions/` - Submit assignment
- `POST /api/auto-fix-submission/` - AI auto-fix
- `POST /api/auto-fix-file/` - Standalone auto-fix
- `POST /api/download-corrected-file/` - Download corrected file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- **Groq** for providing the LLaMA 3.3 70B API
- **spaCy** for NLP capabilities
- **Django** and **React** communities for excellent frameworks
- All contributors and testers

## 📞 Support

For issues, questions, or suggestions:
- Create an issue in the repository
- Contact: your-email@example.com

---

**Made with ❤️ for educators and students**