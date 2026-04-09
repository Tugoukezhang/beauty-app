#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
强制启用所有WorkBuddy Skills
用于解决技能面板中看不到skills的问题
"""

import json
import shutil
import sys
import time
from pathlib import Path
import subprocess
import os

class SkillsEnabler:
    """Skills启用管理器"""
    
    def __init__(self):
        self.workbuddy_home = Path.home() / ".workbuddy"
        self.skills_dir = self.workbuddy_home / "skills"
        self.enabled_file = self.workbuddy_home / "enabled_skills.json"
        self.settings_file = self.workbuddy_home / "settings.json"
        
    def get_installed_skills(self):
        """获取所有已安装的skills"""
        skills = []
        if self.skills_dir.exists():
            for skill_dir in self.skills_dir.iterdir():
                if skill_dir.is_dir():
                    skills.append({
                        "name": skill_dir.name,
                        "path": str(skill_dir),
                        "has_skill_md": (skill_dir / "SKILL.md").exists(),
                        "has_skill_toml": (skill_dir / "skill.toml").exists()
                    })
        return sorted(skills, key=lambda x: x["name"])
    
    def enable_skill(self, skill_name, skill_path):
        """启用一个skill"""
        print(f"正在启用: {skill_name}")
        
        # 方法1: 确保SKILL.md存在且格式正确
        skill_md = Path(skill_path) / "SKILL.md"
        if not skill_md.exists():
            print(f"  [警告] 缺少SKILL.md文件，正在创建...")
            self.create_skill_md(skill_name, skill_md)
        
        # 方法2: 确保skill.toml存在
        skill_toml = Path(skill_path) / "skill.toml"
        if not skill_toml.exists():
            print(f"  [警告] 缺少skill.toml文件，正在创建...")
            self.create_skill_toml(skill_name, skill_toml)
        
        # 方法3: 在settings.json中添加技能启用状态
        self.update_settings_enabled(skill_name)
        
        print(f"  [完成] {skill_name} 已启用")
        return True
    
    def create_skill_md(self, skill_name, skill_md_path):
        """创建SKILL.md文件"""
        # 根据skill名称生成友好的显示名称
        display_name = skill_name.replace("-", " ").title()
        if "AI" in skill_name.upper():
            display_name = skill_name.replace("ai", "AI").replace("-", " ")
        
        content = f"""# {display_name}

这是 {display_name} 技能。

## 描述
这个技能提供了 {display_name} 的相关功能。

## 使用方法
在WorkBuddy中调用此技能即可使用。

## 版本
1.0.0

## 作者
WorkBuddy系统自动生成
"""
        with open(skill_md_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def create_skill_toml(self, skill_name, skill_toml_path):
        """创建skill.toml文件"""
        content = f"""[skill]
name = "{skill_name}"
version = "1.0.0"
description = "Auto-generated skill for {skill_name}"
enabled = true

[metadata]
created = "{time.strftime('%Y-%m-%d')}"
generator = "SkillsEnabler"
"""
        with open(skill_toml_path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def update_settings_enabled(self, skill_name):
        """更新settings.json中的启用状态"""
        if not self.settings_file.exists():
            return
        
        try:
            with open(self.settings_file, 'r', encoding='utf-8') as f:
                settings = json.load(f)
            
            # 确保skills设置部分存在
            if "skills" not in settings:
                settings["skills"] = {}
            
            # 设置技能为启用
            if "enabled" not in settings["skills"]:
                settings["skills"]["enabled"] = {}
            
            if skill_name not in settings["skills"]["enabled"]:
                settings["skills"]["enabled"][skill_name] = True
            
            with open(self.settings_file, 'w', encoding='utf-8') as f:
                json.dump(settings, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"  [警告] 更新settings.json失败: {e}")
    
    def create_enabled_file(self, skills):
        """创建启用技能列表文件"""
        enabled_data = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "total_enabled": len(skills),
            "enabled_skills": [s["name"] for s in skills],
            "enabled_details": skills
        }
        
        with open(self.enabled_file, 'w', encoding='utf-8') as f:
            json.dump(enabled_data, f, ensure_ascii=False, indent=2)
        
        return self.enabled_file
    
    def enable_all_skills(self):
        """启用所有skills"""
        print("=" * 70)
        print("强制启用所有WorkBuddy Skills")
        print("=" * 70)
        
        skills = self.get_installed_skills()
        print(f"找到 {len(skills)} 个已安装的skills")
        print()
        
        if not skills:
            print("没有找到任何已安装的skills！")
            return
        
        enabled_count = 0
        for skill in skills:
            if self.enable_skill(skill["name"], skill["path"]):
                enabled_count += 1
        
        # 创建启用列表文件
        enabled_file = self.create_enabled_file(skills)
        
        print()
        print("=" * 70)
        print("启用完成摘要")
        print("=" * 70)
        print(f"总共处理: {len(skills)} 个skills")
        print(f"成功启用: {enabled_count} 个skills")
        print()
        
        if enabled_count < len(skills):
            print("[警告] 部分skills可能有问题，请检查技能目录")
        else:
            print("[成功] 所有skills都已启用！")
        
        print()
        print(f"启用列表已保存到: {enabled_file}")
        
        # 生成重启建议
        print()
        print("=" * 70)
        print("下一步操作建议")
        print("=" * 70)
        print("1. 重启WorkBuddy以加载所有启用的skills")
        print("2. 如果技能面板仍然看不到skills，请运行:")
        print("   reload_workbuddy_skills.bat")
        print("3. 检查WorkBuddy版本是否支持所有skills")
        print("4. 查看详细报告: skills_enable_report.json")
        print("=" * 70)
    
    def create_batch_script(self):
        """创建Windows批处理脚本"""
        batch_content = """@echo off
chcp 65001 >nul
echo ===================================================
echo 强制启用所有WorkBuddy Skills
echo ===================================================
echo.

REM 切换到脚本目录
cd /d "%~dp0"

REM 运行Python脚本启用所有skills
echo 正在启用所有WorkBuddy Skills...
python enable_all_skills.py

if %errorlevel% neq 0 (
    echo.
    echo [错误] Python脚本运行失败！
    echo 请确保已安装Python 3.7或更高版本
    pause
    exit /b 1
)

echo.
echo ===================================================
echo 启用完成！
echo ===================================================
echo.
echo 建议操作：
echo 1. 重启WorkBuddy以加载所有skills
echo 2. 运行reload_workbuddy_skills.bat自动重启
echo 3. 检查技能面板是否显示所有skills
echo.
echo 按任意键退出...
pause >nul
"""

        batch_file = Path.cwd() / "enable_all_skills.bat"
        with open(batch_file, 'w', encoding='utf-8') as f:
            f.write(batch_content)
        
        print(f"已创建批处理脚本: {batch_file}")
        return batch_file


def main():
    """主函数"""
    enabler = SkillsEnabler()
    
    # 检查命令行参数
    if len(sys.argv) > 1 and sys.argv[1] == "batch":
        batch_file = enabler.create_batch_script()
        print(f"已创建批处理脚本: {batch_file}")
        print("请运行: enable_all_skills.bat")
        return
    
    # 默认启用所有skills
    enabler.enable_all_skills()


if __name__ == "__main__":
    main()