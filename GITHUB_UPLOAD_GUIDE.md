# GitHub上传指南

## 📋 准备工作

### 1. 安装Git
如果没有安装Git，请先下载安装：
- 下载地址: https://git-scm.com/download/win
- 选择默认选项安装

### 2. 配置Git
```bash
# 配置用户名（使用你的GitHub用户名）
git config --global user.name "你的用户名"

# 配置邮箱（使用你的GitHub邮箱）
git config --global user.email "你的邮箱@example.com"
```

## 🚀 上传到GitHub

### 步骤1: 初始化Git仓库
```bash
# 进入项目目录
cd "C:\Users\lintianhao\WorkBuddy\20260407093653"

# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交初始版本
git commit -m "Initial commit: WorkBuddy自动化系统 v3.0.0"
```

### 步骤2: 在GitHub创建仓库
1. 登录GitHub (https://github.com)
2. 点击右上角 "+" → "New repository"
3. 填写仓库信息:
   - **Repository name**: workbuddy-automation
   - **Description**: WorkBuddy自动化系统 - 包含签到、Skills管理、自检功能
   - **Public** (选择公开仓库)
   - 不要勾选 "Initialize this repository with a README"
4. 点击 "Create repository"

### 步骤3: 连接本地仓库和GitHub
```bash
# 复制GitHub仓库的URL（在创建后的页面中）
git remote add origin https://github.com/你的用户名/workbuddy-automation.git

# 推送到GitHub
git push -u origin main
```

### 步骤4: 如果遇到问题（仓库已初始化）
如果GitHub仓库已经初始化了README，需要先拉取：
```bash
# 拉取远程仓库
git pull origin main --allow-unrelated-histories

# 解决可能的冲突
# 然后推送
git push origin main
```

## 📁 项目文件说明

### 核心文件
- `auto_signin.py` - 主签到脚本（含自检功能）
- `skills_manager.py` - Skills管理器
- `skills_self_check.py` - Skills自检系统
- `skills_search_manager.py` - Skills搜索管理器

### 批处理文件（用户友好）
- `install_dependencies.bat` - 安装依赖
- `daily_skills_check.bat` - 每日检查
- `enable_all_skills.bat` - 启用所有Skills
- `reload_workbuddy_skills.bat` - 重启修复

### 配置文件
- `config.json` - 主配置文件
- `.gitignore` - Git忽略文件配置
- `LICENSE` - MIT许可证

### 文档文件
- `README.md` - 主说明文档
- `QUICK_START.md` - 快速开始指南
- `SKILLS_SYNC_GUIDE.md` - Skills同步指南
- `SKILLS_SELF_CHECK_GUIDE.md` - Skills自检指南

## 🛠️ 批量操作脚本

为了方便上传，我创建了一个批处理脚本：

### `upload_to_github.bat`
```batch
@echo off
echo =======================================
echo WorkBuddy自动化系统 - GitHub上传助手
echo =======================================
echo.

REM 初始化Git仓库
echo 步骤1: 初始化Git仓库...
git init
if errorlevel 1 (
    echo [错误] Git初始化失败
    pause
    exit /b 1
)

REM 添加所有文件
echo 步骤2: 添加所有文件...
git add .
if errorlevel 1 (
    echo [错误] 添加文件失败
    pause
    exit /b 1
)

REM 提交更改
echo 步骤3: 提交更改...
git commit -m "Initial commit: WorkBuddy自动化系统 v3.0.0"
if errorlevel 1 (
    echo [错误] 提交失败
    pause
    exit /b 1
)

echo.
echo =======================================
echo 初始化完成！
echo =======================================
echo.
echo 下一步:
echo 1. 在GitHub创建仓库: https://github.com/new
echo 2. 仓库名: workbuddy-automation
echo 3. 不要勾选"Initialize with README"
echo 4. 创建完成后运行以下命令:
echo.
echo git remote add origin https://github.com/你的用户名/workbuddy-automation.git
echo git push -u origin main
echo.
pause
```

### `complete_upload.bat`（在创建GitHub仓库后运行）
```batch
@echo off
echo =======================================
echo 完成GitHub上传
echo =======================================
echo.

REM 添加远程仓库（需要替换为你的GitHub用户名）
set /p github_user="请输入你的GitHub用户名: "
echo 添加远程仓库...
git remote add origin https://github.com/%github_user%/workbuddy-automation.git

REM 推送代码
echo 推送到GitHub...
git push -u origin main

echo.
echo =======================================
echo 上传完成！
echo =======================================
echo GitHub仓库地址: https://github.com/%github_user%/workbuddy-automation
pause
```

## 🔄 后续更新

### 日常更新流程
```bash
# 1. 添加修改的文件
git add .

# 2. 提交更改
git commit -m "更新描述"

# 3. 推送到GitHub
git push origin main
```

### 添加新文件
```bash
# 添加单个文件
git add 新文件.py

# 添加多个文件
git add 文件1.py 文件2.py

# 提交并推送
git commit -m "添加新功能"
git push origin main
```

## 📊 GitHub页面功能

### 1. Issues（问题跟踪）
- 用于报告Bug
- 功能建议
- 问题讨论

### 2. Projects（项目管理）
- 管理开发任务
- 跟踪进度
- 里程碑规划

### 3. Wiki（文档）
- 详细使用指南
- API文档
- 开发文档

### 4. Releases（版本发布）
- 版本管理
- 发布说明
- 下载链接

## 🛡️ 安全注意事项

### 需要保护的信息
以下信息不应上传到GitHub：
1. **个人认证信息**
   - 不要上传包含密码、API密钥的配置文件
   - 使用环境变量或配置文件模板

2. **个人信息**
   - 不要包含个人用户名、邮箱等信息
   - 修改代码中的硬编码路径

3. **私有配置**
   - 创建 `config.example.json` 作为模板
   - 实际的 `config.json` 应在 `.gitignore` 中

### 推荐的.gitignore配置
```
# 用户特定的配置文件
config.json
private_settings.json

# 日志和报告
logs/
reports/
screenshots/

# 数据库文件
*.db
*.sqlite

# 临时文件
tmp/
temp/
*.tmp
```

## 🌟 推广你的项目

### 1. 添加徽章
在README.md中添加：
```markdown
[![GitHub stars](https://img.shields.io/github/stars/你的用户名/workbuddy-automation)](https://github.com/你的用户名/workbuddy-automation/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/你的用户名/workbuddy-automation)](https://github.com/你的用户名/workbuddy-automation/network)
[![GitHub issues](https://img.shields.io/github/issues/你的用户名/workbuddy-automation)](https://github.com/你的用户名/workbuddy-automation/issues)
```

### 2. 添加演示视频或截图
在README中添加：
- 系统截图
- 功能演示视频链接
- 使用效果图

### 3. 添加贡献指南
创建 `CONTRIBUTING.md` 文件，说明：
- 如何贡献代码
- 代码规范
- 提交要求

## 🆘 常见问题

### Q1: push时提示需要认证
```bash
# 使用HTTPS方式（需要输入用户名密码）
git push origin main

# 或者使用SSH方式
git remote set-url origin git@github.com:你的用户名/workbuddy-automation.git
git push origin main
```

### Q2: 文件太大上传失败
```bash
# 检查大文件
git count-objects -vH

# 如果需要清理历史大文件
git filter-branch --tree-filter 'rm -f 大文件路径' HEAD
```

### Q3: 想删除已上传的敏感信息
```bash
# 从Git历史中移除敏感文件
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch 敏感文件路径' \
  --prune-empty --tag-name-filter cat -- --all
```

## 📞 技术支持

如果在GitHub上传过程中遇到问题：
1. 查看Git官方文档: https://git-scm.com/doc
2. GitHub帮助: https://docs.github.com
3. 在项目Issues中提出问题

---

**最后更新**: 2026-04-08  
**指南版本**: 1.0.0