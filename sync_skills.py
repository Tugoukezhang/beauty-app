#!/usr/bin/env python3
"""
WorkBuddy Skills 自检、更新和同步管理工具
支持：每日自检、自动更新、跨设备一致性、记忆存储
"""

import os
import sys
import json
import shutil
import zipfile
import hashlib
import re
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path
import logging
import argparse
import subprocess
import platform
import threading
import time

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# 定义常量
SKILLS_CHECKLIST_FILE = ".workbuddy_skills_checklist.json"
MEMORY_DB_FILE = ".workbuddy/skills_memory.db"

class SkillsMemoryDatabase:
    """Skills 记忆数据库"""
    
    def __init__(self, db_path=None):
        if db_path is None:
            db_path = Path.home() / MEMORY_DB_FILE
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
    
    def init_database(self):
        """初始化数据库表结构"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        # Skills 使用记录表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS skills_usage (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_name TEXT NOT NULL,
                skill_dir TEXT NOT NULL,
                used_date DATE NOT NULL,
                use_count INTEGER DEFAULT 0,
                last_used TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Skills 版本历史表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS skills_versions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_name TEXT NOT NULL,
                version TEXT NOT NULL,
                checksum TEXT NOT NULL,
                update_date DATE NOT NULL,
                source TEXT,
                update_type TEXT,  -- manual/auto/restore
                notes TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(skill_name, version)
            )
        ''')
        
        # 跨设备同步记录表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS device_sync (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT NOT NULL,
                device_name TEXT,
                last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                sync_type TEXT,  -- push/pull/auto
                skills_count INTEGER,
                sync_status TEXT,  -- success/partial/failed
                sync_details TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 自检历史表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS self_check_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                check_date DATE NOT NULL,
                check_type TEXT NOT NULL,  -- daily/weekly/monthly
                skills_checked INTEGER,
                issues_found INTEGER,
                warnings_count INTEGER,
                check_duration REAL,
                check_result TEXT,  -- passed/failed/partial
                report_file TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Skills 依赖关系表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS skills_dependencies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_name TEXT NOT NULL,
                dependency_name TEXT NOT NULL,
                dependency_type TEXT,  -- required/recommended/optional
                current_version TEXT,
                required_version TEXT,
                status TEXT,  -- ok/outdated/missing
                checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(skill_name, dependency_name)
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info(f"记忆数据库初始化完成: {self.db_path}")
    
    def record_skill_usage(self, skill_name, skill_dir, metadata=None):
        """记录 Skills 使用"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        today = datetime.now().date()
        
        # 检查是否已有今日记录
        cursor.execute('''
            SELECT id, use_count FROM skills_usage 
            WHERE skill_name = ? AND skill_dir = ? AND used_date = ?
        ''', (skill_name, skill_dir, str(today)))
        
        result = cursor.fetchone()
        
        if result:
            # 更新现有记录
            cursor.execute('''
                UPDATE skills_usage 
                SET use_count = use_count + 1, 
                    last_used = CURRENT_TIMESTAMP,
                    metadata = ?
                WHERE id = ?
            ''', (json.dumps(metadata) if metadata else None, result[0]))
        else:
            # 创建新记录
            cursor.execute('''
                INSERT INTO skills_usage 
                (skill_name, skill_dir, used_date, use_count, metadata)
                VALUES (?, ?, ?, 1, ?)
            ''', (skill_name, skill_dir, str(today), 
                  json.dumps(metadata) if metadata else None))
        
        conn.commit()
        conn.close()
    
    def record_version_change(self, skill_name, version, checksum, source="unknown", 
                             update_type="manual", notes=""):
        """记录 Skills 版本变更"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO skills_versions 
            (skill_name, version, checksum, update_date, source, update_type, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (skill_name, version, checksum, str(datetime.now().date()), 
              source, update_type, notes))
        
        conn.commit()
        conn.close()
    
    def record_device_sync(self, device_id, device_name, sync_type, skills_count, 
                          sync_status, sync_details=None):
        """记录设备同步事件"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO device_sync 
            (device_id, device_name, sync_type, skills_count, sync_status, sync_details)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (device_id, device_name, sync_type, skills_count, 
              sync_status, json.dumps(sync_details) if sync_details else None))
        
        conn.commit()
        conn.close()
    
    def record_self_check(self, check_type, skills_checked, issues_found, 
                         warnings_count, check_duration, check_result, report_file):
        """记录自检结果"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO self_check_history 
            (check_date, check_type, skills_checked, issues_found, warnings_count, 
             check_duration, check_result, report_file)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (str(datetime.now().date()), check_type, skills_checked, issues_found, 
              warnings_count, check_duration, check_result, report_file))
        
        conn.commit()
        conn.close()
    
    def get_skill_usage_stats(self, days=30):
        """获取 Skills 使用统计"""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        
        start_date = (datetime.now() - timedelta(days=days)).date()
        
        # 使用频率统计
        cursor.execute('''
            SELECT skill_name, SUM(use_count) as total_use
            FROM skills_usage
            WHERE used_date >= ?
            GROUP BY skill_name
            ORDER BY total_use DESC
            LIMIT 20
        ''', (str(start_date),))
        
        usage_stats = cursor.fetchall()
        
        # 最近活动统计
        cursor.execute('''
            SELECT skill_name, MAX(last_used) as last_used
            FROM skills_usage
            GROUP BY skill_name
            ORDER BY last_used DESC
            LIMIT 20
        ''')
        
        recent_stats = cursor.fetchall()
        
        conn.close()
        
        return {
            "usage_stats": usage_stats,
            "recent_stats": recent_stats
        }
    
    def get_sync_history(self, limit=50):
        """获取同步历史"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM device_sync
            ORDER BY last_sync DESC
            LIMIT ?
        ''', (limit,))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results
    
    def get_self_check_history(self, limit=50):
        """获取自检历史"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM self_check_history
            ORDER BY check_date DESC, created_at DESC
            LIMIT ?
        ''', (limit,))
        
        results = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return results

