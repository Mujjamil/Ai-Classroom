# 🍎 AI Classroom - macOS Setup Guide

Complete installation and setup instructions for macOS users.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Python 3.8 or higher**
   - Check if installed: `python3 --version`
   - Install from: [python.org](https://www.python.org/downloads/)
   - Or use Homebrew: `brew install python3`

2. **Node.js 16.x or higher**
   - Check if installed: `node --version`
   - Install from: [nodejs.org](https://nodejs.org/)
   - Or use Homebrew: `brew install node`

3. **Git**
   - Check if installed: `git --version`
   - Usually pre-installed on macOS
   - Or install via Homebrew: `brew install git`

4. **Homebrew** (Optional but recommended)
   - Install: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`

## 🚀 Installation Steps

### Step 1: Clone the Repository

Open Terminal and run:

```bash
# Navigate to your desired directory (e.g., Desktop)
cd ~/Desktop

# Clone the repository
git clone https://github.com/Mujjamil/Ai-Classroom.git

# Navigate into the project
cd Ai-Classroom
```

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate
```

**Note**: You should see `(venv)` in your terminal prompt when activated.

#### 2.2 Install Python Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install all required packages
pip install -r requirements.txt
```

#### 2.3 Download NLP Models

```bash
# Download spaCy English language model
python -m spacy download en_core_web_sm
```

#### 2.4 Setup Environment Variables

Create a `.env` file in the `backend` directory:

```bash
# Create .env file
touch .env

# Open in default text editor
open -e .env
```

Add the following content to `.env`:

```env
# Django Settings
SECRET_KEY=your-secret-key-here-change-this-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Groq API (Required for AI features)
GROQ_API_KEY=your-groq-api-key-here

# CORS Settings
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Get your Groq API Key:**
1. Visit [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new API key
5. Copy and paste it into the `.env` file

#### 2.5 Database Setup

```bash
# Run migrations to create database tables
python manage.py migrate

# Create a superuser account (admin)
python manage.py createsuperuser
```

Follow the prompts to create your admin account:
- Username: (your choice)
- Email: (your email)
- Password: (secure password)

#### 2.6 Load Demo Data (Optional)

```bash
# Seed the database with demo data
python manage.py seed_data
```

This creates:
- Demo teacher account: `prof_smith@example.com` / `password123`
- Demo student account: `alice_student@example.com` / `password123`
- Sample classrooms and assignments

#### 2.7 Start Backend Server

```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Start Django development server
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

**Keep this terminal window open!** The backend server needs to keep running.

### Step 3: Frontend Setup

Open a **NEW Terminal window** (⌘ + T):

#### 3.1 Navigate to Frontend Directory

```bash
cd ~/Desktop/Ai-Classroom/frontend
```

#### 3.2 Install Node Dependencies

```bash
# Install all npm packages
npm install
```

This may take a few minutes.

#### 3.3 Setup Environment Variables

Create a `.env` file in the `frontend` directory:

```bash
# Create .env file
touch .env

# Open in default text editor
open -e .env
```

Add the following content:

```env
VITE_API_URL=http://localhost:8000/api
```

#### 3.4 Start Frontend Server

```bash
# Start Vite development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this terminal window open too!**

## 🎉 Access the Application

1. Open your web browser (Chrome, Safari, Firefox)
2. Navigate to: `http://localhost:5173`
3. You should see the AI Classroom login page

### Login Options:

**Option 1: Use Demo Accounts** (if you ran seed_data)
- Teacher: `prof_smith@example.com` / `password123`
- Student: `alice_student@example.com` / `password123`

**Option 2: Use Superuser Account**
- Use the credentials you created in Step 2.5

**Option 3: Register New Account**
- Click "Register" and create a new account

## 🔄 Daily Usage

### Starting the Application

You need to run both servers every time you want to use the application:

**Terminal 1 - Backend:**
```bash
cd ~/Desktop/Ai-Classroom/backend
source venv/bin/activate
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd ~/Desktop/Ai-Classroom/frontend
npm run dev
```

### Stopping the Application

Press `Ctrl + C` in each terminal window to stop the servers.

## 🛠️ Troubleshooting

### Issue: "python3: command not found"
**Solution:**
```bash
# Install Python via Homebrew
brew install python3
```

### Issue: "npm: command not found"
**Solution:**
```bash
# Install Node.js via Homebrew
brew install node
```

### Issue: Port 8000 already in use
**Solution:**
```bash
# Find and kill the process using port 8000
lsof -ti:8000 | xargs kill -9

# Then restart the backend server
python manage.py runserver
```

### Issue: Port 5173 already in use
**Solution:**
```bash
# Find and kill the process using port 5173
lsof -ti:5173 | xargs kill -9

# Then restart the frontend server
npm run dev
```

### Issue: "ModuleNotFoundError: No module named 'X'"
**Solution:**
```bash
# Make sure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Database errors
**Solution:**
```bash
# Reset database (WARNING: This deletes all data)
cd backend
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
python manage.py seed_data
```

### Issue: CORS errors in browser console
**Solution:**
- Check that backend is running on `http://localhost:8000`
- Check that frontend `.env` has `VITE_API_URL=http://localhost:8000/api`
- Restart both servers

### Issue: SSL Certificate errors with NLTK
**Solution:**
This is a known issue and won't affect core functionality. You can safely ignore these warnings.

## 📦 Updating the Application

```bash
# Navigate to project directory
cd ~/Desktop/Ai-Classroom

# Pull latest changes
git pull

# Update backend dependencies
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate

# Update frontend dependencies
cd ../frontend
npm install
```

## 🔧 Advanced Configuration

### Using PostgreSQL instead of SQLite

1. Install PostgreSQL:
```bash
brew install postgresql
brew services start postgresql
```

2. Create database:
```bash
createdb ai_classroom
```

3. Update `.env`:
```env
DATABASE_URL=postgresql://localhost/ai_classroom
```

4. Install psycopg2:
```bash
pip install psycopg2-binary
```

### Running on Different Ports

**Backend:**
```bash
python manage.py runserver 8080
```

**Frontend:**
Update `vite.config.js`:
```javascript
export default {
  server: {
    port: 3000
  }
}
```

## 📚 Additional Resources

- [Python Documentation](https://docs.python.org/3/)
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## 🆘 Getting Help

If you encounter issues not covered here:
1. Check the main README.md for general information
2. Search for similar issues in the repository
3. Create a new issue with:
   - Your macOS version
   - Python version (`python3 --version`)
   - Node version (`node --version`)
   - Error messages
   - Steps to reproduce

---

**Happy coding! 🚀**
