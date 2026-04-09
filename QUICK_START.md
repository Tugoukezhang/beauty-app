# WorkBuddy 自动签到快速开始指南

只需5步，即可设置每日自动签到！

## 步骤1：安装依赖

双击运行 `install_dependencies.bat`，安装所需Python库。

## 步骤2：测试脚本

打开命令提示符，运行：

```cmd
cd c:\Users\lintonhao\WorkBuddy\20260407093653
python auto_signin.py
```

**注意**：第一次运行时，请确保：
- WorkBuddy 客户端已登录
- 电脑屏幕未锁定
- 观察脚本执行过程

## 步骤3：调整坐标（可选）

如果签到按钮点击不准确：

1. 运行 `python auto_signin.py` 测试
2. 查看生成的截图：`C:\Users\你的用户名\.workbuddy\screenshots\`
3. 编辑 `config.json`，修改坐标：
   ```json
   "username_click": {"x": 100, "y": 1000},
   "signin_button": {"x": 500, "y": 600}
   ```

## 步骤4：验证自动化任务

在 WorkBuddy 中：
1. 点击左侧菜单 → 自动化
2. 找到 "WorkBuddy每日自动签到"
3. 确保状态为 "ACTIVE"
4. 下次执行时间：明天 09:00

## 步骤5：检查签到结果

查看签到记录：

```cmd
type %USERPROFILE%\.workbuddy\logs\signin_history.csv
```

## 重要提示

### 电脑需保持状态
- 自动签到时电脑需为唤醒状态
- 屏幕不能锁定（或使用远程桌面保持连接）
- 建议设置电脑不自动休眠

### 安全提醒
- 脚本仅在你的电脑上运行
- 不会上传任何个人信息
- 可以随时禁用自动化任务

### 问题解决
1. **签到失败**：查看 `%USERPROFILE%\.workbuddy\logs\` 中的日志
2. **脚本不运行**：检查 Python 和依赖是否安装
3. **坐标不准**：使用截图功能调试

## 预期效果

设置成功后：
- ✅ 每天自动签到领取100积分
- ✅ 连续7天额外奖励
- ✅ 无需手动操作
- ✅ 完整签到记录

---

**开始享受自动签到的便利吧！** 🎉

有任何问题，请查看 `README.md` 获取详细帮助。