# 自检程序上传指南

## 🎯 目标
将WorkBuddy自检程序作为扩展模块添加到现有 `beauty-app` 仓库。

## 📁 文件结构
上传的自检程序将位于仓库根目录的 `beauty-app-selfcheck` 文件夹中：

```
beauty-app/
├── .workbuddy/          # 现有目录（保持不变）
├── .gitignore           # 现有文件（保持不变）
├── MIGRATION.md         # 现有文件（保持不变）
├── install-skills.bat   # 现有文件（保持不变）
├── beauty-app-selfcheck/  # 📌 新增的自检程序文件夹
│   ├── README.md        # 项目概述
│   ├── requirements.txt # Python依赖
│   ├── UPLOAD_GUIDE.md  # 此文件
│   ├── upload_to_existing_repo.bat  # 上传脚本
│   ├── complete_push.bat           # 推送脚本
│   ├── selfcheck/       # 自检程序核心
│   │   ├── auto_signin.py        # 自动签到
│   │   └── skills_self_check.py  # Skills检查
│   ├── scripts/         # 批处理脚本
│   │   ├── run_selfcheck.bat     # 运行检查
│   │   ├── run_selfcheck_fix.bat # 修复问题
│   │   └── run_signin.bat        # 运行签到
│   ├── config/          # 配置文件
│   │   └── selfcheck.json        # 主配置
│   └── docs/            # 文档
│       └── USAGE.md     # 使用指南
```

## 🚀 上传步骤

### 第一步：准备工作
1. **确保Git已安装**
   ```bash
   git --version
   ```

2. **确保有GitHub账号**并登录
   - 仓库地址：https://github.com/Tugoukezhang/beauty-app
   - 确保有推送权限

### 第二步：上传自检程序
**方法一：使用批处理脚本（推荐）**
```
双击运行：upload_to_existing_repo.bat
```

**方法二：手动上传**
```bash
# 1. 克隆仓库（如果尚未克隆）
git clone https://github.com/Tugoukezhang/beauty-app.git
cd beauty-app

# 2. 复制自检程序文件夹
# （将 beauty-app-selfcheck 文件夹复制到仓库根目录）

# 3. 添加到Git
git add beauty-app-selfcheck/

# 4. 提交更改
git commit -m "添加WorkBuddy自检程序扩展"

# 5. 推送到GitHub
git push origin main
```

### 第三步：验证上传
1. **访问GitHub仓库**
   ```
   https://github.com/Tugoukezhang/beauty-app
   ```

2. **确认文件结构**
   - 确保 `beauty-app-selfcheck` 文件夹存在
   - 确认现有文件未受影响

## ⚠️ 重要注意事项

### 1. **不会影响的现有文件**
- ✅ `.gitignore` - Git忽略规则
- ✅ `MIGRATION.md` - 迁移指南  
- ✅ `install-skills.bat` - Skills安装脚本
- ✅ `.workbuddy/memory/` - 记忆文件目录

### 2. **独立模块设计**
自检程序是独立模块：
- **不依赖**现有文件
- **不影响**现有功能
- **可单独**运行和维护

### 3. **冲突处理**
如果遇到冲突：
```bash
# 拉取最新代码
git pull origin main

# 解决冲突
git mergetool

# 提交解决
git add .
git commit -m "解决冲突"
git push origin main
```

## 🔧 使用方法

### 基本使用
```bash
# 进入自检程序目录
cd beauty-app-selfcheck

# 运行Skills检查
scripts\run_selfcheck.bat

# 运行自动签到
scripts\run_signin.bat
```

### 配置修改
编辑 `config/selfcheck.json`：
- 修改WorkBuddy安装路径
- 调整签到按钮坐标
- 设置定时任务

## 📊 文件统计

### 新增文件
- **Python脚本**: 2个 (~400行代码)
- **批处理脚本**: 5个 (~200行代码)
- **配置文件**: 1个
- **文档文件**: 3个 (~1500字)
- **总计**: 11个文件

### 磁盘占用
- **代码文件**: ~50KB
- **文档**: ~15KB
- **总计**: ~65KB

## 🔄 后续更新

### 更新自检程序
```bash
# 拉取最新代码
git pull origin main

# 或手动更新文件后
git add .
git commit -m "更新自检程序"
git push origin main
```

### 删除自检程序
如果需要删除：
```bash
git rm -r beauty-app-selfcheck
git commit -m "删除自检程序"
git push origin main
```

## 📞 支持

### 问题反馈
1. **GitHub Issues**
   ```
   https://github.com/Tugoukezhang/beauty-app/issues
   ```

2. **检查日志**
   ```
   beauty-app-selfcheck/logs/
   ```

### 文档参考
- `README.md` - 项目概述
- `docs/USAGE.md` - 详细使用指南

## ✅ 完成检查清单

上传前请确认：
- [ ] 自检程序文件夹完整
- [ ] 现有文件未修改
- [ ] Git配置正确
- [ ] 有GitHub推送权限
- [ ] 网络连接正常

---

**完成上传后**，你可以在任何地方通过以下命令获取自检程序：
```bash
git clone https://github.com/Tugoukezhang/beauty-app.git
cd beauty-app/beauty-app-selfcheck
```

自检程序将作为美妆项目的有用扩展，帮助维护WorkBuddy系统的健康状态！