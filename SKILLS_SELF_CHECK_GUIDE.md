# WorkBuddy Skills 自检和记忆系统指南

## 概述

本系统实现了完整的 Skills 自检、更新、跨设备一致性和记忆存储功能，确保您的 WorkBuddy Skills 始终保持最新、完整且跨设备一致。

## 系统架构

```
WorkBuddy Skills 生态系统
├── ✅ 自动签到系统 (auto_signin.py)
├── ✅ Skills 同步工具 (sync_skills.py)
├── ✅ Skills 自检系统 (skills_self_check.py)
├── ✅ 跨设备一致性管理 (skills_manager.py)
├── ✅ 每日自动化任务 (daily_skills_check.bat)
└── ✅ 记忆数据库 (SQLite)
```

## 快速开始

### 1. 初始化系统

```bash
# 1. 注册当前设备
python skills_manager.py register

# 2. 创建初始快照
python skills_manager.py snapshot

# 3. 执行首次自检
python skills_self_check.py check
```

### 2. 在其他设备上设置

```bash
# 在其他电脑上重复步骤1-3
python skills_manager.py register "办公室电脑"
python skills_manager.py snapshot
python skills_self_check.py check
```

### 3. 检查跨设备一致性

```bash
# 在任何设备上运行
python skills_manager.py consistency
```

## 详细功能说明

### 1. Skills 自检系统 (`skills_self_check.py`)

#### 功能列表
- ✅ **完整性检查**：验证每个 Skill 的文件结构和校验和
- ✅ **版本跟踪**：自动提取和记录 Skills 版本信息
- ✅ **依赖检查**：检查 package.json 和 requirements.txt
- ✅ **报告生成**：生成详细的 TXT 和 JSON 报告
- ✅ **记忆存储**：所有检查结果存入 SQLite 数据库
- ✅ **使用统计**：跟踪 Skills 使用频率和活跃度

#### 使用命令
```bash
# 基本自检（每日）
python skills_self_check.py check

# 指定检查类型
python skills_self_check.py check weekly     # 每周检查
python skills_self_check.py check monthly    # 每月检查

# 查看统计信息
python skills_self_check.py stats

# 自动模式（用于定时任务）
python skills_self_check.py auto
```

#### 报告示例
```
============================================================
WorkBuddy Skills 自检报告
============================================================

检查类型: daily
检查时间: 2026-04-07T11:30:00
设备ID: a1b2c3d4e5f6g7h8
检查 Skills 数量: 15

发现问题: 0 个
发现警告: 2 个

============================================================
SKILLS 详细检查结果
============================================================

✅ Agent Browser
   目录: agent-browser
   大小: 2.45 MB
   版本: 1.2.0
   校验和: a1b2c3d4e5f6g7h8...
   警告:
     - README.md 文件较简单

⚠️  Excel 文件处理
   目录: excel-handler
   大小: 3.12 MB
   版本: 2.1.0
   校验和: b2c3d4e5f6g7h8i9...
   警告:
     - 缺少 requirements.txt
```

### 2. 跨设备一致性管理 (`skills_manager.py`)

#### 功能列表
- ✅ **设备注册**：自动生成唯一设备ID并注册
- ✅ **快照管理**：创建 Skills 状态快照
- ✅ **一致性检查**：比较不同设备的 Skills 状态
- ✅ **差异检测**：自动发现并报告差异
- ✅ **变更历史**：记录所有 Skills 变更
- ✅ **自动同步**：支持向主要设备同步

#### 使用命令
```bash
# 显示当前状态
python skills_manager.py status

# 注册/更新设备
python skills_manager.py register
python skills_manager.py register "书房电脑"  # 指定设备名称

# 创建快照
python skills_manager.py snapshot

# 检查一致性
python skills_manager.py consistency

# 同步到主要设备
python skills_manager.py sync

# 查看设备列表
python skills_manager.py devices
```

