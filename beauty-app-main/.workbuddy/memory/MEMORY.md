# MEMORY.md - 长期记忆

## 美妆综合服务平台项目

### 项目概述
用户想做一个美妆综合服务平台APP，定位是"美妆界的点评+得到+滴滴"。

### MVP 功能范围（V1.0）
1. **课程系统** — 化妆课程分类/详情/视频播放/购买
2. **社区功能** — 发帖/评论/点赞/收藏/关注/话题标签（不带购买链接）
3. **用户系统** — 手机号+验证码注册登录、个人中心

### 暂不包含（后续版本）
- AI 肤质分析（需第三方API）
- AR 实时试妆（需第三方SDK）
- 约妆平台（化妆师接单）
- 老师辅导（1v1视频）

### 技术方案
- 前端：uni-app + Vue 3（iOS + Android + 小程序）
- 后端：Python FastAPI
- 数据库：MySQL + Redis
- 存储：阿里云 OSS / 腾讯云 COS

### 扩展路线
- V1.5 → AI肤质分析
- V2.0 → AR试妆
- V2.5 → 约妆平台
- V3.0 → 老师辅导

### 商业模式
课程付费 40% + 约妆抽佣 35% + 辅导付费 15% + 广告 10%

### 用户情况
- 用户不会写代码，APP开发完全依赖AI
- 服务器运维一知半解，需要部署脚本和指导
- 计划注册公司，上架各大应用商店
- 尚未购买服务器和开发者账号

### Git & GitHub 配置（2026-04-08 完成）
- GitHub 用户名：Tugoukezhang
- GitHub 邮箱：1135638409@qq.com
- 仓库地址：https://github.com/Tugoukezhang/beauty-app
- 仓库可见性：Public
- Token 已存入 Windows 凭据管理器（cmdkey）
- 本地分支：main，已关联远程 origin/main
- 换电脑后需要重新配置 Token 和凭据

### 沟通偏好
- 中文交流
- 目前在公司用手机聊天，回家后用自己的电脑开始开发

### 已安装 Skills（2026-04-07 确认）
开发相关：
- fullstack-dev（全栈架构/API设计）
- frontend-dev（前端UI/动画）
- ui-ux-pro-max（UI/UX设计规范）
- tencentcloud-cos（腾讯云对象存储）
- wechatpay-product-coupon（微信支付商品券）
- market-researcher（市场调研）
- video-frames（视频帧提取）
- github（版本管理）
- find-skills（搜索新Skills）

小程序相关：
- wechat-miniprogram
- tdesign-miniprogram
- 微信小程序开发框架

### 待安装 Skills（按需）
- 微信支付核心接入（课程购买支付，非商品券）
- tapd-openapi（团队项目管理，可选）
- cos-vectors（AI肤质分析时再装）
