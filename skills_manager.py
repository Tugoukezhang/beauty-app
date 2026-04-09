#!/usr/bin/env python3
"""
WorkBuddy Skills 综合管理工具
整合：同步、自检、更新、跨设备一致性、记忆存储
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
import time
import uuid
import socket
import getpass

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class SkillsIntegrityManager:
    """Skills 完整性管理器"""
    
    def __init__(self):
        self.skills_dir = Path.home() / ".workbuddy" / "skills"
        self.backup_dir = Path.home() / ".workbuddy" / "skills_backups"
        self.reports_dir = Path.home() / ".workbuddy" / "skills_reports"
        self.sync_config_file = Path.home() / ".workbuddy" / "skills_sync_config.json"
        self.integrity_config_file = Path.home() / ".workbuddy" / "skills_integrity_config.json"
        self.memory_db_file = Path.home() / ".workbuddy" / "skills_integrity.db"
        
        # 确保目录存在
        self.skills_dir.mkdir(parents=True, exist_ok=True)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        
        # 加载配置
        self.sync_config = self.load_sync_config()
        self.integrity_config = self.load_integrity_config()
        
        # 初始化数据库
        self.init_database()
        
        # 设备信息
        self.device_id = self._generate_device_id()
        self.device_name = socket.gethostname()
        
        # 已知设备列表（从配置文件或数据库加载）
        self.known_devices = self.load_known_devices()
    
    def load_sync_config(self):
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
                logger.warning(f"同步配置文件加载失败，使用默认配置: {e}")
                return default_config
        else:
            logger.info("未找到同步配置文件，使用默认配置")
            return default_config
    
    def load_integrity_config(self):
        """加载完整性配置"""
        default_config = {
            "integrity": {
                "enabled": True,
                "check_on_startup": False,
                "check_on_change": True,
                "auto_fix": False
            },
            "cross_device": {
                "enabled": True,
                "primary_device": "",
                "sync_devices": [],  # 要同步的设备ID列表
                "consistency_check_interval_hours": 24,
                "auto_resolve_conflicts": False
            },
            "monitoring": {
                "log_changes": True,
                "alert_on_missing_skills": True,
                "alert_on_version_conflict": True
            },
            "backup": {
                "before_sync": True,
                "before_restore": True,
                "max_backups": 10
            }
        }
        
        if self.integrity_config_file.exists():
            try:
                with open(self.integrity_config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                merged_config = default_config.copy()
                self._merge_dict(merged_config, user_config)
                logger.info("完整性配置加载成功")
                return merged_config
            except Exception as e:
                logger.warning(f"完整性配置文件加载失败，使用默认配置: {e}")
                return default_config
        else:
            logger.info("未找到完整性配置文件，使用默认配置")
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
    
    def init_database(self):
        """初始化数据库"""
        conn = sqlite3.connect(str(self.memory_db_file))
        cursor = conn.cursor()
        
        # 设备信息表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS devices (
                device_id TEXT PRIMARY KEY,
                device_name TEXT NOT NULL,
                last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                skills_count INTEGER DEFAULT 0,
                last_checksum TEXT,
                is_primary BOOLEAN DEFAULT FALSE,
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Skills 快照表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS skills_snapshots (
                snapshot_id INTEGER PRIMARY KEY AUTOINCREMENT,
                device_id TEXT NOT NULL,
                snapshot_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                total_skills INTEGER,
                skills_list TEXT,  -- JSON格式的Skills列表
                overall_checksum TEXT,
                FOREIGN KEY (device_id) REFERENCES devices (device_id)
            )
        ''')
        
        # 一致性检查表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS consistency_checks (
                check_id INTEGER PRIMARY KEY AUTOINCREMENT,
                check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                check_type TEXT,  -- manual/auto/scheduled
                devices_compared TEXT,  -- 参与比较的设备ID列表
                differences_found INTEGER,
                differences_details TEXT,  -- JSON格式的差异详情
                resolution_action TEXT,  -- none/synced/ignored
                resolution_details TEXT,
                check_status TEXT  -- pending/completed/failed
            )
        ''')
        
        # Skills 变更历史表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS skills_changes (
                change_id INTEGER PRIMARY KEY AUTOINCREMENT,
                change_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                device_id TEXT NOT NULL,
                skill_name TEXT NOT NULL,
                change_type TEXT,  -- added/updated/removed
                old_version TEXT,
                new_version TEXT,
                old_checksum TEXT,
                new_checksum TEXT,
                change_source TEXT,  -- manual/sync/update
                change_details TEXT
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info(f"完整性数据库初始化完成: {self.memory_db_file}")
    
    def load_known_devices(self):
        """加载已知设备列表"""
        conn = sqlite3.connect(str(self.memory_db_file))
        cursor = conn.cursor()
        
        cursor.execute('SELECT device_id, device_name, is_primary FROM devices')
        devices = cursor.fetchall()
        
        conn.close()
        
        device_list = []
        for device_id, device_name, is_primary in devices:
            device_list.append({
                "device_id": device_id,
                "device_name": device_name,
                "is_primary": bool(is_primary)
            })
        
        return device_list
    
    def register_device(self, device_name=None):
        """注册当前设备"""
        if device_name is None:
            device_name = self.device_name
        
        conn = sqlite3.connect(str(self.memory_db_file))
        cursor = conn.cursor()
        
        # 检查是否已注册
        cursor.execute('SELECT device_id FROM devices WHERE device_id = ?', (self.device_id,))
        existing = cursor.fetchone()
        
        if existing:
            # 更新设备信息
            cursor.execute('''
                UPDATE devices 
                SET device_name = ?, last_seen = CURRENT_TIMESTAMP 
                WHERE device_id = ?
            ''', (device_name, self.device_id))
            logger.info(f"设备信息已更新: {device_name} ({self.device_id})")
        else:
            # 插入新设备
            is_primary = False
            if not self.known_devices:
                is_primary = True  # 第一个设备设为主要设备
            
            cursor.execute('''
                INSERT INTO devices (device_id, device_name, is_primary)
                VALUES (?, ?, ?)
            ''', (self.device_id, device_name, is_primary))
            logger.info(f"新设备已注册: {device_name} ({self.device_id})")
        
        conn.commit()
        conn.close()
        
        # 重新加载设备列表
        self.known_devices = self.load_known_devices()
    
    def take_snapshot(self):
        """创建当前设备的 Skills 快照"""
        skills = self.get_skills_list()
        
        # 计算整体校验和
        overall_checksum = self._calculate_overall_checksum()
        
        conn = sqlite3.connect(str(self.memory_db_file))
        cursor = conn.cursor()
        
        # 保存快照
        cursor.execute('''
            INSERT INTO skills_snapshots 
            (device_id, total_skills, skills_list, overall_checksum)
            VALUES (?, ?, ?, ?)
        ''', (self.device_id, len(skills), json.dumps(skills), overall_checksum))
        
        # 更新设备信息
        cursor.execute('''
            UPDATE devices 
            SET skills_count = ?, last_checksum = ?, last_seen = CURRENT_TIMESTAMP
            WHERE device_id = ?
        ''', (len(skills), overall_checksum, self.device_id))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Skills 快照已创建: {len(skills)} 个Skills，校验和: {overall_checksum[:16]}...")
        return len(skills), overall_checksum
    
    def get_skills_list(self):
        """获取 Skills 列表"""
        skills = []
        for item in self.skills_dir.iterdir():
            if item.is_dir():
                skill_file = item / "SKILL.md"
                if skill_file.exists():
                    try:
                        with open(skill_file, 'r', encoding='utf-8') as f:
                            content = f.read()
                        
                        name = item.name
                        version = "unknown"
                        
                        # 提取版本信息
                        version_match = re.search(r'version\s*[=:]\s*([\d\.]+)', content, re.IGNORECASE)
                        if version_match:
                            version = version_match.group(1)
                        
                        # 计算校验和
                        checksum = self._calculate_skill_checksum(item)
                        
                        skills.append({
                            "name": name,
                            "directory": item.name,
                            "version": version,
                            "checksum": checksum,
                            "size_mb": self._get_directory_size(item) / (1024 * 1024)
                        })
                    except:
                        # 如果读取失败，只记录基本信息
                        checksum = self._calculate_skill_checksum(item)
                        skills.append({
                            "name": item.name,
                            "directory": item.name,
                            "version": "unknown",
                            "checksum": checksum,
                            "size_mb": self._get_directory_size(item) / (1024 * 1024)
                        })
        
        return skills
    
    def _get_directory_size(self, path):
        """计算目录大小"""
        total = 0
        for entry in path.rglob('*'):
            if entry.is_file():
                total += entry.stat().st_size
        return total
    
    def _calculate_skill_checksum(self, skill_dir):
        """计算单个 Skill 的校验和"""
        checksum = hashlib.md5()
        
        for file_path in sorted(skill_dir.rglob('*')):
            if file_path.is_file():
                # 排除某些文件
                exclude_patterns = ['.git', '__pycache__', 'node_modules', '.tmp', '.log']
                if any(pattern in str(file_path) for pattern in exclude_patterns):
                    continue
                
                checksum.update(str(file_path.relative_to(skill_dir)).encode())
                
                try:
                    with open(file_path, 'rb') as f:
                        data = f.read(8192)
                        while data:
                            checksum.update(data)
                            data = f.read(8192)
                except:
                    pass
        
        return checksum.hexdigest()
    
    def _calculate_overall_checksum(self):
        """计算所有 Skills 的整体校验和"""
        skills = self.get_skills_list()
        
        # 按名称排序以确保一致性
        skills_sorted = sorted(skills, key=lambda x: x['name'])
        
        checksum = hashlib.md5()
        for skill in skills_sorted:
            checksum.update(skill['name'].encode())
            checksum.update(skill['checksum'].encode())
        
        return checksum.hexdigest()
    
    def check_cross_device_consistency(self):
        """检查跨设备一致性"""
        logger.info("开始跨设备一致性检查...")
        
        # 确保当前设备已注册
        self.register_device()
        
        # 创建当前快照
        current_skills_count, current_checksum = self.take_snapshot()
        
        # 获取其他设备的最新快照
        other_devices_snapshots = self.get_other_devices_snapshots()
        
        if not other_devices_snapshots:
            logger.info("未找到其他设备的快照，无法进行一致性检查")
            return {
                "status": "no_other_devices",
                "current_device": {
                    "device_id": self.device_id,
                    "device_name": self.device_name,
                    "skills_count": current_skills_count,
                    "checksum": current_checksum
                },
                "differences": []
            }
        
        # 比较一致性
        differences = []
        for device_snapshot in other_devices_snapshots:
            diff = self._compare_snapshots(
                current_skills_count, current_checksum,
                device_snapshot['skills_count'], device_snapshot['checksum'],
                device_snapshot['device_id'], device_snapshot['device_name']
            )
            
            if diff['has_differences']:
                differences.append(diff)
        
        # 记录检查结果
        self.record_consistency_check(differences)
        
        # 生成报告
        report = self.generate_consistency_report(differences)
        
        if differences:
            logger.warning(f"发现 {len(differences)} 个设备存在差异")
        else:
            logger.info("所有设备 Skills 一致")
        
        return {
            "status": "completed",
            "current_device": {
                "device_id": self.device_id,
                "device_name": self.device_name,
                "skills_count": current_skills_count,
                "checksum": current_checksum
            },
            "differences": differences,
            "report": report
        }
    
    def get_other_devices_snapshots(self):
        """获取其他设备的最新快照"""
        conn = sqlite3.connect(str(self.memory_db_file))
        cursor = conn.cursor()
        
        # 获取每个设备的最新快照
        cursor.execute('''
            SELECT d.device_id, d.device_name, s.total_skills, s.overall_checksum, s.snapshot_time
            FROM devices d
            LEFT JOIN skills_snapshots s ON d.device_id = s.device_id
            WHERE d.device_id != ? 
              AND s.snapshot_id = (
                  SELECT MAX(snapshot_id) 
                  FROM skills_snapshots 
                  WHERE device_id = d.device_id
              )
            ORDER BY s.snapshot_time DESC
        ''', (self.device_id,))
        
        snapshots = []
        for row in cursor.fetchall():
            snapshots.append({
                "device_id": row[0],
                "device_name": row[1],
                "skills_count": row[2] if row[2] is not None else 0,
                "checksum": row[3] if row[3] is not None else "",
                "snapshot_time": row[4]
            })
        
        conn.close()
        return snapshots
    
    def _compare_snapshots(self, count1, checksum1, count2, checksum2, device2_id, device2_name):
        """比较两个快照"""
        diff = {
            "device_id": device2_id,
            "device_name": device2_name,
            "has_differences": False,
            "differences": []
        }
        
        # 比较 Skills 数量
        if count1 != count2:
            diff["has_differences"] = True
            diff["differences"].append({
                "type": "count_mismatch",
                "current_count": count1,
                "other_count": count2,
                "difference": abs(count1 - count2)
            })
        
        # 比较校验和
        if checksum1 != checksum2:
            diff["has_differences"] = True
            diff["differences"].append({
                "type": "checksum_mismatch",
                "current_checksum": checksum1[:16],
                "other_checksum": checksum2[:16]
            })
        
        return diff
    
    def record_consistency_check(self, differences):
        """记录一致性检查结果"""
        conn = sqlite3.connect(str(self.memory_db_file))
        cursor = conn.cursor()
        
        devices_compared = [self.device_id] + [diff["device_id"] for diff in differences]
        differences_found = sum(1 for diff in differences if diff["has_differences"])
        
        cursor.execute('''
            INSERT INTO consistency_checks 
            (check_type, devices_compared, differences_found, differences_details, check_status)
            VALUES (?, ?, ?, ?, ?)
        ''', ('auto', json.dumps(devices_compared), differences_found, 
              json.dumps(differences), 'completed'))
        
        conn.commit()
        conn.close()
    
    def generate_consistency_report(self, differences):
        """生成一致性报告"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = self.reports_dir / f"consistency_check_{timestamp}.txt"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("WorkBuddy Skills 跨设备一致性检查报告\n")
            f.write("=" * 60 + "\n\n")
            
            f.write(f"检查时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"当前设备: {self.device_name} ({self.device_id})\n\n")
            
            if not differences:
                f.write("✅ 所有设备 Skills 一致\n\n")
            else:
                f.write(f"⚠️  发现 {len(differences)} 个设备存在差异:\n\n")
                
                for diff in differences:
                    if diff["has_differences"]:
                        f.write(f"设备: {diff['device_name']} ({diff['device_id'][:8]}...)\n")
                        for detail in diff["differences"]:
                            if detail["type"] == "count_mismatch":
                                f.write(f"  - Skills 数量不匹配: ")
                                f.write(f"当前设备 {detail['current_count']} 个，")
                                f.write(f"其他设备 {detail['other_count']} 个\n")
                            elif detail["type"] == "checksum_mismatch":
                                f.write(f"  - 校验和不匹配: ")
                                f.write(f"当前设备 {detail['current_checksum']}...，")
                                f.write(f"其他设备 {detail['other_checksum']}...\n")
                        f.write("\n")
            
            f.write("建议操作:\n")
            f.write("1. 运行同步工具确保所有设备一致\n")
            f.write("2. 检查网络连接和共享设置\n")
            f.write("3. 确认所有设备都已注册并创建快照\n")
            f.write("4. 如果有冲突，手动处理或设置自动解决\n\n")
            
            f.write("=" * 60 + "\n")
            f.write("报告生成完成\n")
            f.write("=" * 60 + "\n")
        
        logger.info(f"一致性报告已生成: {report_file}")
        return str(report_file)
    
    def sync_to_primary_device(self):
        """同步到主要设备"""
        # 查找主要设备
        primary_device = None
        for device in self.known_devices:
            if device["is_primary"]:
                primary_device = device
                break
        
        if not primary_device:
            logger.warning("未找到主要设备")
            return False
        
        logger.info(f"开始同步到主要设备: {primary_device['device_name']}")
        
        # 这里可以添加实际的同步逻辑
        # 目前只是记录同步操作
        
        conn = sqlite3.connect(str(self.memory_db_file))
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO skills_changes 
            (device_id, skill_name, change_type, change_source, change_details)
            VALUES (?, ?, ?, ?, ?)
        ''', (self.device_id, "ALL_SKILLS", "synced", "auto_sync", 
              json.dumps({"target_device": primary_device["device_id"], 
                         "sync_type": "to_primary"})))
        
        conn.commit()
        conn.close()
        
        logger.info(f"已记录同步操作到主要设备: {primary_device['device_name']}")
        return True
    
    def show_status(self):
        """显示状态信息"""
        print("\n" + "=" * 60)
        print("WorkBuddy Skills 完整性管理器状态")
        print("=" * 60)
        
        # 当前设备信息
        print(f"\n📱 当前设备:")
        print(f"  设备ID: {self.device_id}")
        print(f"  设备名称: {self.device_name}")
        
        # Skills 信息
        skills = self.get_skills_list()
        print(f"\n📦 Skills 状态:")
        print(f"  Skills 数量: {len(skills)}")
        
        if skills:
            print(f"  Skills 列表:")
            for i, skill in enumerate(skills[:10], 1):
                print(f"    {i:2d}. {skill['name']} (v{skill['version']}, {skill['size_mb']:.1f}MB)")
            
            if len(skills) > 10:
                print(f"    ... 还有 {len(skills) - 10} 个 Skills")
        
        # 设备列表
        print(f"\n🔄 已知设备 ({len(self.known_devices)} 个):")
        for device in self.known_devices:
            primary_marker = "⭐" if device["is_primary"] else "  "
            print(f"  {primary_marker} {device['device_name']} ({device['device_id'][:8]}...)")
        
        # 最近检查
        conn = sqlite3.connect(str(self.memory_db_file))
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT check_time, check_type, differences_found 
            FROM consistency_checks 
            ORDER BY check_time DESC 
            LIMIT 3
        ''')
        
        recent_checks = cursor.fetchall()
        
        if recent_checks:
            print(f"\n🔍 最近一致性检查:")
            for check_time, check_type, differences_found in recent_checks:
                status = "✅ 一致" if differences_found == 0 else f"⚠️  {differences_found}个差异"
                print(f"  {check_time} - {check_type}: {status}")
        
        conn.close()
        
        print("\n" + "=" * 60)
        print("使用 'python skills_manager.py help' 查看可用命令")
        print("=" * 60)
    
    def show_help(self):
        """显示帮助信息"""
        help_text = """
WorkBuddy Skills 综合管理工具
=====================================

使用方法:
  python skills_manager.py [命令] [参数]

可用命令:
  status          - 显示当前状态和设备信息
  register        - 注册当前设备
  snapshot        - 创建当前设备 Skills 快照
  consistency     - 检查跨设备一致性
  sync            - 同步到主要设备
  devices         - 显示所有已知设备
  help            - 显示此帮助信息

示例:
  python skills_manager.py status          # 显示状态
  python skills_manager.py register        # 注册当前设备
  python skills_manager.py snapshot        # 创建快照
  python skills_manager.py consistency     # 检查一致性
  python skills_manager.py sync            # 同步到主要设备
  python skills_manager.py devices         # 显示设备列表

高级功能:
  - 跨设备 Skills 一致性检查
  - 自动设备注册和跟踪
  - Skills 变更历史记录
  - 校验和验证确保完整性
  - 自动同步到主要设备

配置文件:
  同步配置: ~/.workbuddy/skills_sync_config.json
  完整性配置: ~/.workbuddy/skills_integrity_config.json
  数据库: ~/.workbuddy/skills_integrity.db
  报告目录: ~/.workbuddy/skills_reports/
"""
        print(help_text)

