#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
查找所有可能的Skills目录中的Skills
包括：用户目录、全局目录、项目目录等
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime

def find_all_skills_directories():
    """查找所有可能的Skills目录"""
    directories = []
    
    # 1. 当前用户目录
    user_dir = Path.home() / ".workbuddy" / "skills"
    if user_dir.exists():
        directories.append(("用户目录", str(user_dir)))
    
    # 2. 系统全局目录（如果存在）
    system_dirs = [
        "C:\\Program Files\\Tencent\\WorkBuddy\\skills",
        "C:\\ProgramData\\WorkBuddy\\skills",
        os.path.join(os.environ.get("APPDATA", ""), "WorkBuddy", "skills"),
    ]
    
    for system_dir in system_dirs:
        if os.path.exists(system_dir):
            directories.append(("系统目录", system_dir))
    
    # 3. 项目目录（当前工作空间）
    project_dir = os.path.join(os.getcwd(), ".workbuddy", "skills")
    if os.path.exists(project_dir):
        directories.append(("项目目录", project_dir))
    
    # 4. 工作空间其他可能的目录
    workspace_root = os.path.dirname(os.getcwd()) if "WorkBuddy" in os.getcwd() else os.getcwd()
    workspace_dirs = [
        os.path.join(workspace_root, "skills"),
        os.path.join(workspace_root, ".workbuddy", "skills"),
    ]
    
    for workspace_dir in workspace_dirs:
        if os.path.exists(workspace_dir) and os.path.abspath(workspace_dir) not in [d[1] for d in directories]:
            directories.append(("工作空间目录", workspace_dir))
    
    return directories

def find_skills_in_directory(dir_type, dir_path):
    """在指定目录中查找Skills"""
    skills = []
    
    if not os.path.exists(dir_path):
        return skills
    
    try:
        items = os.listdir(dir_path)
        for item in items:
            skill_path = os.path.join(dir_path, item)
            if os.path.isdir(skill_path):
                # 检查是否为有效的Skill目录
                skill_md = os.path.join(skill_path, "SKILL.md")
                skill_toml = os.path.join(skill_path, "skill.toml")
                
                has_md = os.path.exists(skill_md)
                has_toml = os.path.exists(skill_toml)
                
                # 即使没有标准文件，也认为是可能的Skill
                skills.append({
                    "name": item,
                    "path": skill_path,
                    "type": dir_type,
                    "has_skill_md": has_md,
                    "has_skill_toml": has_toml,
                    "is_valid": has_md and has_toml,
                    "size_mb": round(sum(os.path.getsize(os.path.join(root, f)) 
                                      for root, dirs, files in os.walk(skill_path) 
                                      for f in files) / (1024*1024), 2) if os.path.exists(skill_path) else 0
                })
    except Exception as e:
        print(f"[错误] 无法扫描目录 {dir_path}: {e}")
    
    return skills

def check_recently_installed_skills():
    """检查最近安装的Skills（从报告中）"""
    recently_installed = []
    
    # 检查可能存在的安装报告
    report_files = [
        os.path.join(Path.home(), ".workbuddy", "skills_search_results.json"),
        os.path.join(Path.home(), ".workbuddy", "skills_installation_report.json"),
        os.path.join(Path.home(), ".workbuddy", "reports", "skills_installation_report.json"),
    ]
    
    for report_file in report_files:
        if os.path.exists(report_file):
            try:
                with open(report_file, 'r', encoding='utf-8') as f:
                    report = json.load(f)
                    if isinstance(report, dict):
                        # 检查各种可能的键
                        for key in ["installed_skills", "suggested_skills", "found_skills", "results"]:
                            if key in report:
                                if isinstance(report[key], list):
                                    recently_installed.extend(report[key])
                                elif isinstance(report[key], dict):
                                    recently_installed.extend(report[key].keys())
            except:
                pass
    
    # 去重
    return list(set([s for s in recently_installed if isinstance(s, str)]))

