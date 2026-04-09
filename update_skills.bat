@echo off
echo ========================================
echo 🚀 WorkBuddy Skills Update System
echo ========================================
echo.

echo 📊 Checking Python environment...
python --version
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8 or later.
    pause
    exit /b 1
)

echo.
echo 🔍 Searching for frontend and backend skills...
python skills_search_manager.py

echo.
echo 📋 Summary of installed skills:
python skills_search_manager.py summary

echo.
echo 📄 Report generated at: %USERPROFILE%\.workbuddy\skills_report.json
echo.

echo ✅ Skills update completed!
echo.
pause