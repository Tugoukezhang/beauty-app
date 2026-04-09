@echo off
chcp 65001 >nul
echo ========================================
echo WorkBuddy Skills 重新加载工具
echo ========================================
echo.

REM 检查WorkBuddy是否在运行
tasklist /FI "IMAGENAME eq WorkBuddy.exe" 2>nul | find /I "WorkBuddy.exe" >nul
if %ERRORLEVEL% equ 0 (
    echo [INFO] WorkBuddy 正在运行，正在关闭...
    taskkill /F /IM "WorkBuddy.exe" >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo [OK] WorkBuddy 已关闭
    ) else (
        echo [WARNING] 无法关闭 WorkBuddy，请手动关闭
    )
    timeout /t 3 /nobreak >nul
) else (
    echo [INFO] WorkBuddy 未运行
)

echo.
echo [INFO] 清除 WorkBuddy 缓存...
if exist "%APPDATA%\Tencent\WorkBuddy\Cache" (
    rmdir /S /Q "%APPDATA%\Tencent\WorkBuddy\Cache" 2>nul
    echo [OK] 已清除 AppData 缓存
)

if exist "%LOCALAPPDATA%\Tencent\WorkBuddy\Cache" (
    rmdir /S /Q "%LOCALAPPDATA%\Tencent\WorkBuddy\Cache" 2>nul
    echo [OK] 已清除 LocalAppData 缓存
)

echo.
echo [INFO] 验证修复后的 Skills 文件...
cd /d "%~dp0"
python fix_skill_files.py

echo.
echo [INFO] 启动 WorkBuddy...
start "" "C:\Program Files\Tencent\WorkBuddy\WorkBuddy.exe"

echo.
echo [INFO] 等待 WorkBuddy 启动...
timeout /t 10 /nobreak >nul

echo.
echo [INFO] 检查 Skills 加载状态...
python check_skills_enabled.py

echo.
echo ========================================
echo 操作完成！
echo ========================================
echo.
echo 建议：
echo 1. 打开 WorkBuddy 技能面板查看 Skills
echo 2. 如果仍然看不到，请等待几分钟后重试
echo 3. 检查 WorkBuddy 设置中的技能管理
echo.
echo 按任意键退出...
pause >nul