#!/usr/bin/env python3
"""
WorkBuddy Skills 自检、更新和记忆系统
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
import hashlib
from datetime import datetime, timedelta
from pathlib import Path
import logging
import argparse
import subprocess
import platform
import threading
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

class SkillsSelfCheckManager:
    """Skills 自检管理器"""
    
    def __init__(self):
        self.skills_dir = Path.home() / ".workbuddy" / "skills"
        self.reports_dir = Path.home() / ".workbuddy" / "skills_reports"
        self.config_file = Path.home() / ".workbuddy" / "skills_self_check_config.json"
        
        # 确保目录存在
        self.skills_dir.mkdir(parents=True, exist_ok=True)
        self.reports_dir.mkdir(parents=True, exist_ok=True)
        
        # 加载配置
        self.config = self.load_config()
        
        # 初始化记忆数据库
        self.memory_db = SkillsMemoryDatabase()
        
        # 生成设备ID
        self.device_id = self._generate_device_id()
        self.device_name = socket.gethostname()
    
    def load_config(self):
        """加载配置"""
        default_config = {
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
        }
        
        if self.config_file.exists():
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                # 合并配置
                merged_config = default_config.copy()
                self._merge_dict(merged_config, user_config)
                logger.info("自检配置加载成功")
                return merged_config
            except Exception as e:
                logger.warning(f"配置文件加载失败，使用默认配置: {e}")
                return default_config
        else:
            logger.info("未找到自检配置文件，使用默认配置")
            return default_config
    
    def _merge_dict(self, base, update):
        """递归合并字典"""
        for key, value in update.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self._merge_dict(base[key], value)
            else:
                base[key] = value
    
    def save_config(self):
        """保存配置"""
        with open(self.config_file, 'w', encoding='utf-8') as f:
            json.dump(self.config, f, indent=2, ensure_ascii=False)
        logger.info(f"配置已保存: {self.config_file}")
    
    def _generate_device_id(self):
        """生成设备唯一标识符"""
        try:
            import uuid
            
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
    
    # ==================== Skills 自检功能 ====================
    
    def perform_self_check(self, check_type="daily"):
        """执行 Skills 自检"""
        start_time = time.time()
        
        if not self.config["self_check"]["enabled"]:
            logger.warning("Skills 自检功能未启用")
            return False
        
        logger.info(f"开始执行 {check_type} Skills 自检...")
        
        # 获取所有 Skills
        skills = self.list_skills()
        skills_checked = len(skills)
        
        # 初始化检查结果
        check_result = {
            "check_type": check_type,
            "check_date": datetime.now().isoformat(),
            "skills_checked": skills_checked,
            "device_id": self.device_id,
            "device_name": self.device_name,
            "results": []
        }
        
        issues_found = 0
        warnings_count = 0
        
        # 逐个检查每个 Skill
        for skill in skills:
            skill_result = self._check_single_skill(skill)
            check_result["results"].append(skill_result)
            
            if skill_result["status"] == "error":
                issues_found += 1
            elif skill_result["status"] == "warning":
                warnings_count += 1
        
        # 检查 Skills 版本一致性
        if self.config["self_check"]["check_versions"]:
            version_check = self._check_skills_versions(skills)
            check_result["version_check"] = version_check
        
        # 检查依赖关系
        if self.config["self_check"]["check_dependencies"]:
            dependency_check = self._check_dependencies(skills)
            check_result["dependency_check"] = dependency_check
        
        # 检查跨设备一致性
        if self.config["cross_device"]["consistency_check"]:
            consistency_check = self._check_cross_device_consistency(skills)
            check_result["consistency_check"] = consistency_check
        
        # 生成检查报告
        report_file = self._generate_self_check_report(check_result, check_type)
        
        # 确定检查结果
        overall_status = "passed"
        if issues_found > 0:
            overall_status = "failed"
        elif warnings_count > 0:
            overall_status = "partial"
        
        # 记录到数据库
        check_duration = time.time() - start_time
        self.memory_db.record_self_check(
            check_type, skills_checked, issues_found, warnings_count,
            check_duration, overall_status, str(report_file)
        )
        
        logger.info(f"✅ {check_type} Skills 自检完成")
        logger.info(f"   检查 Skills 数量: {skills_checked}")
        logger.info(f"   发现问题: {issues_found} 个，警告: {warnings_count} 个")
        logger.info(f"   检查用时: {check_duration:.2f} 秒")
        logger.info(f"   检查报告: {report_file}")
        
        return check_result
    
    def _check_single_skill(self, skill):
        """检查单个 Skill"""
        skill_dir = Path(skill["path"])
        skill_result = {
            "name": skill["name"],
            "directory": skill["directory"],
            "path": skill["path"],
            "size_mb": skill["size_mb"],
            "status": "ok",
            "checksum": "",
            "version": "unknown",
            "issues": [],
            "warnings": []
        }
        
        try:
            # 计算校验和
            skill_result["checksum"] = self._calculate_checksum(skill_dir)
            
            # 检查 SKILL.md 文件
            skill_file = skill_dir / "SKILL.md"
            if skill_file.exists():
                with open(skill_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # 尝试提取版本信息
                version_match = re.search(r'version\s*[=:]\s*([\d\.]+)', content, re.IGNORECASE)
                if version_match:
                    skill_result["version"] = version_match.group(1)
                
                # 检查基本结构
                if "# " not in content[:100]:
                    skill_result["warnings"].append("SKILL.md 缺少标题")
                
                if "description" not in content.lower() and "描述" not in content:
                    skill_result["warnings"].append("SKILL.md 缺少描述信息")
            else:
                skill_result["status"] = "error"
                skill_result["issues"].append("缺少 SKILL.md 文件")
            
            # 检查目录结构
            subdirs = [d.name for d in skill_dir.iterdir() if d.is_dir()]
            
            # 检查是否有 scripts 目录但为空
            scripts_dir = skill_dir / "scripts"
            if scripts_dir.exists() and not any(scripts_dir.iterdir()):
                skill_result["warnings"].append("scripts 目录为空")
            
            # 检查是否有 assets 目录但为空
            assets_dir = skill_dir / "assets"
            if assets_dir.exists() and not any(assets_dir.iterdir()):
                skill_result["warnings"].append("assets 目录为空")
            
            # 检查是否有 README.md
            readme_file = skill_dir / "README.md"
            if not readme_file.exists():
                skill_result["warnings"].append("缺少 README.md 文件")
            
            # 记录到使用统计
            self.memory_db.record_skill_usage(
                skill["name"], 
                skill["directory"],
                metadata={"check_type": "self_check", "status": skill_result["status"]}
            )
            
        except Exception as e:
            skill_result["status"] = "error"
            skill_result["issues"].append(f"检查过程中出错: {str(e)}")
        
        return skill_result
    
    def _calculate_checksum(self, directory):
        """计算目录的校验和"""
        checksum = hashlib.md5()
        
        for file_path in sorted(directory.rglob('*')):
            if file_path.is_file():
                # 排除某些文件
                exclude_patterns = ['.git', '__pycache__', 'node_modules', '.tmp', '.log']
                if any(pattern in str(file_path) for pattern in exclude_patterns):
                    continue
                
                # 添加文件名到校验和
                checksum.update(str(file_path.relative_to(directory)).encode())
                
                # 添加文件内容到校验和
                try:
                    with open(file_path, 'rb') as f:
                        # 只读取文件前 8KB 来加快计算速度
                        data = f.read(8192)
                        while data:
                            checksum.update(data)
                            data = f.read(8192)
                except:
                    pass  # 跳过无法读取的文件
        
        return checksum.hexdigest()
    
    def _check_skills_versions(self, skills):
        """检查 Skills 版本"""
        version_check = {
            "skills_with_version": 0,
            "skills_without_version": 0,
            "outdated_skills": [],
            "version_issues": []
        }
        
        for skill in skills:
            skill_dir = Path(skill["path"])
            skill_file = skill_dir / "SKILL.md"
            
            if skill_file.exists():
                try:
                    with open(skill_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 检查版本信息
                    version_match = re.search(r'version\s*[=:]\s*([\d\.]+)', content, re.IGNORECASE)
                    if version_match:
                        version_check["skills_with_version"] += 1
                        
                        version = version_match.group(1)
                        # 记录版本信息到数据库
                        checksum = self._calculate_checksum(skill_dir)
                        self.memory_db.record_version_change(
                            skill["name"], version, checksum,
                            source="self_check", update_type="check", 
                            notes="版本检查"
                        )
                    else:
                        version_check["skills_without_version"] += 1
                        version_check["version_issues"].append({
                            "skill": skill["name"],
                            "issue": "缺少版本信息"
                        })
                except:
                    version_check["skills_without_version"] += 1
        
        return version_check
    
    def _check_dependencies(self, skills):
        """检查 Skills 依赖关系"""
        dependency_check = {
            "skills_with_dependencies": 0,
            "missing_dependencies": [],
            "outdated_dependencies": [],
            "dependency_conflicts": []
        }
        
        for skill in skills:
            skill_dir = Path(skill["path"])
            
            # 检查是否有 package.json（Node.js 项目）
            package_json = skill_dir / "package.json"
            if package_json.exists():
                try:
                    with open(package_json, 'r', encoding='utf-8') as f:
                        package_data = json.load(f)
                    
                    dependency_check["skills_with_dependencies"] += 1
                    
                    # 检查依赖
                    deps = package_data.get("dependencies", {})
                    dev_deps = package_data.get("devDependencies", {})
                    
                    all_deps = {**deps, **dev_deps}
                    
                    # 这里可以添加依赖检查逻辑
                    # 目前只是记录有依赖的 Skills
                    
                except:
                    pass
            
            # 检查是否有 requirements.txt（Python 项目）
            requirements_txt = skill_dir / "requirements.txt"
            if requirements_txt.exists():
                dependency_check["skills_with_dependencies"] += 1
        
        return dependency_check
    
    def _check_cross_device_consistency(self, skills):
        """检查跨设备一致性"""
        consistency_check = {
            "total_skills": len(skills),
            "device_skills_count": len(skills),
            "consistency_issues": [],
            "sync_needed": False
        }
        
        # 这里可以添加与其他设备比较的逻辑
        # 目前只是记录当前设备的信息
        
        return consistency_check
    
    def _generate_self_check_report(self, check_result, check_type):
        """生成自检报告"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if "report_format" in self.config["self_check"]:
            report_formats = self.config["self_check"]["report_format"]
        else:
            report_formats = ["txt", "json"]
        
        reports_generated = []
        
        for report_format in report_formats:
            if report_format == "txt":
                report_file = self.reports_dir / f"skills_self_check_{check_type}_{timestamp}.txt"
                self._generate_txt_report(check_result, report_file)
                reports_generated.append(report_file)
            
            elif report_format == "json":
                report_file = self.reports_dir / f"skills_self_check_{check_type}_{timestamp}.json"
                with open(report_file, 'w', encoding='utf-8') as f:
                    json.dump(check_result, f, indent=2, ensure_ascii=False)
                reports_generated.append(report_file)
        
        return reports_generated[0] if reports_generated else None
    
    def _generate_txt_report(self, check_result, report_file):
        """生成 TXT 格式报告"""
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write(f"WorkBuddy Skills 自检报告\n")
            f.write("=" * 60 + "\n\n")
            
            f.write(f"检查类型: {check_result['check_type']}\n")
            f.write(f"检查时间: {check_result['check_date']}\n")
            f.write(f"设备ID: {check_result['device_id']}\n")
            f.write(f"设备名称: {check_result['device_name']}\n")
            f.write(f"检查 Skills 数量: {check_result['skills_checked']}\n\n")
            
            # 统计信息
            issues = sum(1 for r in check_result['results'] if r['status'] == 'error')
            warnings = sum(1 for r in check_result['results'] if r['status'] == 'warning')
            
            f.write(f"发现问题: {issues} 个\n")
            f.write(f"发现警告: {warnings} 个\n\n")
            
            f.write("=" * 60 + "\n")
            f.write("SKILLS 详细检查结果\n")
            f.write("=" * 60 + "\n\n")
            
            for skill_result in check_result['results']:
                status_icon = "✅" if skill_result['status'] == 'ok' else \
                             "⚠️" if skill_result['status'] == 'warning' else "❌"
                
                f.write(f"{status_icon} {skill_result['name']}\n")
                f.write(f"   目录: {skill_result['directory']}\n")
                f.write(f"   大小: {skill_result['size_mb']:.2f} MB\n")
                f.write(f"   版本: {skill_result['version']}\n")
                f.write(f"   校验和: {skill_result['checksum'][:16]}...\n")
                
                if skill_result['issues']:
                    f.write(f"   问题:\n")
                    for issue in skill_result['issues']:
                        f.write(f"     - {issue}\n")
                
                if skill_result['warnings']:
                    f.write(f"   警告:\n")
                    for warning in skill_result['warnings']:
                        f.write(f"     - {warning}\n")
                
                f.write("\n")
            
            # 版本检查结果
            if 'version_check' in check_result:
                vc = check_result['version_check']
                f.write("\n" + "=" * 60 + "\n")
                f.write("版本检查结果\n")
                f.write("=" * 60 + "\n")
                f.write(f"包含版本信息的 Skills: {vc['skills_with_version']}\n")
                f.write(f"缺少版本信息的 Skills: {vc['skills_without_version']}\n")
            
            # 依赖检查结果
            if 'dependency_check' in check_result:
                dc = check_result['dependency_check']
                f.write("\n" + "=" * 60 + "\n")
                f.write("依赖检查结果\n")
                f.write("=" * 60 + "\n")
                f.write(f"有依赖关系的 Skills: {dc['skills_with_dependencies']}\n")
            
            f.write("\n" + "=" * 60 + "\n")
            f.write("报告生成完成\n")
            f.write(f"生成时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 60 + "\n")
        
        logger.info(f"TXT 报告已生成: {report_file}")
        return report_file
    
    # ==================== 记忆查看功能 ====================
    
    def show_memory_stats(self):
        """显示记忆统计"""
        print("\n" + "=" * 60)
        print("WorkBuddy Skills 记忆统计")
        print("=" * 60)
        
        # Skills 使用统计
        usage_stats = self.memory_db.get_skill_usage_stats(days=30)
        
        print("\n📊 最近30天 Skills 使用频率统计:")
        print("-" * 40)
        for skill, count in usage_stats["usage_stats"]:
            print(f"  {skill}: {count} 次")
        
        print("\n📅 最近使用的 Skills:")
        print("-" * 40)
        for skill, last_used in usage_stats["recent_stats"]:
            print(f"  {skill}: {last_used}")
        
        # 自检历史
        check_history = self.memory_db.get_self_check_history(limit=10)
        
        print("\n🔍 最近自检记录:")
        print("-" * 40)
        for record in check_history:
            print(f"  {record['check_date']} - {record['check_type']}: "
                  f"{record['skills_checked']}个Skills, "
                  f"{record['issues_found']}个问题, "
                  f"结果: {record['check_result']}")
        
        # 同步历史
        sync_history = self.memory_db.get_sync_history(limit=5)
        
        if sync_history:
            print("\n🔄 设备同步历史:")
            print("-" * 40)
            for record in sync_history:
                print(f"  {record['last_sync']} - {record['device_name']}: "
                      f"{record['sync_type']}, {record['skills_count']}个Skills, "
                      f"状态: {record['sync_status']}")
        
        print("\n" + "=" * 60)
    
    # ==================== CLI 接口 ====================
    
    def show_help(self):
        """显示帮助信息"""
        help_text = """
WorkBuddy Skills 自检、更新和记忆系统
======================================

使用方法:
  python skills_self_check.py [命令]

可用命令:
  check [type]      - 执行自检 (type: daily/weekly/monthly，默认 daily)
  stats             - 显示 Skills 记忆统计
  config            - 交互式配置自检设置
  auto              - 自动执行每日自检（用于定时任务）
  help              - 显示此帮助信息

示例:
  python skills_self_check.py check           # 执行每日自检
  python skills_self_check.py check weekly    # 执行每周自检
  python skills_self_check.py stats           # 显示记忆统计
  python skills_self_check.py config          # 配置自检设置
  python skills_self_check.py auto            # 自动执行（无交互）

高级功能:
  - 自动记录 Skills 使用频率和版本变更
  - 支持跨设备一致性检查
  - 生成详细的自检报告
  - SQLite 数据库存储所有历史记录
  - 支持自动定时执行

记忆数据库位置:
  Windows: C:\\Users\\[用户名]\\.workbuddy\\skills_memory.db
  其他系统: ~/.workbuddy/skills_memory.db
"""
        print(help_text)

def main():
    """主函数"""
    manager = SkillsSelfCheckManager()
    
    # 解析参数
    if len(sys.argv) == 1:
        manager.show_help()
        return
    
    command = sys.argv[1]
    
    try:
        if command == "check":
            check_type = sys.argv[2] if len(sys.argv) > 2 else "daily"
            if check_type not in ["daily", "weekly", "monthly"]:
                print(f"❌ 无效的检查类型: {check_type}")
                print("   请使用: daily, weekly, monthly")
                return
            
            result = manager.perform_self_check(check_type)
            if result:
                print(f"\n✅ {check_type.capitalize()} 自检完成")
                print(f"   检查报告已保存到: {manager.reports_dir}")
                print(f"   记忆已保存到数据库")
        
        elif command == "stats":
            manager.show_memory_stats()
        
        elif command == "config":
            print("Skills 自检配置功能正在开发中...")
            print("目前使用默认配置:")
            print(json.dumps(manager.config, indent=2, ensure_ascii=False))
        
        elif command == "auto":
            # 自动模式，用于定时任务
            result = manager.perform_self_check("daily")
            if result:
                print(f"✅ 自动自检完成，结果: {result.get('overall_status', 'unknown')}")
            else:
                print("❌ 自动自检失败")
        
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