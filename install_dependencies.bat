@echo off
echo ===========================================
echo WorkBuddy 自动签到依赖安装脚本
echo ===========================================
echo.

echo 1. 检查Python是否安装...
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: Python未安装或未添加到系统路径
    echo 请从 https://www.python.org/downloads/ 下载并安装Python
    pause
    exit /b 1
)

echo 2. 安装pyautogui库...
pip install pyautogui

echo.
echo 3. 安装Pillow库（图像处理）...
pip install Pillow

echo.
echo 4. 验证安装...
python -c "import pyautogui; import PIL; print('依赖安装成功！')"

echo.
echo ===========================================
echo 安装完成！
echo ===========================================
echo.
echo 使用方法:
echo 1. 确保WorkBuddy客户端已安装并登录
echo 2. 手动执行签到: python auto_signin.py
echo 3. 自动签到任务将在每天9:00自动运行
echo.
pause