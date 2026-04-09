#!/usr/bin/env python3
"""
Skills 搜索和管理系统
用于从GitHub和WorkBuddy Skillshub搜索并更新前端和后端相关skills
"""

import os
import sys
import json
import shutil
import subprocess
import time
from datetime import datetime
from pathlib import Path
import hashlib
import sqlite3

# 配置
WORKBUDDY_HOME = Path.home() / ".workbuddy"
SKILLS_DIR = WORKBUDDY_HOME / "skills"
MARKETPLACE_DIR = WORKBUDDY_HOME / "skills-marketplace" / "skills"
MEMORY_DB = WORKBUDDY_HOME / "skills_search_memory.db"

class SkillsSearchManager:
    """Skills搜索和管理器"""
    
    def __init__(self):
        self.setup_database()
        
    def setup_database(self):
        """设置数据库"""
        conn = sqlite3.connect(str(MEMORY_DB))
        cursor = conn.cursor()
        
        # 创建搜索历史表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS search_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                query TEXT NOT NULL,
                source TEXT NOT NULL,
                results TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 创建技能安装表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS installed_skills (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_name TEXT NOT NULL,
                source TEXT NOT NULL,
                version TEXT,
                installed_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                last_checked DATETIME,
                update_available BOOLEAN DEFAULT 0
            )
        ''')
        
        # 创建技能分类表
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS skill_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                skill_name TEXT NOT NULL,
                category TEXT NOT NULL,
                subcategory TEXT,
                UNIQUE(skill_name, category)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def get_installed_skills(self):
        """获取已安装的skills列表"""
        installed = []
        if SKILLS_DIR.exists():
            for item in SKILLS_DIR.iterdir():
                if item.is_dir():
                    skill_info = {
                        'name': item.name,
                        'path': str(item),
                        'has_skill_md': (item / "SKILL.md").exists(),
                        'has_skill_toml': (item / "skill.toml").exists()
                    }
                    installed.append(skill_info)
        return installed
    
    def get_marketplace_skills(self):
        """获取marketplace中的skills"""
        marketplace = []
        if MARKETPLACE_DIR.exists():
            for item in MARKETPLACE_DIR.iterdir():
                if item.is_dir():
                    skill_info = {
                        'name': item.name,
                        'path': str(item),
                        'has_skill_md': (item / "SKILL.md").exists(),
                        'has_skill_toml': (item / "skill.toml").exists()
                    }
                    marketplace.append(skill_info)
        return marketplace
    
    def categorize_skill(self, skill_name):
        """对skill进行分类"""
        skill_name_lower = skill_name.lower()
        
        # 前端相关
        if any(keyword in skill_name_lower for keyword in ['frontend', 'ui', 'ux', 'design', 'canvas', 'react', 'vue', 'angular']):
            return 'frontend', 'ui_design' if 'design' in skill_name_lower else 'framework'
        
        # 后端相关
        elif any(keyword in skill_name_lower for keyword in ['backend', 'fullstack', 'api', 'cloud', 'database', 'server', 'node', 'python', 'java', 'go']):
            return 'backend', 'cloud' if 'cloud' in skill_name_lower else 'framework'
        
        # 移动端
        elif any(keyword in skill_name_lower for keyword in ['android', 'ios', 'mobile', 'flutter', 'react-native']):
            return 'mobile', 'native' if 'native' in skill_name_lower else 'cross_platform'
        
        # 小程序/特定平台
        elif any(keyword in skill_name_lower for keyword in ['miniprogram', 'wechat', 'tdesign', 'skyline']):
            return 'platform', 'miniprogram'
        
        # 工具类
        elif any(keyword in skill_name_lower for keyword in ['tool', 'creator', 'manager', 'skill-creator', 'find-skills']):
            return 'tools', 'development'
        
        # 其他
        else:
            return 'other', 'general'
    
    def install_from_marketplace(self, skill_name):
        """从marketplace安装skill"""
        source_path = MARKETPLACE_DIR / skill_name
        dest_path = SKILLS_DIR / skill_name
        
        if not source_path.exists():
            print(f"[ERROR] Skill not found in marketplace: {skill_name}")
            return False
        
        if dest_path.exists():
            # 检查是否需要更新
            source_mtime = os.path.getmtime(str(source_path))
            dest_mtime = os.path.getmtime(str(dest_path))
            
            if source_mtime <= dest_mtime:
                print(f"[OK] Skill already up-to-date: {skill_name}")
                return True
            
            print(f"[UPDATE] Updating skill: {skill_name}")
            shutil.rmtree(str(dest_path))
        
        try:
            # 复制skill
            shutil.copytree(str(source_path), str(dest_path))
            
            # 记录到数据库
            category, subcategory = self.categorize_skill(skill_name)
            self.record_skill_installation(skill_name, 'marketplace', category, subcategory)
            
            print(f"[OK] Installed skill: {skill_name}")
            return True
        except Exception as e:
            print(f"[ERROR] Failed to install skill {skill_name}: {e}")
            return False
    
    def record_skill_installation(self, skill_name, source, category, subcategory):
        """记录技能安装"""
        conn = sqlite3.connect(str(MEMORY_DB))
        cursor = conn.cursor()
        
        # 检查是否已存在
        cursor.execute(
            "SELECT id FROM installed_skills WHERE skill_name = ?",
            (skill_name,)
        )
        exists = cursor.fetchone()
        
        if exists:
            # 更新
            cursor.execute(
                "UPDATE installed_skills SET last_checked = CURRENT_TIMESTAMP, source = ? WHERE skill_name = ?",
                (source, skill_name)
            )
        else:
            # 插入新记录
            cursor.execute(
                "INSERT INTO installed_skills (skill_name, source) VALUES (?, ?)",
                (skill_name, source)
            )
        
        # 记录分类
        cursor.execute(
            "INSERT OR REPLACE INTO skill_categories (skill_name, category, subcategory) VALUES (?, ?, ?)",
            (skill_name, category, subcategory)
        )
        
        conn.commit()
        conn.close()
    
    def search_marketplace(self, query):
        """在marketplace中搜索skills"""
        results = []
        for item in self.get_marketplace_skills():
            if query.lower() in item['name'].lower():
                # 分类
                category, subcategory = self.categorize_skill(item['name'])
                item['category'] = category
                item['subcategory'] = subcategory
                results.append(item)
        return results
    
    def update_all_skills(self):
        """更新所有已安装的skills"""
        installed = self.get_installed_skills()
        marketplace = self.get_marketplace_skills()
        
        marketplace_names = {skill['name'] for skill in marketplace}
        installed_names = {skill['name'] for skill in installed}
        
        print(f"[STATS] Found {len(installed)} installed skills and {len(marketplace)} marketplace skills")
        
        # 检查更新
        for skill in installed:
            if skill['name'] in marketplace_names:
                self.install_from_marketplace(skill['name'])
        
        # 安装新的前端/后端相关skills
        frontend_keywords = ['frontend', 'ui', 'ux', 'design', 'canvas', 'react', 'vue']
        backend_keywords = ['backend', 'fullstack', 'cloud', 'api', 'database', 'server']
        
        print("\n[SEARCH] Looking for new frontend skills...")
        for skill in marketplace:
            skill_name = skill['name'].lower()
            if any(keyword in skill_name for keyword in frontend_keywords):
                if skill['name'] not in installed_names:
                    print(f"[INSTALL] Installing new frontend skill: {skill['name']}")
                    self.install_from_marketplace(skill['name'])
        
        print("\n[SEARCH] Looking for new backend skills...")
        for skill in marketplace:
            skill_name = skill['name'].lower()
            if any(keyword in skill_name for keyword in backend_keywords):
                if skill['name'] not in installed_names:
                    print(f"[INSTALL] Installing new backend skill: {skill['name']}")
                    self.install_from_marketplace(skill['name'])
    
    def generate_report(self):
        """生成技能报告"""
        conn = sqlite3.connect(str(MEMORY_DB))
        cursor = conn.cursor()
        
        # 统计
        cursor.execute("SELECT COUNT(*) FROM installed_skills")
        total_skills = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT category, COUNT(*) as count 
            FROM skill_categories 
            GROUP BY category 
            ORDER BY count DESC
        """)
        category_stats = cursor.fetchall()
        
        cursor.execute("""
            SELECT skill_name, category, subcategory 
            FROM skill_categories 
            ORDER BY category, subcategory, skill_name
        """)
        skills_by_category = cursor.fetchall()
        
        conn.close()
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'total_skills': total_skills,
            'category_stats': [
                {'category': cat, 'count': cnt} for cat, cnt in category_stats
            ],
            'skills_by_category': [
                {'skill': skill, 'category': cat, 'subcategory': sub} 
                for skill, cat, sub in skills_by_category
            ],
            'installed_skills': self.get_installed_skills(),
            'marketplace_skills': len(self.get_marketplace_skills())
        }
        
        return report
    
    def print_summary(self):
        """打印技能摘要"""
        installed = self.get_installed_skills()
        marketplace = self.get_marketplace_skills()
        
        print("=" * 60)
        print("SKILLS SUMMARY")
        print("=" * 60)
        print(f"Installed skills: {len(installed)}")
        print(f"Available in marketplace: {len(marketplace)}")
        print()
        
        # 分类统计
        categories = {}
        for skill in installed:
            category, subcategory = self.categorize_skill(skill['name'])
            if category not in categories:
                categories[category] = []
            categories[category].append((skill['name'], subcategory))
        
        print("Skills by category:")
        for category, skills in categories.items():
            print(f"\n  {category.upper()}:")
            for skill_name, subcategory in sorted(skills):
                print(f"    - {skill_name} ({subcategory})")
        
        print()
        print("=" * 60)

def main():
    """主函数"""
    manager = SkillsSearchManager()
    
    if len(sys.argv) < 2:
        # 默认操作：更新所有skills
        print("Updating all skills from marketplace...")
        manager.update_all_skills()
        manager.print_summary()
        
        # 生成报告
        report = manager.generate_report()
        report_file = WORKBUDDY_HOME / "skills_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"\nReport saved to: {report_file}")
        return
    
    command = sys.argv[1]
    
    if command == "search":
        # 搜索skills
        query = sys.argv[2] if len(sys.argv) > 2 else ""
        results = manager.search_marketplace(query)
        print(f"[SEARCH] Search results for '{query}':")
        for result in results:
            print(f"  • {result['name']} ({result.get('category', 'unknown')})")
    
    elif command == "install":
        # 安装特定skill
        skill_name = sys.argv[2] if len(sys.argv) > 2 else ""
        if skill_name:
            manager.install_from_marketplace(skill_name)
    
    elif command == "update":
        # 更新所有skills
        manager.update_all_skills()
    
    elif command == "report":
        # 生成报告
        report = manager.generate_report()
        print(json.dumps(report, ensure_ascii=False, indent=2))
    
    elif command == "summary":
        # 显示摘要
        manager.print_summary()
    
    elif command == "categories":
        # 显示分类
        installed = manager.get_installed_skills()
        for skill in installed:
            category, subcategory = manager.categorize_skill(skill['name'])
            print(f"{skill['name']}: {category}/{subcategory}")
    
    else:
        print("Usage:")
        print("  python skills_search_manager.py [command]")
        print()
        print("Commands:")
        print("  search <query>    - Search skills in marketplace")
        print("  install <name>    - Install specific skill")
        print("  update            - Update all installed skills")
        print("  report            - Generate detailed report")
        print("  summary           - Show skills summary")
        print("  categories        - Show skill categories")
        print()
        print("  (no command)      - Update all skills and show summary")

if __name__ == "__main__":
    main()