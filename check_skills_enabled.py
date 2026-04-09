#!/usr/bin/env python3
"""
检查已安装的Skills是否已经在WorkBuddy中启用
"""

import os
import sys
import json
import sqlite3
from pathlib import Path
import subprocess
import winreg  # Windows注册表操作
import re

# 配置
WORKBUDDY_HOME = Path.home() / ".workbuddy"
SKILLS_DIR = WORKBUDDY_HOME / "skills"
CONFIG_DIR = WORKBUDDY_HOME / "config"

class SkillsEnableChecker:
    """Skills启用状态检查器"""
    
    def __init__(self):
        self.skills_enabled = []
        self.skills_disabled = []
        self.skills_not_found = []
        
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
                        'has_skill_toml': (item / "skill.toml").exists(),
                        'enabled': False  # 默认未启用
                    }
                    installed.append(skill_info)
        return installed
    
    def check_workbuddy_config(self):
        """检查WorkBuddy配置文件中是否启用了skills"""
        config_files = []
        
        # 查找可能的配置文件
        config_paths = [
            WORKBUDDY_HOME / "config.json",
            WORKBUDDY_HOME / "settings.json",
            WORKBUDDY_HOME / "workbuddy.json",
            Path(os.getenv('APPDATA', '')) / "Tencent" / "WorkBuddy" / "config.json",
            Path(os.getenv('LOCALAPPDATA', '')) / "Tencent" / "WorkBuddy" / "config.json"
        ]
        
        for config_path in config_paths:
            if config_path.exists():
                config_files.append(config_path)
        
        return config_files
    
    def parse_skill_name(self, skill_folder_name):
        """从文件夹名解析skill名称"""
        # 移除可能的版本号和后缀
        name = skill_folder_name
        
        # 处理中文名
        if any('\u4e00' <= c <= '\u9fff' for c in name):
            return name
        
        # 处理带连字符的名称
        if '-' in name:
            # 将连字符转换为空格，但保留某些特定格式
            if name in ['mcp-builder', 'skill-creator', 'find-skills']:
                return name
            else:
                return name.replace('-', ' ')
        
        return name
    
    def check_windows_registry(self):
        """检查Windows注册表中的WorkBuddy配置"""
        try:
            # WorkBuddy可能存储在注册表中
            registry_paths = [
                r"SOFTWARE\Tencent\WorkBuddy",
                r"SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\WorkBuddy",
                r"SOFTWARE\WOW6432Node\Tencent\WorkBuddy"
            ]
            
            for path in registry_paths:
                try:
                    key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, path, 0, winreg.KEY_READ)
                    print(f"找到注册表项: {path}")
                    winreg.CloseKey(key)
                except WindowsError:
                    continue
                    
        except Exception as e:
            print(f"检查注册表时出错: {e}")
    
    def check_skill_enablement(self, skill_info):
        """检查单个skill是否已启用"""
        skill_name = skill_info['name']
        parsed_name = self.parse_skill_name(skill_name)
        
        # 方法1：检查skill目录中的配置文件
        skill_config_path = SKILLS_DIR / skill_name / "skill.toml"
        if skill_config_path.exists():
            # 有skill.toml文件，说明是标准格式
            return self.check_toml_enablement(skill_config_path, skill_name)
        
        # 方法2：检查SKILL.md文件
        skill_md_path = SKILLS_DIR / skill_name / "SKILL.md"
        if skill_md_path.exists():
            return self.check_md_enablement(skill_md_path, skill_name)
        
        # 方法3：检查是否有其他启用标记
        return self.check_other_indicators(skill_info)
    
    def check_toml_enablement(self, toml_path, skill_name):
        """检查TOML文件中的启用状态"""
        try:
            with open(toml_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 简单检查是否包含启用相关字段
            if 'enabled' in content.lower() or 'active' in content.lower():
                # 进一步解析具体值
                lines = content.split('\n')
                for line in lines:
                    if 'enabled' in line.lower() or 'active' in line.lower():
                        if 'true' in line.lower() or 'yes' in line.lower() or '1' in line:
                            return True
                        elif 'false' in line.lower() or 'no' in line.lower() or '0' in line:
                            return False
                return True  # 如果提到但没有明确false，假设启用
            return True  # 有skill.toml文件通常意味着已启用
        except Exception as e:
            print(f"解析TOML文件 {toml_path} 时出错: {e}")
            return False
    
    def check_md_enablement(self, md_path, skill_name):
        """检查SKILL.md文件中的启用状态"""
        try:
            with open(md_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # 检查常见启用标记
            if 'disabled' in content.lower() or '未启用' in content or '未激活' in content:
                return False
            
            # 检查是否包含启用说明
            if 'enabled' in content.lower() or '启用' in content or '激活' in content:
                return True
            
            # 默认：有SKILL.md文件通常意味着已启用
            return True
        except Exception as e:
            print(f"读取SKILL.md文件 {md_path} 时出错: {e}")
            return False
    
    def check_other_indicators(self, skill_info):
        """检查其他启用指示器"""
        skill_path = Path(skill_info['path'])
        
        # 检查是否有脚本文件
        scripts_dir = skill_path / "scripts"
        if scripts_dir.exists():
            # 有scripts目录，通常意味着已启用
            return True
        
        # 检查是否有配置文件
        config_files = list(skill_path.glob("*.json")) + list(skill_path.glob("*.yaml")) + list(skill_path.glob("*.toml"))
        if config_files:
            return True
        
        # 默认情况
        return False
    
    def check_all_skills(self):
        """检查所有skills的启用状态"""
        installed_skills = self.get_installed_skills()
        total_skills = len(installed_skills)
        
        print(f"找到 {total_skills} 个已安装的skills")
        print("=" * 80)
        
        for i, skill in enumerate(installed_skills, 1):
            skill_name = skill['name']
            print(f"{i:3d}. 检查: {skill_name}")
            
            # 检查启用状态
            is_enabled = self.check_skill_enablement(skill)
            
            if is_enabled:
                self.skills_enabled.append(skill_name)
                print(f"    状态: [已启用]")
            else:
                self.skills_disabled.append(skill_name)
                print(f"    状态: [未启用]")
            
            # 显示详细信息
            if skill['has_skill_md']:
                print(f"    文件: 有 SKILL.md")
            if skill['has_skill_toml']:
                print(f"    文件: 有 skill.toml")
            
            print()
        
        return {
            'total': total_skills,
            'enabled': len(self.skills_enabled),
            'disabled': len(self.skills_disabled),
            'enabled_list': self.skills_enabled,
            'disabled_list': self.skills_disabled
        }
    
    def generate_report(self, results):
        """生成启用状态报告"""
        report = {
            '检查时间': self.get_current_time(),
            '总结': results,
            '建议': []
        }
        
        # 添加建议
        if results['disabled'] > 0:
            report['建议'].append(f"发现 {results['disabled']} 个skills可能未启用")
            report['建议'].append("请检查WorkBuddy技能面板或运行启用命令")
        
        if results['enabled'] == 0:
            report['建议'].append("所有skills都未启用，请检查WorkBuddy配置")
        
        return report
    
    def get_current_time(self):
        """获取当前时间"""
        from datetime import datetime
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    def save_report(self, report, filename="skills_enable_report.json"):
        """保存报告到文件"""
        report_path = WORKBUDDY_HOME / filename
        with open(report_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        print(f"\n报告已保存到: {report_path}")
        return report_path
    
    def print_summary(self, results):
        """打印检查摘要"""
        print("=" * 80)
        print("SKILLS 启用状态检查摘要")
        print("=" * 80)
        print(f"总共检查: {results['total']} 个skills")
        print(f"已启用: {results['enabled']} 个")
        print(f"未启用: {results['disabled']} 个")
        print()
        
        if results['enabled'] > 0:
            print("[已启用] 已启用的skills:")
            for skill in results['enabled_list']:
                print(f"  - {skill}")
            print()
        
        if results['disabled'] > 0:
            print("[未启用] 可能未启用的skills:")
            for skill in results['disabled_list']:
                print(f"  - {skill}")
            print()
        
        # 建议
        print("[建议] 建议:")
        if results['disabled'] > 0:
            print("1. 在WorkBuddy中打开技能面板查看")
            print("2. 尝试重新加载或重启WorkBuddy")
            print("3. 检查skills是否有正确的配置文件")
        else:
            print("所有skills看起来都已启用，如果技能面板中没有显示，请尝试:")
            print("1. 重启WorkBuddy")
            print("2. 清除WorkBuddy缓存")
            print("3. 检查WorkBuddy版本兼容性")

def main():
    """主函数"""
    print("开始检查WorkBuddy Skills启用状态...")
    print("=" * 80)
    
    checker = SkillsEnableChecker()
    
    # 检查WorkBuddy配置
    config_files = checker.check_workbuddy_config()
    if config_files:
        print(f"找到WorkBuddy配置文件: {[str(f) for f in config_files]}")
    else:
        print("未找到WorkBuddy配置文件")
    
    # 检查所有skills
    results = checker.check_all_skills()
    
    # 生成和保存报告
    report = checker.generate_report(results)
    report_path = checker.save_report(report)
    
    # 打印摘要
    checker.print_summary(results)
    
    print("=" * 80)
    print("检查完成！")
    print(f"详细报告: {report_path}")

if __name__ == "__main__":
    main()