# Git 安装与提交脚本
Write-Host "======================================"
Write-Host "  i妆小程序 - Git 安装与提交"
Write-Host "======================================"

# 检查 Git
$git = Get-Command git -ErrorAction SilentlyContinue

if ($null -eq $git) {
    Write-Host "[1/4] Git 未安装，正在下载..."
    $tmp = "$env:TEMP\git-setup.exe"
    Invoke-WebRequest -Uri "https://github.com/git-for-windows/git/releases/download/v2.47.1.windows.1/Git-2.47.1-64-bit.exe" -OutFile $tmp -UseBasicParsing
    Write-Host "[2/4] 运行安装程序，请点击 Next/Install/Finish 完成安装"
    Start-Process -FilePath $tmp -Wait
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine")+";"+[System.Environment]::GetEnvironmentVariable("Path","User")
}

Write-Host "[3/4] 配置 Git..."
git config --global user.name "Tugoukezhang"
git config --global user.email "1135638409@qq.com"

$proj = "c:\Users\1\WorkBuddy\20260407195418\beauty-app-main"
Set-Location $proj

if (-not (Test-Path ".git")) {
    git init
    git remote add origin https://github.com/Tugoukezhang/beauty-app.git
}

git add -A
$msg = "M1-M4 完成: 基础架构+用户系统+课程系统+内容社区 (2026-04-08)"
git commit -m $msg
git branch -M main
git push -u origin main --force

Write-Host ""
Write-Host "======================================"
Write-Host "  完成！"
Write-Host "======================================"
