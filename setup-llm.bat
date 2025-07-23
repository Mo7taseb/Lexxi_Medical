@echo off
echo 🚀 Setting up Free LLM Integration for Lexxi Medical

echo.
echo ==========================================
echo Step 1: Checking Ollama Installation
echo ==========================================
echo.

echo Checking if Ollama is installed...
ollama --version 2>nul
if %errorlevel% == 0 (
    echo ✅ Ollama is installed!
    goto :InstallModel
)

echo ❌ Ollama not found. Please install manually:
echo.
echo 1. Visit: https://ollama.ai/download
echo 2. Download Ollama for Windows
echo 3. Run the installer
echo 4. Restart this script
echo.
pause
exit /b 1

:InstallModel
echo.
echo ==========================================
echo Step 2: Installing Essential Model (8GB RAM)
echo ==========================================
echo.

echo Starting Ollama service...
start "Ollama Server" cmd /k "ollama serve"
timeout /t 3 >nul

echo Installing phi3:mini (2.3GB) - Perfect for your hardware...
ollama pull phi3:mini

echo.
echo ==========================================
echo Step 3: Testing Model
echo ==========================================
echo.

echo Testing phi3:mini...
echo "Improve medical text: المريض عنده الم في الرأس" | ollama run phi3:mini --verbose=false

echo.
echo ==========================================
echo Step 4: Setting up Environment
echo ==========================================
echo.

if not exist .env.local (
    echo Creating .env.local file...
    (
        echo # Free LLM API Keys - Get your free keys below:
        echo GROQ_API_KEY=your_groq_api_key_here
        echo HUGGINGFACE_API_KEY=your_hf_api_key_here
        echo.
        echo # Existing OpenAI key ^(optional^)
        echo OPENAI_API_KEY=your_openai_api_key_here
    ) > .env.local
    echo ✅ Created .env.local - add your API keys there
) else (
    echo ✅ .env.local already exists
)

echo.
echo ==========================================
echo Step 5: Installing Dependencies
echo ==========================================
echo.

echo Installing Node.js packages...
npm install

echo.
echo ==========================================
echo ✅ Setup Complete!
echo ==========================================
echo.
echo Your LLM integration is ready with:
echo • ✅ phi3:mini local model (2.3GB)
echo • ✅ Smart LLM routing system
echo • ✅ Enhanced transcription pipeline
echo • ✅ Professional note generation
echo.
echo Next steps:
echo 1. Get FREE API keys (optional but recommended):
echo    - Groq: https://console.groq.com/keys (6K tokens/minute)
echo    - HuggingFace: https://huggingface.co/settings/tokens
echo.
echo 2. Add keys to .env.local for cloud acceleration
echo.
echo 3. Start your app:
echo    npm run dev
echo.
echo 4. Test everything:
echo    http://localhost:3000/test-llm
echo.
echo Your medical transcription now has:
echo 🤖 AI error correction
echo 📝 Medical terminology enhancement  
echo 🏥 Professional note formatting
echo 💰 100%% free operation
echo.
pause
