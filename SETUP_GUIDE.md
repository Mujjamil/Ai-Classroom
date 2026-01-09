# 📚 Complete Setup Process for New Users

## Repository Information
- **GitHub URL**: https://github.com/Mujjamil/Ai-Classroom
- **Project Name**: AI Classroom Management System
- **Tech Stack**: Django (Backend) + React (Frontend)

---

## 🎯 Step-by-Step Process for Anyone Cloning Your Project

### Prerequisites (What They Need First)

1. **Python 3.8+** - [Download from python.org](https://www.python.org/downloads/)
2. **Node.js 16+** - [Download from nodejs.org](https://nodejs.org/)
3. **Git** - [Download from git-scm.com](https://git-scm.com/)
4. **Groq API Key** (Free) - [Get from console.groq.com](https://console.groq.com)

---

## 📋 Complete Installation Process

### Step 1: Clone the Repository

```bash
# Open Terminal (macOS) or Command Prompt (Windows)
git clone https://github.com/Mujjamil/Ai-Classroom.git
cd Ai-Classroom
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
# macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# Windows:
python -m venv venv
venv\Scripts\activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Download NLP model
python -m spacy download en_core_web_sm
```

### Step 3: Configure Backend Environment

Create a `.env` file in the `backend` directory with:

```env
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
GROQ_API_KEY=your-groq-api-key-here
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Important:** Replace `your-groq-api-key-here` with actual Groq API key from [console.groq.com](https://console.groq.com)

### Step 4: Setup Database

```bash
# Run migrations
python manage.py migrate

# Create admin account
python manage.py createsuperuser
# Follow prompts to create username, email, and password

# (Optional) Load demo data
python manage.py seed_data
```

### Step 5: Start Backend Server

```bash
# Make sure virtual environment is activated
python manage.py runserver
```

✅ **Backend should now be running at:** `http://localhost:8000`

**Keep this terminal window open!**

### Step 6: Frontend Setup (New Terminal Window)

```bash
# Navigate to frontend directory
cd Ai-Classroom/frontend

# Install Node.js dependencies
npm install
```

### Step 7: Configure Frontend Environment

Create a `.env` file in the `frontend` directory with:

```env
VITE_API_URL=http://localhost:8000/api
```

### Step 8: Start Frontend Server

```bash
npm run dev
```

✅ **Frontend should now be running at:** `http://localhost:5173`

**Keep this terminal window open too!**

---

## 🎉 Accessing the Application

1. Open web browser (Chrome, Firefox, Safari, Edge)
2. Navigate to: **http://localhost:5173**
3. Login with:
   - **Demo Teacher**: `prof_smith@example.com` / `password123` (if seed_data was run)
   - **Demo Student**: `alice_student@example.com` / `password123` (if seed_data was run)
   - **Or** use the superuser credentials created in Step 4

---

## 🔑 Getting Groq API Key (Required for AI Features)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Click **"Create API Key"**
5. Copy the key (starts with `gsk_...`)
6. Paste it in `backend/.env` file as `GROQ_API_KEY=gsk_...`
7. Restart the backend server

**Note:** Without the Groq API key, AI features (Auto-Fix, grammar checking, plagiarism detection) won't work.

---

## 🔄 Daily Usage (After Initial Setup)

Every time they want to run the application:

### Terminal 1 - Start Backend:
```bash
cd Ai-Classroom/backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver
```

### Terminal 2 - Start Frontend:
```bash
cd Ai-Classroom/frontend
npm run dev
```

### To Stop:
Press `Ctrl + C` in each terminal window

---

## 📖 Available Documentation

Your project now includes:

1. **README.md** - Main project documentation with features and overview
2. **QUICKSTART.md** - Fast 5-minute setup guide
3. **SETUP_MACOS.md** - Detailed macOS setup instructions
4. **SETUP_WINDOWS.md** - Detailed Windows setup instructions

All files include:
- ✅ Actual GitHub repository URL
- ✅ Groq API key instructions
- ✅ Troubleshooting guides
- ✅ Daily usage commands

---

## 🐛 Common Issues & Solutions

### Issue: "Port already in use"
**macOS/Linux:**
```bash
lsof -ti:8000 | xargs kill -9  # Kill backend
lsof -ti:5173 | xargs kill -9  # Kill frontend
```

**Windows:**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Issue: "ModuleNotFoundError"
```bash
# Make sure virtual environment is activated
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Issue: "CORS errors in browser"
- Check backend is running on `http://localhost:8000`
- Check `frontend/.env` has correct API URL
- Restart both servers

### Issue: "python/npm command not found"
- Reinstall Python/Node.js
- Make sure to check "Add to PATH" during installation
- Restart terminal/command prompt

---

## 🎯 What Users Can Do After Setup

### As a Teacher:
1. Create classrooms
2. Add assignments with formatting requirements
3. Review student submissions
4. Use AI analysis to check for plagiarism, grammar, spelling
5. Download AI-corrected submissions

### As a Student:
1. Enroll in classrooms
2. Submit assignments
3. Use **Auto-Fix AI** to improve submissions before submitting
4. View AI feedback and analysis
5. Download corrected versions of their work

---

## 📞 Support & Help

If users encounter issues:
1. Check the troubleshooting sections in setup guides
2. Visit the GitHub repository: https://github.com/Mujjamil/Ai-Classroom
3. Search for similar issues
4. Create a new issue with:
   - Operating system and version
   - Python version (`python --version`)
   - Node version (`node --version`)
   - Error messages (full text)
   - Steps to reproduce the issue

---

## ✅ Summary Checklist for New Users

- [ ] Install Python 3.8+
- [ ] Install Node.js 16+
- [ ] Install Git
- [ ] Clone repository from GitHub
- [ ] Create Python virtual environment
- [ ] Install backend dependencies
- [ ] Download spaCy model
- [ ] Create backend `.env` file
- [ ] Get Groq API key
- [ ] Run database migrations
- [ ] Create superuser account
- [ ] (Optional) Load demo data
- [ ] Start backend server
- [ ] Install frontend dependencies
- [ ] Create frontend `.env` file
- [ ] Start frontend server
- [ ] Access application at http://localhost:5173
- [ ] Login and explore!

---

**Repository:** https://github.com/Mujjamil/Ai-Classroom

**Made with ❤️ for educators and students**
