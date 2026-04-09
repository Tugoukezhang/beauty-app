@echo off
echo ========================================
echo WorkBuddy Skills 每日自检任务
echo ========================================
echo.

REM 设置Python路径
set PYTHON_PATH=C:\Users\lintianhao\.workbuddy\binaries\python\versions\3.13.12\python.exe

REM 检查Python是否可用
if not exist "%PYTHON_PATH%" (
    echo ❌ Python未找到: %PYTHON_PATH%
    echo 请先运行 install_dependencies.bat
    pause
    exit /b 1
)

REM 切换到脚本目录
cd /d "%~dp0"

REM 1. 执行 Skills 自检
echo [1/4] 执行 Skills 自检...
call "%PYTHON_PATH%" skills_self_check.py auto
if %errorlevel% neq 0 (
    echo ⚠️  Skills自检完成但有警告
) else (
    echo ✅ Skills自检成功完成
)

echo.

REM 2. 创建 Skills 快照
echo [2/4] 创建 Skills 快照...
call "%PYTHON_PATH%" skills_manager.py snapshot
if %errorlevel% neq 0 (
    echo ⚠️  Skills快照创建完成但有警告
) else (
    echo ✅ Skills快照创建成功
)

echo.

REM 3. 检查跨设备一致性
echo [3/4] 检查跨设备一致性...
call "%PYTHON_PATH%" skills_manager.py consistency
if %errorlevel% neq 0 (
    echo ⚠️  一致性检查完成但有差异
) else (
    echo ✅ 一致性检查完成，所有设备一致
)

echo.

REM 4. 自动备份 Skills
echo [4/4] 自动备份 Skills...
call "%PYTHON_PATH%" sync_skills.py backup daily_auto_backup
if %errorlevel% neq 0 (
    echo ❌ Skills备份失败
) else (
    echo ✅ Skills备份成功
)

echo.
echo ========================================
echo 每日自检任务完成
echo 查看报告: C:\Users\lintianhao\.workbuddy\skills_reports\
echo 数据库: C:\Users\lintianhao\.workbuddy\skills_integrity.db
echo ========================================
echo.

REM 暂停以便查看结果
timeout /t 5 /nobreak > nul

exit /b 0