@echo off
chcp 65001 >nul
title 上传自检程序到beauty-app仓库

echo ========================================
echo    上传自检程序到现有GitHub仓库
echo    仓库: Tugoukezhang/beauty-app
echo ========================================
echo.

echo [1/5] 检查Git是否安装...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git未安装
    echo 请从 https://git-scm.com/ 下载并安装Git
    pause
    exit /b 1
)

echo [2/5] 克隆现有仓库...
if exist "beauty-app" (
    echo ⚠️ beauty-app文件夹已存在，使用现有副本
    cd beauty-app
    git pull origin main
) else (
    echo 正在克隆 beauty-app 仓库...
    git clone https://github.com/Tugoukezhang/beauty-app.git
    cd beauty-app
)

echo [3/5] 准备自检程序文件...
echo 正在复制自检程序文件...
xcopy /E /I /Y "..\beauty-app-selfcheck" "beauty-app-selfcheck\"

echo [4/5] 检查是否需要添加文件...
git status

echo [5/5] 添加并提交文件...
git add beauty-app-selfcheck/
if errorlevel 1 (
    echo ⚠️ 没有新文件需要添加
) else (
    git commit -m "添加WorkBuddy自检程序扩展"
    echo ✅ 提交完成！
)

echo.
echo ========================================
echo    准备推送文件到GitHub
echo ========================================
echo.
echo 请确认以下信息：
echo 1. 已将自检程序文件添加到 beauty-app-selfcheck 文件夹
echo 2. 文件已提交到本地Git仓库
echo.
echo 接下来步骤：
echo 1. 推送代码到GitHub: git push origin main
echo 2. 或者运行 complete_push.bat 自动推送
echo.
echo 重要提示：这不会影响现有的 install-skills.bat 等文件
echo 自检程序是一个独立的扩展模块
echo.

pause