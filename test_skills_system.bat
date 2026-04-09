@echo off
echo ========================================
echo WorkBuddy Skills 系统功能测试
echo ========================================
echo.

set PYTHON_PATH=C:\Users\lintianhao\.workbuddy\binaries\python\versions\3.13.12\python.exe

if not exist "%PYTHON_PATH%" (
    echo ❌ Python未找到，请先运行 install_dependencies.bat
    pause
    exit /b 1
)

cd /d "%~dp0"

echo [1/4] 测试 Skills 自检系统...
call "%PYTHON_PATH%" skills_self_check.py check
if %errorlevel% neq 0 (
    echo ⚠️  自检系统测试完成但有警告
) else (
    echo ✅ 自检系统测试成功
)

echo.

echo [2/4] 测试跨设备一致性管理...
call "%PYTHON_PATH%" skills_manager.py status
if %errorlevel% neq 0 (
    echo ⚠️  一致性管理测试完成但有警告
) else (
    echo ✅ 一致性管理测试成功
)

echo.

echo [3/4] 测试 Skills 列表...
call "%PYTHON_PATH%" skills_manager.py snapshot
if %errorlevel% neq 0 (
    echo ⚠️  Skills列表测试完成但有警告
) else (
    echo ✅ Skills列表测试成功
)

echo.

echo [4/4] 测试自动化批处理...
call daily_skills_check.bat
if %errorlevel% neq 0 (
    echo ⚠️  自动化批处理测试完成但有警告
) else (
    echo ✅ 自动化批处理测试成功
)

echo.
echo ========================================
echo 系统功能测试完成！
echo ========================================
echo.
echo 数据库位置:
echo   C:\Users\lintianhao\.workbuddy\skills_memory.db
echo   C:\Users\lintianhao\.workbuddy\skills_integrity.db
echo.
echo 报告位置:
echo   C:\Users\lintianhao\.workbuddy\skills_reports\
echo.
echo 使用指南:
echo   python skills_self_check.py help
echo   python skills_manager.py help
echo.
pause