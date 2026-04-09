@echo off
echo ===========================================
echo WorkBuddy Skills 同步工具简单示例
echo ===========================================
echo.

echo 1. 列出当前已安装的 Skills:
python sync_skills.py list
echo.

echo 2. 创建 Skills 备份:
python sync_skills.py backup
echo.

echo 3. 导出 Skills 包（用于其他电脑）:
python sync_skills.py export
echo.

echo 4. 查看帮助信息:
python sync_skills.py help
echo.

echo ===========================================
echo 使用说明：
echo.
echo 将 Skills 同步到其他电脑的步骤：
echo   1. 在本电脑运行: python sync_skills.py export
echo   2. 将生成的 ZIP 文件复制到其他电脑
echo   3. 在其他电脑运行: python sync_skills.py restore [ZIP文件名]
echo   4. 重启 WorkBuddy
echo.
echo ===========================================
pause