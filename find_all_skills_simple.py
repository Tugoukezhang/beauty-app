#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化版系统所有Skills查找脚本
避免Unicode问题，快速查找
"""

import os
import json
import sys

def find_skills_in_directory(directory):
    """查找指定目录中的所有Skills"""
    if not os.path.exists(directory):
        return []
    
    skills = []
    try:
        for item in os.listdir(directory):
            skill_path = os.path.join(directory, item)
            if os.path.isdir(skill_path):
                # 检查是否是有效的Skill目录
                skill_md = os.path.join(skill_path, "SKILL.md")
                skill_toml = os.path.join(skill_path, "skill.toml")
                
                skills.append({
                    "name": item,
                    "path": skill_path,
                    "has_skill_md": os.path.exists(skill_md),
                    "has_skill_toml": os.path.exists(skill_toml),
                    "is_valid": os.path.exists(skill_md) and os.path.exists(skill_toml)
                })
    except Exception as e:
        pass
    
    return skills

def main():
    print("开始查找系统中所有的Skills...")
    print("=" * 60)
    
    # 定义所有可能的Skills目录
    possible_dirs = [
        ("主用户Skills目录", r"C:\Users\lintianhao\.workbuddy\skills"),
        ("工作区Skills目录", r"C:\Users\lintianhao\WorkBuddy\20260407093653\.workbuddy\skills"),
        ("全局Skills目录", r"C:\ProgramData\WorkBuddy\skills"),
        ("应用安装目录", r"C:\Program Files\Tencent\WorkBuddy\skills"),
    ]
    
    # 查找所有Skills
    all_skills = {}
    total_count = 0
    
    for dir_name, dir_path in possible_dirs:
        if os.path.exists(dir_path):
            skills = find_skills_in_directory(dir_path)
            if skills:
                print(f"[找到] 在 {dir_name} ({dir_path})")
                print(f"      找到 {len(skills)} 个Skills:")
                for skill in skills:
                    skill_name = skill["name"]
                    if skill_name not in all_skills:
                        all_skills[skill_name] = skill
                        total_count += 1
                    status = "[有效]" if skill["is_valid"] else "[无效]"
                    print(f"        {skill_name} {status}")
                print()
    
    # 查找最近安装的Skills报告
    recent_skills = []
    report_files = [
        r"C:\Users\lintianhao\.workbuddy\skills_installation_report.json",
        r"C:\Users\lintianhao\.workbuddy\skills_marketplace_search.json",
        r"C:\Users\lintianhao\.workbuddy\skills_github_search.json"
    ]
    
    for report_file in report_files:
        if os.path.exists(report_file):
            try:
                with open(report_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    if "installed_skills" in data:
                        for skill_name in data["installed_skills"]:
                            if skill_name not in all_skills:
                                recent_skills.append(skill_name)
                                all_skills[skill_name] = {
                                    "name": skill_name,
                                    "path": f"从报告找到: {report_file}",
                                    "has_skill_md": False,
                                    "has_skill_toml": False,
                                    "is_valid": False
                                }
                                total_count += 1
            except:
                pass
    
    if recent_skills:
        print(f"[报告] 从安装报告中找到 {len(recent_skills)} 个Skills:")
        for skill in recent_skills:
            print(f"        {skill}")
        print()
    
    # 检查WorkBuddy settings.json中的启用状态
    settings_file = r"C:\Users\lintianhao\.workbuddy\settings.json"
    enabled_skills = []
    if os.path.exists(settings_file):
        try:
            with open(settings_file, 'r', encoding='utf-8') as f:
                settings = json.load(f)
                if "skills" in settings and "enabled" in settings["skills"]:
                    enabled_skills = settings["skills"]["enabled"]
                    print(f"[配置] 在settings.json中找到 {len(enabled_skills)} 个已启用Skills")
        except:
            pass
    
    # 输出统计信息
    print("[统计] 统计结果:")
    print(f"  - 总共找到: {total_count} 个Skills")
    print(f"  - 在settings.json中启用: {len(enabled_skills)} 个")
    
    # 有效性统计
    valid_count = sum(1 for s in all_skills.values() if s["is_valid"])
    print(f"  - 有效Skills: {valid_count} 个")
    print(f"  - 无效Skills: {total_count - valid_count} 个")
    
    # 保存详细报告
    report_file = r"C:\Users\lintianhao\.workbuddy\all_skills_found.json"
    with open(report_file, 'w', encoding='utf-8') as f:
        json.dump({
            "total_count": total_count,
            "valid_count": valid_count,
            "enabled_in_settings": len(enabled_skills),
            "all_skills": all_skills,
            "enabled_skills": enabled_skills
        }, f, ensure_ascii=False, indent=2)
    
    print(f"\n[报告] 详细报告已保存到: {report_file}")
    
    # 与页面显示的67个对比
    user_reported = 67
    print(f"\n[对比] 与技能页面显示的对比:")
    print(f"  - 页面显示: {user_reported} 个Skills")
    print(f"  - 实际找到: {total_count} 个Skills")
    print(f"  - 差异: {user_reported - total_count} 个Skills")
    
    if total_count >= user_reported:
        print("[成功] 找到的Skills数量符合或超过页面显示！")
    else:
        print(f"[差异] 还需要找到 {user_reported - total_count} 个Skills")
    
    return total_count, valid_count

if __name__ == "__main__":
    total_count, valid_count = main()