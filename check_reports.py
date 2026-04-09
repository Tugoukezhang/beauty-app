#!/usr/bin/env python3
"""
WorkBuddy 自检报告查看工具
用于查看每日签到自检报告和系统状态
"""

import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from tabulate import tabulate

class ReportViewer:
    def __init__(self):
        self.report_dir = Path.home() / ".workbuddy" / "reports"
        self.log_dir = Path.home() / ".workbuddy" / "logs"
        
    def list_recent_reports(self, days=7):
        """列出最近的自检报告"""
        print(f"\n📊 最近 {days} 天的自检报告:")
        print("=" * 60)
        
        reports = []
        for file in sorted(self.report_dir.glob("self_check_*.txt"), reverse=True):
            # 从文件名提取日期
            try:
                date_str = file.stem.replace("self_check_", "")
                report_date = datetime.strptime(date_str, "%Y%m%d")
                
                # 检查是否在指定天数内
                if (datetime.now() - report_date).days <= days:
                    with open(file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # 提取关键信息
                    lines = content.split('\n')
                    status = "✅" if "自检结果: 已完成" in content else "⚠️"
                    time_line = next((l for l in lines if "生成时间:" in l), "")
                    time_str = time_line.replace("生成时间:", "").strip()
                    
                    reports.append({
                        "日期": report_date.strftime("%Y-%m-%d"),
                        "状态": status,
                        "时间": time_str,
                        "文件": file.name
                    })
            except Exception as e:
                continue
        
        if reports:
            print(tabulate(reports, headers="keys", tablefmt="grid"))
        else:
            print("暂无自检报告")
    
    def show_today_report(self):
        """显示今日的自检报告"""
        today = datetime.now().strftime("%Y%m%d")
        report_file = self.report_dir / f"self_check_{today}.txt"
        
        if report_file.exists():
            print(f"\n📋 今日自检报告 ({today}):")
            print("=" * 60)
            with open(report_file, 'r', encoding='utf-8') as f:
                print(f.read())
        else:
            print(f"今日 ({today}) 暂无自检报告")
    
    def show_signin_history(self, days=30):
        """显示签到历史"""
        print(f"\n📅 最近 {days} 天签到历史:")
        print("=" * 60)
        
        record_file = self.log_dir / "signin_history.csv"
        if record_file.exists():
            with open(record_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            if len(lines) > 1:  # 有数据行
                # 统计最近days天的签到
                recent_signins = []
                for line in lines[1:]:  # 跳过标题行
                    parts = line.strip().split(',')
                    if len(parts) >= 2:
                        timestamp_str, status = parts[0], parts[1]
                        try:
                            timestamp = datetime.fromisoformat(timestamp_str.replace(' ', 'T'))
                            if (datetime.now() - timestamp).days <= days:
                                recent_signins.append({
                                    "日期": timestamp.strftime("%Y-%m-%d"),
                                    "时间": timestamp.strftime("%H:%M:%S"),
                                    "状态": "✅" if status == "success" else "❌"
                                })
                        except:
                            continue
                
                if recent_signins:
                    print(tabulate(recent_signins, headers="keys", tablefmt="grid"))
                    
                    # 统计信息
                    total_days = days
                    success_days = len(set(s["日期"] for s in recent_signins if s["状态"] == "✅"))
                    success_rate = (success_days / total_days) * 100
                    
                    print(f"\n📈 统计信息:")
                    print(f"  观察期: {total_days} 天")
                    print(f"  成功签到: {success_days} 天")
                    print(f"  成功率: {success_rate:.1f}%")
                    
                    # 连续签到天数
                    consecutive = self._calculate_consecutive_days(recent_signins)
                    if consecutive > 0:
                        print(f"  当前连续签到: {consecutive} 天")
                        if consecutive >= 7:
                            print(f"  🎉 已达到连续7天签到，可能获得额外奖励！")
                else:
                    print(f"最近 {days} 天暂无签到记录")
            else:
                print("暂无签到记录")
        else:
            print("签到记录文件不存在")
    
    def _calculate_consecutive_days(self, signins):
        """计算连续签到天数"""
        if not signins:
            return 0
        
        # 获取成功签到的日期
        success_dates = set()
        for s in signins:
            if s["状态"] == "✅":
                success_dates.add(s["日期"])
        
        if not success_dates:
            return 0
        
        # 按日期排序
        sorted_dates = sorted(success_dates, reverse=True)
        
        # 检查连续天数
        consecutive = 1
        for i in range(len(sorted_dates) - 1):
            current_date = datetime.strptime(sorted_dates[i], "%Y-%m-%d")
            next_date = datetime.strptime(sorted_dates[i + 1], "%Y-%m-%d")
            
            if (current_date - next_date).days == 1:
                consecutive += 1
            else:
                break
        
        return consecutive
    
    def show_system_summary(self):
        """显示系统摘要"""
        print(f"\n⚙️ 系统状态摘要:")
        print("=" * 60)
        
        # 检查报告目录
        report_count = len(list(self.report_dir.glob("self_check_*.txt")))
        print(f"自检报告数量: {report_count} 份")
        
        # 检查日志目录
        log_count = len(list(self.log_dir.glob("*.log")))
        print(f"日志文件数量: {log_count} 个")
        
        # 检查截图目录
        screenshot_dir = Path.home() / ".workbuddy" / "screenshots"
        if screenshot_dir.exists():
            screenshot_count = len(list(screenshot_dir.glob("*.png")))
            print(f"截图数量: {screenshot_count} 张")
        
        # 检查配置文件
        config_file = Path(__file__).parent / "config.json"
        if config_file.exists():
            print(f"配置文件: 已存在")
            try:
                with open(config_file, 'r', encoding='utf-8') as f:
                    config = json.load(f)
                if config.get("self_check", {}).get("enabled", False):
                    print(f"自检功能: 已启用")
                else:
                    print(f"自检功能: 已禁用")
            except:
                print(f"配置文件: 读取异常")
        else:
            print(f"配置文件: 不存在")
        
        print(f"\n📁 相关目录:")
        print(f"  报告目录: {self.report_dir}")
        print(f"  日志目录: {self.log_dir}")
        print(f"  截图目录: {screenshot_dir}")
    
    def show_help(self):
        """显示帮助信息"""
        print(f"""
WorkBuddy 自检报告查看工具
========================

使用方法:
  python check_reports.py [命令]

可用命令:
  today        - 查看今日自检报告
  recent       - 查看最近7天报告
  history      - 查看签到历史
  summary      - 查看系统摘要
  all          - 查看所有信息
  help         - 显示此帮助信息

示例:
  python check_reports.py today      # 查看今日报告
  python check_reports.py recent     # 查看最近报告
  python check_reports.py history    # 查看签到历史

无参数时默认显示今日报告和摘要。
""")

def main():
    viewer = ReportViewer()
    
    # 确保目录存在
    viewer.report_dir.mkdir(parents=True, exist_ok=True)
    viewer.log_dir.mkdir(parents=True, exist_ok=True)
    
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        if command == "today":
            viewer.show_today_report()
        elif command == "recent":
            viewer.list_recent_reports(7)
        elif command == "history":
            viewer.show_signin_history(30)
        elif command == "summary":
            viewer.show_system_summary()
        elif command == "all":
            viewer.show_today_report()
            viewer.list_recent_reports(7)
            viewer.show_signin_history(30)
            viewer.show_system_summary()
        elif command in ["help", "-h", "--help"]:
            viewer.show_help()
        else:
            print(f"未知命令: {command}")
            viewer.show_help()
    else:
        # 默认显示今日报告和摘要
        viewer.show_today_report()
        viewer.show_system_summary()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n用户中断操作")
    except Exception as e:
        print(f"\n❌ 程序执行出错: {e}")
        print(f"请检查依赖是否安装: pip install tabulate")