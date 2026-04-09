#!/usr/bin/env python3
"""
修复Skills文件格式问题
主要修复SKILL.md缺少标题的问题
"""

import os
import json
from pathlib import Path

WORKBUDDY_HOME = Path.home() / ".workbuddy"
SKILLS_DIR = WORKBUDDY_HOME / "skills"

# 技能名称映射（文件夹名 -> 显示名）
SKILL_NAME_MAPPING = {
    "agent-browser": "Agent Browser",
    "agent-memory": "Agent Memory",
    "AI交叉审查": "AI交叉审查",
    "AI绘图": "AI绘图",
    "Android 原生开发": "Android原生开发",
    "brand-guidelines": "Brand Guidelines",
    "byterover": "ByteRover",
    "canvas-design": "Canvas Design",
    "clawdhub": "ClawdHub",
    "cloudbase": "CloudBase开发指南",
    "cloudq": "CloudQ云开发助手",
    "codeconductor": "CodeConductor",
    "data-analysis": "Data Analysis",
    "elite-longterm-memory": "Elite Longterm Memory",
    "evolver": "Evolver",
    "Excel 文件处理": "Excel文件处理",
    "excel-xlsx": "Excel/XLSX",
    "find-skills": "Find Skills",
    "Flutter 开发": "Flutter开发",
    "frontend-dev": "Frontend Development",
    "fullstack-dev": "Fullstack Development",
    "github": "GitHub",
    "GLSL Shader 开发": "GLSL Shader开发",
    "humanizer": "Humanizer",
    "iOS 应用开发": "iOS应用开发",
    "mcp-builder": "MCP Builder",
    "MCP管理器": "MCP管理器",
    "multi-search-engine": "Multi Search Engine",
    "nano-banana-pro": "Nano Banana Pro",
    "ontology": "Ontology",
    "openai-whisper-api": "OpenAI Whisper API",
    "PDF 文档生成": "PDF文档生成",
    "PPT 演示文稿": "PPT演示文稿",
    "proactive-agent": "Proactive Agent",
    "React Native 开发": "React Native开发",
    "react-native-dev": "React Native Dev",
    "self-improving": "Self Improving",
    "self-improving-agent": "Self Improving Agent",
    "skill-creator": "Skill Creator",
    "skyline": "Skyline",
    "skyline渲染引擎": "Skyline渲染引擎",
    "summarize": "Summarize",
    "tapd-openapi": "TAPD OpenAPI",
    "tdesign-miniprogram": "TDesign Mini Program",
    "tencent-ssv-techforgood": "腾讯技术公益",
    "tencentcloud-cos": "腾讯云COS",
    "tencentmap-jsapi-gl-skill": "腾讯地图API",
    "tmux": "Tmux",
    "ui-ux-pro-max": "UI/UX Pro Max",
    "video-generator-seedance": "Video Generator",
    "wechat-miniprogram": "微信小程序",
    "Word 文档生成": "Word文档生成",
    "word-docx": "Word/DOCX",
    "ZenStudio": "ZenStudio",
    "全栈开发": "全栈开发",
    "前端开发": "前端开发",
    "市场调研": "市场调研",
    "微信小程序开发框架": "微信小程序开发框架",
    "腾讯ima": "腾讯IMA",
    "腾讯云CloudBase": "腾讯云CloudBase"
}

def get_skill_display_name(folder_name):
    """获取技能的显示名称"""
    if folder_name in SKILL_NAME_MAPPING:
        return SKILL_NAME_MAPPING[folder_name]
    
    # 默认处理：将连字符替换为空格，首字母大写
    if '-' in folder_name:
        parts = folder_name.split('-')
        return ' '.join(part.capitalize() for part in parts)
    
    return folder_name

