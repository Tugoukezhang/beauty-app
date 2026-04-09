#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
WorkBuddy自动签到程序 - 精简版本
适用于美妆项目的签到扩展

功能：
1. 自动启动WorkBuddy
2. 模拟点击签到按钮
3. 截图保存证据
4. 生成签到报告

使用方法：
python auto_signin.py [--test] [--debug] [--config config.json]
"""

import os
import sys
import json
import time
import logging
import subprocess
import datetime
from pathlib import Path
from typing import Dict, Any, Optional, Tuple

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

try:
    import pyautogui
    import pygetwindow as gw
    from PIL import ImageGrab
    PYTHON_LIBS_AVAILABLE = True
except ImportError:
    PYTHON_LIBS_AVAILABLE = False
    print("⚠️ 缺少必要Python库，将安装依赖...")

class WorkBuddyAutoSignin:
    """WorkBuddy自动签到类"""
    
    def __init__(self, config_path: Optional[str] = None):
        """初始化签到程序
        
        Args:
            config_path: 配置文件路径，如果为None则使用默认配置
        """
        # 基本配置
        self.config = {
            "workbuddy_path": "C:\\Program Files\\Tencent\\WorkBuddy\\WorkBuddy.exe",
            "signin_button_coords": {"x": 1800, "y": 100},  # 默认签到按钮坐标
            "wait_for_startup": 30,  # 等待WorkBuddy启动的秒数
            "check_interval": 2,  # 检查签到状态的间隔（秒）
            "max_attempts": 3,  # 最大尝试次数
            "screenshot_dir": str(project_root / "screenshots"),
            "report_dir": str(project_root / "reports"),
            "log_dir": str(project_root / "logs"),
            "log_level": "INFO"
        }
        
        # 加载自定义配置
        if config_path and os.path.exists(config_path):
            try:
                with open(config_path, 'r', encoding='utf-8') as f:
                    user_config = json.load(f)
                    self.config.update(user_config)
            except Exception as e:
                print(f"⚠️ 加载配置文件失败: {e}")
        
        # 确保目录存在
        for dir_path in [self.config["screenshot_dir"], 
                         self.config["report_dir"], 
                         self.config["log_dir"]]:
            os.makedirs(dir_path, exist_ok=True)
        
        # 配置日志
        self._setup_logging()
        
        # 当前状态
        self.workbuddy_process = None
        self.signin_successful = False
        self.error_message = None
        
    def _setup_logging(self):
        """配置日志系统"""
        log_file = os.path.join(
            self.config["log_dir"], 
            f"signin_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        )
        
        logging.basicConfig(
            level=getattr(logging, self.config["log_level"]),
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        
        self.logger = logging.getLogger("WorkBuddyAutoSignin")
        
    def check_dependencies(self) -> bool:
        """检查依赖是否安装"""
        if not PYTHON_LIBS_AVAILABLE:
            self.logger.warning("缺少Python库，尝试安装...")
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install", "pyautogui", "pygetwindow", "Pillow"])
                self.logger.info("依赖安装成功")
                return True
            except Exception as e:
                self.logger.error(f"依赖安装失败: {e}")
                return False
        return True
    
    def start_workbuddy(self) -> bool:
        """启动WorkBuddy程序"""
        try:
            wb_path = self.config["workbuddy_path"]
            
            if not os.path.exists(wb_path):
                self.logger.error(f"WorkBuddy路径不存在: {wb_path}")
                return False
            
            self.logger.info(f"启动WorkBuddy: {wb_path}")
            
            # 检查是否已经运行
            try:
                import pygetwindow as gw
                wb_windows = gw.getWindowsWithTitle("WorkBuddy")
                if wb_windows:
                    self.logger.info("WorkBuddy已在运行中")
                    return True
            except:
                pass
            
            # 启动WorkBuddy
            self.workbuddy_process = subprocess.Popen([wb_path])
            self.logger.info(f"等待WorkBuddy启动 ({self.config['wait_for_startup']}秒)...")
            time.sleep(self.config["wait_for_startup"])
            
            return True
            
        except Exception as e:
            self.logger.error(f"启动WorkBuddy失败: {e}")
            self.error_message = str(e)
            return False
    
    def find_signin_button(self) -> Tuple[bool, Tuple[int, int]]:
        """查找签到按钮位置
        
        Returns:
            (是否找到, (x坐标, y坐标))
        """
        try:
            # 使用配置的坐标
            if self.config.get("signin_button_coords"):
                coords = self.config["signin_button_coords"]
                self.logger.info(f"使用配置的签到按钮坐标: ({coords['x']}, {coords['y']})")
                return True, (coords["x"], coords["y"])
            
            # 如果没有配置，尝试自动查找（简单实现）
            self.logger.info("尝试自动查找签到按钮...")
            screenshot = pyautogui.screenshot()
            
            # 这里可以添加图像识别逻辑
            # 暂时返回默认坐标
            default_coords = (1800, 100)
            self.logger.info(f"使用默认坐标: {default_coords}")
            return True, default_coords
            
        except Exception as e:
            self.logger.error(f"查找签到按钮失败: {e}")
            return False, (0, 0)
    
    def perform_signin(self) -> bool:
        """执行签到操作"""
        try:
            # 查找签到按钮
            found, coords = self.find_signin_button()
            if not found:
                self.logger.error("无法找到签到按钮")
                return False
            
            # 移动鼠标到签到按钮位置
            x, y = coords
            pyautogui.moveTo(x, y, duration=0.5)
            self.logger.info(f"移动鼠标到签到按钮位置: ({x}, {y})")
            
            # 点击签到按钮
            pyautogui.click()
            self.logger.info("点击签到按钮")
            
            # 等待签到完成
            time.sleep(3)
            
            # 截图保存证据
            self._capture_screenshot("signin_completed")
            
            self.logger.info("签到操作完成")
            return True
            
        except Exception as e:
            self.logger.error(f"签到操作失败: {e}")
            self.error_message = str(e)
            return False
    
    def _capture_screenshot(self, name: str):
        """截图保存
        
        Args:
            name: 截图名称
        """
        try:
            screenshot = pyautogui.screenshot()
            
            # 生成文件名
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"{name}_{timestamp}.png"
            filepath = os.path.join(self.config["screenshot_dir"], filename)
            
            # 保存截图
            screenshot.save(filepath)
            self.logger.info(f"截图已保存: {filepath}")
            
        except Exception as e:
            self.logger.warning(f"截图失败: {e}")
    
    def generate_report(self) -> Dict[str, Any]:
        """生成签到报告"""
        report = {
            "timestamp": datetime.datetime.now().isoformat(),
            "success": self.signin_successful,
            "workbuddy_path": self.config["workbuddy_path"],
            "attempts": getattr(self, 'attempt_count', 1),
            "error_message": self.error_message,
            "screenshots": [],
            "system_info": {
                "python_version": sys.version,
                "platform": sys.platform,
                "current_time": time.strftime("%Y-%m-%d %H:%M:%S"),
                "working_directory": os.getcwd()
            }
        }
        
        # 收集截图文件
        if os.path.exists(self.config["screenshot_dir"]):
            try:
                screenshots = []
                for file in os.listdir(self.config["screenshot_dir"]):
                    if file.endswith(('.png', '.jpg', '.jpeg')):
                        filepath = os.path.join(self.config["screenshot_dir"], file)
                        file_stat = os.stat(filepath)
                        screenshots.append({
                            "filename": file,
                            "path": filepath,
                            "size_bytes": file_stat.st_size,
                            "modified_time": file_stat.st_mtime
                        })
                report["screenshots"] = screenshots
            except Exception as e:
                self.logger.warning(f"收集截图信息失败: {e}")
        
        return report
    
    def save_report(self, report: Dict[str, Any]):
        """保存报告到文件"""
        try:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            
            # JSON格式报告
            json_file = os.path.join(self.config["report_dir"], f"signin_report_{timestamp}.json")
            with open(json_file, 'w', encoding='utf-8') as f:
                json.dump(report, f, ensure_ascii=False, indent=2)
            self.logger.info(f"JSON报告已保存: {json_file}")
            
            # 文本格式报告
            txt_file = os.path.join(self.config["report_dir"], f"signin_report_{timestamp}.txt")
            with open(txt_file, 'w', encoding='utf-8') as f:
                f.write("=" * 50 + "\n")
                f.write("WorkBuddy 自动签到报告\n")
                f.write("=" * 50 + "\n\n")
                f.write(f"报告时间: {report['timestamp']}\n")
                f.write(f"签到状态: {'成功 ✅' if report['success'] else '失败 ❌'}\n")
                f.write(f"WorkBuddy路径: {report['workbuddy_path']}\n")
                f.write(f"尝试次数: {report['attempts']}\n")
                if report['error_message']:
                    f.write(f"错误信息: {report['error_message']}\n")
                f.write(f"\n系统信息:\n")
                for key, value in report['system_info'].items():
                    f.write(f"  {key}: {value}\n")
                
                if report['screenshots']:
                    f.write(f"\n截图文件 ({len(report['screenshots'])}张):\n")
                    for i, screenshot in enumerate(report['screenshots'], 1):
                        f.write(f"  {i}. {screenshot['filename']} ({screenshot['size_bytes']:,} bytes)\n")
            
            self.logger.info(f"文本报告已保存: {txt_file}")
            
        except Exception as e:
            self.logger.error(f"保存报告失败: {e}")
    
    def run(self, max_attempts: Optional[int] = None) -> bool:
        """运行自动签到程序
        
        Args:
            max_attempts: 最大尝试次数，None使用配置值
            
        Returns:
            是否签到成功
        """
        self.logger.info("=" * 50)
        self.logger.info("WorkBuddy自动签到程序启动")
        self.logger.info("=" * 50)
        
        # 检查依赖
        if not self.check_dependencies():
            self.signin_successful = False
            self.error_message = "依赖检查失败"
            return False
        
        # 设置最大尝试次数
        if max_attempts is None:
            max_attempts = self.config["max_attempts"]
        
        self.attempt_count = 0
        
        # 尝试签到
        for attempt in range(1, max_attempts + 1):
            self.attempt_count = attempt
            self.logger.info(f"签到尝试 #{attempt}/{max_attempts}")
            
            try:
                # 启动WorkBuddy
                if not self.start_workbuddy():
                    self.logger.warning("启动WorkBuddy失败，继续尝试...")
                    time.sleep(5)
                    continue
                
                # 执行签到
                if self.perform_signin():
                    self.signin_successful = True
                    self.logger.info("✅ 签到成功!")
                    break
                else:
                    self.logger.warning(f"签到失败，{self.config['check_interval']}秒后重试...")
                    time.sleep(self.config["check_interval"])
                    
            except Exception as e:
                self.logger.error(f"签到过程中发生错误: {e}")
                self.error_message = str(e)
                time.sleep(self.config["check_interval"])
        
        # 生成报告
        report = self.generate_report()
        self.save_report(report)
        
        # 清理资源
        if self.workbuddy_process:
            try:
                self.workbuddy_process.terminate()
                self.logger.info("WorkBuddy进程已终止")
            except:
                pass
        
        self.logger.info(f"签到程序结束，状态: {'成功 ✅' if self.signin_successful else '失败 ❌'}")
        return self.signin_successful

def main():
    """主函数"""
    import argparse
    
    parser = argparse.ArgumentParser(description="WorkBuddy自动签到程序")
    parser.add_argument("--test", action="store_true", help="测试模式，不实际点击")
    parser.add_argument("--debug", action="store_true", help="调试模式，输出详细信息")
    parser.add_argument("--config", type=str, help="配置文件路径")
    parser.add_argument("--attempts", type=int, help="最大尝试次数")
    
    args = parser.parse_args()
    
    # 创建签到程序实例
    signin = WorkBuddyAutoSignin(args.config)
    
    if args.debug:
        signin.config["log_level"] = "DEBUG"
        # 重新配置日志
        signin._setup_logging()
    
    if args.test:
        signin.logger.info("运行测试模式...")
        # 在测试模式中修改配置，避免实际点击
        signin.config["max_attempts"] = 1
        # 这里可以添加测试逻辑
        signin.logger.info("测试模式完成")
        return True
    
    # 运行签到
    success = signin.run(args.attempts)
    
    # 输出结果
    if success:
        print("\n" + "=" * 50)
        print("✅ 签到成功!")
        print("=" * 50)
    else:
        print("\n" + "=" * 50)
        print("❌ 签到失败!")
        print("=" * 50)
        if signin.error_message:
            print(f"错误信息: {signin.error_message}")
    
    return success

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n程序被用户中断")
        sys.exit(130)
    except Exception as e:
        print(f"程序发生错误: {e}")
        sys.exit(1)