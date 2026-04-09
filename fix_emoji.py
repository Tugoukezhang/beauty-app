#!/usr/bin/env python3
"""
修复skills_search_manager.py中的表情符号编码问题
"""

import re

def fix_emoji_in_file(filename):
    """修复文件中的表情符号"""
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 替换表情符号为文本描述
    replacements = {
        "❌": "[ERROR]",
        "✅": "[OK]",
        "🔄": "[UPDATE]",
        "📊": "[STATS]",
        "🔍": "[SEARCH]",
        "📦": "[INSTALL]",
        "📄": "[REPORT]",
        "📁": "[FOLDER]"
    }
    
    for emoji, text in replacements.items():
        content = content.replace(emoji, text)
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed emoji in {filename}")

if __name__ == "__main__":
    fix_emoji_in_file("skills_search_manager.py")