def get_skill_description(folder_name):
    """获取技能的描述"""
    descriptions = {
        "agent-browser": "快速Rust-based无头浏览器自动化CLI，支持Node.js回退，使AI代理能够通过结构化命令导航、点击、输入和截图页面。",
        "agent-memory": "AI代理记忆系统，提供知识管理和上下文检索功能。",
        "AI交叉审查": "使用@steipete/oracle CLI打包提示和文件，获取第二模型审查（API或浏览器）进行调试、重构、设计检查或交叉验证。",
        "AI绘图": "使用Nano Banana Pro（Gemini 3 Pro Image）生成/编辑图像。支持文本到图像和图像到图像转换。",
        "Android 原生开发": "Android原生应用开发和UI设计指南。涵盖Material Design 3、Kotlin/Compose开发、项目配置、无障碍功能和构建故障排除。",
        "brand-guidelines": "将Anthropic的官方品牌颜色和排版应用于任何可能受益于Anthropic外观和感觉的工件。",
        "byterover": "AI代理的知识管理系统。使用`brv`存储和检索项目模式、决策和架构规则。",
        "canvas-design": "使用设计理念在.png和.pdf文档中创建美丽的视觉艺术。",
        "clawdhub": "使用ClawdHub CLI从clawdhub.com搜索、安装、更新和发布代理技能。",
        "cloudbase": "CloudBase是一个全栈开发和部署工具包，用于构建和启动网站、Web应用、微信小程序和移动应用。",
        "cloudq": "腾讯云产品资源、AWS、阿里云等多云资源的智能顾问。",
        "data-analysis": "数据分析和可视化。查询数据库、生成报告、自动化电子表格，并将原始数据转化为清晰、可操作的见解。",
        "elite-longterm-memory": "Cursor、Claude、ChatGPT和Copilot的终极AI代理记忆系统。WAL协议+向量搜索+git-notes+云备份。",
        "evolver": "远程记忆图服务的API密钥。",
        "Excel 文件处理": "打开、创建、读取、分析、编辑或验证Excel/电子表格文件。",
        "find-skills": "帮助用户发现和安装代理技能。",
        "Flutter 开发": "Flutter跨平台开发指南，涵盖widget模式、Riverpod/Bloc状态管理、GoRouter导航、性能优化和平台特定实现。",
        "frontend-dev": "全栈前端开发，结合高级UI设计、电影动画、AI生成的媒体资产、有说服力的文案和视觉艺术。",
        "fullstack-dev": "全栈后端架构和前后端集成指南。",
        "github": "使用`gh` CLI与GitHub交互。",
        "GLSL Shader 开发": "全面的GLSL着色器技术，用于创建令人惊叹的视觉效果。",
        "humanizer": "从文本中移除AI生成的写作痕迹。",
        "iOS 应用开发": "iOS应用开发指南，涵盖UIKit、SnapKit和SwiftUI。",
        "mcp-builder": "创建高质量MCP（模型上下文协议）服务器的指南。",
        "multi-search-engine": "多搜索引擎集成，支持17个引擎。",
        "nano-banana-pro": "使用Nano Banana Pro生成/编辑图像。",
        "openai-whisper-api": "通过OpenAI音频转录API转录音频。",
        "PDF 文档生成": "生成高质量的PDF文档，支持表单填充和重新格式化。",
        "PPT 演示文稿": "生成、编辑和读取PowerPoint演示文稿。",
        "proactive-agent": "将AI代理从任务跟随者转变为主动合作伙伴。",
        "React Native 开发": "React Native和Expo开发指南。",
        "self-improving": "自我改进的AI代理系统。",
        "skill-creator": "技能创建工具。",
        "skyline": "Skyline渲染引擎技能。",
        "summarize": "文本摘要工具。",
        "tapd-openapi": "TAPD OpenAPI集成。",
        "tdesign-miniprogram": "TDesign小程序组件库。",
        "tencent-ssv-techforgood": "腾讯技术公益智能助手。",
        "tencentcloud-cos": "腾讯云对象存储服务。",
        "tencentmap-jsapi-gl-skill": "腾讯地图JavaScript API GL技能。",
        "tmux": "终端复用工具。",
        "ui-ux-pro-max": "高级UI/UX设计工具。",
        "wechat-miniprogram": "微信小程序开发框架。",
        "全栈开发": "全栈开发指南。",
        "前端开发": "前端开发指南。",
        "市场调研": "市场调研工具。",
        "微信小程序开发框架": "微信小程序开发框架。",
        "腾讯ima": "腾讯互动媒体广告。",
        "腾讯云CloudBase": "腾讯云CloudBase开发平台。"
    }
    
    if folder_name in descriptions:
        return descriptions[folder_name]
    
    return f"{get_skill_display_name(folder_name)}技能，提供相关功能和服务。"

