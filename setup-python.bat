@echo off
echo Installing Python dependencies for Lexxi Medical...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Install required packages
echo Installing OpenAI Whisper...
pip install openai-whisper

echo Installing additional dependencies...
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

echo.
echo Python dependencies installed successfully!
echo.
echo Next steps:
echo 1. Add your OpenAI API key to .env.local
echo 2. Run 'npm run dev' to start the development server
echo.
pause
