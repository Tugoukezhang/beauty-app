# Git 安装与项目提交脚本
# 运行前请以管理员身份运行 PowerShell

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  i妆小程序 - Git 安装与提交脚本" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 检查 Git 是否已安装
$gitPath = Get-Command git -ErrorAction SilentlyContinue

if ($null -eq $gitPath) {
    Write-Host "[1/4] Git 未安装，正在下载安装..." -ForegroundColor Yellow
    
    # 下载 Git 安装包
    $installerPath = "$env:TEMP\git-installer.exe"
    Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe" -OutFile $installerPath -UseBasicParsing
    
    Write-Host "[2/4] 安装 Git（请在弹出的窗口中点击 Next 完成安装）..." -ForegroundColor Yellow
    Start-Process -FilePath $installerPath -Wait
    
    # 刷新环境变量
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
} else {
    Write-Host "[1/4] Git 已安装: $($gitPath.Source)" -ForegroundColor Green
}

Write-Host "[2/4] 配置 Git 用户信息..." -ForegroundColor Yellow
git config --global user.name "Tugoukezhang"
git config --global user.email "1135638409@qq.com"

# 进入项目目录
$projectPath = "c:\Users\1\WorkBuddy\20260407195418\beauty-app-main"
Set-Location $projectPath

Write-Host "[3/4] 初始化仓库并添加文件..." -ForegroundColor Yellow

# 检查是否已有 .git 目录
if (-not (Test-Path ".git")) {
    git init
    git remote add origin https://github.com/Tugoukezhang/beauty-app.git
    Write-Host "  仓库初始化完成" -ForegroundColor Green
} else {
    Write-Host "  仓库已存在，拉取远程..." -ForegroundColor Green
    git pull origin main --allow-unrelated-histories 2>$null
}

# 添加所有文件
git add -A

# 检查是否有更改
$status = git status --porcelain
if ($status.Count -eq 0) {
    Write-Host "  没有新文件需要提交" -ForegroundColor Yellow
} else {
    # 提交
    $commitMsg = "M1-M4 完成: 基础架构+用户系统+课程系统+内容社区 (2026-04-08)"
    git commit -m $commitMsg
    Write-Host "  提交完成: $commitMsg" -ForegroundColor Green
}

Write-Host "[4/4] 推送到 GitHub..." -ForegroundColor Yellow
git branch -M main
git push -u origin main

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  完成！请访问 https://github.com/Tugoukezhang/beauty-app" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键退出..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