def main():
    print("[搜索] 开始全面查找系统中的所有Skills...")
    print("=" * 80)
    
    # 查找所有目录
    directories = find_all_skills_directories()
    
    if not directories:
        print("[错误] 未找到任何Skills目录")
        return
    
    print(f"[目录] 找到 {len(directories)} 个可能的Skills目录：")
    for i, (dir_type, dir_path) in enumerate(directories, 1):
        print(f"  {i}. {dir_type}: {dir_path}")
    print()
    
    # 在所有目录中查找Skills
    all_skills = []
    skill_names = set()
    
    for dir_type, dir_path in directories:
        skills = find_skills_in_directory(dir_type, dir_path)
        if skills:
            print(f"[找到] 在 {dir_type} ({dir_path}) 中找到 {len(skills)} 个Skills：")
            for skill in skills:
                skill_name = skill["name"]
                # 避免重复
                if skill_name not in skill_names:
                    skill_names.add(skill_name)
                    all_skills.append(skill)
                    print(f"    • {skill_name} ({skill['type']})")
            print()
    
    # 检查最近安装的Skills
    recently_installed = check_recently_installed_skills()
    if recently_installed:
        print("[报告] 从安装报告中找到以下最近安装的Skills：")
        for skill in recently_installed:
            print(f"    • {skill}")
        
        # 添加到所有Skills中（如果还未存在）
        for skill_name in recently_installed:
            if skill_name not in skill_names:
                skill_names.add(skill_name)
                all_skills.append({
                    "name": skill_name,
                    "path": "未找到文件路径（可能在其他位置）",
                    "type": "报告中的Skills",
                    "has_skill_md": False,
                    "has_skill_toml": False,
                    "is_valid": False,
                    "size_mb": 0
                })
    
    # 统计信息
    print("\n[统计] 统计信息：")
    print(f"  • 总Skills数量: {len(all_skills)}")
    
    # 按类型统计
    type_stats = {}
    for skill in all_skills:
        skill_type = skill["type"]
        type_stats[skill_type] = type_stats.get(skill_type, 0) + 1
    
    print(f"  • 按目录类型统计：")
    for skill_type, count in type_stats.items():
        print(f"    - {skill_type}: {count}个")
    
    # 按有效性统计
    valid_count = sum(1 for s in all_skills if s["is_valid"])
    print(f"  • 有效Skills（有SKILL.md和skill.toml）: {valid_count}个")
    print(f"  • 无效Skills: {len(all_skills) - valid_count}个")
    
    # 生成报告
    report = {
        "检查时间": datetime.now().isoformat(),
        "总Skills数量": len(all_skills),
        "有效Skills数量": valid_count,
        "Skills目录": [{"类型": t, "路径": p} for t, p in directories],
        "所有Skills": all_skills,
        "按类型统计": type_stats,
        "技能页面显示": 67,  # 用户反馈的数量
        "差异分析": {
            "页面显示数量": 67,
            "实际找到数量": len(all_skills),
            "差异数量": 67 - len(all_skills),
            "说明": f"页面显示67个，实际找到{len(all_skills)}个，差异{67 - len(all_skills)}个"
        }
    }
    
    # 保存报告
    report_dir = os.path.join(Path.home(), ".workbuddy")
    os.makedirs(report_dir, exist_ok=True)
    report_file = os.path.join(report_dir, "all_skills_comprehensive_report.json")
    
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"\n[报告] 详细报告已保存到: {report_file}")
    print("=" * 80)
    print("\n[建议] 建议下一步：")
    print("  1. 如果找到的Skills数量仍然不足67个，可能需要:")
    print("     • 检查WorkBuddy的其他安装目录")
    print("     • 查看WorkBuddy的安装日志")
    print("     • 重新运行Skills搜索和安装")
    print("  2. 如果需要更多Skills，可以运行:")
    print("     • python skills_search_manager.py search --category=all")
    print("     • 或者使用Skill Creator创建自定义Skills")
    
    return len(all_skills), valid_count

if __name__ == "__main__":
    total_count, valid_count = main()
    
    # 与用户反馈的数量比较
    user_reported = 67
    print(f"\n[对比] 与用户反馈对比：")
    print(f"  • 技能页面显示: {user_reported}个Skills")
    print(f"  • 实际找到: {total_count}个Skills")
    print(f"  • 差异: {user_reported - total_count}个Skills")
    
    if total_count >= user_reported:
        print("[成功] 太好了！找到的Skills数量符合或超过页面显示！")
    elif total_count >= 60:  # 我们之前检测到的数量
        print(f"[注意] 差异分析：找到{total_count}个，比页面显示少{user_reported - total_count}个")
        print(f"   但比之前检测的60个多了{total_count - 60}个")
    else:
        print(f"[问题] 只找到{total_count}个，比页面显示少{user_reported - total_count}个")