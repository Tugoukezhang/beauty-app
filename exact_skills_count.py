#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
精确统计WorkBuddy Skills数量
找出缺失的Skills
"""

import json
import os
from pathlib import Path
import sys

class SkillsCounter:
    """Skills数量精确统计器"""
    
    def __init__(self):
        self.workbuddy_home = Path.home() / ".workbuddy"
        
        # 所有可能的Skills目录
        self.possible_dirs = [
            self.workbuddy_home / "skills",           # 用户级Skills
            Path("C:/Program Files/Tencent/WorkBuddy/skills"),  # 全局安装目录
            Path("C:/ProgramData/Tencent/WorkBuddy/skills"),   # 程序数据目录
            Path(os.environ.get("APPDATA", "")) / "Tencent/WorkBuddy/skills",  # AppData目录
            Path(os.environ.get("LOCALAPPDATA", "")) / "Tencent/WorkBuddy/skills",  # LocalAppData
        ]
        
    def find_all_skills_dirs(self):
        """查找所有Skills目录"""
        found_dirs = []
        for dir_path in self.possible_dirs:
            if dir_path.exists() and dir_path.is_dir():
                found_dirs.append(dir_path)
                print(f"[发现] Skills目录: {dir_path}")
        
        return found_dirs
    
    def count_skills_in_dir(self, skills_dir):
        """统计目录中的Skills数量"""
        skills = []
        if not skills_dir.exists():
            return []
        
        for item in skills_dir.iterdir():
            if item.is_dir():
                # 检查是否是有效的Skill目录
                skill_name = item.name
                
                # 检查是否有SKILL.md或skill.toml文件
                has_skill_md = (item / "SKILL.md").exists()
                has_skill_toml = (item / "skill.toml").exists()
                
                # 判断是否是有效的Skill
                is_valid = has_skill_md or has_skill_toml
                
                skills.append({
                    "name": skill_name,
                    "path": str(item),
                    "has_skill_md": has_skill_md,
                    "has_skill_toml": has_skill_toml,
                    "is_valid": is_valid
                })
        
        return sorted(skills, key=lambda x: x["name"])
    
    def get_all_skills(self):
        """获取所有Skills"""
        all_skills = {}
        skill_dirs = self.find_all_skills_dirs()
        
        for skills_dir in skill_dirs:
            print(f"\n扫描目录: {skills_dir}")
            skills = self.count_skills_in_dir(skills_dir)
            
            for skill in skills:
                skill_name = skill["name"]
                if skill_name not in all_skills:
                    all_skills[skill_name] = {
                        "name": skill_name,
                        "paths": [],
                        "has_skill_md": skill["has_skill_md"],
                        "has_skill_toml": skill["has_skill_toml"],
                        "is_valid": skill["is_valid"]
                    }
                all_skills[skill_name]["paths"].append(skill["path"])
        
        return list(all_skills.values())
    
    def check_skill_files(self, skill):
        """检查Skill文件的详细信息"""
        skill_paths = skill["paths"]
        details = []
        
        for path in skill_paths:
            skill_dir = Path(path)
            file_info = {
                "path": path,
                "files": []
            }
            
            # 列出目录中的所有文件
            for file_path in skill_dir.rglob("*"):
                if file_path.is_file():
                    rel_path = str(file_path.relative_to(skill_dir))
                    file_size = file_path.stat().st_size
                    file_info["files"].append({
                        "name": rel_path,
                        "size": file_size
                    })
            
            details.append(file_info)
        
        return details
    
    def generate_detailed_report(self, all_skills):
        """生成详细报告"""
        report = {
            "统计时间": os.popen("date /t").read().strip() + " " + os.popen("time /t").read().strip(),
            "检测到的Skills目录": [str(d) for d in self.find_all_skills_dirs()],
            "总Skills数量": len(all_skills),
            "有效Skills": sum(1 for s in all_skills if s["is_valid"]),
            "无效Skills": sum(1 for s in all_skills if not s["is_valid"]),
            "详细列表": all_skills
        }
        
        # 保存报告
        report_file = self.workbuddy_home / "exact_skills_count.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        return report_file, report
    
    def run_detailed_analysis(self):
        """运行详细分析"""
        print("=" * 80)
        print("WorkBuddy Skills 精确数量统计")
        print("=" * 80)
        
        # 找到所有Skills目录
        skill_dirs = self.find_all_skills_dirs()
        print(f"\n总共找到 {len(skill_dirs)} 个Skills目录")
        
        # 获取所有Skills
        all_skills = self.get_all_skills()
        
        print(f"\n[统计结果]")
        print("-" * 50)
        print(f"总共找到: {len(all_skills)} 个Skills")
        
        # 分类统计
        valid_skills = [s for s in all_skills if s["is_valid"]]
        invalid_skills = [s for s in all_skills if not s["is_valid"]]
        
        print(f"有效Skills: {len(valid_skills)} 个")
        print(f"无效Skills: {len(invalid_skills)} 个")
        
        # 显示所有Skills
        print(f"\n[所有Skills列表]")
        print("-" * 50)
        for i, skill in enumerate(sorted(all_skills, key=lambda x: x["name"]), 1):
            status = "[有效]" if skill["is_valid"] else "[无效]"
            has_md = "[md]" if skill["has_skill_md"] else "    "
            has_toml = "[toml]" if skill["has_skill_toml"] else "      "
            print(f"{i:3d}. {status} {has_md}{has_toml} {skill['name']}")
            for path in skill["paths"]:
                print(f"     路径: {path}")
        
        # 无效Skills详情
        if invalid_skills:
            print(f"\n[无效Skills详情]")
            print("-" * 50)
            for skill in invalid_skills:
                print(f"❌ {skill['name']}")
                print(f"   路径: {', '.join(skill['paths'])}")
                print(f"   缺少: ", end="")
                missing = []
                if not skill["has_skill_md"]:
                    missing.append("SKILL.md")
                if not skill["has_skill_toml"]:
                    missing.append("skill.toml")
                print(", ".join(missing) if missing else "未知原因")
        
        # 生成报告
        report_file, report = self.generate_detailed_report(all_skills)
        
        print(f"\n[报告生成]")
        print("-" * 50)
        print(f"详细报告已保存到: {report_file}")
        print(f"总Skills数量: {report['总Skills数量']}")
        print(f"有效Skills: {report['有效Skills']}")
        print(f"无效Skills: {report['无效Skills']}")
        
        print(f"\n[分析结果]")
        print("-" * 50)
        if len(all_skills) < 67:
            missing = 67 - len(all_skills)
            print(f"⚠️ 发现差异: 技能页面显示67个，但只找到{len(all_skills)}个")
            print(f"⚠️ 缺失数量: {missing} 个Skills")
            print(f"可能原因:")
            print(f"  1. 有Skills在其他未检测的目录中")
            print(f"  2. 技能页面统计包含重复或虚拟Skills")
            print(f"  3. 部分Skills目录被隐藏或权限限制")
        elif len(all_skills) > 67:
            print(f"⚠️ 发现差异: 找到{len(all_skills)}个，但技能页面只显示67个")
            print(f"可能原因:")
            print(f"  1. 技能页面只显示有效Skills")
            print(f"  2. 有重复或无效Skills被过滤")
            print(f"  3. 页面统计有误")
        else:
            print(f"✅ 数量匹配: 找到{len(all_skills)}个，技能页面显示67个")
        
        print("\n" + "=" * 80)
        
        return all_skills, report_file


def main():
    """主函数"""
    try:
        counter = SkillsCounter()
        all_skills, report_file = counter.run_detailed_analysis()
        
        # 建议下一步操作
        print("\n[建议操作]")
        print("=" * 80)
        print("1. 查看详细报告:")
        print(f"   文件: {report_file}")
        print()
        print("2. 如果缺失Skills，运行:")
        print("   python skills_search_manager.py search --category=all")
        print()
        print("3. 修复无效Skills:")
        print("   python fix_skill_files.py")
        print()
        print("4. 重新验证数量:")
        print("   python exact_skills_count.py")
        
        print("\n" + "=" * 80)
        
    except Exception as e:
        print(f"[错误] 分析失败: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()