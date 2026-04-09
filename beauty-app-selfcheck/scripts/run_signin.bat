@echo off
chcp 65001 >nul
title WorkBuddy自动签到 - 美妆项目扩展

echo ========================================
echo    WorkBuddy自动签到程序
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

echo [3/4] 启动WorkBuddy...
echo 正在启动WorkBuddy并进行签到...
cd /d "%~dp0.."
python selfcheck\auto_signin.py

echo [4/4] 完成签到...
echo 签到报告已生成在 reports\ 目录下
echo 截图已保存到 screenshots\ 目录下
echo.

echo ========================================
echo    自动签到完成！
echo ========================================
echo.

echo 注意事项：
echo 1. 确保WorkBuddy已退出，否则可能无法正常启动
echo 2. 签到按钮坐标可能需要根据屏幕分辨率调整
echo 3. 可在 config\selfcheck.json 中修改配置
echo.

echo 运行测试模式: run_signin_test.bat
echo.

pause