class SkillsSyncManager:
    def __init__(self):
        self.skills_dir = Path.home() / ".workbuddy" / "skills"
        self.backup_dir = Path.home() / ".workbuddy" / "skills_backups"
        self.reports_dir = Path.home() / ".workbuddy" / "skills_reports"
        self.sync_config_file = Path.home() / ".workbuddy" / "skills_sync_config.json"
        self.checklist_file = self.skills_dir / SKILLS_CHECKLIST_FILE
        
        # 确保目录存在
        self.skills_dir.mkdir(parents=True, exist_ok=True)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        
        # 加载配置
        self.config = self.load_config()
        
        # 初始化记忆数据库
        self.memory_db = SkillsMemoryDatabase()
        
        # 生成设备ID
        self.device_id = self._generate_device_id()
    
    def load_config(self):
        """加载同步配置"""
        default_config = {
            "sync_methods": {
                "zip_backup": True,
                "sync_to_cloud": False,
                "sync_to_local_network": False
            },
            "cloud_storage": {
                "enabled": False,
                "type": "",  # onedrive, dropbox, google_drive, icloud
                "path": ""
            },
            "local_network": {
                "enabled": False,
                "shared_folder": ""
            },
            "exclude_patterns": [
                "node_modules",
                "__pycache__",
                ".git",
                "*.tmp",
                "*.log"
            ],
            "auto_backup": True,
            "backup_retention_days": 30
        },
            "self_check": {
                "enabled": True,
                "daily_check": True,
                "check_versions": True,
                "check_dependencies": True,
                "auto_update": False,
                "report_format": ["txt", "json"]
            },
            "cross_device": {
                "enabled": True,
                "consistency_check": True,
                "auto_sync_on_difference": True,
                "preferred_device": ""  # 主要设备名称
            },
            "memory": {
                "enabled": True,
                "retention_days": 365,
                "backup_to_cloud": True
            }
        
        if self.sync_config_file.exists():
            try:
                with open(self.sync_config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                # 合并配置
                merged_config = default_config.copy()
                self._merge_dict(merged_config, user_config)
                logger.info("同步配置加载成功")
                return merged_config
            except Exception as e:
                logger.warning(f"配置文件加载失败，使用默认配置: {e}")
                return default_config
        else:
            logger.info("未找到同步配置文件，使用默认配置")
            return default_config
    
    def _merge_dict(self, base, update):
        """递归合并字典"""
        for key, value in update.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._merge_dict(base[key], value)
            else:
                base[key] = value
    
    def _generate_device_id(self):
        """生成设备唯一标识符"""
        try:
            import uuid
            import socket
            import getpass
            
            # 基于主机名、用户名和MAC地址生成设备ID
            hostname = socket.gethostname()
            username = getpass.getuser()
            
            # 尝试获取MAC地址
            mac = None
            try:
                if platform.system() == "Windows":
                    result = subprocess.run(['getmac', '/FO', 'CSV', '/V'], 
                                          capture_output=True, text=True)
                    lines = result.stdout.split('\n')
                    if len(lines) > 1:
                        mac = lines[1].split(',')[0].strip('"')
                elif platform.system() == "Darwin":  # macOS
                    result = subprocess.run(['ifconfig', 'en0'], 
                                          capture_output=True, text=True)
                    for line in result.stdout.split('\n'):
                        if 'ether' in line:
                            mac = line.split()[1]
                else:  # Linux
                    result = subprocess.run(['cat', '/sys/class/net/eth0/address'], 
                                          capture_output=True, text=True)
                    mac = result.stdout.strip()
            except:
                mac = "unknown"
            
            # 创建唯一设备ID
            device_info = f"{hostname}_{username}_{mac if mac else 'unknown'}"
            device_hash = hashlib.md5(device_info.encode()).hexdigest()[:16]
            
            return device_hash
            
        except Exception as e:
            logger.warning(f"生成设备ID失败，使用随机ID: {e}")
            return str(uuid.uuid4())[:16]
    
    def save_config(self):
        """保存配置"""
        with open(self.sync_config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
        logger.info(f"配置已保存: {self.sync_config_file}")
    
    def list_skills(self):
        """列出所有已安装的 Skills"""
        logger.info(f"当前 Skills 目录: {self.skills_dir}")
        
        skills = []
        for item in self.skills_dir.iterdir():
            if item.is_dir():
                # 检查是否是有效的 Skill 目录
                skill_file = item / "SKILL.md"
                if skill_file.exists():
                    try:
                        with open(skill_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                        # 提取技能名称
                        name = item.name
                        # 简单解析 SKILL.md 获取信息
                        lines = content.split('\n')
                        description = ""
                        for line in lines:
                            if line.startswith("# "):
                                name = line[2:].strip()
                            elif line.startswith("description:") or line.startswith("描述:"):
                                description = line.split(":", 1)[1].strip()
                        
                        skills.append({
                            "name": name,
                            "directory": item.name,
                            "path": str(item),
                            "size_mb": self._get_directory_size(item) / (1024 * 1024)
                        })
                    except:
                        skills.append({
                            "name": item.name,
                            "directory": item.name,
                            "path": str(item),
                            "size_mb": self._get_directory_size(item) / (1024 * 1024)
                        })
        
        logger.info(f"发现 {len(skills)} 个 Skills:")
        for i, skill in enumerate(skills, 1):
            logger.info(f"  {i:2d}. {skill['name']} ({skill['size_mb']:.2f} MB)")
        
        return skills
    
    def _get_directory_size(self, path):
        """计算目录大小"""
        total = 0
        for entry in path.rglob('*'):
            if entry.is_file():
                total += entry.stat().st_size
        return total
    
    def backup_skills(self, backup_name=None):
        """备份 Skills 到 ZIP 文件"""
        if backup_name is None:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_name = f"skills_backup_{timestamp}"
        
        backup_file = self.backup_dir / f"{backup_name}.zip"
        
        logger.info(f"开始备份 Skills 到: {backup_file}")
        
        # 创建备份
        try:
            with zipfile.ZipFile(backup_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for skill_dir in self.skills_dir.iterdir():
                    if skill_dir.is_dir():
                        skill_name = skill_dir.name
                        logger.info(f"  备份: {skill_name}")
                        
                        # 添加到 ZIP
                        for file_path in skill_dir.rglob('*'):
                            if file_path.is_file():
                                # 排除不需要的文件
                                if self._should_exclude(file_path):
                                    continue
                                
                                arcname = file_path.relative_to(self.skills_dir)
                                zipf.write(file_path, arcname)
            
            # 计算备份文件大小
            backup_size = backup_file.stat().st_size / (1024 * 1024)
            logger.info(f"✅ 备份完成: {backup_file.name} ({backup_size:.2f} MB)")
            
            # 保存备份记录
            self._save_backup_record(backup_file, backup_size)
            
            # 清理旧备份
            self._cleanup_old_backups()
            
            return str(backup_file)
            
        except Exception as e:
            logger.error(f"备份失败: {e}")
            return None
    
    def _should_exclude(self, file_path):
        """检查是否应该排除文件"""
        for pattern in self.config["exclude_patterns"]:
            if pattern in str(file_path):
                return True
        return False
    
    def _save_backup_record(self, backup_file, size_mb):
        """保存备份记录"""
        record_file = self.backup_dir / "backup_history.json"
        
        record = {
            "timestamp": datetime.now().isoformat(),
            "filename": backup_file.name,
            "size_mb": round(size_mb, 2),
            "skills_count": len(list(self.skills_dir.iterdir()))
        }
        
        history = []
        if record_file.exists():
            try:
                with open(record_file, 'r', encoding='utf-8') as f:
                    history = json.load(f)
            except:
                pass
        
        history.append(record)
        
        with open(record_file, 'w', encoding='utf-8') as f:
            json.dump(history, f, indent=2, ensure_ascii=False)
    
    def _cleanup_old_backups(self):
        """清理旧的备份文件"""
        if not self.config["auto_backup"]:
            return
        
        retention_days = self.config["backup_retention_days"]
        
        for backup_file in self.backup_dir.glob("skills_backup_*.zip"):
            try:
                # 从文件名提取时间戳
                filename = backup_file.stem
                date_str = filename.replace("skills_backup_", "")
                
                # 尝试解析时间戳
                try:
                    file_date = datetime.strptime(date_str, "%Y%m%d_%H%M%S")
                    days_old = (datetime.now() - file_date).days
                    
                    if days_old > retention_days:
                        backup_file.unlink()
                        logger.info(f"清理旧备份: {backup_file.name} ({days_old} 天前)")
                except ValueError:
                    # 文件名格式不匹配，跳过
                    pass
            except Exception as e:
                logger.warning(f"清理备份时出错: {e}")
    
    def restore_skills(self, backup_file):
        """从备份文件恢复 Skills"""
        backup_path = Path(backup_file)
        
        if not backup_path.exists():
            logger.error(f"备份文件不存在: {backup_file}")
            return False
        
        logger.info(f"开始从备份恢复: {backup_path}")
        
        # 先备份当前 Skills
        current_backup = self.backup_skills(f"pre_restore_{datetime.now().strftime('%Y%m%d_%H%M%S')}")
        if current_backup:
            logger.info(f"当前 Skills 已备份到: {current_backup}")
        
        try:
            # 清空当前 Skills 目录（保留备份文件）
            for item in self.skills_dir.iterdir():
                if item.is_dir():
                    shutil.rmtree(item)
                elif item.is_file() and not item.name.startswith("skills_backup_"):
                    item.unlink()
            
            # 解压备份文件
            with zipfile.ZipFile(backup_path, 'r') as zipf:
                zipf.extractall(self.skills_dir)
            
            logger.info(f"✅ Skills 恢复完成")
            logger.info(f"恢复后的 Skills 目录包含 {len(list(self.skills_dir.iterdir()))} 个项目")
            
            return True
            
        except Exception as e:
            logger.error(f"恢复失败: {e}")
            return False
    
    def export_skills_package(self, output_file=None):
        """导出 Skills 为可共享的包"""
        if output_file is None:
            timestamp = datetime.now().strftime("%Y%m%d")
            output_file = f"workbuddy_skills_package_{timestamp}.zip"
        
        output_path = Path(output_file)
        
        logger.info(f"开始导出 Skills 包: {output_path}")
        
        # 创建 Skills 包
        try:
            with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # 添加 Skills
                for skill_dir in self.skills_dir.iterdir():
                    if skill_dir.is_dir():
                        skill_name = skill_dir.name
                        logger.info(f"  添加: {skill_name}")
                        
                        for file_path in skill_dir.rglob('*'):
                            if file_path.is_file() and not self._should_exclude(file_path):
                                arcname = file_path.relative_to(self.skills_dir)
                                zipf.write(file_path, arcname)
                
                # 添加说明文件
                readme_content = f"""# WorkBuddy Skills 包
导出时间: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
包含 Skills 数量: {len(list(self.skills_dir.iterdir()))}

## 使用方法
1. 在另一台电脑上安装 WorkBuddy
2. 解压此 ZIP 文件到 WorkBuddy Skills 目录：
   - Windows: C:\\Users\\[用户名]\\.workbuddy\\skills\\
   - macOS: ~/Library/Application Support/WorkBuddy/skills/
3. 重启 WorkBuddy

## 包含的 Skills
{self._generate_skills_list()}

## 注意
- 确保 WorkBuddy 版本兼容
- 部分 Skills 可能需要重新授权
- 建议先备份原有的 Skills
"""
                
                zipf.writestr("README.txt", readme_content)
            
            package_size = output_path.stat().st_size / (1024 * 1024)
            logger.info(f"✅ Skills 包导出完成: {output_path.name} ({package_size:.2f} MB)")
            
            return str(output_path)
            
        except Exception as e:
            logger.error(f"导出失败: {e}")
            return None
    
    def _generate_skills_list(self):
        """生成 Skills 列表"""
        skills = self.list_skills()
        skills_list = []
        for skill in skills:
            skills_list.append(f"- {skill['name']} ({skill['size_mb']:.2f} MB)")
        return "\n".join(skills_list)
    
    def setup_sync_config(self):
        """交互式设置同步配置"""
        logger.info("设置 Skills 同步配置")
        
        print("\n=== Skills 同步配置设置 ===")
        
        # ZIP 备份配置
        self.config["sync_methods"]["zip_backup"] = self._ask_yes_no("启用 ZIP 备份?", True)
        
        # 云存储配置
        use_cloud = self._ask_yes_no("启用云存储同步?", False)
        self.config["sync_methods"]["sync_to_cloud"] = use_cloud
        self.config["cloud_storage"]["enabled"] = use_cloud
        
        if use_cloud:
            print("选择云存储类型:")
            print("  1. OneDrive")
            print("  2. Dropbox")
            print("  3. Google Drive")
            print("  4. iCloud")
            print("  5. 其他 (手动指定路径)")
            
            choice = input("请选择 (1-5): ").strip()
            if choice == "1":
                self.config["cloud_storage"]["type"] = "onedrive"
                self.config["cloud_storage"]["path"] = str(Path.home() / "OneDrive" / "WorkBuddy_Skills")
            elif choice == "2":
                self.config["cloud_storage"]["type"] = "dropbox"
                self.config["cloud_storage"]["path"] = str(Path.home() / "Dropbox" / "WorkBuddy_Skills")
            elif choice == "3":
                self.config["cloud_storage"]["type"] = "google_drive"
                self.config["cloud_storage"]["path"] = str(Path.home() / "Google Drive" / "WorkBuddy_Skills")
            elif choice == "4":
                self.config["cloud_storage"]["type"] = "icloud"
                self.config["cloud_storage"]["path"] = str(Path.home() / "Library" / "Mobile Documents" / "com~apple~CloudDocs" / "WorkBuddy_Skills")
            else:
                self.config["cloud_storage"]["type"] = "custom"
                custom_path = input("请输入云存储路径: ").strip()
                self.config["cloud_storage"]["path"] = custom_path
        
        # 局域网共享
        use_network = self._ask_yes_no("启用局域网共享?", False)
        self.config["sync_methods"]["sync_to_local_network"] = use_network
        self.config["local_network"]["enabled"] = use_network
        
        if use_network:
            shared_path = input("请输入共享文件夹路径 (如 \\\\NAS\\share\\WorkBuddy_Skills): ").strip()
            self.config["local_network"]["shared_folder"] = shared_path
        
        # 自动备份
        self.config["auto_backup"] = self._ask_yes_no("启用自动备份?", True)
        
        if self.config["auto_backup"]:
            try:
                days = int(input("备份保留天数 (默认30): ").strip() or "30")
                self.config["backup_retention_days"] = max(1, days)
            except:
                self.config["backup_retention_days"] = 30
        
        # 保存配置
        self.save_config()
        
        logger.info("✅ 同步配置设置完成")
    
    def _ask_yes_no(self, question, default=True):
        """询问是/否问题"""
        default_str = "Y/n" if default else "y/N"
        answer = input(f"{question} [{default_str}]: ").strip().lower()
        
        if answer == "":
            return default
        elif answer in ["y", "yes", "是", "1"]:
            return True
        else:
            return False
    
    def sync_to_cloud(self):
        """同步到云存储"""
        if not self.config["cloud_storage"]["enabled"]:
            logger.warning("云存储同步未启用")
            return False
        
        cloud_path = Path(self.config["cloud_storage"]["path"])
        
        # 确保云存储目录存在
        cloud_path.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"开始同步到云存储: {cloud_path}")
        
        try:
            # 创建备份
            backup_file = self.backup_skills()
            if not backup_file:
                logger.error("备份失败，无法同步")
                return False
            
            # 复制到云存储
            backup_path = Path(backup_file)
            cloud_backup = cloud_path / backup_path.name
            
            shutil.copy2(backup_path, cloud_backup)
            
            # 同时复制最新的 Skills 包
            package_file = self.export_skills_package(cloud_path / f"skills_package_latest.zip")
            
            logger.info(f"✅ 已同步到云存储:")
            logger.info(f"   备份文件: {cloud_backup}")
            if package_file:
                logger.info(f"   Skills包: {package_file}")
            
            return True
            
        except Exception as e:
            logger.error(f"云存储同步失败: {e}")
            return False
    
    def show_help(self):
        """显示帮助信息"""
        help_text = """
WorkBuddy Skills 同步管理工具
============================

使用方法:
  python sync_skills.py [命令] [参数]

可用命令:
  list        - 列出所有已安装的 Skills
  backup      - 备份当前 Skills 到 ZIP 文件
  restore     - 从备份文件恢复 Skills
  export      - 导出 Skills 为可共享的包
  config      - 交互式设置同步配置
  sync        - 同步到云存储（如果已配置）
  help        - 显示此帮助信息

示例:
  python sync_skills.py list                    # 列出 Skills
  python sync_skills.py backup                  # 创建备份
  python sync_skills.py backup my_backup        # 指定备份名称
  python sync_skills.py restore backup.zip      # 从备份恢复
  python sync_skills.py export                  # 导出 Skills 包
  python sync_skills.py export my_skills.zip    # 指定导出文件名
  python sync_skills.py config                  # 设置同步配置
  python sync_skills.py sync                    # 同步到云存储

无参数时默认显示帮助信息。

跨设备同步步骤:
1. 在电脑 A 上: python sync_skills.py export
2. 将生成的 ZIP 文件复制到电脑 B
3. 在电脑 B 上: python sync_skills.py restore [ZIP文件]
4. 重启 WorkBuddy

云存储同步:
1. 运行: python sync_skills.py config
2. 配置云存储路径
3. 运行: python sync_skills.py sync
4. 在其他电脑上从云存储恢复

Skills 目录位置:
  Windows: C:\\Users\\[用户名]\\.workbuddy\\skills
  macOS:   ~/Library/Application Support/WorkBuddy/skills
"""
        print(help_text)

def main():
    manager = SkillsSyncManager()
    
    parser = argparse.ArgumentParser(description="WorkBuddy Skills 同步管理工具")
    parser.add_argument("command", nargs="?", help="要执行的命令")
    parser.add_argument("args", nargs="*", help="命令参数")
    
    # 如果没有参数，显示帮助
    if len(sys.argv) == 1:
        manager.show_help()
        return
    
    args = parser.parse_args()
    
    try:
        if args.command == "list":
            manager.list_skills()
        
        elif args.command == "backup":
            backup_name = args.args[0] if args.args else None
            backup_file = manager.backup_skills(backup_name)
            if backup_file:
                print(f"\n✅ 备份完成: {backup_file}")
            else:
                print("\n❌ 备份失败")
        
        elif args.command == "restore":
            if not args.args:
                print("❌ 请指定要恢复的备份文件")
                return
            
            backup_file = args.args[0]
            if manager.restore_skills(backup_file):
                print("\n✅ Skills 恢复完成，请重启 WorkBuddy")
            else:
                print("\n❌ 恢复失败")
        
        elif args.command == "export":
            output_file = args.args[0] if args.args else None
            package_file = manager.export_skills_package(output_file)
            if package_file:
                print(f"\n✅ Skills 包导出完成: {package_file}")
                print("   可以将此文件复制到其他电脑使用")
            else:
                print("\n❌ 导出失败")
        
        elif args.command == "config":
            manager.setup_sync_config()
        
        elif args.command == "sync":
            if manager.sync_to_cloud():
                print("\n✅ 云存储同步完成")
            else:
                print("\n❌ 同步失败")
        
        elif args.command in ["help", "-h", "--help"]:
            manager.show_help()
        
        else:
            print(f"❌ 未知命令: {args.command}")
            manager.show_help()
    
    except KeyboardInterrupt:
        print("\n\n用户中断操作")
    except Exception as e:
        print(f"\n❌ 程序执行出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()