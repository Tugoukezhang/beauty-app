@echo off
chcp 65001 >nul
echo ========================================
echo   美妆项目 Skills 一键安装脚本
echo   从本地 Marketplace 安装到 workbuddy/skills
echo ========================================
echo.

set SRC=%USERPROFILE%\.workbuddy\skills-marketplace\skills
set DST=%USERPROFILE%\.workbuddy\skills

echo [1/11] 安装 fullstack-dev ...
xcopy "%SRC%\fullstack-dev" "%DST%\fullstack-dev\" /E /I /Y >nul 2>&1 && echo   ✅ fullstack-dev || echo   ❌ fullstack-dev 安装失败

echo [2/11] 安装 frontend-dev ...
xcopy "%SRC%\frontend-dev" "%DST%\frontend-dev\" /E /I /Y >nul 2>&1 && echo   ✅ frontend-dev || echo   ❌ frontend-dev 安装失败

echo [3/11] 安装 ui-ux-pro-max ...
xcopy "%SRC%\ui-ux-pro-max" "%DST%\ui-ux-pro-max\" /E /I /Y >nul 2>&1 && echo   ✅ ui-ux-pro-max || echo   ❌ ui-ux-pro-max 安装失败

echo [4/11] 安装 tencentcloud-cos ...
xcopy "%SRC%\tencentcloud-cos" "%DST%\tencentcloud-cos\" /E /I /Y >nul 2>&1 && echo   ✅ tencentcloud-cos || echo   ❌ tencentcloud-cos 安装失败

echo [5/11] 安装 wechatpay-product-coupon ...
xcopy "%SRC%\wechatpay-product-coupon" "%DST%\wechatpay-product-coupon\" /E /I /Y >nul 2>&1 && echo   ✅ wechatpay-product-coupon || echo   ❌ wechatpay-product-coupon 安装失败

echo [6/11] 安装 market-researcher ...
xcopy "%SRC%\market-researcher" "%DST%\market-researcher\" /E /I /Y >nul 2>&1 && echo   ✅ market-researcher || echo   ❌ market-researcher 安装失败

echo [7/11] 安装 video-frames ...
xcopy "%SRC%\video-frames" "%DST%\video-frames\" /E /I /Y >nul 2>&1 && echo   ✅ video-frames || echo   ❌ video-frames 安装失败

echo [8/11] 安装 github ...
xcopy "%SRC%\github" "%DST%\github\" /E /I /Y >nul 2>&1 && echo   ✅ github || echo   ❌ github 安装失败

echo [9/11] 安装 wechat-miniprogram ...
xcopy "%SRC%\wechat-miniprogram" "%DST%\wechat-miniprogram\" /E /I /Y >nul 2>&1 && echo   ✅ wechat-miniprogram || echo   ❌ wechat-miniprogram 安装失败

echo [10/11] 安装 tdesign-miniprogram ...
xcopy "%SRC%\tdesign-miniprogram" "%DST%\tdesign-miniprogram\" /E /I /Y >nul 2>&1 && echo   ✅ tdesign-miniprogram || echo   ❌ tdesign-miniprogram 安装失败

echo [11/11] 安装 find-skills ...
xcopy "%SRC%\find-skills" "%DST%\find-skills\" /E /I /Y >nul 2>&1 && echo   ✅ find-skills || echo   ❌ find-skills 安装失败

echo.
echo ========================================
echo   安装完成！请重启 WorkBuddy 客户端。
echo ========================================
pause
