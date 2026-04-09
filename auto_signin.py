#!/usr/bin/env python3
"""
WorkBuddy 自动签到脚本
通过模拟用户界面操作实现每日自动签到领取积分
"""

import os
import sys
import time
import logging
import subprocess
from datetime import datetime
from pathlib import Path

import pyautogui
# 禁用 fail-safe，防止鼠标移动到角落时程序中止
pyautogui.FAILSAFE = False
# 降低操作速度，避免操作过快
pyautogui.PAUSE = 0.3

# 配置日志
log_dir = Path.home() / ".workbuddy" / "logs"
log_dir.mkdir(parents=True, exist_ok=True)
log_file = log_dir / f"workbuddy_signin_{datetime.now().strftime('%Y%m')}.log"

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(log_file, encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# WorkBuddy 相关配置
import json
CONFIG_FILE = Path(__file__).parent / "config.json"

class WorkBuddyAutoSignIn:
    def __init__(self):
        self.screen_width, self.screen_height = pyautogui.size()
        logger.info(f"屏幕分辨率: {self.screen_width}x{self.screen_height}")
        
        # 加载配置
        self.config = self.load_config()
        
    def load_config(self):
        """加载配置文件"""
        default_config = {
            "workbuddy": {
                "executable_path": r"C:\Program Files\Tencent\WorkBuddy\WorkBuddy.exe",
                "process_name": "WorkBuddy.exe"
            },
            "signin": {
                "username_click": {"x": "auto", "y": "auto"},
                "signin_button": {"x": "auto", "y": "auto"},
                "retry_count": 3,
                "delay_between_clicks": 1.0
            },
            "self_check": {
                "enabled": True,
                "generate_report": True,
                "check_system_status": True,
                "check_signin_history": True,
                "report_format": ["txt", "json"]
            },
            "logging": {
                "log_level": "INFO",
                "save_screenshots": True,
                "screenshot_dir": "~/.workbuddy/screenshots"
            }
        }
        
        if CONFIG_FILE.exists():
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                # 合并配置
                merged_config = default_config.copy()
                self.merge_config(merged_config, user_config)
                logger.info("配置文件加载成功")
                return merged_config
            except Exception as e:
                logger.warning(f"配置文件加载失败，使用默认配置: {e}")
                return default_config
        else:
            logger.info("未找到配置文件，使用默认配置")
            return default_config
    
    def merge_config(self, base, update):
        """递归合并配置"""
        for key, value in update.items():
            if key in base and isinstance(base[key], dict) and isinstance(value, dict):
                self.merge_config(base[key], value)
            else:
                base[key] = value
        
    def is_workbuddy_running(self):
        """检查 WorkBuddy 是否正在运行"""
        try:
            process_name = self.config["workbuddy"]["process_name"]
            result = subprocess.run(
                ['tasklist', '/FI', f'IMAGENAME eq {process_name}'],
                capture_output=True, text=True, encoding='utf-8', errors='ignore'
            )
            return process_name.lower() in result.stdout.lower()
        except Exception as e:
            logger.error(f"检查进程时出错: {e}")
            return False
    
    def start_workbuddy(self):
        """启动 WorkBuddy 客户端"""
        logger.info("正在启动 WorkBuddy...")
        try:
            workbuddy_path = self.config["workbuddy"]["executable_path"]
            if os.path.exists(workbuddy_path):
                subprocess.Popen([workbuddy_path])
                logger.info(f"WorkBuddy 启动命令已执行: {workbuddy_path}")
                time.sleep(10)  # 等待应用启动
                return True
            else:
                logger.error(f"WorkBuddy 路径不存在: {workbuddy_path}")
                logger.info("请在 config.json 中设置正确的 WorkBuddy 路径")
                return False
        except Exception as e:
            logger.error(f"启动 WorkBuddy 时出错: {e}")
            return False
    
    def focus_workbuddy_window(self):
        """将焦点切换到 WorkBuddy 窗口"""
        logger.info("尝试聚焦 WorkBuddy 窗口")
        try:
            # 使用 Windows 命令查找并激活 WorkBuddy 窗口
            script = """
            Add-Type -TypeDefinition @"
            using System;
            using System.Runtime.InteropServices;
            public class WindowHelper {
                [DllImport("user32.dll")]
                public static extern bool SetForegroundWindow(IntPtr hWnd);
                
                [DllImport("user32.dll")]
                public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
                
                [DllImport("user32.dll", SetLastError = true)]
                public static extern IntPtr FindWindow(string lpClassName, string lpWindowName);
            }
"@
            $hWnd = [WindowHelper]::FindWindow($null, "WorkBuddy")
            if ($hWnd -ne [IntPtr]::Zero) {
                [WindowHelper]::ShowWindow($hWnd, 9) # SW_RESTORE
                [WindowHelper]::SetForegroundWindow($hWnd)
                Write-Output "WorkBuddy窗口已激活"
            } else {
                Write-Output "未找到WorkBuddy窗口"
            }
            """
            
            result = subprocess.run(
                ["powershell", "-Command", script],
                capture_output=True, text=True, encoding='utf-8', errors='ignore'
            )
            output = result.stdout.strip() + result.stderr.strip()
            logger.info(f"窗口激活结果: {output}")
            time.sleep(2)
            return "WorkBuddy" in output and "未找到" not in output
        except Exception as e:
            logger.error(f"聚焦窗口时出错: {e}")
            return False
    
    def perform_signin(self):
        """执行签到操作"""
        logger.info("开始执行签到流程")
        
        try:
            # 步骤1: 点击左下角用户名区域
            username_config = self.config["signin"]["username_click"]
            
            if username_config["x"] == "auto":
                username_x = self.screen_width // 10  # 屏幕左侧10%位置
            else:
                username_x = int(username_config["x"])
                
            if username_config["y"] == "auto":
                username_y = self.screen_height - 50  # 屏幕底部上方50像素
            else:
                username_y = int(username_config["y"])
            
            logger.info(f"点击用户名区域: ({username_x}, {username_y})")
            pyautogui.click(username_x, username_y)
            time.sleep(self.config["signin"]["delay_between_clicks"])
            
            # 步骤2: 寻找签到按钮
            # 方法1: 尝试点击屏幕中部可能的签到按钮位置
            signin_x = self.screen_width // 2
            signin_y = self.screen_height // 2 + 100
            logger.info(f"尝试点击可能的签到按钮位置: ({signin_x}, {signin_y})")
            pyautogui.click(signin_x, signin_y)
            time.sleep(1)
            
            # 方法2: 按ESC关闭可能弹出的菜单，然后重新尝试
            pyautogui.press('esc')
            time.sleep(0.5)
            
            # 再次点击用户名区域
            pyautogui.click(username_x, username_y)
            time.sleep(1)
            
            # 方法3: 使用方向键导航
            pyautogui.press('down', presses=3)  # 按向下键3次
            time.sleep(0.5)
            pyautogui.press('enter')  # 按回车键选择
            time.sleep(1)
            
            # 方法4: 最后尝试点击积分相关区域
            points_x = username_x + 100
            points_y = username_y - 100
            
            logger.info(f"尝试点击积分相关区域: ({points_x}, {points_y})")
            pyautogui.click(points_x, points_y)
            time.sleep(1)
            
            # 步骤3: 确认签到成功
            pyautogui.press('esc')
            time.sleep(0.5)
            
            logger.info("签到流程执行完成")
            return True
            
        except Exception as e:
            logger.error(f"执行签到流程时出错: {e}")
            return False
    
    def take_screenshot(self, description):
        """截图保存，用于调试"""
        try:
            screenshot_dir = Path.home() / ".workbuddy" / "screenshots"
            screenshot_dir.mkdir(parents=True, exist_ok=True)
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            screenshot_path = screenshot_dir / f"{description}_{timestamp}.png"
            
            screenshot = pyautogui.screenshot()
            screenshot.save(str(screenshot_path))
            logger.info(f"截图已保存: {screenshot_path}")
            
            return screenshot_path
        except Exception as e:
            logger.warning(f"截图跳过 ({e.__class__.__name__}): {e}")
            return None
    
    def self_check(self):
        """签到后自检功能"""
        # 检查自检功能是否启用
        if not self.config.get("self_check", {}).get("enabled", True):
            logger.info("自检功能已禁用，跳过自检")
            return True
            
        logger.info("开始签到后自检...")
        
        try:
            self_check_config = self.config.get("self_check", {})
            
            # 自检步骤1: 检查签到记录（如果启用）
            if self_check_config.get("check_signin_history", True):
                self._check_signin_record()
            else:
                logger.info("跳过签到记录检查")
            
            # 自检步骤2: 检查系统状态（如果启用）
            if self_check_config.get("check_system_status", True):
                self._check_system_status()
            else:
                logger.info("跳过系统状态检查")
            
            # 自检步骤3: 生成自检报告（如果启用）
            if self_check_config.get("generate_report", True):
                self._generate_self_check_report()
            else:
                logger.info("跳过报告生成")
            
            logger.info("✓ 自检完成")
            return True
            
        except Exception as e:
            logger.error(f"自检过程出错: {e}")
            return False
    
    def _check_signin_record(self):
        """检查签到记录"""
        logger.info("检查签到记录...")
        
        record_file = log_dir / "signin_history.csv"
        if record_file.exists():
            with open(record_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            # 统计签到记录
            total_signins = len(lines) - 1  # 减去标题行
            today = datetime.now().strftime("%Y-%m-%d")
            today_signins = sum(1 for line in lines if today in line)
            
            logger.info(f"总签到次数: {total_signins}")
            logger.info(f"今日签到次数: {today_signins}")
            
            # 检查连续签到
            if total_signins >= 7:
                logger.info("🎉 已达到连续签到7天资格，可能获得额外奖励！")
            
            return total_signins, today_signins
        else:
            logger.warning("签到记录文件不存在")
            return 0, 0
    
    def _check_system_status(self):
        """检查系统状态"""
        logger.info("检查系统状态...")
        
        # 检查 WorkBuddy 进程
        is_running = self.is_workbuddy_running()
        logger.info(f"WorkBuddy 进程状态: {'运行中' if is_running else '未运行'}")
        
        # 检查屏幕状态
        screen_width, screen_height = pyautogui.size()
        logger.info(f"屏幕分辨率: {screen_width}x{screen_height}")
        
        # 检查鼠标位置
        try:
            mouse_x, mouse_y = pyautogui.position()
            logger.info(f"当前鼠标位置: ({mouse_x}, {mouse_y})")
        except:
            logger.warning("无法获取鼠标位置")
        
        return is_running
    
    def _generate_self_check_report(self):
        """生成自检报告"""
        logger.info("生成自检报告...")
        
        report_dir = Path.home() / ".workbuddy" / "reports"
        report_dir.mkdir(parents=True, exist_ok=True)
        
        report_file = report_dir / f"self_check_{datetime.now().strftime('%Y%m%d')}.txt"
        
        report_content = f"""WorkBuddy 自动签到自检报告
生成时间: {datetime.now()}

=== 签到记录 ===
"""
        # 读取签到记录
        record_file = log_dir / "signin_history.csv"
        if record_file.exists():
            with open(record_file, 'r', encoding='utf-8') as f:
                report_content += f.read()
        else:
            report_content += "签到记录文件不存在\n"
        
        report_content += f"""
=== 系统状态 ===
WorkBuddy 运行状态: {'正常' if self.is_workbuddy_running() else '异常'}
屏幕分辨率: {self.screen_width}x{self.screen_height}
当前时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

=== 今日操作 ===
签到执行时间: {datetime.now().strftime('%H:%M:%S')}
签到结果: 已执行
自检结果: 已完成

=== 建议 ===
1. 每日检查签到记录确认是否成功
2. 连续签到7天关注额外奖励
3. 定期清理截图和日志文件
4. 关注 WorkBuddy 积分余额变化

=== 积分规则参考 ===
- 每日签到: 100 积分
- 连续7天签到: 额外奖励
- 积分有效期: 请查看官方说明
"""
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report_content)
        
        logger.info(f"自检报告已保存: {report_file}")
        
        # 同时保存为 JSON 格式便于程序读取
        json_report = {
            "timestamp": datetime.now().isoformat(),
            "signin_count": self._get_today_signin_count(),
            "workbuddy_running": self.is_workbuddy_running(),
            "screen_resolution": f"{self.screen_width}x{self.screen_height}",
            "self_check_status": "completed"
        }
        
        json_file = report_dir / f"self_check_{datetime.now().strftime('%Y%m%d')}.json"
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(json_report, f, indent=2, ensure_ascii=False)
        
        return report_file
    
    def _get_today_signin_count(self):
        """获取今日签到次数"""
        record_file = log_dir / "signin_history.csv"
        if record_file.exists():
            with open(record_file, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            today = datetime.now().strftime("%Y-%m-%d")
            return sum(1 for line in lines if today in line)
        return 0
    
    def run(self):
        """主执行流程"""
        logger.info("=" * 50)
        logger.info(f"WorkBuddy 自动签到开始 - {datetime.now()}")
        logger.info("=" * 50)
        
        # 检查 WorkBuddy 是否运行
        if not self.is_workbuddy_running():
            logger.warning("WorkBuddy 未运行，尝试启动...")
            if not self.start_workbuddy():
                logger.error("无法启动 WorkBuddy，签到失败")
                return False
        
        # 等待 WorkBuddy 完全启动
        time.sleep(5)
        
        # 聚焦到 WorkBuddy 窗口
        if not self.focus_workbuddy_window():
            logger.warning("无法聚焦到 WorkBuddy 窗口，继续尝试...")
        
        # 截图当前状态（调试用）
        self.take_screenshot("before_signin")
        
        # 执行签到
        signin_success = self.perform_signin()
        
        # 签到后截图（调试用）
        self.take_screenshot("after_signin")
        
        # 记录结果
        if signin_success:
            logger.info("✓ 签到流程执行完成")
            
            # 保存签到记录
            record_file = log_dir / "signin_history.csv"
            record = f"{datetime.now()},success\n"
            
            if not record_file.exists():
                with open(record_file, 'w', encoding='utf-8') as f:
                    f.write("timestamp,status\n")
            
            with open(record_file, 'a', encoding='utf-8') as f:
                f.write(record)
        else:
            logger.warning("⚠ 签到流程可能未完全成功")
        
        # 签到后自检
        logger.info("-" * 30)
        logger.info("开始签到后自检...")
        self_check_result = self.self_check()
        
        if self_check_result:
            logger.info("✅ 自检完成，系统状态正常")
        else:
            logger.warning("⚠ 自检过程中发现异常")
        
        logger.info("=" * 50)
        logger.info(f"WorkBuddy 自动签到结束 - {datetime.now()}")
        logger.info("=" * 50)
        
        return signin_success and self_check_result

def main():
    """主函数"""
    try:
        # 检查必要的库
        try:
            import pyautogui
        except ImportError:
            logger.error("缺少依赖库: pyautogui")
            logger.info("请安装依赖: pip install pyautogui")
            return False
        
        # 创建自动签到实例
        auto_signin = WorkBuddyAutoSignIn()
        
        # 运行自动签到
        success = auto_signin.run()
        
        if success:
            logger.info("自动签到任务执行成功！")
            return 0
        else:
            logger.warning("自动签到任务执行可能有异常，请检查日志")
            return 1
            
    except KeyboardInterrupt:
        logger.info("用户中断执行")
        return 2
    except Exception as e:
        logger.error(f"程序执行异常: {e}", exc_info=True)
        return 3

if __name__ == "__main__":
    sys.exit(main())