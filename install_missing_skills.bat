@echo off
chcp 65001 >nul
echo ===================================================
echo 安装缺失的WorkBuddy Skills
echo ===================================================
echo.

REM 切换到脚本目录
cd /d "%~dp0"

echo [状态] 当前情况：
echo   技能页面显示: 67 个Skills
echo   实际检测到: 60 个Skills
echo   缺失: 7 个Skills
echo.

echo [建议] 建议安装以下重要的Skills：
echo   1. html-css-js  - HTML/CSS/JavaScript基础
echo   2. typescript   - TypeScript类型安全
echo   3. nodejs       - Node.js运行时
echo   4. python       - Python编程语言
echo   5. vue          - Vue.js前端框架
echo.

echo [操作] 请按以下步骤操作：
echo   1. 打开命令提示符或PowerShell
echo   2. 切换到当前目录：cd "%~dp0"
echo   3. 运行以下命令安装Skills：
echo.
echo   安装命令示例：
echo      python skills_search_manager.py install html-css-js
echo      python skills_search_manager.py install typescript
echo      python skills_search_manager.py install nodejs
echo      python skills_search_manager.py install python
echo      python skills_search_manager.py install vue
echo.

echo [提示] 或运行Skills搜索查看所有可用的Skills：
echo      python skills_search_manager.py search --category=all
echo.

echo ===================================================
echo 重要提醒：
echo ===================================================
echo 1. 建议先运行重启脚本确保现有Skills正常：
echo    双击运行: reload_workbuddy_skills.bat
echo.
echo 2. 缺失Skills不影响现有功能使用
echo.
echo 3. 可根据实际需要选择性安装
echo.
echo 4. 安装完成后运行验证：
echo    python exact_skills_count.py
echo    python check_skills_enabled.py
echo ===================================================
echo.
echo 按任意键退出...
pause >nul