@echo off
chcp 65001 >nul
title WorkBuddy自检程序 - 美妆项目扩展

echo ========================================
echo    WorkBuddy Skills自检程序
echo    美妆项目扩展版本
echo ========================================
echo.

echo [1/4] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装或未添加到环境变量
    echo 请安装Python 3.7或更高版本
    pause
    exit /b 1
)

echo [2/4] 检查必要库...
python -c "import pyautogui" >nul 2>&1
if errorlevel 1 (
    echo ⚠️ 缺少Python库，正在安装...
    pip install pyautogui pygetwindow pillow
)

echo [3/4] 运行Skills自检...
echo 正在检查Skills状态...
cd /d "%~dp0.."
python selfcheck\skills_self_check.py --check

echo [4/4] 生成报告...
echo 报告已生成在 reports\ 目录下
echo.

echo ========================================
echo    自检程序运行完成！
echo ========================================
echo.

echo 建议操作：
echo 1. 查看 reports\ 目录中的详细报告
echo 2. 如需修复问题，运行: run_selfcheck_fix.bat
echo 3. 运行自动签到: run_signin.bat
echo.

pause