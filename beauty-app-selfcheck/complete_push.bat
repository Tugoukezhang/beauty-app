@echo off
chcp 65001 >nul
title 推送自检程序到GitHub

echo ========================================
echo    推送自检程序到GitHub
echo ========================================
echo.

echo [1/3] 检查当前目录...
cd /d "%~dp0"
if not exist ".git" (
    echo ❌ 当前目录不是Git仓库
    echo 请先运行 upload_to_existing_repo.bat
    pause
    exit /b 1
)

echo [2/3] 推送代码...
echo 正在推送到GitHub...
git push origin main

if errorlevel 1 (
    echo ⚠️ 推送失败，可能原因：
    echo 1. 未设置远程仓库
    echo 2. 网络连接问题
    echo 3. 权限不足
    echo.
    echo 手动设置远程仓库：
    echo   git remote add origin https://github.com/Tugoukezhang/beauty-app.git
    echo   git branch -M main
    echo   git push -u origin main
) else (
    echo ✅ 推送成功！
)

echo [3/3] 验证推送...
git log --oneline -5

echo.
echo ========================================
echo    推送完成！
echo ========================================
echo.
echo 🌐 仓库地址：
echo   https://github.com/Tugoukezhang/beauty-app
echo.
echo 📁 自检程序位置：
echo   https://github.com/Tugoukezhang/beauty-app/tree/main/beauty-app-selfcheck
echo.
echo 🔧 现有文件不受影响：
echo   - install-skills.bat ✅
echo   - MIGRATION.md ✅
echo   - .gitignore ✅
echo.
echo 下次更新自检程序：
echo   1. 修改文件
echo   2. git add .
echo   3. git commit -m "更新描述"
echo   4. git push origin main
echo.

pause