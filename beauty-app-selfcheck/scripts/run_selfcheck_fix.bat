@echo off
chcp 65001 >nul
title 修复Skills问题 - 美妆项目扩展

echo ========================================
echo    WorkBuddy Skills修复程序
echo ========================================
echo.

echo ⚠️ 警告：此操作将自动修复Skills问题
echo.
echo 将执行以下操作：
echo 1. 检查所有Skills的完整性
echo 2. 自动创建缺失的SKILL.md文件
echo 3. 自动创建缺失的skill.toml文件
echo 4. 备份原始文件（如果需要）
echo.
set /p confirm="确认继续？(Y/N): "
if /i not "%confirm%"=="Y" (
    echo 操作已取消
    pause
    exit /b 0
)

echo [1/3] 运行检查...
cd /d "%~dp0.."
python selfcheck\skills_self_check.py --check

echo [2/3] 运行修复...
python selfcheck\skills_self_check.py --fix

echo [3/3] 验证修复...
python selfcheck\skills_self_check.py --check

echo.
echo ========================================
echo    修复完成！
echo ========================================
echo.
echo 修复结果：
echo 1. 查看 reports\ 目录中的报告
echo 2. 备份文件保存在 backups\ 目录
echo 3. 数据库记录已更新
echo.
echo 注意事项：
echo - 修复操作不可逆
echo - 建议先运行 run_selfcheck.bat 检查
echo - 如有疑问，请查看日志文件
echo.

pause