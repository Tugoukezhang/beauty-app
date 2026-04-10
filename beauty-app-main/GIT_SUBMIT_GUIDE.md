# Git 安装与项目提交指南

## 第一步：安装 Git

### 方法1：下载安装包（推荐）
1. 访问 https://git-scm.com/download/win
2. 下载 Windows 版本（通常是 64-bit Git for Windows Setup）
3. 运行安装包，全部使用默认选项即可

### 方法2：使用 winget（如果可用）
在 PowerShell 中运行：
```
winget install Git.Git
```

### 方法3：使用 Chocolatey
```
choco install git
```

## 第二步：配置 Git

安装完成后，打开 PowerShell 或 Git Bash，运行：

```bash
git config --global user.name "Tugoukezhang"
git config --global user.email "1135638409@qq.com"
```

## 第三步：克隆并提交项目

### 如果是新仓库
```bash
# 进入项目目录
cd c:\Users\1\WorkBuddy\20260407195418\beauty-app-main

# 初始化仓库
git init

# 添加所有文件
git add -A

# 提交
git commit -m "M1-M4 开发完成：基础架构+用户系统+课程系统+内容社区"

# 添加远程仓库
git remote add origin https://github.com/Tugoukezhang/beauty-app.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

### 如果仓库已存在
```bash
cd c:\Users\1\WorkBuddy\20260407195418\beauty-app-main

# 拉取最新
git pull origin main --allow-unrelated-histories

# 添加所有文件
git add -A

# 提交
git commit -m "M1-M4 开发完成：基础架构+用户系统+课程系统+内容社区"

# 推送
git push origin main
```

## 验证提交成功

访问 https://github.com/Tugoukezhang/beauty-app 查看代码是否已上传。

## 常见问题

### Q: 推送时被拒绝？
可能需要先拉取远程仓库：
```bash
git pull origin main --rebase --allow-unrelated-histories
```

### Q: 提示需要认证？
可能需要设置 GitHub 访问令牌或 SSH 密钥。

---

## 📦 项目备份

如果无法立即安装 Git，项目代码已完整保存在：
`c:\Users\1\WorkBuddy\20260407195418\beauty-app-main\`
