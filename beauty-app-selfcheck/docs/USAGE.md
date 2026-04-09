# 自检程序使用指南

## 📋 简介

WorkBuddy自检程序是一个独立的扩展模块，为你的美妆项目提供自动化健康检查和维护功能。它不会影响现有项目的任何文件。

## 🚀 快速开始

### 安装步骤

1. **克隆仓库**（如果尚未克隆）
```bash
git clone https://github.com/Tugoukezhang/beauty-app.git
cd beauty-app
```

2. **运行安装脚本**
```bash
# 双击运行：install-skills.bat （已有）
# 然后添加自检程序
```

3. **使用自检程序**
```bash
cd beauty-app-selfcheck
```

### 一键运行

#### Windows用户
双击以下批处理文件：
- `scripts/run_selfcheck.bat` - 运行Skills自检
- `scripts/run_signin.bat` - 运行自动签到

#### 命令行用户
```bash
# 检查Skills状态
python selfcheck/skills_self_check.py --check

# 自动签到
python selfcheck/auto_signin.py

# 修复问题
python selfcheck/skills_self_check.py --fix
```

## ⚙️ 配置说明

### 配置文件位置
```
beauty-app-selfcheck/config/selfcheck.json
```

### 主要配置项

#### 1. WorkBuddy路径
```json
"workbuddy_path": "C:\\Program Files\\Tencent\\WorkBuddy\\WorkBuddy.exe"
```
- 修改为你的WorkBuddy安装路径

#### 2. 签到按钮坐标
```json
"signin_button_coords": {
  "x": 1800,
  "y": 100
}
```
- 根据你的屏幕分辨率调整

#### 3. Skills目录
```json
"skills_dirs": [
  "C:\\Users\\%USERNAME%\\.workbuddy\\skills"
]
```
- 默认使用用户目录下的Skills
- 可添加其他目录

#### 4. 定时任务
```json
"scheduling": {
  "auto_signin_enabled": true,
  "auto_selfcheck_enabled": true,
  "signin_cron": "0 9 * * *",
  "selfcheck_cron": "0 10 * * *"
}
```
- 自动签到：每天9:00
- 自检程序：每天10:00

## 📊 功能详解

### 1. Skills健康检查

#### 检查内容
- ✅ SKILL.md文件是否存在
- ✅ skill.toml文件是否存在
- ✅ settings.json中是否启用
- ✅ 文件权限和完整性

#### 运行方式
```bash
# 基本检查
python selfcheck/skills_self_check.py --check

# 详细报告
python selfcheck/skills_self_check.py --check --report

# 自动修复
python selfcheck/skills_self_check.py --fix
```

#### 输出报告
```
reports/
├── skills_check_report_20260408_103000.json
└── skills_check_report_20260408_103000.txt
```

### 2. 自动签到系统

#### 功能特点
- 🔄 自动启动WorkBuddy
- 🖱️ 模拟点击签到按钮
- 📸 截图保存证据
- 📄 生成签到报告

#### 运行方式
```bash
# 正常签到
python selfcheck/auto_signin.py

# 测试模式（不实际点击）
python selfcheck/auto_signin.py --test

# 调试模式
python selfcheck/auto_signin.py --debug
```

#### 输出文件
```
screenshots/     # 签到截图
reports/         # 签到报告
logs/            # 运行日志
```

### 3. 数据库存储

#### 存储内容
- Skills检查历史
- 签到记录
- 系统状态
- 错误日志

#### 数据库位置
```
skills_memory.db
```

#### 查询数据
```bash
# 使用SQLite查看
sqlite3 skills_memory.db

# 示例查询
SELECT * FROM skills_check_history;
SELECT * FROM skills_details;
```

## 🔧 故障排除

### 常见问题

#### Q1: 无法找到WorkBuddy
**解决方法**：
1. 检查配置文件中的路径
2. 确认WorkBuddy已安装
3. 手动指定路径：`--config config/custom.json`

#### Q2: 签到按钮坐标不对
**解决方法**：
1. 运行测试模式：`python auto_signin.py --test`
2. 获取屏幕坐标
3. 更新配置文件

#### Q3: Skills检查失败
**解决方法**：
1. 检查Skills目录权限
2. 确认settings.json文件存在
3. 运行修复模式：`--fix`

#### Q4: Python库缺失
**解决方法**：
```bash
# 安装依赖
pip install -r requirements.txt

# 或手动安装
pip install pyautogui pygetwindow Pillow
```

### 调试技巧

#### 日志级别
修改 `config/selfcheck.json`：
```json
"log_level": "DEBUG"
```

#### 测试模式
```bash
# Skills检查测试
python selfcheck/skills_self_check.py --check --debug

# 签到测试
python selfcheck/auto_signin.py --test --debug
```

#### 查看日志
```
logs/
├── skills_check_20260408_103000.log
└── signin_20260408_090000.log
```

## 🔄 更新维护

### 更新自检程序
```bash
cd beauty-app
git pull origin main
```

### 添加新功能
1. 修改代码
2. 测试功能
3. 提交更改
```bash
git add .
git commit -m "添加新功能"
git push origin main
```

### 备份数据
```bash
# 备份数据库
cp skills_memory.db skills_memory_backup.db

# 备份报告
zip -r reports_backup.zip reports/
```

## 📞 技术支持

### 文档参考
- [README.md](../README.md) - 项目概述
- [CONFIGURATION.md](CONFIGURATION.md) - 配置说明
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - 故障排除

### 问题反馈
1. 检查日志文件
2. 查看错误消息
3. 在GitHub仓库提交Issue

### 联系信息
- GitHub仓库：https://github.com/Tugoukezhang/beauty-app
- Issues页面：提交问题和建议

## 📝 注意事项

### 安全性
- 🔐 配置文件不包含敏感信息
- 🔐 使用环境变量保护路径
- 🔐 定期备份重要数据

### 兼容性
- ✅ Windows 10/11
- ✅ Python 3.7+
- ✅ WorkBuddy最新版本

### 性能
- ⚡ 检查速度：< 30秒
- ⚡ 内存占用：< 100MB
- ⚡ 存储空间：< 1GB（日志和报告）

---

**重要提示**：自检程序是美妆项目的独立扩展模块，不会修改或影响现有的 `install-skills.bat` 和其他核心文件。