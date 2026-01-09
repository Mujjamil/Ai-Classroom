# 🪟 AI Classroom - Windows Setup Guide

Complete installation and setup instructions for Windows users.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Python 3.8 or higher**
   - Download from: [python.org](https://www.python.org/downloads/)
   - ✅ During installation, check "Add Python to PATH"
   - Verify installation: Open Command Prompt and run `python --version`

2. **Node.js 16.x or higher**
   - Download from: [nodejs.org](https://nodejs.org/)
   - Download the LTS (Long Term Support) version
   - Verify installation: Open Command Prompt and run `node --version`

3. **Git for Windows**
   - Download from: [git-scm.com](https://git-scm.com/download/win)
   - Use default installation options
   - Verify installation: Open Command Prompt and run `git --version`

4. **Text Editor** (Optional but recommended)
   - [Visual Studio Code](https://code.visualstudio.com/)
   - Or use Notepad (built-in)

## 🚀 Installation Steps

### Step 1: Clone the Repository

Open **Command Prompt** (Press `Win + R`, type `cmd`, press Enter):

```cmd
:: Navigate to your desired directory (e.g., Desktop)
cd %USERPROFILE%\Desktop

:: Clone the repository
git clone https://github.com/Mujjamil/Ai-Classroom.git

:: Navigate into the project
cd Ai-Classroom
```

### Step 2: Backend Setup

#### 2.1 Create Virtual Environment

```cmd
:: Navigate to backend directory
cd backend

:: Create virtual environment
python -m venv venv

:: Activate virtual environment
venv\Scripts\activate
```

**Note**: You should see `(venv)` at the beginning of your command prompt when activated.

#### 2.2 Install Python Dependencies

```cmd
:: Upgrade pip
python -m pip install --upgrade pip

:: Install all required packages
pip install -r requirements.txt
```

**Note**: This may take several minutes. Don't close the window.

#### 2.3 Download NLP Models

```cmd
:: Download spaCy English language model
python -m spacy download en_core_web_sm
```

#### 2.4 Setup Environment Variables

Create a `.env` file in the `backend` directory:

**Option 1: Using Command Prompt**
```cmd
:: Create .env file
type nul > .env

:: Open in Notepad
notepad .env
```

**Option 2: Using File Explorer**
1. Navigate to `Desktop\ai-classroom-main\backend`
2. Right-click → New → Text Document
3. Rename to `.env` (remove the .txt extension)
4. Open with Notepad

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

```cmd
:: Run migrations to create database tables
python manage.py migrate

:: Create a superuser account (admin)
python manage.py createsuperuser
```

Follow the prompts to create your admin account:
- Username: (your choice)
- Email: (your email)
- Password: (secure password)
- Password (again): (same password)

**Note**: Password won't show while typing - this is normal for security.

#### 2.6 Load Demo Data (Optional)

```cmd
:: Seed the database with demo data
python manage.py seed_data
```

This creates:
- Demo teacher account: `prof_smith@example.com` / `password123`
- Demo student account: `alice_student@example.com` / `password123`
- Sample classrooms and assignments

#### 2.7 Start Backend Server

```cmd
:: Make sure virtual environment is activated
venv\Scripts\activate

:: Start Django development server
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

**Keep this Command Prompt window open!** The backend server needs to keep running.

### Step 3: Frontend Setup

Open a **NEW Command Prompt window** (Press `Win + R`, type `cmd`, press Enter):

#### 3.1 Navigate to Frontend Directory

```cmd
cd %USERPROFILE%\Desktop\Ai-Classroom\frontend
```

#### 3.2 Install Node Dependencies

```cmd
:: Install all npm packages
npm install
```

This may take a few minutes. You'll see a progress bar.

#### 3.3 Setup Environment Variables

Create a `.env` file in the `frontend` directory:

**Option 1: Using Command Prompt**
```cmd
:: Create .env file
type nul > .env

:: Open in Notepad
notepad .env
```

**Option 2: Using File Explorer**
1. Navigate to `Desktop\ai-classroom-main\frontend`
2. Right-click → New → Text Document
3. Rename to `.env` (remove the .txt extension)
4. Open with Notepad

Add the following content:

```env
VITE_API_URL=http://localhost:8000/api
```

Save and close Notepad.

#### 3.4 Start Frontend Server

```cmd
:: Start Vite development server
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

**Keep this Command Prompt window open too!**

## 🎉 Access the Application

1. Open your web browser (Chrome, Edge, Firefox)
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

**Command Prompt 1 - Backend:**
```cmd
cd %USERPROFILE%\Desktop\Ai-Classroom\backend
venv\Scripts\activate
python manage.py runserver
```

**Command Prompt 2 - Frontend:**
```cmd
cd %USERPROFILE%\Desktop\Ai-Classroom\frontend
npm run dev
```

### Stopping the Application

Press `Ctrl + C` in each Command Prompt window to stop the servers.

## 🛠️ Troubleshooting

### Issue: "python is not recognized as an internal or external command"
**Solution:**
1. Reinstall Python from [python.org](https://www.python.org/downloads/)
2. ✅ **Check "Add Python to PATH"** during installation
3. Restart Command Prompt

### Issue: "npm is not recognized as an internal or external command"
**Solution:**
1. Reinstall Node.js from [nodejs.org](https://nodejs.org/)
2. Use default installation options
3. Restart Command Prompt

### Issue: Port 8000 already in use
**Solution:**
```cmd
:: Find the process using port 8000
netstat -ano | findstr :8000

:: Note the PID (last column number)
:: Kill the process (replace <PID> with the actual number)
taskkill /PID <PID> /F

:: Then restart the backend server
python manage.py runserver
```

### Issue: Port 5173 already in use
**Solution:**
```cmd
:: Find the process using port 5173
netstat -ano | findstr :5173

:: Note the PID (last column number)
:: Kill the process (replace <PID> with the actual number)
taskkill /PID <PID> /F

:: Then restart the frontend server
npm run dev
```

### Issue: "ModuleNotFoundError: No module named 'X'"
**Solution:**
```cmd
:: Make sure virtual environment is activated
venv\Scripts\activate

:: Reinstall dependencies
pip install -r requirements.txt
```

### Issue: Virtual environment activation fails
**Solution:**
```cmd
:: If you get execution policy error, run PowerShell as Administrator:
Set-ExecutionPolicy RemoteSigned

:: Then try activating again in Command Prompt:
venv\Scripts\activate
```

### Issue: Database errors
**Solution:**
```cmd
:: Navigate to backend directory
cd backend

:: Delete database file
del db.sqlite3

:: Recreate database
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

### Issue: Permission denied errors
**Solution:**
- Run Command Prompt as Administrator (Right-click → Run as administrator)
- Or check that you have write permissions in the project folder

## 📦 Updating the Application

```cmd
:: Navigate to project directory
cd %USERPROFILE%\Desktop\Ai-Classroom

:: Pull latest changes
git pull

:: Update backend dependencies
cd backend
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate

:: Update frontend dependencies
cd ..\frontend
npm install
```

## 🔧 Advanced Configuration

### Using PostgreSQL instead of SQLite

1. Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)

2. Create database using pgAdmin or command line:
```sql
CREATE DATABASE ai_classroom;
```

3. Update `.env`:
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/ai_classroom
```

4. Install psycopg2:
```cmd
pip install psycopg2-binary
```

### Running on Different Ports

**Backend:**
```cmd
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

## 💡 Tips for Windows Users

1. **Use Windows Terminal** (available in Microsoft Store) for a better command-line experience
2. **Pin Command Prompt** to taskbar for quick access
3. **Create Desktop Shortcuts** for starting servers:
   - Right-click Desktop → New → Shortcut
   - For backend: `cmd /k "cd %USERPROFILE%\Desktop\ai-classroom-main\backend && venv\Scripts\activate && python manage.py runserver"`
   - For frontend: `cmd /k "cd %USERPROFILE%\Desktop\ai-classroom-main\frontend && npm run dev"`

## 📚 Additional Resources

- [Python Documentation](https://docs.python.org/3/)
- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Windows Command Prompt Guide](https://docs.microsoft.com/en-us/windows-server/administration/windows-commands/windows-commands)

## 🆘 Getting Help

If you encounter issues not covered here:
1. Check the main README.md for general information
2. Search for similar issues in the repository
3. Create a new issue with:
   - Your Windows version
   - Python version (`python --version`)
   - Node version (`node --version`)
   - Error messages (copy from Command Prompt)
   - Steps to reproduce

---

**Happy coding! 🚀**