#### 一致性检查结果示例
```
============================================================
WorkBuddy Skills 跨设备一致性检查报告
============================================================

检查时间: 2026-04-07 11:35:22
当前设备: 笔记本电脑 (a1b2c3d4e5f6g7h8)

⚠️  发现 1 个设备存在差异:

设备: 办公室电脑 (b2c3d4e5f6g7h8i9)
  - Skills 数量不匹配: 当前设备 15 个，其他设备 12 个
  - 缺少的 Skills: agent-browser, pdf-generator, video-editor

建议操作:
1. 运行同步工具确保所有设备一致
2. 检查网络连接和共享设置
3. 确认所有设备都已注册并创建快照
4. 如果有冲突，手动处理或设置自动解决
```

### 3. 数据库结构

系统使用两个 SQLite 数据库：

#### `skills_memory.db` - 记忆数据库
```sql
-- Skills 使用记录
CREATE TABLE skills_usage (
    skill_name TEXT,      -- Skill 名称
    skill_dir TEXT,       -- 目录名称
    used_date DATE,       -- 使用日期
    use_count INTEGER,    -- 使用次数
    last_used TIMESTAMP,  -- 最后使用时间
    metadata TEXT         -- 元数据
);

-- Skills 版本历史
CREATE TABLE skills_versions (
    skill_name TEXT,      -- Skill 名称
    version TEXT,         -- 版本号
    checksum TEXT,        -- 校验和
    update_date DATE,     -- 更新日期
    source TEXT,          -- 来源
    update_type TEXT      -- 更新类型
);

-- 自检历史
CREATE TABLE self_check_history (
    check_date DATE,      -- 检查日期
    check_type TEXT,      -- 检查类型
    skills_checked INTEGER, -- 检查数量
    issues_found INTEGER, -- 发现问题数
    warnings_count INTEGER, -- 警告数
    report_file TEXT      -- 报告文件
);
```

#### `skills_integrity.db` - 完整性数据库
```sql
-- 设备信息
CREATE TABLE devices (
    device_id TEXT PRIMARY KEY,  -- 设备ID
    device_name TEXT,            -- 设备名称
    last_seen TIMESTAMP,         -- 最后出现时间
    skills_count INTEGER,        -- Skills 数量
    is_primary BOOLEAN           -- 是否主要设备
);

-- Skills 快照
CREATE TABLE skills_snapshots (
    device_id TEXT,              -- 设备ID
    snapshot_time TIMESTAMP,     -- 快照时间
    total_skills INTEGER,        -- 总 Skills 数
    skills_list TEXT,            -- Skills 列表（JSON）
    overall_checksum TEXT        -- 整体校验和
);

-- 一致性检查记录
CREATE TABLE consistency_checks (
    check_time TIMESTAMP,        -- 检查时间
    check_type TEXT,             -- 检查类型
    devices_compared TEXT,       -- 比较的设备
    differences_found INTEGER,   -- 发现的差异
    differences_details TEXT     -- 差异详情
);
```

## 自动化配置

### 每日自动化任务

已配置自动化任务，每天 **早上10:00** 自动执行：

1. **Skills 完整性自检** - 检查所有 Skills 的健康状态
2. **Skills 快照创建** - 创建当前设备状态快照
3. **跨设备一致性检查** - 比较所有注册设备
4. **Skills 自动备份** - 创建备份以防数据丢失

### 手动执行完整流程

```bash
# 运行批处理脚本
daily_skills_check.bat

# 或手动执行
python skills_self_check.py auto
python skills_manager.py snapshot
python skills_manager.py consistency
python sync_skills.py backup daily_auto_backup
```

## 故障排除

### 常见问题

#### 1. 设备注册失败
```bash
# 检查网络权限
python skills_manager.py register --verbose

# 手动指定设备ID
python -c "import socket, getpass; print(f'{socket.gethostname()}_{getpass.getuser()}')"
```

