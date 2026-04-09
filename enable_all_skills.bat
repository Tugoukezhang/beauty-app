@echo off
chcp 65001 >nul
echo ===================================================
echo 强制启用所有WorkBuddy Skills
echo ===================================================
echo.

REM 切换到脚本目录
cd /d "%~dp0"

REM 运行Python脚本启用所有skills
echo 正在启用所有WorkBuddy Skills...
python enable_all_skills.py

if %errorlevel% neq 0 (
    echo.
    echo [错误] Python脚本运行失败！
    echo 请确保已安装Python 3.7或更高版本
    pause
    exit /b 1
)

echo.
echo ===================================================
echo 启用完成！
echo ===================================================
echo.
echo 建议操作：
echo 1. 重启WorkBuddy以加载所有skills
echo 2. 运行reload_workbuddy_skills.bat自动重启
echo 3. 检查技能面板是否显示所有skills
echo.
echo 按任意键退出...
pause >nul
