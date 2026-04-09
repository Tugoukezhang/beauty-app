#!/usr/bin/env python3
"""
验证Skills文件的完整性和格式
"""

import os
import json
from pathlib import Path

WORKBUDDY_HOME = Path.home() / ".workbuddy"
SKILLS_DIR = WORKBUDDY_HOME / "skills"

def verify_skill_structure(skill_path):
    """验证skill目录结构"""
    issues = []
    warnings = []
    
    # 必需的文件
    required_files = ["SKILL.md"]
    optional_files = ["skill.toml", "README.md", "package.json", "config.json"]
    
    # 检查必需文件
    for file in required_files:
        file_path = skill_path / file
        if not file_path.exists():
            issues.append(f"缺少必需文件: {file}")
    
    # 检查可选文件
    for file in optional_files:
        file_path = skill_path / file
        if file_path.exists():
            warnings.append(f"有可选文件: {file}")
    
    # 检查目录结构
    common_dirs = ["scripts", "assets", "config", "src", "lib"]
    for dir_name in common_dirs:
        dir_path = skill_path / dir_name
        if dir_path.exists() and dir_path.is_dir():
            warnings.append(f"有常见目录: {dir_name}")
    
    return issues, warnings

def check_skill_md_format(skill_path):
    """检查SKILL.md文件格式"""
    md_path = skill_path / "SKILL.md"
    issues = []
    
    if not md_path.exists():
        issues.append("没有SKILL.md文件")
        return issues
    
    try:
        with open(md_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查基本格式
        if len(content.strip()) == 0:
            issues.append("SKILL.md文件为空")
        
        # 检查是否有标题
        if not content.startswith('#') and not 'title:' in content.lower():
            issues.append("SKILL.md缺少标题")
        
        # 检查是否有描述
        if 'description' not in content.lower() and '描述' not in content:
            issues.append("SKILL.md缺少描述信息")
        
        # 检查长度
        if len(content) < 100:
            issues.append("SKILL.md内容可能过于简短")
            
    except Exception as e:
        issues.append(f"读取SKILL.md失败: {e}")
    
    return issues

def check_skill_toml_format(skill_path):
    """检查skill.toml文件格式"""
    toml_path = skill_path / "skill.toml"
    issues = []
    
    if not toml_path.exists():
        return issues  # toml文件是可选的
    
    try:
        with open(toml_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 检查基本格式
        if len(content.strip()) == 0:
            issues.append("skill.toml文件为空")
        
        # 检查是否有基本字段
        required_fields = ['name', 'version', 'description']
        for field in required_fields:
            if field not in content.lower():
                issues.append(f"skill.toml缺少{field}字段")
        
        # 检查是否有enabled字段
        if 'enabled' in content.lower():
            lines = content.split('\n')
            for line in lines:
                if 'enabled' in line.lower():
                    if 'false' in line.lower() or '0' in line:
                        issues.append("skill.toml中enabled=false")
                    break
        
    except Exception as e:
        issues.append(f"读取skill.toml失败: {e}")
    
    return issues

def main():
    """主函数"""
    print("开始验证Skills文件完整性和格式...")
    print("=" * 80)
    
    if not SKILLS_DIR.exists():
        print(f"错误: Skills目录不存在: {SKILLS_DIR}")
        return
    
    skills = list(SKILLS_DIR.iterdir())
    print(f"找到 {len(skills)} 个skills")
    print()
    
    all_issues = []
    all_warnings = []
    
    for skill_path in skills:
        if not skill_path.is_dir():
            continue
            
        skill_name = skill_path.name
        print(f"检查: {skill_name}")
        
        # 验证目录结构
        issues, warnings = verify_skill_structure(skill_path)
        
        # 检查SKILL.md格式
        md_issues = check_skill_md_format(skill_path)
        issues.extend(md_issues)
        
        # 检查skill.toml格式
        toml_issues = check_skill_toml_format(skill_path)
        issues.extend(toml_issues)
        
        # 汇总结果
        if issues:
            print(f"  问题: {len(issues)} 个")
            for issue in issues:
                print(f"    - {issue}")
                all_issues.append(f"{skill_name}: {issue}")
        else:
            print(f"  问题: 无")
        
        if warnings:
            print(f"  警告: {len(warnings)} 个")
            for warning in warnings:
                print(f"    - {warning}")
                all_warnings.append(f"{skill_name}: {warning}")
        
        print()
    
    # 生成总结报告
    print("=" * 80)
    print("验证结果总结")
    print("=" * 80)
    print(f"总共检查: {len(skills)} 个skills")
    print(f"发现问题: {len(all_issues)} 个")
    print(f"发现警告: {len(all_warnings)} 个")
    print()
    
    if all_issues:
        print("主要问题:")
        for issue in all_issues[:10]:  # 显示前10个问题
            print(f"  - {issue}")
        if len(all_issues) > 10:
            print(f"  ... 还有 {len(all_issues)-10} 个问题")
        print()
    
    # 建议
    print("建议:")
    if len(all_issues) > 0:
        print("1. 修复有问题的skills文件")
        print("2. 确保每个skill都有完整的SKILL.md文件")
        print("3. 检查skill.toml配置是否正确")
    else:
        print("所有skills文件格式基本正常")
    
    print("4. 重启WorkBuddy加载修复后的skills")
    print("5. 检查WorkBuddy日志查看skills加载情况")
    
    # 保存报告
    report = {
        '检查时间': '2026-04-07 12:35',
        '检查skills数量': len(skills),
        '发现问题数量': len(all_issues),
        '发现警告数量': len(all_warnings),
        '主要问题': all_issues[:20],
        '警告信息': all_warnings[:20]
    }
    
    report_path = WORKBUDDY_HOME / "skill_verification_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print()
    print(f"详细报告保存到: {report_path}")
    print("=" * 80)

if __name__ == "__main__":
    main()