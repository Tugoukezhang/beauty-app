# WorkBuddy 自动化系统

一个完整的WorkBuddy自动化系统，包含每日签到、Skills管理、自检系统等功能。

[![GitHub](https://img.shields.io/badge/GitHub-workbuddy--automation-blue)](https://github.com/your-username/workbuddy-automation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)

## 🌟 功能特点

### 🎯 自动签到系统
- ✅ 自动检查WorkBuddy客户端运行状态
- ✅ 自动启动WorkBuddy（如未运行）
- ✅ 模拟鼠标点击签到按钮
- ✅ 每日自动执行（早上9:00）
- ✅ 详细的日志记录和历史保存
- ✅ **新增：每日签到后自检功能**
- ✅ **新增：自检报告生成和查看**

### 🔧 Skills管理系统
- ✅ Skills列表查看和统计
- ✅ Skills备份和恢复功能
- ✅ Skills包导出和导入
- ✅ 云存储同步配置
- ✅ 跨设备同步指南
- ✅ 自动化同步脚本

### 🧪 Skills自检和记忆系统
- ✅ Skills完整性自检
- ✅ Skills版本跟踪
- ✅ 依赖关系检查
- ✅ 跨设备一致性检查
- ✅ Skills记忆存储（SQLite数据库）
- ✅ 设备注册和快照
- ✅ 自动每日检查任务
- ✅ 完整报告生成

### 🔍 Skills搜索和更新系统
- ✅ GitHub Skills仓库搜索
- ✅ WorkBuddy Skillshub搜索
- ✅ 自动分类和安装
- ✅ 前端/后端技能智能识别
- ✅ 技能分类数据库
- ✅ 自动更新机制
- ✅ 详细技能报告生成

## 📁 项目结构

```
.
├── auto_signin.py              # 主签到脚本（含自检功能）
├── check_reports.py            # 自检报告查看工具
├── skills_manager.py           # Skills管理器
├── sync_skills.py              # Skills同步工具
├── skills_search_manager.py    # Skills搜索管理器
├── skills_self_check.py        # Skills自检系统
├── check_skills_enabled.py     # Skills启用状态检查
├── verify_skill_files.py       # Skills文件验证
├── fix_skill_files.py          # Skills文件修复
├── exact_skills_count.py       # 精确Skills统计
├── find_all_skills_simple.py   # 全面Skills查找
├── enable_all_skills.py        # 启用所有Skills
├── final_skills_verification.py # 最终验证工具
├── config.json                 # 配置文件
├── install_dependencies.bat    # 依赖安装脚本
├── daily_skills_check.bat      # 每日Skills检查
├── enable_all_skills.bat       # 启用所有Skills（批处理）
├── reload_workbuddy_skills.bat # 重启WorkBuddy修复
├── update_skills.bat           # Skills更新脚本
├── README.md                   # 使用说明
├── QUICK_START.md              # 快速开始指南
├── SKILLS_SYNC_GUIDE.md        # Skills同步指南
├── SKILLS_SELF_CHECK_GUIDE.md  # Skills自检指南
├── SKILLS_SEARCH_GUIDE.md      # Skills搜索指南
└── LICENSE                     # MIT许可证
```

## 🚀 快速开始

### 1. 安装依赖
```bash
# 使用批处理脚本
双击 install_dependencies.bat

# 或手动安装
pip install pyautogui pillow requests
```

### 2. 测试签到系统
```bash
python auto_signin.py
```

### 3. 测试Skills管理系统
```bash
# 查看Skills状态
python check_skills_enabled.py

# 查看所有Skills
python find_all_skills_simple.py

# 启用所有Skills
python enable_all_skills.py
```

### 4. 配置自动化任务
```bash
# 查看当前自动化任务
python auto_signin.py check_automation

# 创建每日签到任务
python auto_signin.py create_automation
```

## 📊 核心组件详解

### 🎯 签到系统 (`auto_signin.py`)
- **自动签到**: 每日自动领取WorkBuddy积分
- **自检功能**: 签到后自动执行系统自检
- **报告生成**: 生成详细的签到和自检报告
- **历史记录**: 保存所有签到历史

### 🔧 Skills管理器 (`skills_manager.py`)
- **设备注册**: 注册多台设备进行同步
- **快照创建**: 创建Skills状态快照
- **一致性检查**: 检查跨设备一致性
- **自动同步**: 自动同步Skills到所有设备

### 🧪 自检系统 (`skills_self_check.py`)
- **完整性检查**: 验证所有Skills文件完整性
- **版本跟踪**: 跟踪Skills版本变化
- **依赖检查**: 检查Skills之间的依赖关系
- **记忆存储**: 使用SQLite存储自检历史

### 🔍 搜索系统 (`skills_search_manager.py`)
- **GitHub搜索**: 从GitHub搜索Skills
- **Skillshub搜索**: 从WorkBuddy官方Skillshub搜索
- **智能分类**: 自动分类前端/后端/移动端技能
- **一键安装**: 自动安装选择的Skills

## 📈 使用方法

### 每日签到
```bash
# 手动签到（含自检）
python auto_signin.py

# 查看签到报告
python check_reports.py today
```

### Skills管理
```bash
# 查看所有Skills
python find_all_skills_simple.py

# 启用所有Skills
python enable_all_skills.py

# 验证Skills完整性
python skills_self_check.py
```

### Skills搜索和安装
```bash
# 搜索所有可用Skills
python skills_search_manager.py search --category=all

# 安装特定Skill
python skills_search_manager.py install frontend-dev

# 更新所有Skills
python skills_search_manager.py update
```

## 🔧 批处理脚本

系统包含多个批处理脚本，方便非技术用户使用：

### 📁 批处理文件列表
1. **`install_dependencies.bat`** - 安装Python依赖
2. **`daily_skills_check.bat`** - 每日自动Skills检查
3. **`enable_all_skills.bat`** - 强制启用所有Skills
4. **`reload_workbuddy_skills.bat`** - 重启WorkBuddy修复问题
5. **`update_skills.bat`** - 更新Skills
6. **`install_missing_skills.bat`** - 安装缺失Skills指南
7. **`test_skills_system.bat`** - 测试Skills系统

### 🖱️ 使用方法
```
只需双击相应的.bat文件即可执行对应功能
```

## 📋 配置文件

### `config.json` 主要配置项
```json
{
  "workbuddy": {
    "path": "C:\\Program Files\\Tencent\\WorkBuddy\\WorkBuddy.exe"
  },
  "signin": {
    "daily_time": "09:00",
    "auto_check": true,
    "self_check": true
  },
  "skills": {
    "auto_check": true,
    "check_time": "10:00",
    "backup_days": 30,
    "memory_days": 365
  },
  "sync": {
    "cloud_storage": "baidu",
    "auto_sync": true,
    "devices": []
  }
}
```

## 🗄️ 数据存储

### 存储位置
```
%USERPROFILE%\.workbuddy\
├── logs/                      # 日志文件
│   ├── workbuddy_signin_YYYYMM.log
│   └── signin_history.csv
├── reports/                   # 自检报告
│   ├── self_check_YYYYMMDD.txt
│   └── self_check_YYYYMMDD.json
├── skills_reports/            # Skills自检报告
├── screenshots/               # 签到截图
├── skills_backups/            # Skills备份
├── skills_memory.db           # Skills记忆数据库
└── skills_integrity.db        # Skills完整性数据库
```

## 🔍 监控和报告

### 查看报告
```bash
# 查看签到报告
python check_reports.py all

# 查看Skills报告
python skills_self_check.py report

# 查看Skills启用状态
python check_skills_enabled.py detailed
```

### 生成摘要
```bash
# 生成系统摘要
python check_reports.py summary

# 生成Skills摘要
python skills_search_manager.py summary
```

## ⚙️ 自动化任务

### 默认自动化任务
1. **每日签到**: 09:00自动执行
2. **Skills自检**: 10:00自动执行
3. **Skills搜索更新**: 每周一次

### 管理自动化任务
```bash
# 查看所有任务
python auto_signin.py list_automations

# 创建新任务
python auto_signin.py create_automation --name "MyTask" --time "14:30"

# 暂停/恢复任务
python auto_signin.py pause_automation --name "WorkBuddy每日自动签到"
```

## 🐛 故障排除

### 常见问题

#### 1. 签到按钮点击不准确
```bash
# 启用调试模式查看坐标
python auto_signin.py --debug

# 调整配置文件中的坐标
编辑 config.json 中的 "signin_button_position"
```

#### 2. Skills不显示
```bash
# 强制启用所有Skills
python enable_all_skills.py

# 重启WorkBuddy
reload_workbuddy_skills.bat

# 验证Skills文件
python verify_skill_files.py
```

#### 3. 自动化任务未执行
```bash
# 检查自动化任务状态
python auto_signin.py check_automation

# 重新创建任务
python auto_signin.py create_automation
```

### 调试工具
```bash
# 获取屏幕坐标
python -c "import pyautogui; print(pyautogui.position())"

# 检查系统状态
python auto_signin.py check_system

# 查看详细日志
python check_reports.py logs
```

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 联系方式

如有问题或建议，请：
- 在GitHub Issues中提出问题
- 或通过电子邮件联系

---

**版本**: 3.0.0  
**最后更新**: 2026-04-08  
**GitHub仓库**: https://github.com/your-username/workbuddy-automation