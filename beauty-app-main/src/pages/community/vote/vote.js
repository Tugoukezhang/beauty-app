// pages/community/vote/vote.js
Page({
  data: {
    // 投票问题
    voteQuestion: 'i妆下一次更新课程，你最期待哪个方向？',
    voteTotal: 1289,

    // 投票选项
    options: [
      {
        id: 'A',
        label: 'A',
        text: '古风妆容进阶课程',
        votes: 456,
        percent: 35
      },
      {
        id: 'B',
        label: 'B',
        text: '影视特效化妆',
        votes: 312,
        percent: 24
      },
      {
        id: 'C',
        label: 'C',
        text: '新娘跟妆实战',
        votes: 298,
        percent: 23
      },
      {
        id: 'D',
        label: 'D',
        text: '日常妆容技巧',
        votes: 223,
        percent: 17
      }
    ],

    // 用户选择
    selectedId: null,
    hasVoted: false
  },

  onLoad: function(options) {
    // 检查是否已经投过票
    const voted = wx.getStorageSync('hasVoted');
    const votedOption = wx.getStorageSync('votedOption');
    if (voted) {
      this.setData({
        hasVoted: true,
        selectedId: votedOption
      });
    }
  },

  onShow: function() {
    // 更新票数（模拟）
    this.updateVoteStats();
  },

  // 更新投票统计
  updateVoteStats: function() {
    const options = this.data.options.map(opt => {
      // 找到最高票的作为领先
      return {
        ...opt,
        isLeading: false
      };
    });
    
    // 找出领先项
    const maxVotes = Math.max(...options.map(o => o.votes));
    options.forEach(opt => {
      if (opt.votes === maxVotes) {
        opt.isLeading = true;
      }
    });

    this.setData({ options });
  },

  // 选择选项
  selectOption: function(e) {
    if (this.data.hasVoted) {
      // 已投票则不能修改
      return;
    }

    const { id } = e.currentTarget.dataset;
    this.setData({ selectedId: id });
  },

  // 提交投票
  submitVote: function() {
    if (!this.data.selectedId) {
      wx.showToast({
        title: '请先选择一个选项',
        icon: 'none'
      });
      return;
    }

    // 更新数据
    const options = this.data.options.map(opt => {
      if (opt.id === this.data.selectedId) {
        return {
          ...opt,
          votes: opt.votes + 1
        };
      }
      return opt;
    });

    // 重新计算百分比
    const totalVotes = options.reduce((sum, opt) => sum + opt.votes, 0);
    options.forEach(opt => {
      opt.percent = Math.round((opt.votes / totalVotes) * 100);
      opt.isLeading = opt.votes === Math.max(...options.map(o => o.votes));
    });

    // 标记为已投票
    wx.setStorageSync('hasVoted', true);
    wx.setStorageSync('votedOption', this.data.selectedId);

    this.setData({
      options,
      hasVoted: true,
      voteTotal: this.data.voteTotal + 1
    });

    wx.showToast({
      title: '投票成功！',
      icon: 'success'
    });
  },

  // 分享投票
  shareVote: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage: function() {
    return {
      title: '📊 i妆课程方向投票，等你来决定！',
      path: '/pages/community/vote/vote',
      imageUrl: '/assets/images/vote-share.png'
    };
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  }
});