def fix_skill_md_file(skill_path):
    """修复SKILL.md文件"""
    md_path = skill_path / "SKILL.md"
    folder_name = skill_path.name
    display_name = get_skill_display_name(folder_name)
    description = get_skill_description(folder_name)
    
    # 如果文件不存在，创建它
    if not md_path.exists():
        print(f"  创建SKILL.md文件: {display_name}")
        content = f"""# {display_name}

{description}

## 功能特性
- 提供相关功能和服务
- 支持常见操作和工作流程
- 易于集成和使用

## 使用方法
1. 在WorkBuddy中加载此技能
2. 按照提示使用相关功能
3. 查看帮助文档获取详细信息

## 版本信息
- 版本: 1.0.0
- 更新日期: 2026-04-07
- 状态: 已启用

## 注意事项
- 请确保WorkBuddy版本兼容
- 如有问题请查看日志或联系支持
"""
    else:
        # 读取现有内容
        try:
            with open(md_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            content = ""
        
        # 检查是否缺少标题
        if not content.startswith('#') and not content.strip().startswith('title:'):
            print(f"  修复SKILL.md标题: {display_name}")
            # 添加标题
            new_content = f"# {display_name}\n\n{description}\n\n"
            if content.strip():
                new_content += content
            content = new_content
    
    # 写入文件
    try:
        with open(md_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"  写入SKILL.md失败: {e}")
        return False

def create_skill_toml_if_needed(skill_path):
    """如果需要，创建skill.toml文件"""
    toml_path = skill_path / "skill.toml"
    folder_name = skill_path.name
    display_name = get_skill_display_name(folder_name)
    
    # 如果文件已存在，跳过
    if toml_path.exists():
        return True
    
    print(f"  创建skill.toml文件: {display_name}")
    
    content = f"""name = "{display_name}"
version = "1.0.0"
description = "{get_skill_description(folder_name)}"
author = "WorkBuddy Skills System"
enabled = true

[metadata]
created = "2026-04-07"
category = "tools"
tags = ["workbuddy", "skill", "automation"]

[dependencies]
# 依赖项列表
"""
    
    try:
        with open(toml_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"  写入skill.toml失败: {e}")
        return False

def main():
    """主函数"""
    print("开始修复Skills文件格式问题...")
    print("=" * 80)
    
    if not SKILLS_DIR.exists():
        print(f"错误: Skills目录不存在: {SKILLS_DIR}")
        return
    
    skills = list(SKILLS_DIR.iterdir())
    print(f"找到 {len(skills)} 个skills需要检查")
    print()
    
    fixed_count = 0
    created_toml_count = 0
    failed_count = 0
    
    for skill_path in skills:
        if not skill_path.is_dir():
            continue
            
        skill_name = skill_path.name
        print(f"修复: {skill_name}")
        
        # 修复SKILL.md文件
        if fix_skill_md_file(skill_path):
            fixed_count += 1
            print(f"  SKILL.md修复成功")
        else:
            failed_count += 1
            print(f"  SKILL.md修复失败")
        
        # 创建skill.toml文件（如果需要）
        if create_skill_toml_if_needed(skill_path):
            created_toml_count += 1
            print(f"  skill.toml创建/检查完成")
        
        print()
    
    # 生成总结报告
    print("=" * 80)
    print("修复结果总结")
    print("=" * 80)
    print(f"总共处理: {len(skills)} 个skills")
    print(f"修复SKILL.md文件: {fixed_count} 个")
    print(f"创建skill.toml文件: {created_toml_count} 个")
    print(f"修复失败: {failed_count} 个")
    print()
    
    # 建议
    print("建议后续操作:")
    print("1. 重启WorkBuddy以加载修复后的skills")
    print("2. 检查技能面板是否现在能显示所有skills")
    print("3. 如果仍有问题，检查WorkBuddy日志")
    print("4. 考虑清除WorkBuddy缓存")
    print()
    
    # 保存报告
    report = {
        '修复时间': '2026-04-07 12:38',
        '处理skills数量': len(skills),
        '修复SKILL.md数量': fixed_count,
        '创建skill.toml数量': created_toml_count,
        '失败数量': failed_count,
        '建议': [
            '重启WorkBuddy',
            '检查技能面板',
            '查看WorkBuddy日志'
        ]
    }
    
    report_path = WORKBUDDY_HOME / "skill_fix_report.json"
    with open(report_path, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    print(f"详细报告保存到: {report_path}")
    print("=" * 80)

if __name__ == "__main__":
    main()