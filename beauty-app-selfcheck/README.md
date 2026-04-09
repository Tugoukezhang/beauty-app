# WorkBuddy 自检程序 - 美妆项目扩展

## 📋 概述
这是为 `beauty-app` 项目添加的自检程序扩展，用于增强美妆项目的稳定性和可靠性管理。

## 🎯 功能特点
- **Skills健康检查** - 检查所有已安装Skills的完整性和可用性
- **自动签到系统** - 每日自动领取WorkBuddy积分
- **Skills同步管理** - 跨设备Skills一致性检查
- **报告生成** - 生成详细的检查报告和日志

## 📁 目录结构
```
beauty-app-selfcheck/
├── selfcheck/              # 自检程序主目录
│   ├── skills_check.py    # Skills健康检查
│   ├── auto_signin.py     # 自动签到系统
│   ├── skills_manager.py  # Skills管理器
│   ├── sync_skills.py     # Skills同步工具
│   └── skills_self_check.py  # Skills自检系统
├── scripts/               # 批处理脚本
│   ├── run_selfcheck.bat  # 运行自检程序
│   ├── run_signin.bat     # 运行自动签到
│   ├── enable_skills.bat  # 启用所有Skills
│   └── check_skills.bat   # 检查Skills状态
├── docs/                  # 文档
│   ├── USAGE.md           # 使用指南
│   ├── CONFIGURATION.md   # 配置说明
│   └── TROUBLESHOOTING.md # 故障排除
├── config/                # 配置文件
│   ├── selfcheck.json     # 自检程序配置
│   ├── skills_config.json # Skills配置
│   └── logging_config.json # 日志配置
└── utils/                 # 工具函数
    ├── report_generator.py # 报告生成器
    └── file_validator.py   # 文件验证器
```

## 🚀 快速开始

### 1. 安装依赖
```
cd beauty-app-selfcheck
pip install -r requirements.txt
```

### 2. 运行自检程序
双击 `scripts/run_selfcheck.bat` 或运行：
```bash
python selfcheck/skills_self_check.py
```

### 3. 运行自动签到
双击 `scripts/run_signin.bat` 或运行：
```bash
python selfcheck/auto_signin.py
```

### 4. 启用所有Skills
双击 `scripts/enable_skills.bat` 或运行：
```bash
python scripts/enable_all_skills.py
```

## ⚙️ 配置说明

### 基本配置
编辑 `config/selfcheck.json`：
```json
{
  "workbuddy_path": "C:/Program Files/Tencent/WorkBuddy/WorkBuddy.exe",
  "signin_time": "09:00",
  "selfcheck_time": "10:00",
  "log_level": "INFO",
  "report_format": ["txt", "json"]
}
```

### Skills配置
编辑 `config/skills_config.json`：
```json
{
  "skills_dirs": [
    "C:/Users/%USERNAME%/.workbuddy/skills",
    "C:/ProgramData/WorkBuddy/skills"
  ],
  "check_interval_hours": 24,
  "backup_enabled": true,
  "consistency_check": true
}
```

## 📊 报告格式

自检程序会生成以下报告：

### 1. **Skills状态报告**
- 已安装Skills数量
- 启用状态
- 文件完整性
- 依赖关系

### 2. **签到报告**
- 签到时间
- 签到结果
- 积分变化
- 截图证据

### 3. **系统健康报告**
- 工作目录状态
- 配置文件状态
- 数据库连接
- 外部API状态

## 🔧 故障排除

### 常见问题

#### Q1: 自检程序找不到WorkBuddy
**解决方法**：
1. 检查 `config/selfcheck.json` 中的 `workbuddy_path`
2. 确认WorkBuddy已安装在该路径
3. 运行路径验证脚本：`python utils/file_validator.py`

#### Q2: Skills检查失败
**解决方法**：
1. 确认Skills目录权限
2. 运行权限检查：`python selfcheck/skills_check.py --fix-permissions`
3. 检查日志文件了解具体错误

#### Q3: 自动签到不工作
**解决方法**：
1. 检查系统时间是否正确
2. 确认WorkBuddy窗口可以正常访问
3. 运行测试模式：`python selfcheck/auto_signin.py --test`

## 🔗 与美妆项目集成

### 集成方式
1. **独立运行** - 作为独立模块运行，不影响美妆项目
2. **定时任务** - 设置Windows定时任务自动运行
3. **项目集成** - 作为美妆项目的一部分集成

### 建议配置
对于美妆项目，建议以下配置：
- **签到时间**: 09:00（每天）
- **自检时间**: 10:00（每天）
- **Skills检查**: 每6小时一次
- **报告保存**: 保留30天历史

## 📝 开发说明

### 代码结构
```python
beauty-app-selfcheck/
├── selfcheck/           # 核心逻辑
│   ├── __init__.py
│   ├── base_check.py   # 基类检查
│   └── specialized_checks.py  # 专用检查
├── models/             # 数据模型
│   ├── skill_model.py  # Skills模型
│   └── report_model.py # 报告模型
└── tests/              # 测试
    ├── test_skills.py  # Skills测试
    └── test_signin.py  # 签到测试
```

### API接口
自检程序提供以下API：
- `GET /api/skills/status` - 获取Skills状态
- `GET /api/signin/history` - 获取签到历史
- `POST /api/selfcheck/run` - 运行自检
- `GET /api/reports/{report_type}` - 获取报告

## 📄 许可证
MIT License - 与美妆项目相同的许可证

## 🤝 贡献指南
欢迎提交Issue和Pull Request来改进自检程序！

## 📞 联系方式
如有问题，请在美妆项目仓库中提交Issue。

---

**重要提示**：此自检程序是美妆项目的补充工具，不会修改或影响美妆项目的核心文件。