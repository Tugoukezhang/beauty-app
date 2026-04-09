@echo off
echo =======================================
echo WorkBuddy自动化系统 - GitHub上传助手
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

echo 检查当前目录...
cd /d "C:\Users\lintianhao\WorkBuddy\20260407093653"
if errorlevel 1 (
    echo [错误] 无法进入项目目录
    pause
    exit /b 1
)

echo 项目目录: %CD%
echo.

REM 检查是否已有Git仓库
if exist ".git" (
    echo [信息] 检测到已存在的Git仓库
    echo.
    echo 选项:
    echo 1. 重置并重新初始化 (清理现有Git信息)
    echo 2. 继续使用现有仓库
    echo 3. 退出
    echo.
    set /p choice="请选择 (1/2/3): "
    
    if "%choice%"=="1" (
        echo 清理现有Git仓库...
        rd /s /q .git
        echo 清理完成
    ) elseif "%choice%"=="2" (
        echo 使用现有Git仓库
        goto existing_repo
    ) else (
        echo 退出
        exit /b 0
    )
)

:initialize
echo.
echo 步骤1: 初始化Git仓库...
git init
if errorlevel 1 (
    echo [错误] Git初始化失败
    pause
    exit /b 1
)

echo 步骤2: 添加所有文件...
git add .
if errorlevel 1 (
    echo [错误] 添加文件失败
    pause
    exit /b 1
)

echo 步骤3: 提交更改...
git commit -m "Initial commit: WorkBuddy自动化系统 v3.0.0"
if errorlevel 1 (
    echo [错误] 提交失败
    pause
    exit /b 1
)

echo.
echo =======================================
echo Git仓库初始化完成！
echo =======================================
echo.

echo 下一步操作:
echo 1. 在浏览器中打开GitHub: https://github.com
echo 2. 登录你的账号
echo 3. 点击右上角"+" → "New repository"
echo 4. 填写仓库信息:
echo    - Repository name: workbuddy-automation
echo    - Description: WorkBuddy自动化系统
echo    - 选择Public (公开仓库)
echo    - 不要勾选"Initialize this repository with a README"
echo 5. 点击"Create repository"
echo.
echo 创建完成后，运行以下命令完成上传:
echo.
echo git remote add origin https://github.com/你的用户名/workbuddy-automation.git
echo git push -u origin main
echo.
pause
exit /b 0

:existing_repo
echo.
echo 检查现有仓库状态...
git status
echo.
echo 如果要推送到新仓库，建议:
echo 1. 备份现有.git目录
echo 2. 删除.git目录重新初始化
echo 3. 使用上面的步骤重新开始
echo.
pause
exit /b 0