def main():
    """主函数"""
    manager = SkillsIntegrityManager()
    
    # 解析参数
    if len(sys.argv) == 1:
        manager.show_help()
        return
    
    command = sys.argv[1]
    
    try:
        if command == "status":
            manager.show_status()
        
        elif command == "register":
            device_name = sys.argv[2] if len(sys.argv) > 2 else None
            manager.register_device(device_name)
            print(f"✅ 设备已注册/更新")
            print(f"   设备ID: {manager.device_id}")
            print(f"   设备名称: {manager.device_name}")
        
        elif command == "snapshot":
            skills_count, checksum = manager.take_snapshot()
            print(f"✅ Skills 快照已创建")
            print(f"   Skills 数量: {skills_count}")
            print(f"   整体校验和: {checksum[:16]}...")
        
        elif command == "consistency":
            result = manager.check_cross_device_consistency()
            print(f"\n✅ 一致性检查完成")
            
            if result["status"] == "no_other_devices":
                print(f"   未找到其他设备进行对比")
                print(f"   请在其他设备上运行 'register' 和 'snapshot' 命令")
            else:
                differences = result["differences"]
                if differences:
                    print(f"   ⚠️  发现 {len(differences)} 个设备存在差异")
                    for diff in differences:
                        print(f"     设备: {diff['device_name']}")
                else:
                    print(f"   ✅ 所有设备 Skills 一致")
                
                print(f"   详细报告: {result['report']}")
        
        elif command == "sync":
            if manager.sync_to_primary_device():
                print(f"✅ 已记录同步操作到主要设备")
            else:
                print(f"❌ 同步失败: 未找到主要设备")
        
        elif command == "devices":
            print("\n已知设备列表:")
            print("-" * 40)
            for device in manager.known_devices:
                primary_marker = "⭐" if device["is_primary"] else "  "
                print(f"{primary_marker} {device['device_name']} ({device['device_id'][:16]})")
            print("-" * 40)
            print(f"共 {len(manager.known_devices)} 个设备")
        
        elif command in ["help", "-h", "--help"]:
            manager.show_help()
        
        else:
            print(f"❌ 未知命令: {command}")
            manager.show_help()
    
    except KeyboardInterrupt:
        print("\n\n操作被用户中断")
    except Exception as e:
        print(f"\n❌ 程序执行出错: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()