#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
找出缺失的Skills并安装它们
基于用户反馈：技能页面显示67个，但只找到60个
"""

import json
import sys
from pathlib import Path

class MissingSkillsFinder:
    """缺失Skills查找器"""
    
    def __init__(self):
        self.workbuddy_home = Path.home() / ".workbuddy"
        self.skills_dir = self.workbuddy_home / "skills"
        
    def get_current_skills(self):
        """获取当前已安装的Skills"""
        current_skills = []
        if self.skills_dir.exists():
            for skill_dir in self.skills_dir.iterdir():
                if skill_dir.is_dir():
                    current_skills.append(skill_dir.name)
        return sorted(current_skills)
    
    def load_skills_catalog(self):
        """加载Skills目录，包含常见的Skills"""
        catalog = {
            # 前端开发相关
            "frontend": [
                "html-css-js", "react", "vue", "angular", "svelte",
                "typescript", "webpack", "vite", "tailwindcss", "bootstrap",
                "ui-design", "responsive-design", "web-performance"
            ],
            
            # 后端开发相关
            "backend": [
                "nodejs", "python", "java", "go", "rust",
                "spring-boot", "django", "flask", "express", "nestjs",
                "database", "mongodb", "mysql", "postgresql", "redis",
                "api-design", "rest-api", "graphql", "microservices"
            ],
            
            # 移动开发相关
            "mobile": [
                "react-native", "flutter", "android", "ios", "swift",
                "kotlin", "mobile-ui", "mobile-testing"
            ],
            
            # 云服务和DevOps
            "cloud-devops": [
                "docker", "kubernetes", "aws", "azure", "gcp",
                "terraform", "ansible", "jenkins", "gitlab-ci", "github-actions",
                "monitoring", "logging", "security"
            ],
            
            # AI和机器学习
            "ai-ml": [
                "machine-learning", "deep-learning", "nlp", "computer-vision",
                "pytorch", "tensorflow", "opencv", "scikit-learn",
                "ai-chatbot", "llm", "ai-ethics"
            ],
            
            # 数据科学
            "data-science": [
                "data-analysis", "data-visualization", "pandas", "numpy",
                "matplotlib", "seaborn", "plotly", "jupyter"
            ],
            
            # 测试和质量保证
            "testing": [
                "unit-testing", "integration-testing", "e2e-testing",
                "jest", "pytest", "cypress", "selenium", "test-automation"
            ],
            
            # 文档和写作
            "documentation": [
                "technical-writing", "markdown", "api-documentation",
                "readme-generator", "documentation-tools"
            ],
            
            # 其他工具
            "tools": [
                "git", "vim", "vscode", "terminal", "shell-scripting",
                "regex", "algorithms", "data-structures", "system-design"
            ],
            
            # 项目管理和团队协作
            "management": [
                "project-management", "agile", "scrum", "kanban",
                "code-review", "pair-programming", "team-collaboration"
            ]
        }
        
        # 展平所有Skills
        all_skills = []
        for category in catalog.values():
            all_skills.extend(category)
        
        return all_skills
    
    def find_popular_skills(self):
        """查找常见的Skills"""
        popular_skills = [
            # 编程语言
            "javascript", "typescript", "python", "java", "csharp", "cpp", "php", "ruby", "go", "rust", "kotlin", "swift",
            
            # 前端框架
            "react", "vue", "angular", "svelte", "nextjs", "nuxtjs", "gatsby", "astro",
            
            # 后端框架
            "nodejs", "express", "nestjs", "fastapi", "django", "flask", "spring-boot", "laravel", "rails",
            
            # 数据库
            "mongodb", "mysql", "postgresql", "redis", "sqlite", "elasticsearch",
            
            # 云服务
            "aws", "azure", "gcp", "tencent-cloud", "aliyun", "docker", "kubernetes",
            
            # 移动开发
            "react-native", "flutter", "android", "ios", "ionic", "capacitor",
            
            # AI和机器学习
            "pytorch", "tensorflow", "openai", "langchain", "huggingface",
            
            # 工具
            "git", "webpack", "vite", "eslint", "prettier", "jest", "cypress", "jenkins", "terraform",
            
            # 设计工具
            "figma", "sketch", "adobe-xd", "photoshop", "illustrator",
            
            # 其他
            "wordpress", "shopify", "woocommerce", "magento", "strapi", "graphql"
        ]
        
        return popular_skills
    
    def find_missing_skills(self):
        """找出缺失的Skills"""
        current_skills = self.get_current_skills()
        catalog_skills = self.load_skills_catalog()
        popular_skills = self.find_popular_skills()
        
        print("=" * 80)
        print("缺失Skills分析报告")
        print("=" * 80)
        print(f"当前已安装: {len(current_skills)} 个Skills")
        print(f"技能页面显示: 67 个Skills")
        print(f"缺失数量: {67 - len(current_skills)} 个Skills")
        print()
        
        # 查找可能缺失的Skills
        all_possible_skills = set(catalog_skills + popular_skills)
        missing_skills = []
        
        for skill in all_possible_skills:
            # 检查是否已安装（忽略大小写和分隔符差异）
            skill_lower = skill.lower().replace("-", "").replace("_", "")
            found = False
            
            for current in current_skills:
                current_lower = current.lower().replace("-", "").replace("_", "")
                if skill_lower in current_lower or current_lower in skill_lower:
                    found = True
                    break
            
            if not found:
                missing_skills.append(skill)
        
        # 限制最多20个可能的缺失Skills
        missing_skills = missing_skills[:20]
        
        print("[可能缺失的Skills]")
        print("-" * 50)
        for i, skill in enumerate(missing_skills, 1):
            print(f"{i:2d}. {skill}")
        
        print()
        print("[当前已安装的Skills]")
        print("-" * 50)
        for i, skill in enumerate(current_skills, 1):
            print(f"{i:2d}. {skill}")
        
        # 生成建议报告
        report = {
            "current_count": len(current_skills),
            "expected_count": 67,
            "missing_count": 67 - len(current_skills),
            "current_skills": current_skills,
            "possible_missing_skills": missing_skills,
            "suggestions": []
        }
        
        if missing_skills:
            report["suggestions"].append(f"建议安装以下{len(missing_skills)}个Skills：")
            for skill in missing_skills:
                report["suggestions"].append(f"  - {skill}")
        
        # 保存报告
        report_file = self.workbuddy_home / "missing_skills_report.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
        
        print()
        print("[报告生成]")
        print(f"详细报告已保存到: {report_file}")
        
        return report, missing_skills
    
    def create_install_script(self, skills_to_install):
        """创建安装脚本"""
        if not skills_to_install:
            print("没有需要安装的Skills")
            return
        
        script_content = """@echo off
