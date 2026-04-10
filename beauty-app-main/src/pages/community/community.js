// pages/community/community.js
const api = require('../../api/community.js');
const app = getApp();

Page({
  data: {
    // Tab切换
    activeTab: 0,
    tabs: ['推荐', '关注', '话题'],

    // 话题分类
    topics: [],
    activeTopicId: 0,

    // 帖子列表
    posts: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,

    // 用户信息
    userInfo: null,

    // 筛选排序
    sortOptions: [
      { id: 'recommend', name: '推荐' },
      { id: 'latest', name: '最新' },
      { id: 'hot', name: '最热' }
    ],
    currentSort: 'recommend',

    // ========== 投票数据 ==========
    voteQuestion: 'i妆下一次更新课程，你最期待哪个方向？',
    voteTotal: 1289,
    voteParticipation: 68,
    hasVoted: false,
    votedOption: null
  },

  onLoad: function(options) {
    // 获取传递的参数
    if (options.topicId) {
      this.setData({ activeTopicId: parseInt(options.topicId) });
    }

    // 获取用户信息
    this.setData({ userInfo: app.globalData.userInfo });

    // 加载数据
    this.loadTopics();
    this.loadPosts();
  },

  onShow: function() {
    this.setData({ userInfo: app.globalData.userInfo });
  },

  onReachBottom: function() {
    if (this.data.hasMore && !this.data.loading && this.data.activeTab !== 2) {
      this.loadMorePosts();
    }
  },

  onPullDownRefresh: function() {
    this.setData({ page: 1, posts: [], hasMore: true });
    Promise.all([this.loadTopics(), this.loadPosts()]).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // ========== Tab切换 ==========
  switchTab: function(e) {
    const index = typeof e === 'number' ? e : e.currentTarget.dataset.index;
    this.setData({
      activeTab: index,
      page: 1,
      posts: [],
      hasMore: true
    });

    if (index === 2) {
      this.loadTopicsList();
    } else {
      this.loadPosts();
    }
  },

  // ========== 加载话题分类 ==========
  loadTopics: function() {
    // 使用模拟数据
    const mockTopics = [
      { id: 1, name: '新娘妆教程', postCount: 256 },
      { id: 2, name: '日常妆容', postCount: 189 },
      { id: 3, name: '古风造型', postCount: 142 },
      { id: 4, name: '护肤心得', postCount: 98 },
      { id: 5, name: '美甲分享', postCount: 76 },
      { id: 6, name: 'Cosplay', postCount: 54 }
    ];
    this.setData({ topics: mockTopics });
  },

  // ========== 加载话题广场 ==========
  loadTopicsList: function() {
    const mockTopics = [
      { id: 1, name: '新娘妆教程', cover: 'https://picsum.photos/300/200?random=t1', postCount: 256 },
      { id: 2, name: '日常妆容', cover: 'https://picsum.photos/300/200?random=t2', postCount: 189 },
      { id: 3, name: '古风造型', cover: 'https://picsum.photos/300/200?random=t3', postCount: 142 },
      { id: 4, name: '护肤心得', cover: 'https://picsum.photos/300/200?random=t4', postCount: 98 },
      { id: 5, name: '美甲分享', cover: 'https://picsum.photos/300/200?random=t5', postCount: 76 },
      { id: 6, name: 'Cosplay', cover: 'https://picsum.photos/300/200?random=t6', postCount: 54 }
    ];
    this.setData({ topics: mockTopics });
  },

  // ========== 话题分类切换 ==========
  selectTopic: function(e) {
    const topicId = e.currentTarget.dataset.id;
    this.setData({
      activeTopicId: topicId,
      page: 1,
      posts: [],
      hasMore: true
    });
    this.loadPosts();
  },

  // ========== 加载帖子列表 ==========
  loadPosts: function(loadMore = false) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    // 使用模拟数据
    const mockPosts = this.getMockPosts();
    const filteredPosts = this.data.activeTopicId === 0 
      ? mockPosts 
      : mockPosts.filter(p => p.topic && p.topic.id === this.data.activeTopicId);

    setTimeout(() => {
      this.setData({
        posts: loadMore ? [...this.data.posts, ...filteredPosts] : filteredPosts,
        hasMore: !loadMore,
        loading: false
      });
    }, 300);
  },

  // 模拟帖子数据
  getMockPosts() {
    return [
      {
        id: 1,
        userId: 101,
        nickname: '美妆达人小雅',
        avatar: 'https://picsum.photos/100/100?random=u1',
        createTime: '2小时前',
        content: '今天给大家分享一款超适合春夏的日常妆容，整体风格清新自然，又不失精致感～眼妆部分用了最近很火的裸粉色系，超级温柔！',
        images: [
          'https://picsum.photos/400/400?random=p1',
          'https://picsum.photos/400/400?random=p1b',
          'https://picsum.photos/400/400?random=p1c'
        ],
        topic: { id: 2, name: '日常妆容' },
        likes: 892,
        comments: 56,
        isLiked: false,
        isCollected: false,
        isFollow: false
      },
      {
        id: 2,
        userId: 102,
        nickname: '婚礼化妆师Lisa',
        avatar: 'https://picsum.photos/100/100?random=u2',
        createTime: '4小时前',
        content: '分享一组今日份的新娘妆造～新娘子喜欢自然清透的感觉，所以整体妆容以裸妆为主，突出她本身的好气色。迎宾时宾客们都夸好看，新娘子开心我也超有成就感的！',
        images: [
          'https://picsum.photos/400/400?random=p2',
          'https://picsum.photos/400/400?random=p2b'
        ],
        topic: { id: 1, name: '新娘妆教程' },
        likes: 2341,
        comments: 128,
        isLiked: true,
        isCollected: true,
        isFollow: true
      },
      {
        id: 3,
        userId: 103,
        nickname: '古风爱好者阿雪',
        avatar: 'https://picsum.photos/100/100?random=u3',
        createTime: '6小时前',
        content: '终于画出了我心中理想的唐风妆造！整体色调以橘红色系为主，眼妆是重点，用了非常经典的唐代斜红妆容，面靥和花钿也都安排上了～这套造型太美了呜呜呜',
        images: [
          'https://picsum.photos/400/400?random=p3',
          'https://picsum.photos/400/400?random=p3b',
          'https://picsum.photos/400/400?random=p3c'
        ],
        topic: { id: 3, name: '古风造型' },
        likes: 1567,
        comments: 89,
        isLiked: false,
        isCollected: false,
        isFollow: false
      },
      {
        id: 4,
        userId: 104,
        nickname: '护肤小管家',
        avatar: 'https://picsum.photos/100/100?random=u4',
        createTime: '8小时前',
        content: '敏感肌换季护肤心得分享！作为一个资深敏感肌，这些年踩过不少坑，总结出一套自己的护肤方法～核心就是精简护肤+保湿修护，成分要选择温和的，不要过度清洁。',
        images: [
          'https://picsum.photos/400/400?random=p4'
        ],
        topic: { id: 4, name: '护肤心得' },
        likes: 456,
        comments: 34,
        isLiked: false,
        isCollected: true,
        isFollow: false
      }
    ];
  },

  // 加载更多
  loadMorePosts: function() {
    this.loadPosts(true);
  },

  // ========== 排序切换 ==========
  switchSort: function(e) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({
      currentSort: sort,
      page: 1,
      posts: [],
      hasMore: true
    });
    this.loadPosts();
  },

  // ========== 展开/收起 ==========
  toggleExpand: function(e) {
    const index = e.currentTarget.dataset.index;
    const posts = [...this.data.posts];
    posts[index].isExpand = !posts[index].isExpand;
    this.setData({ posts });
  },

  // ========== 点赞 ==========
  handleLike: function(e) {
    const postId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const post = this.data.posts[index];
    const isLiked = !post.isLiked;
    const likes = isLiked ? post.likes + 1 : post.likes - 1;

    // 即时更新UI
    const posts = [...this.data.posts];
    posts[index].isLiked = isLiked;
    posts[index].likes = likes;
    this.setData({ posts });
  },

  // ========== 收藏 ==========
  handleCollect: function(e) {
    const postId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const post = this.data.posts[index];
    const isCollected = !post.isCollected;

    const posts = [...this.data.posts];
    posts[index].isCollected = isCollected;
    this.setData({ posts });

    wx.showToast({
      title: isCollected ? '收藏成功' : '取消收藏',
      icon: 'success'
    });
  },

  // ========== 关注 ==========
  handleFollow: function(e) {
    const userId = e.currentTarget.dataset.id;
    const index = this.data.posts.findIndex(p => p.userId === userId);
    if (index !== -1) {
      const posts = [...this.data.posts];
      posts[index].isFollow = !posts[index].isFollow;
      this.setData({ posts });
      wx.showToast({
        title: posts[index].isFollow ? '关注成功' : '取消关注',
        icon: 'success'
      });
    }
  },

  // ========== 分享 ==========
  handleShare: function(e) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  onShareAppMessage: function(res) {
    return {
      title: '美妆教程社区',
      path: '/pages/community/community'
    };
  },

  // ========== 跳转投票页 ==========
  goToVote: function() {
    wx.navigateTo({
      url: '/pages/community/vote/vote'
    });
  },

  // ========== 跳转页面 ==========
  goToPostDetail: function(e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/community/postDetail/postDetail?id=${postId}`
    });
  },

  goToPublish: function() {
    wx.navigateTo({
      url: '/pages/community/publish/publish'
    });
  },

  goToTopicDetail: function(e) {
    const topicId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/community/topicDetail/topicDetail?id=${topicId}`
    });
  },

  goToUserProfile: function(e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/community/user/user?id=${userId}`
    });
  },

  goToSearch: function() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  }
});
