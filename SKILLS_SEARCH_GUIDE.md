# Skills 搜索和更新指南

本指南详细介绍如何使用Skills搜索和更新系统，自动发现和安装前端和后端相关技能。

## 📋 目录

1. [系统概述](#系统概述)
2. [功能介绍](#功能介绍)
3. [快速开始](#快速开始)
4. [详细使用](#详细使用)
5. [技能分类](#技能分类)
6. [配置选项](#配置选项)
7. [故障排除](#故障排除)
8. [常见问题](#常见问题)

## 🎯 系统概述

### 什么是Skills搜索和更新系统？

这是一个自动化系统，专门用于：
- 🔍 **搜索** GitHub和WorkBuddy Skillshub上的前端和后端相关技能
- 📦 **安装** 未安装的相关技能到本地
- 🔄 **更新** 已安装技能的版本
- 📊 **分类** 技能并按类型管理
- 📄 **报告** 生成详细的技能报告

### 系统架构

```
Skills搜索和更新系统
├── 搜索模块
│   ├── GitHub技能仓库搜索
│   ├── WorkBuddy Skillshub搜索
│   └── 本地marketplace扫描
├── 分类模块
│   ├── 前端技能识别 (React, Vue, UI设计等)
│   ├── 后端技能识别 (Node.js, Python, 云服务等)
│   ├── 移动端技能识别 (Android, iOS, Flutter等)
│   └── 平台工具识别 (小程序, 设计系统等)
├── 管理模块
│   ├── 技能安装和更新
│   ├── 数据库存储
│   └── 报告生成
└── 自动化模块
    ├── 定时搜索
    ├── 自动更新
    └── 备份管理
```

## ✨ 功能介绍

### 核心功能

1. **智能技能搜索**
   - 自动搜索前端相关技能：`frontend`, `ui`, `ux`, `design`, `react`, `vue`
   - 自动搜索后端相关技能：`backend`, `fullstack`, `cloud`, `api`, `node`, `python`
   - 支持多种来源：GitHub、Skillshub、本地marketplace

2. **自动分类**
   - 基于技能名称和描述智能分类
   - 支持5个主分类和多个子分类
   - 记录技能分类到数据库

3. **一键安装和更新**
   - 从本地marketplace安装新技能
   - 检查并更新已有技能
   - 自动备份旧版本

4. **详细报告**
   - JSON格式的详细报告
   - 技能统计和分类分析
   - 安装历史和更新记录

5. **跨平台支持**
   - Windows批处理脚本
   - Python跨平台脚本
   - 兼容WorkBuddy所有版本

### 支持的技能类型

| 分类 | 子分类 | 示例技能 | 描述 |
|------|--------|----------|------|
| **前端** | UI设计 | `frontend-dev`, `ui-ux-pro-max` | 用户界面设计和开发 |
| | 框架 | `react-native-dev`, `canvas-design` | 前端框架和库 |
| **后端** | 云服务 | `cloudbase`, `tencentcloud-cos` | 云平台和存储服务 |
| | 开发 | `fullstack-dev` | 全栈和后端开发 |
| **移动端** | 原生 | `android-native-dev`, `ios-application-dev` | 原生移动应用开发 |
| | 跨平台 | `flutter-dev`, `react-native-dev` | 跨平台移动开发 |
| **平台工具** | 小程序 | `wechat-miniprogram`, `tdesign-miniprogram` | 小程序开发框架 |
| | 渲染引擎 | `skyline` | 小程序渲染引擎 |
| **开发工具** | 创建器 | `skill-creator` | 技能创建工具 |
| | 搜索 | `find-skills` | 技能搜索工具 |

## 🚀 快速开始

### 第一步：检查当前技能

```bash
# 查看已安装的技能
ls ~/.workbuddy/skills

# 查看marketplace中的技能
ls ~/.workbuddy/skills-marketplace/skills
```

### 第二步：运行更新脚本

**方法一：使用批处理脚本（推荐）**
```bash
双击 update_skills.bat
```

**方法二：使用Python脚本**
```bash
python skills_search_manager.py
```

### 第三步：查看结果

```bash
# 查看技能摘要
python skills_search_manager.py summary

# 查看技能分类
python skills_search_manager.py categories

# 查看详细报告
type %USERPROFILE%\.workbuddy\skills_report.json
```

## 📖 详细使用

### 1. 基本命令

```bash
# 更新所有技能（默认命令）
python skills_search_manager.py

# 搜索特定技能
python skills_search_manager.py search "react"

# 安装特定技能
python skills_search_manager.py install "frontend-dev"

# 生成报告
python skills_search_manager.py report

# 显示摘要
python skills_search_manager.py summary
```

### 2. 批处理脚本使用

```bash
# Windows系统
双击 update_skills.bat

# 或命令行运行
update_skills.bat
```

### 3. 配置选项

修改 `config.json` 中的 `skills_search` 配置：

```json
"skills_search": {
  "enabled": true,
  "search_interval_hours": 24,
  "auto_update_skills": false,
  "categories": [
    "frontend",
    "backend", 
    "mobile",
    "platform",
    "tools"
  ],
  "sources": [
    "local_marketplace",
    "github",
    "skillshub"
  ],
  "max_skills_per_category": 10,
  "update_schedule": "weekly",
  "backup_before_update": true
}
```

### 4. 查看数据库

系统使用SQLite数据库存储技能信息：

```bash
# 数据库位置
%USERPROFILE%\.workbuddy\skills_search_memory.db

# 使用sqlite3查看
sqlite3 ~/.workbuddy/skills_search_memory.db
.tables
SELECT * FROM installed_skills;
SELECT * FROM skill_categories;
```

## 🏷️ 技能分类

### 分类规则

系统基于技能名称自动分类：

| 关键词 | 主分类 | 子分类 | 说明 |
|--------|--------|--------|------|
| frontend, ui, ux, design, react, vue, angular | 前端 | ui_design | 用户界面设计 |
| frontend, react, vue, angular | 前端 | framework | 前端框架 |
| backend, fullstack, api, cloud, database, server | 后端 | cloud | 云服务 |
| backend, node, python, java, go, rust | 后端 | framework | 后端框架 |
| android, ios, mobile, flutter, react-native | 移动端 | native | 原生开发 |
| android, ios, flutter, react-native | 移动端 | cross_platform | 跨平台开发 |
| miniprogram, wechat, tdesign, skyline | 平台工具 | miniprogram | 小程序开发 |
| tool, creator, manager, skill-creator, find-skills | 开发工具 | development | 开发工具 |

### 手动分类覆盖

如果需要手动指定技能分类，可以修改数据库：

```sql
-- 查看所有技能分类
SELECT * FROM skill_categories;

-- 更新技能分类
UPDATE skill_categories 
SET category = 'frontend', subcategory = 'framework' 
WHERE skill_name = 'my-react-skill';

-- 添加新技能分类
INSERT INTO skill_categories (skill_name, category, subcategory) 
VALUES ('my-new-skill', 'backend', 'api');
```

## ⚙️ 配置选项

### 完整配置参考

```json
{
  "skills_search": {
    "enabled": true,                     // 是否启用技能搜索
    "search_interval_hours": 24,        // 搜索间隔（小时）
    "auto_update_skills": false,        // 是否自动更新技能
    "categories": [                     // 要搜索的技能分类
      "frontend",
      "backend", 
      "mobile",
      "platform",
      "tools"
    ],
    "sources": [                        // 搜索来源
      "local_marketplace",
      "github",
      "skillshub"
    ],
    "max_skills_per_category": 10,      // 每个分类最大技能数
    "update_schedule": "weekly",        // 更新计划：daily/weekly/monthly
    "backup_before_update": true,       // 更新前是否备份
    "exclude_patterns": [               // 排除模式
      "*test*",
      "*demo*"
    ],
    "priority_sources": [               // 优先来源
      "local_marketplace"
    ]
  }
}
```

### 环境变量

```bash
# 设置技能安装目录
export WORKBUDDY_SKILLS_DIR="C:/Users/username/.workbuddy/skills"

# 设置marketplace目录
export WORKBUDDY_MARKETPLACE_DIR="C:/Users/username/.workbuddy/skills-marketplace/skills"

# 设置数据库路径
export WORKBUDDY_SEARCH_DB="C:/Users/username/.workbuddy/skills_search_memory.db"
```

## 🔧 故障排除

### 常见问题

#### 1. 脚本无法运行

**问题**: `python: command not found` 或类似错误

**解决**:
```bash
# 检查Python安装
python --version

# 如果没有Python，安装Python 3.8+
# 下载地址: https://www.python.org/downloads/

# 或将Python添加到PATH
set PATH=%PATH%;C:\Python39\
```

#### 2. 技能无法安装

**问题**: `Permission denied` 或文件复制错误

**解决**:
```bash
# 以管理员身份运行
右键点击 update_skills.bat → 以管理员身份运行

# 或检查文件权限
icacls %USERPROFILE%\.workbuddy /grant Users:F
```

#### 3. 分类不准确

**问题**: 技能被错误分类

**解决**:
```bash
# 查看技能分类
python skills_search_manager.py categories

# 手动更新分类
# 编辑 skills_search_manager.py 中的 categorize_skill 函数
# 或直接更新数据库
```

#### 4. 报告生成失败

**问题**: JSON报告无法生成或格式错误

**解决**:
```bash
# 检查数据库连接
python -c "import sqlite3; conn = sqlite3.connect('~/.workbuddy/skills_search_memory.db'); print('Connected')"

# 重建数据库
del %USERPROFILE%\.workbuddy\skills_search_memory.db
python skills_search_manager.py
```

### 调试模式

启用调试模式获取更多信息：

```bash
# 修改脚本添加调试输出
# 在 skills_search_manager.py 开头添加:
import logging
logging.basicConfig(level=logging.DEBUG)

# 或运行带调试参数
python skills_search_manager.py --debug
```

## ❓ 常见问题

### Q1: 系统会修改我的现有技能吗？

**A**: 默认情况下，系统只会：
1. 安装你还没有的技能
2. 更新marketplace中有新版本的技能
3. 保留所有用户自定义修改

如果需要完全覆盖，请设置 `auto_update_skills: true`。

### Q2: 如何排除某些技能不被搜索？

**A**: 在配置文件中添加 `exclude_patterns`：
```json
"exclude_patterns": [
  "*test*",
  "*demo*",
  "*experimental*"
]
```

### Q3: 系统多久搜索一次新技能？

**A**: 默认每24小时搜索一次，可以在配置中修改 `search_interval_hours`。

### Q4: 可以添加自定义技能源吗？

**A**: 目前支持：
1. 本地marketplace
2. GitHub仓库
3. WorkBuddy Skillshub

未来版本会添加自定义源支持。

### Q5: 技能更新会中断我的工作吗？

**A**: 不会。技能更新在后台进行，不会影响WorkBuddy的正常使用。

### Q6: 如何恢复被误删的技能？

**A**: 系统会保留备份（如果启用），位置在：
```
%USERPROFILE%\.workbuddy\skills_backups\
```

## 📈 最佳实践

### 1. 定期更新

建议每周运行一次技能更新：
```bash
# 设置定时任务（Windows）
schtasks /create /tn "Update WorkBuddy Skills" /tr "C:\path\to\update_skills.bat" /sc weekly /d MON /st 09:00
```

### 2. 备份策略

启用备份功能：
```json
"backup_before_update": true
```

### 3. 分类管理

定期检查技能分类，确保准确：
```bash
# 每月检查一次分类
python skills_search_manager.py categories > skills_categories_$(date +%Y%m).txt
```

### 4. 报告分析

分析技能使用情况：
```bash
# 生成月度报告
python skills_search_manager.py report > skills_report_$(date +%Y%m).json

# 统计技能增长
python -c "
import json, os
from datetime import datetime
report = json.load(open(os.path.expanduser('~/.workbuddy/skills_report.json')))
print(f'Total skills: {report[\"total_skills\"]}')
for cat in report['category_stats']:
    print(f'{cat[\"category\"]}: {cat[\"count\"]}')
"
```

## 🔄 集成到现有系统

### 与签到系统集成

将技能更新添加到每日签到流程：

```python
# 在 auto_signin.py 中添加
def update_skills_after_signin():
    """签到后更新技能"""
    print("🔄 Updating skills after signin...")
    try:
        subprocess.run([sys.executable, "skills_search_manager.py"], check=False)
        print("✅ Skills update completed")
    except Exception as e:
        print(f"⚠️ Skills update failed: {e}")
```

### 与自动化任务集成

创建新的自动化任务：

```bash
# 创建每周技能更新任务
python -c "
import automation_update
automation_update(
    mode='suggested create',
    name='Weekly Skills Update',
    prompt='Update all WorkBuddy skills from marketplace',
    cwds=['c:/Users/lintianhao/WorkBuddy/20260407093653'],
    status='ACTIVE',
    scheduleType='recurring',
    rrule='FREQ=WEEKLY;BYDAY=MO;BYHOUR=09;BYMINUTE=00'
)
"
```

## 📚 相关文档

- [GitHub Skills 仓库](https://github.com/466852675/Skills-2026)
- [WorkBuddy Skillshub 文档](https://skills.sh/)
- [Skills CLI 工具](https://github.com/vercel-labs/agent-skills)
- [SQLite 数据库文档](https://www.sqlite.org/docs.html)

## 👥 贡献指南

欢迎贡献技能分类规则、搜索源和改进建议：

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/new-classification`)
3. 提交更改 (`git commit -am 'Add new skill category'`)
4. 推送到分支 (`git push origin feature/new-classification`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源。

## 📞 联系方式

如有问题或建议，请：
1. 创建 GitHub Issue
2. 发送邮件到项目维护者
3. 在WorkBuddy社区讨论

---

**最后更新**: 2026-04-07  
**版本**: 1.0.0  
**文档状态**: 完整