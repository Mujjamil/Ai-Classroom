# ⚡ Quick Start Guide - AI Classroom

Get up and running with AI Classroom in minutes!

## 📦 What You'll Need

- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **Node.js 16+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **Groq API Key** (Free - [Get it here](https://console.groq.com))

---

## 🚀 5-Minute Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Mujjamil/Ai-Classroom.git
cd Ai-Classroom
```

### 2️⃣ Backend Setup

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
# macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# Windows:
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download NLP model
python -m spacy download en_core_web_sm

# Create .env file
# macOS/Linux:
cat > .env << EOF
SECRET_KEY=django-insecure-dev-key-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
GROQ_API_KEY=your-groq-api-key-here
CORS_ALLOWED_ORIGINS=http://localhost:5173
EOF

# Windows (use notepad):
# notepad .env
# Then paste the above content

# Setup database
python manage.py migrate
python manage.py createsuperuser  # Create your admin account

# Optional: Load demo data
python manage.py seed_data

# Start backend server
python manage.py runserver
```

**✅ Backend running at:** `http://localhost:8000`

### 3️⃣ Frontend Setup

Open a **NEW terminal window**:

```bash
# Navigate to frontend
cd Ai-Classroom/frontend

# Install dependencies
npm install

# Create .env file
# macOS/Linux:
echo "VITE_API_URL=http://localhost:8000/api" > .env

# Windows:
# echo VITE_API_URL=http://localhost:8000/api > .env

# Start frontend server
npm run dev
```

**✅ Frontend running at:** `http://localhost:5173`

---

## 🎯 Access the Application

1. Open your browser
2. Go to: **http://localhost:5173**
3. Login with:
   - **Demo Teacher**: `prof_smith@example.com` / `password123`
   - **Demo Student**: `alice_student@example.com` / `password123`
   - **Or** use your superuser credentials

---

## 🔑 Getting Your Groq API Key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (it's free!)
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the key (starts with `gsk_...`)
6. Paste it in `backend/.env` as `GROQ_API_KEY=gsk_...`

**Note:** The Groq API is required for AI features like Auto-Fix, grammar checking, and plagiarism detection.

---

## 🎓 What's Next?

### For Teachers:
1. Create a classroom
2. Add assignments with formatting requirements
3. Review student submissions
4. Use AI analysis features

### For Students:
1. Enroll in classrooms
2. Submit assignments
3. Use **Auto-Fix AI** to improve your work
4. View AI feedback

---

## 🔄 Daily Usage

Every time you want to run the application:

**Terminal 1 - Backend:**
```bash
cd Ai-Classroom/backend
source venv/bin/activate  # Windows: venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd Ai-Classroom/frontend
npm run dev
```

---

## 🐛 Common Issues

### "Port already in use"
**macOS/Linux:**
```bash
lsof -ti:8000 | xargs kill -9  # Backend
lsof -ti:5173 | xargs kill -9  # Frontend
```

**Windows:**
```cmd
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### "Module not found"
```bash
# Activate virtual environment first!
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### "CORS errors"
- Make sure backend is running on port 8000
- Check `frontend/.env` has `VITE_API_URL=http://localhost:8000/api`
- Restart both servers

---

## 📖 Full Documentation

- **macOS Users**: See [SETUP_MACOS.md](SETUP_MACOS.md)
- **Windows Users**: See [SETUP_WINDOWS.md](SETUP_WINDOWS.md)
- **Features & Usage**: See [README.md](README.md)

---

## 🆘 Need Help?

1. Check the troubleshooting sections in setup guides
2. Search existing issues on GitHub
3. Create a new issue with:
   - Your OS and versions
   - Error messages
   - Steps to reproduce

---

**Made with ❤️ for educators and students**

**Repository:** https://github.com/Mujjamil/Ai-Classroom
