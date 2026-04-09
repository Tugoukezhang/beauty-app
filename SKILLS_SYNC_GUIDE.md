# WorkBuddy Skills 跨设备同步指南

本文档介绍如何在多台电脑间同步 WorkBuddy Skills，确保你在不同设备上有一致的技能环境。

## 📁 Skills 存储位置

### Windows
```
C:\Users\[用户名]\.workbuddy\skills\
```

### macOS
```
~/Library/Application Support/WorkBuddy/skills/
```

## 🔄 同步方法汇总

### 方法1：手动复制（最简单）
1. **在电脑 A（源电脑）**：
   - 找到 Skills 目录
   - 压缩整个 `skills` 文件夹为 ZIP 文件

2. **传输文件**：
   - 通过U盘、网盘、邮件等方式将 ZIP 文件传输到电脑 B

3. **在电脑 B（目标电脑）**：
   - 关闭 WorkBuddy
   - 解压 ZIP 文件到 Skills 目录（覆盖原有文件）
   - 启动 WorkBuddy

### 方法2：使用同步工具（推荐）
使用 `sync_skills.py` 工具自动化同步：

```bash
# 1. 在电脑 A 上导出 Skills 包
python sync_skills.py export

# 2. 将生成的 ZIP 文件复制到电脑 B
# 3. 在电脑 B 上恢复 Skills
python sync_skills.py restore workbuddy_skills_package_YYYYMMDD.zip

# 4. 重启 WorkBuddy
```

### 方法3：云存储同步（自动）
```bash
# 1. 配置云存储
python sync_skills.py config

# 2. 选择云存储类型（OneDrive/Dropbox/Google Drive等）
# 3. 同步到云存储
python sync_skills.py sync

# 4. 在其他电脑上从云存储恢复
```

## 🛠️ 同步工具使用方法

### 安装依赖
```bash
# 工具使用标准 Python 库，无需额外安装
# 确保已安装 Python 3.6+
```

### 常用命令
```bash
# 列出所有已安装的 Skills
python sync_skills.py list

# 创建备份
python sync_skills.py backup
python sync_skills.py backup my_custom_backup

# 从备份恢复
python sync_skills.py restore skills_backup_20260407_102930.zip

# 导出 Skills 包（用于共享）
python sync_skills.py export
python sync_skills.py export my_skills_package.zip

# 设置同步配置
python sync_skills.py config

# 同步到云存储
python sync_skills.py sync
```

## ⚙️ 同步配置说明

### 配置文件位置
```
~/.workbuddy/skills_sync_config.json
```

### 配置选项
```json
{
  "sync_methods": {
    "zip_backup": true,           // 启用 ZIP 备份
    "sync_to_cloud": false,       // 启用云存储同步
    "sync_to_local_network": false // 启用局域网共享
  },
  "cloud_storage": {
    "enabled": false,             // 云存储是否启用
    "type": "",                   // 类型：onedrive/dropbox/google_drive/icloud/custom
    "path": ""                    // 云存储路径
  },
  "local_network": {
    "enabled": false,             // 局域网共享是否启用
    "shared_folder": ""           // 共享文件夹路径
  },
  "exclude_patterns": [           // 排除的文件模式
    "node_modules",
    "__pycache__",
    ".git",
    "*.tmp",
    "*.log"
  ],
  "auto_backup": true,            // 自动备份
  "backup_retention_days": 30     // 备份保留天数
}
```

## 🔒 同步注意事项

### 1. 版本兼容性
- 确保所有设备上的 WorkBuddy 版本一致
- 不同版本的 Skills 可能不兼容

### 2. 授权和密钥
- API 密钥、访问令牌等敏感信息不会自动同步
- 需要在每台设备上重新授权
- 建议使用环境变量管理敏感信息

### 3. 文件路径差异
- Windows 和 macOS 路径格式不同
- 绝对路径可能需要在不同系统间调整

### 4. 网络依赖
- 部分 Skills 需要网络连接
- 确保每台设备都能访问所需服务

## 📊 同步策略建议

### 个人使用场景
```bash
# 简单策略：定期导出/导入
# 每周执行一次
python sync_skills.py export
# 将生成的包复制到其他设备
```

### 多设备同步场景
```bash
# 使用云存储自动同步
# 配置云存储路径
python sync_skills.py config
# 每天自动同步
python sync_skills.py sync
```

### 团队共享场景
```bash
# 创建标准 Skills 包
python sync_skills.py export team_skills_package.zip
# 分享给团队成员
# 团队成员恢复包
python sync_skills.py restore team_skills_package.zip
```

## 🚨 故障排除

### 问题1：同步后 Skills 不显示
- 检查 Skills 目录权限
- 确保已重启 WorkBuddy
- 查看 WorkBuddy 日志：`~/.workbuddy/logs/`

### 问题2：Skills 功能异常
- 检查依赖是否完整
- 确认 API 密钥已配置
- 查看 Skills 自身日志

### 问题3：同步冲突
- 手动合并冲突文件
- 使用较新的备份恢复
- 重新安装有问题的 Skills

### 问题4：文件过大
- 使用 `exclude_patterns` 排除大文件
- 分批同步 Skills
- 清理不需要的 Skills

## 🔧 高级用法

### 选择性同步
```bash
# 手动选择要同步的 Skills
# 1. 列出所有 Skills
python sync_skills.py list

# 2. 手动复制需要的 Skills 目录
# 3. 在目标设备上粘贴到 Skills 目录
```

### 自动化脚本
创建自动化同步脚本 `auto_sync.bat`（Windows）：
```batch
@echo off
echo 正在同步 WorkBuddy Skills...
cd /d "%~dp0"
python sync_skills.py backup
python sync_skills.py sync
echo 同步完成！
pause
```

### 定时同步
使用 Windows 任务计划或 macOS cron：
```bash
# 每天 18:00 自动同步
0 18 * * * cd /path/to/script && python sync_skills.py sync
```

## 📞 技术支持

### 查看帮助
```bash
python sync_skills.py help
```

### 查看日志
```bash
# 同步工具日志在控制台输出
# WorkBuddy 日志在：
#   Windows: %USERPROFILE%\.workbuddy\logs\
#   macOS: ~/.workbuddy/logs/
```

### 获取帮助
- 查看本文档
- 运行 `python sync_skills.py help`
- 查看脚本源代码了解详细实现

---

**最后更新**：2026-04-07  
**版本**：1.0.0  
**工具版本**：sync_skills.py v1.0

> 💡 提示：定期同步可以确保你在不同设备上有一致的工作环境，提高工作效率！