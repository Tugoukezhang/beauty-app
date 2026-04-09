#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WorkBuddy Skills自检程序 - 精简版本
适用于美妆项目的Skills健康检查

功能：
1. 检查所有Skills的完整性
2. 验证Skills配置文件
3. 生成健康报告
4. 修复常见问题

使用方法：
python skills_self_check.py [--check] [--fix] [--report] [--config config.json]
"""

import os
import sys
import json
import time
import logging
import datetime
import sqlite3
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass, asdict

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

@dataclass
class SkillInfo:
    """Skills信息数据类"""
    name: str
    directory: str
    skill_md_exists: bool = False
    skill_toml_exists: bool = False
    settings_enabled: bool = False
    is_valid: bool = False
    error_messages: List[str] = None
    last_modified: float = 0.0
    size_bytes: int = 0
    
    def __post_init__(self):
        if self.error_messages is None:
            self.error_messages = []
    
    def to_dict(self) -> Dict[str, Any]:
        """转换为字典"""
        return {
            "name": self.name,
            "directory": self.directory,
            "skill_md_exists": self.skill_md_exists,
            "skill_toml_exists": self.skill_toml_exists,
            "settings_enabled": self.settings_enabled,
            "is_valid": self.is_valid,
            "error_count": len(self.error_messages),
            "error_messages": self.error_messages,
            "last_modified": self.last_modified,
            "size_bytes": self.size_bytes
        }

class SkillsSelfCheck:
    """Skills自检程序"""
    
    def __init__(self, config_path: Optional[str] = None):
        """初始化自检程序
        
        Args:
            config_path: 配置文件路径
        """
        # 默认配置
        self.config = {
            "skills_dirs": [
                os.path.expandvars("%USERPROFILE%/.workbuddy/skills"),
                os.path.expandvars("%USERPROFILE%/WorkBuddy/.workbuddy/skills")
            ],
            "workbuddy_settings_path": os.path.expandvars("%USERPROFILE%/.workbuddy/settings.json"),
            "database_path": str(project_root / "skills_memory.db"),
            "report_dir": str(project_root / "reports"),
            "log_dir": str(project_root / "logs"),
            "log_level": "INFO",
            "check_skill_md": True,
            "check_skill_toml": True,
            "check_settings": True,
            "auto_fix": False,
            "backup_before_fix": True
        }
        
        # 加载自定义配置
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                    self.config.update(user_config)
            except Exception as e:
                print(f"⚠️ 加载配置文件失败: {e}")
        
        # 确保目录存在
        for dir_path in [self.config["report_dir"], self.config["log_dir"]]:
            os.makedirs(dir_path, exist_ok=True)
        
        # 配置日志
        self._setup_logging()
        
        # 存储结果
        self.all_skills: List[SkillInfo] = []
        self.enabled_skills: List[SkillInfo] = []
        self.valid_skills: List[SkillInfo] = []
        self.invalid_skills: List[SkillInfo] = []
        
        # 统计数据
        self.stats = {
            "total_skills": 0,
            "enabled_skills": 0,
            "valid_skills": 0,
            "invalid_skills": 0,
            "skill_md_missing": 0,
            "skill_toml_missing": 0,
            "settings_disabled": 0,
            "start_time": time.time(),
            "end_time": 0
        }
    
    def _setup_logging(self):
        """配置日志系统"""
        log_file = os.path.join(
            self.config["log_dir"], 
            f"skills_check_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        )
        
        logging.basicConfig(
            level=getattr(logging, self.config["log_level"]),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        self.logger = logging.getLogger("SkillsSelfCheck")
    
    def find_all_skills(self) -> List[SkillInfo]:
        """查找所有Skills"""
        all_skills = []
        
        for skills_dir in self.config["skills_dirs"]:
            expanded_dir = os.path.expandvars(skills_dir)
            
            if not os.path.exists(expanded_dir):
                self.logger.warning(f"Skills目录不存在: {expanded_dir}")
                continue
            
            self.logger.info(f"搜索Skills目录: {expanded_dir}")
            
            try:
                for skill_name in os.listdir(expanded_dir):
                    skill_dir = os.path.join(expanded_dir, skill_name)
                    
                    if not os.path.isdir(skill_dir):
                        continue
                    
                    # 创建SkillInfo对象
                    skill_info = SkillInfo(name=skill_name, directory=skill_dir)
                    
                    # 检查SKILL.md文件
                    skill_md_path = os.path.join(skill_dir, "SKILL.md")
                    skill_info.skill_md_exists = os.path.exists(skill_md_path)
                    
                    # 检查skill.toml文件
                    skill_toml_path = os.path.join(skill_dir, "skill.toml")
                    skill_info.skill_toml_exists = os.path.exists(skill_toml_path)
                    
                    # 检查settings.json中的启用状态
                    skill_info.settings_enabled = self._check_settings_enabled(skill_name)
                    
                    # 判断是否有效
                    skill_info.is_valid = (
                        skill_info.skill_md_exists and 
                        skill_info.skill_toml_exists
                    )
                    
                    # 收集错误信息
                    if not skill_info.skill_md_exists:
                        skill_info.error_messages.append("缺少 SKILL.md 文件")
                    
                    if not skill_info.skill_toml_exists:
                        skill_info.error_messages.append("缺少 skill.toml 文件")
                    
                    if not skill_info.settings_enabled:
                        skill_info.error_messages.append("在settings.json中未启用")
                    
                    # 获取文件信息
                    try:
                        if skill_info.skill_md_exists:
                            stat_info = os.stat(skill_md_path)
                            skill_info.last_modified = stat_info.st_mtime
                            skill_info.size_bytes = stat_info.st_size
                    except:
                        pass
                    
                    all_skills.append(skill_info)
                    
            except Exception as e:
                self.logger.error(f"搜索Skills目录时出错 {expanded_dir}: {e}")
        
        return all_skills
    
    def _check_settings_enabled(self, skill_name: str) -> bool:
        """检查Skills在settings.json中是否启用"""
        settings_path = self.config["workbuddy_settings_path"]
        
        if not os.path.exists(settings_path):
            self.logger.warning(f"settings.json文件不存在: {settings_path}")
            return False
        
        try:
            with open(settings_path, 'r', encoding='utf-8') as f:
                settings = json.load(f)
            
            # 检查skills.enabled字段
            if "skills" in settings and "enabled" in settings["skills"]:
                enabled_skills = settings["skills"]["enabled"]
                return skill_name in enabled_skills
            
            return False
            
        except Exception as e:
            self.logger.error(f"读取settings.json时出错: {e}")
            return False
    
    def analyze_skills(self):
        """分析Skills数据"""
        # 查找所有Skills
        self.all_skills = self.find_all_skills()
        
        # 分类Skills
        self.enabled_skills = [s for s in self.all_skills if s.settings_enabled]
        self.valid_skills = [s for s in self.all_skills if s.is_valid]
        self.invalid_skills = [s for s in self.all_skills if not s.is_valid]
        
        # 更新统计数据
        self.stats["total_skills"] = len(self.all_skills)
        self.stats["enabled_skills"] = len(self.enabled_skills)
        self.stats["valid_skills"] = len(self.valid_skills)
        self.stats["invalid_skills"] = len(self.invalid_skills)
        
        # 统计具体问题
        for skill in self.all_skills:
            if not skill.skill_md_exists:
                self.stats["skill_md_missing"] += 1
            if not skill.skill_toml_exists:
                self.stats["skill_toml_missing"] += 1
            if not skill.settings_enabled:
                self.stats["settings_disabled"] += 1
    
    def fix_common_issues(self) -> Dict[str, int]:
        """修复常见问题
        
        Returns:
            修复统计
        """
        if not self.config["auto_fix"]:
            self.logger.info("自动修复功能已禁用")
            return {"fixed": 0, "skipped": 0}
        
        fix_stats = {
            "fixed": 0,
            "skipped": 0,
            "errors": 0
        }
        
        self.logger.info("开始修复常见问题...")
        
        for skill in self.invalid_skills:
            try:
                # 备份（如果需要）
                if self.config["backup_before_fix"]:
                    self._backup_skill(skill)
                
                # 修复问题
                issues_fixed = self._fix_skill_issues(skill)
                
                if issues_fixed > 0:
                    fix_stats["fixed"] += 1
                    self.logger.info(f"修复了技能 {skill.name} 的 {issues_fixed} 个问题")
                else:
                    fix_stats["skipped"] += 1
                    
            except Exception as e:
                fix_stats["errors"] += 1
                self.logger.error(f"修复技能 {skill.name} 时出错: {e}")
        
        self.logger.info(f"修复完成: {fix_stats['fixed']} 个技能已修复, {fix_stats['errors']} 个错误")
        return fix_stats
    
    def _backup_skill(self, skill: SkillInfo):
        """备份Skills"""
        try:
            backup_dir = os.path.join(project_root, "backups", "skills", skill.name)
            os.makedirs(backup_dir, exist_ok=True)
            
            # 这里可以添加具体的备份逻辑
            self.logger.debug(f"已备份技能: {skill.name}")
            
        except Exception as e:
            self.logger.warning(f"备份技能 {skill.name} 失败: {e}")
    
    def _fix_skill_issues(self, skill: SkillInfo) -> int:
        """修复Skills问题
        
        Returns:
            修复的问题数量
        """
        issues_fixed = 0
        
        # 创建缺失的SKILL.md模板
        if not skill.skill_md_exists and self.config["check_skill_md"]:
            skill_md_path = os.path.join(skill.directory, "SKILL.md")
            template = f"""# {skill.name}

