/**
 * 每日任务页面
 * 功能：签到、完成任务赚积分/妆币
 */

const taskApi = require('../../api/task');

Page({
  data: {
    // 用户信息
    userInfo: null,
    coins: 0,
    points: 0,
    
    // 签到状态
    isSignedToday: false,
    continuousDays: 0,
    signInReward: 10,
    
    // 签到日历
    signInCalendar: [],
    currentMonth: '',
    
    // 任务列表
    taskList: [
      {
        id: 1,
        name: '每日签到',
        desc: '连续签到奖励更多',
        icon: '/assets/icons/task-sign.png',
        rewardType: 'coins',
        reward: 10,
        status: 'pending', // pending, completed, claimed
        progress: 0,
        target: 1,
        action: '去签到'
      },
      {
        id: 2,
        name: '观看课程',
        desc: '观看任意课程10分钟',
        icon: '/assets/icons/task-course.png',
        rewardType: 'coins',
        reward: 20,
        status: 'pending',
        progress: 0,
        target: 10,
        action: '去学习',
        path: '/pages/category/category'
      },
      {
        id: 3,
        name: '分享课程',
        desc: '分享课程给好友',
        icon: '/assets/icons/task-share.png',
        rewardType: 'coins',
        reward: 30,
        status: 'pending',
        progress: 0,
        target: 1,
        action: '去分享'
      },
      {
        id: 4,
        name: '发布动态',
        desc: '在社区发布一条动态',
        icon: '/assets/icons/task-post.png',
        rewardType: 'points',
        reward: 50,
        status: 'pending',
        progress: 0,
        target: 1,
        action: '去发布',
        path: '/pages/community/publish/publish'
      },
      {
        id: 5,
        name: '点赞互动',
        desc: '给5个课程或动态点赞',
        icon: '/assets/icons/task-like.png',
        rewardType: 'points',
        reward: 20,
        status: 'pending',
        progress: 0,
        target: 5,
        action: '去互动'
      },
      {
        id: 6,
        name: '邀请好友',
        desc: '邀请好友注册成功',
        icon: '/assets/icons/task-invite.png',
        rewardType: 'coins',
        reward: 100,
        status: 'pending',
        progress: 0,
        target: 1,
        action: '去邀请',
        path: '/pages/invite/invite'
      }
    ],
    
    // 累计奖励
    totalReward: {
      today: 0,
      total: 0
    }
  },

  onLoad() {
    this.loadUserInfo();
    this.generateCalendar();
    this.loadTaskStatus();
  },

  onShow() {
    this.loadUserInfo();
    this.loadTaskStatus();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo') || {};
    this.setData({
      userInfo,
      coins: userInfo.coins || 0,
      points: userInfo.points || 0,
      continuousDays: userInfo.continuousDays || 0,
      isSignedToday: userInfo.isSignedToday || false
    });
  },

  // 生成签到日历
  generateCalendar() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendar = [];
    for (let i = 1; i <= daysInMonth; i++) {
      calendar.push({
        day: i,
        signed: i <= 15, // 模拟前15天已签到
        today: i === now.getDate(),
        future: i > now.getDate()
      });
    }
    
    this.setData({
      signInCalendar: calendar,
      currentMonth: `${year}年${month + 1}月`
    });
  },

  // 加载任务状态
  async loadTaskStatus() {
    try {
      // 实际项目中从服务器获取
      // const result = await taskApi.getTaskStatus();
      // this.setData({ taskList: result.tasks });
    } catch (err) {
      console.error('加载任务状态失败', err);
    }
  },

  // 签到
  async signIn() {
    if (this.data.isSignedToday) {
      wx.showToast({ title: '今日已签到', icon: 'none' });
      return;
    }

    try {
      // 调用签到API
      // await taskApi.signIn();
      
      // 更新本地状态
      const userInfo = wx.getStorageSync('userInfo') || {};
      userInfo.coins = (userInfo.coins || 0) + this.data.signInReward;
      userInfo.isSignedToday = true;
      userInfo.continuousDays = (userInfo.continuousDays || 0) + 1;
      wx.setStorageSync('userInfo', userInfo);
      
      // 更新任务状态
      const taskList = this.data.taskList;
      const signTask = taskList.find(t => t.id === 1);
      if (signTask) {
        signTask.status = 'completed';
        signTask.progress = 1;
      }
      
      this.setData({
        isSignedToday: true,
        coins: userInfo.coins,
        continuousDays: userInfo.continuousDays,
        taskList
      });
      
      wx.showToast({
        title: `签到成功，获得${this.data.signInReward}妆币`,
        icon: 'none'
      });
      
    } catch (err) {
      wx.showToast({ title: '签到失败', icon: 'none' });
    }
  },

  // 执行任务
  doTask(e) {
    const taskId = e.currentTarget.dataset.id;
    const task = this.data.taskList.find(t => t.id === taskId);
    
    if (!task) return;
    
    if (task.status === 'completed') {
      // 领取奖励
      this.claimReward(taskId);
      return;
    }
    
    if (task.status === 'claimed') {
      wx.showToast({ title: '任务已完成', icon: 'none' });
      return;
    }
    
    // 跳转到对应页面
    if (taskId === 1) {
      this.signIn();
    } else if (task.path) {
      wx.navigateTo({ url: task.path });
    } else if (taskId === 3) {
      // 分享
      wx.showShareMenu({ withShareTicket: true });
    }
  },

  // 领取奖励
  async claimReward(taskId) {
    try {
      // await taskApi.claimReward(taskId);
      
      const taskList = this.data.taskList;
      const task = taskList.find(t => t.id === taskId);
      if (task) {
        task.status = 'claimed';
        
        // 更新用户资产
        const userInfo = wx.getStorageSync('userInfo') || {};
        if (task.rewardType === 'coins') {
          userInfo.coins = (userInfo.coins || 0) + task.reward;
        } else {
          userInfo.points = (userInfo.points || 0) + task.reward;
        }
        wx.setStorageSync('userInfo', userInfo);
        
        this.setData({
          taskList,
          coins: userInfo.coins,
          points: userInfo.points
        });
        
        wx.showToast({
          title: `获得${task.reward}${task.rewardType === 'coins' ? '妆币' : '积分'}`,
          icon: 'success'
        });
      }
    } catch (err) {
      wx.showToast({ title: '领取失败', icon: 'none' });
    }
  },

  // 补签
  makeUpSign(e) {
    const day = e.currentTarget.dataset.day;
    wx.showModal({
      title: '补签',
      content: `花费10妆币补签${day}号？`,
      success: (res) => {
        if (res.confirm) {
          // 执行补签
          wx.showToast({ title: '补签成功', icon: 'success' });
        }
      }
    });
  },

  // 分享
  onShareAppMessage() {
    return {
      title: '来i妆做任务，免费赚妆币学化妆',
      path: '/pages/task/task',
      imageUrl: '/assets/images/task-share.png'
    };
  }
});