#### 2. 一致性检查显示无其他设备
```bash
# 确保其他设备已注册
# 在其他设备上运行：
python skills_manager.py register
python skills_manager.py snapshot
```

#### 3. 校验和不匹配
```bash
# 重新计算校验和
python -c "import hashlib, os; print('检查文件完整性')"

# 检查是否有临时文件影响
# 排除 node_modules、__pycache__ 等目录
```

#### 4. 数据库访问错误
```bash
# 检查数据库文件权限
ls -la ~/.workbuddy/*.db

# 重建数据库（备份后）
rm ~/.workbuddy/skills_memory.db
python skills_self_check.py check
```

## 高级配置

### 配置文件说明

在 `config.json` 中新增以下配置：

```json
"skills_self_check": {
  "enabled": true,                    // 是否启用自检
  "daily_check": true,                // 每日检查
  "check_versions": true,             // 检查版本信息
  "check_dependencies": true,         // 检查依赖关系
  "auto_update": false,               // 自动更新（谨慎启用）
  "report_format": ["txt", "json"],   // 报告格式
  "cross_device_consistency": true,   // 跨设备一致性检查
  "auto_sync_on_difference": false,   // 发现差异时自动同步
  "memory_enabled": true,             // 启用记忆存储
  "retention_days": 365               // 数据保留天数
}
```

### 自定义检查规则

创建 `~/.workbuddy/skills_check_rules.json`：

```json
{
  "required_files": ["SKILL.md", "README.md"],
  "optional_files": ["scripts/", "assets/", "examples/"],
  "exclude_patterns": [".git", "node_modules", "__pycache__"],
  "max_file_size_mb": 50,
  "version_patterns": [
    "version\\s*[=:]\\s*([\\d\\.]+)",
    "v([\\d\\.]+)"
  ]
}
```

## 最佳实践

### 1. 多设备管理策略
- **主要设备**：设置为 Skills 更新的主要来源
- **次要设备**：定期从主要设备同步
- **检查频率**：每天自动检查一致性

### 2. 备份策略
```bash
# 每日自动备份
python sync_skills.py backup daily_$(date +%Y%m%d)

# 每周完整备份
python sync_skills.py backup weekly_$(date +%Y%m%d)

# 每月归档
python sync_skills.py backup monthly_$(date +%Y%m)
```

### 3. 监控和告警
```bash
# 检查自检结果
python -c "
import sqlite3, json
conn = sqlite3.connect('~/.workbuddy/skills_memory.db')
cursor = conn.cursor()
cursor.execute('SELECT * FROM self_check_history ORDER BY check_date DESC LIMIT 1')
result = cursor.fetchone()
print(f'最近检查: {result[1]}, 问题: {result[3]}, 警告: {result[4]}')
"

# 如果有问题发送通知
# 可以集成到系统监控中
```

## 数据安全和隐私

### 安全注意事项
1. **设备ID**：基于主机名、用户名和MAC地址生成，不包含敏感信息
2. **校验和**：仅用于文件完整性验证，不包含文件内容
3. **数据库**：存储在用户目录下，不共享到网络
4. **报告**：包含 Skills 基本信息，不包含 API 密钥等敏感数据

### 数据清理
```bash
# 清理旧报告（保留30天）
find ~/.workbuddy/skills_reports -name "*.txt" -mtime +30 -delete
find ~/.workbuddy/skills_reports -name "*.json" -mtime +30 -delete

# 清理旧备份（保留90天）
find ~/.workbuddy/skills_backups -name "*.zip" -mtime +90 -delete
```

## 更新日志

### v1.0.0 (2026-04-07)
- ✅ 初始版本发布
- ✅ 完整的 Skills 自检功能
- ✅ 跨设备一致性管理
- ✅ SQLite 记忆数据库
- ✅ 自动化每日检查
- ✅ 详细报告生成

---

**最后更新**: 2026-04-07  
**版本**: 1.0.0  
**维护者**: WorkBuddy 自动化系统