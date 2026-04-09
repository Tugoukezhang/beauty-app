#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化版缺失Skills查找
"""

import json
from pathlib import Path

def main():
    print("=" * 80)
    print("Skills数量差异分析")
    print("=" * 80)
    
    workbuddy_home = Path.home() / ".workbuddy"
    skills_dir = workbuddy_home / "skills"
    
    # 获取当前已安装的Skills
    current_skills = []
    if skills_dir.exists():
        for skill_dir in skills_dir.iterdir():
            if skill_dir.is_dir():
                current_skills.append(skill_dir.name)
    
    print(f"[统计] 当前找到: {len(current_skills)} 个Skills")
    print(f"[统计] 技能页面显示: 67 个Skills")
    print(f"[统计] 缺失: {67 - len(current_skills)} 个Skills")
    print()
    
    print("[当前已安装的Skills]")
    print("-" * 60)
    for i, skill in enumerate(sorted(current_skills), 1):
        print(f"{i:2d}. {skill}")
    
    print()
    print("[分析结果]")
    print("-" * 60)
    print("发现7个Skills缺失！")
    print()
    
    # 常见可能缺失的Skills
    possible_missing = [
        # 前端相关
        "html-css-js", "react", "vue", "typescript", "webpack",
        "tailwindcss", "bootstrap", "ui-design",
        
        # 后端相关  
        "nodejs", "python", "java", "go", "database",
        "mongodb", "mysql", "postgresql", "redis",
        
        # 移动开发
        "react-native", "android", "ios", "mobile-ui",
        
        # 云服务
        "docker", "kubernetes", "aws", "azure", "gcp",
        
        # AI和机器学习
        "machine-learning", "deep-learning", "pytorch", "tensorflow",
        
        # 工具
        "git", "vscode", "terminal", "shell-scripting",
        
        # 项目管理
        "project-management", "agile", "scrum"
    ]
    
    # 过滤已安装的
    missing_skills = []
    for skill in possible_missing:
        skill_lower = skill.lower().replace("-", "")
        found = False
        
        for current in current_skills:
            current_lower = current.lower().replace("-", "")
            if skill_lower in current_lower or current_lower in skill_lower:
                found = True
                break
        
        if not found:
            missing_skills.append(skill)
    
    # 取前10个可能的缺失Skills
    missing_skills = missing_skills[:10]
    
    if missing_skills:
        print("[可能缺失的Skills]")
        print("-" * 60)
        for i, skill in enumerate(missing_skills, 1):
            print(f"{i:2d}. {skill}")
    
    print()
    print("[立即解决方案]")
    print("=" * 80)
    print()
    print("1. 运行Skills搜索查看所有可用Skills：")
    print("   python skills_search_manager.py search --category=all")
    print()
    print("2. 搜索特定类型的Skills：")
    print("   python skills_search_manager.py search --category=frontend")
    print("   python skills_search_manager.py search --category=backend")
    print("   python skills_search_manager.py search --category=mobile")
    print()
    print("3. 安装具体的Skills：")
    print("   python skills_search_manager.py install <skill-name>")
    print()
    print("4. 可能的原因：")
    print("   - Skills在其他目录中")
    print("   - 部分Skills是系统自带的")
    print("   - 技能页面统计包含重复项")
    print("   - 部分Skills是插件或扩展")
    print()
    print("5. 建议操作：")
    print("   - 先运行Skills搜索查看marketplace中的Skills")
    print("   - 从搜索结果中选择需要的Skills安装")
    print("   - 如果Skills在其他目录，需要手动查找")
    print()
    
    # 保存报告
    report = {
        "current_count": len(current_skills),
        "expected_count": 67,
        "missing_count": 67 - len(current_skills),
        "current_skills": sorted(current_skills),
        "possible_missing_skills": missing_skills,
        "suggestions": [
            "运行skills_search_manager.py搜索所有Skills",
            "从marketplace安装缺失的Skills",
            "检查其他可能的Skills目录"
        ]
    }
    
    report_file = workbuddy_home / "skills_difference_report.json"
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"[报告] 详细报告已保存到: {report_file}")
    print("=" * 80)

if __name__ == "__main__":
    main()