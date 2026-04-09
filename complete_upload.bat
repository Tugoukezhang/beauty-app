@echo off
echo =======================================
echo WorkBuddy自动化系统 - 完成GitHub上传
echo =======================================
echo.

REM 检查Git是否安装
where git >nul 2>nul
if errorlevel 1 (
    echo [错误] Git未安装
    echo 请先安装Git: https://git-scm.com/download/win
    pause
    exit /b 1
)

REM 检查是否已初始化Git仓库
if not exist ".git" (
    echo [错误] Git仓库未初始化
    echo 请先运行 upload_to_github.bat
    pause
    exit /b 1
)

cd /d "C:\Users\lintianhao\WorkBuddy\20260407093653"
if errorlevel 1 (
    echo [错误] 无法进入项目目录
    pause
    exit /b 1
)

echo 当前目录: %CD%
echo.

REM 获取GitHub用户名
echo 请输入你的GitHub用户名
echo (例如: lintianhao)
set /p github_user="GitHub用户名: "

if "%github_user%"=="" (
    echo [错误] 用户名不能为空
    pause
    exit /b 1
)

echo.
echo 仓库URL: https://github.com/%github_user%/workbuddy-automation.git
echo.

REM 检查是否已设置远程仓库
git remote -v >nul 2>nul
if errorlevel 1 (
    echo [信息] 添加远程仓库...
    git remote add origin https://github.com/%github_user%/workbuddy-automation.git
    if errorlevel 1 (
        echo [错误] 添加远程仓库失败
        pause
        exit /b 1
    )
    echo 远程仓库添加成功
) else (
    echo [信息] 检测到已存在的远程仓库
    set /p choice="是否更新远程仓库URL? (y/N): "
    if /i "%choice%"=="y" (
        git remote remove origin
        git remote add origin https://github.com/%github_user%/workbuddy-automation.git
        echo 远程仓库已更新
    )
)

echo.
echo 步骤1: 检查本地更改...
git status
echo.

set /p proceed="是否继续推送? (Y/n): "
if /i not "%proceed%"=="n" (
    echo.
    echo 步骤2: 推送到GitHub...
    git push -u origin main
    
    if errorlevel 1 (
        echo [错误] 推送失败
        echo.
        echo 可能的原因:
        echo 1. GitHub仓库不存在
        echo 2. 网络连接问题
        echo 3. 认证问题
        echo.
        echo 解决方案:
        echo 1. 确认仓库已创建: https://github.com/%github_user%/workbuddy-automation
        echo 2. 如果仓库有README文件，可能需要先拉取:
        echo    git pull origin main --allow-unrelated-histories
        echo 3. 检查网络连接
        pause
        exit /b 1
    )
    
    echo.
    echo =======================================
    echo 上传成功！
    echo =======================================
    echo.
    echo GitHub仓库地址: https://github.com/%github_user%/workbuddy-automation
    echo.
    echo 你可以:
    echo 1. 访问上面的链接查看仓库
    echo 2. 分享给其他人使用
    echo 3. 在Issues中报告问题或提出建议
    echo.
) else (
    echo 取消推送
)

echo.
echo 后续更新命令:
echo 1. git add .
echo 2. git commit -m "更新描述"
echo 3. git push origin main
echo.
pause