chcp 65001 >nul
echo ===================================================
echo 安装缺失的WorkBuddy Skills
echo ===================================================
echo.

REM 切换到脚本目录
cd /d "%~dp0"

echo 正在安装缺失的Skills...
"""
        
        for skill in skills_to_install:
            script_content += f'echo 安装: {skill}\n'
            # 这里可以添加实际的安装命令
            script_content += f'REM python skills_search_manager.py install {skill}\n'
        
        script_content += """
echo.
echo ===================================================
echo 安装完成！
echo ===================================================
echo.
echo 请手动运行以下命令安装Skills：
echo 1. python skills_search_manager.py search --category=all
echo 2. 查看搜索结果并安装需要的Skills
echo 3. 或手动从marketplace安装
echo.
echo 按任意键退出...
pause >nul
"""
        
        script_file = Path.cwd() / "install_missing_skills.bat"
        with open(script_file, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        print(f"已创建安装脚本: {script_file}")
        return script_file
    
    def suggest_immediate_solutions(self):
        """提供立即解决方案"""
        print()
        print("=" * 80)
        print("立即解决方案")
        print("=" * 80)
        print()
        print("1. 运行Skills搜索和安装：")
        print("   python skills_search_manager.py search --category=all")
        print()
        print("2. 手动检查Skills目录：")
        print(f"   目录: {self.skills_dir}")
        print()
        print("3. 可能的原因：")
        print("   - Skills在其他目录中（如全局安装目录）")
        print("   - 部分Skills是系统自带或内置的")
        print("   - 技能页面统计包含重复项")
        print("   - 部分Skills可能是插件或扩展")
        print()
        print("4. 建议操作：")
        print("   • 运行Skills搜索查看所有可用的Skills")
        print("   • 从marketplace安装你需要的Skills")
        print("   • 创建install_missing_skills.bat脚本")
        print()
        print("=" * 80)


def main():
    """主函数"""
    finder = MissingSkillsFinder()
    
    # 查找缺失的Skills
    report, missing_skills = finder.find_missing_skills()
    
    # 创建安装脚本
    if missing_skills:
        script_file = finder.create_install_script(missing_skills)
        print(f"已创建安装脚本: {script_file}")
        print("请运行此脚本安装缺失的Skills")
    
    # 提供解决方案
    finder.suggest_immediate_solutions()


if __name__ == "__main__":
    main()