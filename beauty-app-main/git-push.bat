@echo off
chcp 65001 >nul
cd /d "c:\Users\1\WorkBuddy\20260407195418\beauty-app-main"

git config --global user.name "Tugoukezhang"
git config --global user.email "1135638409@qq.com"

if not exist ".git" (
    git init
    git remote add origin https://github.com/Tugoukezhang/beauty-app.git
)

git add -A
git commit -m "M1-M4 完成: 基础架构+用户系统+课程系统+内容社区 (2026-04-08)"
git branch -M main
git push -u origin main --force

echo.
echo 按任意键退出...
pause >nul