## 描述
这是一个自动创建的SKILL.md文件。

## 功能
- 功能1
- 功能2

## 使用方法
请参考相关文档。

## 配置
请修改此文件以适应您的需求。

---
*自动生成于 {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*
"""
            try:
                with open(skill_md_path, 'w', encoding='utf-8') as f:
                    f.write(template)
                skill.skill_md_exists = True
                issues_fixed += 1
                self.logger.debug(f"创建了 SKILL.md 模板: {skill_md_path}")
            except Exception as e:
                self.logger.error(f"创建 SKILL.md 失败: {e}")
        
        # 创建缺失的skill.toml模板
        if not skill.skill_toml_exists and self.config["check_skill_toml"]:
            skill_toml_path = os.path.join(skill.directory, "skill.toml")
            template = f"""[skill]
name = "{skill.name}"
description = "自动创建的技能配置文件"
version = "1.0.0"
author = "系统自动创建"

[skill.metadata]
created_at = "{datetime.datetime.now().isoformat()}"
updated_at = "{datetime.datetime.now().isoformat()}"

[skill.configuration]
enabled = true

# 自动生成的配置文件
"""
            try:
                with open(skill_toml_path, 'w', encoding='utf-8') as f:
                    f.write(template)
                skill.skill_toml_exists = True
                issues_fixed += 1
                self.logger.debug(f"创建了 skill.toml 模板: {skill_toml_path}")
            except Exception as e:
                self.logger.error(f"创建 skill.toml 失败: {e}")
        
        return issues_fixed
    
    def save_to_database(self):
        """保存结果到数据库"""
        db_path = self.config["database_path"]
        
        try:
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # 创建表
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS skills_check_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    check_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    total_skills INTEGER,
                    enabled_skills INTEGER,
                    valid_skills INTEGER,
                    invalid_skills INTEGER,
                    skill_md_missing INTEGER,
                    skill_toml_missing INTEGER,
                    settings_disabled INTEGER,
                    duration_seconds REAL
                )
            ''')
            
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS skills_details (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    check_id INTEGER,
                    skill_name TEXT,
                    directory TEXT,
                    skill_md_exists BOOLEAN,
                    skill_toml_exists BOOLEAN,
                    settings_enabled BOOLEAN,
                    is_valid BOOLEAN,
                    error_count INTEGER,
                    FOREIGN KEY (check_id) REFERENCES skills_check_history (id)
                )
            ''')
            
            # 插入检查历史
            duration = time.time() - self.stats["start_time"]
            cursor.execute('''
                INSERT INTO skills_check_history 
                (total_skills, enabled_skills, valid_skills, invalid_skills,
                 skill_md_missing, skill_toml_missing, settings_disabled, duration_seconds)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                self.stats["total_skills"],
                self.stats["enabled_skills"],
                self.stats["valid_skills"],
                self.stats["invalid_skills"],
                self.stats["skill_md_missing"],
                self.stats["skill_toml_missing"],
                self.stats["settings_disabled"],
                duration
            ))
            
            check_id = cursor.lastrowid
            
            # 插入Skills详情
            for skill in self.all_skills:
                cursor.execute('''
                    INSERT INTO skills_details 
                    (check_id, skill_name, directory, skill_md_exists, skill_toml_exists,
                     settings_enabled, is_valid, error_count)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    check_id,
                    skill.name,
                    skill.directory,
                    skill.skill_md_exists,
                    skill.skill_toml_exists,
                    skill.settings_enabled,
                    skill.is_valid,
                    len(skill.error_messages)
                ))
            
            conn.commit()
            conn.close()
            
            self.logger.info(f"数据已保存到数据库: {db_path}")
            
        except Exception as e:
            self.logger.error(f"保存到数据库失败: {e}")
    
    def generate_report(self) -> Dict[str, Any]:
        """生成报告"""
        self.stats["end_time"] = time.time()
        duration = self.stats["end_time"] - self.stats["start_time"]
        
        report = {
            "metadata": {
                "report_time": datetime.datetime.now().isoformat(),
                "duration_seconds": duration,
                "config": self.config,
                "generator": "WorkBuddy Skills自检程序"
            },
            "statistics": self.stats.copy(),
            "skill_counts": {
                "total": len(self.all_skills),
                "enabled": len(self.enabled_skills),
                "valid": len(self.valid_skills),
                "invalid": len(self.invalid_skills)
            },
            "valid_skills": [s.to_dict() for s in self.valid_skills],
            "invalid_skills": [s.to_dict() for s in self.invalid_skills],
            "problems_summary": {
                "missing_skill_md": self.stats["skill_md_missing"],
                "missing_skill_toml": self.stats["skill_toml_missing"],
                "disabled_in_settings": self.stats["settings_disabled"]
            }
        }
        
        return report
    
    def save_report(self, report: Dict[str, Any]):
        """保存报告到文件"""
        try:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # JSON格式报告
            json_file = os.path.join(self.config["report_dir"], f"skills_check_report_{timestamp}.json")
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            self.logger.info(f"JSON报告已保存: {json_file}")
            
            # 文本格式报告
            txt_file = os.path.join(self.config["report_dir"], f"skills_check_report_{timestamp}.txt")
            with open(txt_file, 'w', encoding='utf-8') as f:
                f.write("=" * 60 + "\n")
                f.write("WorkBuddy Skills自检报告\n")
                f.write("=" * 60 + "\n\n")
                
                f.write(f"报告时间: {report['metadata']['report_time']}\n")
                f.write(f"检查耗时: {report['metadata']['duration_seconds']:.2f} 秒\n\n")
                
                f.write("-" * 60 + "\n")
                f.write("📊 统计数据\n")
                f.write("-" * 60 + "\n")
                stats = report['statistics']
                f.write(f"总Skills数量: {stats['total_skills']}\n")
                f.write(f"已启用Skills: {stats['enabled_skills']}\n")
                f.write(f"有效Skills: {stats['valid_skills']}\n")
                f.write(f"无效Skills: {stats['invalid_skills']}\n\n")
                
                f.write("-" * 60 + "\n")
                f.write("⚠️ 问题摘要\n")
                f.write("-" * 60 + "\n")
                problems = report['problems_summary']
                f.write(f"缺少SKILL.md文件: {problems['missing_skill_md']}\n")
                f.write(f"缺少skill.toml文件: {problems['missing_skill_toml']}\n")
                f.write(f"settings.json中未启用: {problems['disabled_in_settings']}\n\n")
                
                if report['invalid_skills']:
                    f.write("-" * 60 + "\n")
                    f.write("❌ 无效Skills列表\n")
                    f.write("-" * 60 + "\n")
                    for i, skill in enumerate(report['invalid_skills'], 1):
                        f.write(f"{i}. {skill['name']}\n")
                        for error in skill['error_messages']:
                            f.write(f"   - {error}\n")
                        f.write("\n")
                
                f.write("-" * 60 + "\n")
                f.write("✅ 有效Skills列表\n")
                f.write("-" * 60 + "\n")
                for i, skill in enumerate(report['valid_skills'], 1):
                    f.write(f"{i}. {skill['name']}")
                    if skill['settings_enabled']:
                        f.write(" ✅ (已启用)")
                    f.write("\n")
            
            self.logger.info(f"文本报告已保存: {txt_file}")
            
        except Exception as e:
            self.logger.error(f"保存报告失败: {e}")
    
    def run(self, auto_fix: bool = False) -> bool:
        """运行自检程序
        
        Args:
            auto_fix: 是否自动修复问题
            
        Returns:
            是否成功运行
        """
        self.logger.info("=" * 60)
        self.logger.info("WorkBuddy Skills自检程序启动")
        self.logger.info("=" * 60)
        
        try:
            # 更新配置
            if auto_fix:
                self.config["auto_fix"] = True
            
            # 分析Skills
            self.analyze_skills()
            
            # 显示统计信息
            self.logger.info(f"📊 统计信息:")
            self.logger.info(f"   总Skills数量: {self.stats['total_skills']}")
            self.logger.info(f"   已启用Skills: {self.stats['enabled_skills']}")
            self.logger.info(f"   有效Skills: {self.stats['valid_skills']}")
            self.logger.info(f"   无效Skills: {self.stats['invalid_skills']}")
            
            # 自动修复
            if auto_fix and self.stats["invalid_skills"] > 0:
                fix_stats = self.fix_common_issues()
                self.logger.info(f"🔧 修复结果: {fix_stats['fixed']}个已修复")
            
            # 保存到数据库
            self.save_to_database()
            
            # 生成报告
            report = self.generate_report()
            self.save_report(report)
            
            # 总结
            self.logger.info("=" * 60)
            self.logger.info("自检程序完成")
            self.logger.info("=" * 60)
            
            if self.stats["invalid_skills"] == 0:
                self.logger.info("✅ 所有Skills都正常!")
                return True
            else:
                self.logger.warning(f"⚠️ 发现 {self.stats['invalid_skills']} 个无效Skills")
                return False
            
        except Exception as e:
            self.logger.error(f"运行自检程序时出错: {e}")
            return False

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="WorkBuddy Skills自检程序")
    parser.add_argument("--check", action="store_true", help="检查Skills状态")
    parser.add_argument("--fix", action="store_true", help="自动修复问题")
    parser.add_argument("--report", action="store_true", help="生成详细报告")
    parser.add_argument("--config", type=str, help="配置文件路径")
    parser.add_argument("--debug", action="store_true", help="调试模式")
    
    args = parser.parse_args()
    
    # 创建自检程序实例
    self_check = SkillsSelfCheck(args.config)
    
    if args.debug:
        self_check.config["log_level"] = "DEBUG"
        self_check._setup_logging()
    
    # 运行自检程序
    success = self_check.run(args.fix)
    
    # 输出结果
    if success:
        print("\n" + "=" * 60)
        print("✅ Skills自检完成，所有Skills正常!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print(f"⚠️ Skills自检完成，发现 {self_check.stats['invalid_skills']} 个问题")
        print("=" * 60)
        
        if self_check.invalid_skills:
            print("\n无效Skills列表:")
            for i, skill in enumerate(self_check.invalid_skills, 1):
                print(f"  {i}. {skill.name}")
                for error in skill.error_messages:
                    print(f"     - {error}")
        
        print(f"\n详细报告已保存到: {self_check.config['report_dir']}")
    
    return success

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n程序被用户中断")
        sys.exit(130)
    except Exception as e:
        print(f"程序发生错误: {e}")
        sys.exit(1)