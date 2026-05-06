@echo off
REM Development setup script for Windows

echo 🚀 Setting up Cripto ^& Stock API Project...

REM Check Python version
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✓ Python version: %PYTHON_VERSION%

REM Create virtual environment
echo 📦 Creating virtual environment...
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install requirements
echo 📥 Installing dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    copy .env.example .env
    echo ⚠️  Please edit .env and add your ALPHA_VANTAGE_API_KEY
)

REM Create instance directory
if not exist instance mkdir instance

REM Initialize database
echo 🗄️  Initializing database...
python -c "from BitcoinApiProject import app, db, init_db; init_db(app); print('✓ Database initialized')"

echo.
echo ✅ Setup complete!
echo.
echo Next steps:
echo 1. Edit .env and add your ALPHA_VANTAGE_API_KEY
echo 2. Run: venv\Scripts\activate.bat
echo 3. Run: python BitcoinApiProject.py
echo 4. Open: http://localhost:5000
echo.
