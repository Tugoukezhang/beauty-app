// pages/community/topicDetail/topicDetail.js
const api = require('../../../api/api.js');
const app = getApp();

Page({
  data: {
    topicId: null,
    topic: null,

    // 排序
    sortOptions: [
      { id: 'recommend', name: '推荐' },
      { id: 'latest', name: '最新' }
    ],
    currentSort: 'recommend',

    // 帖子列表
    posts: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false
  },

  onLoad: function (options) {
    const topicId = options.id;
    if (!topicId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
      return;
    }

    this.setData({ topicId });
    this.loadTopicDetail();
    this.loadPosts();
  },

  // ========== 加载话题详情 ==========
  loadTopicDetail: function () {
    api.getTopicDetail(this.data.topicId).then(res => {
      if (res.code === 0) {
        this.setData({ topic: res.data });
        wx.setNavigationBarTitle({ title: '#' + res.data.name });
      }
    });
  },

  // ========== 加载帖子列表 ==========
  loadPosts: function (loadMore = false) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    const params = {
      topicId: this.data.topicId,
      page: loadMore ? this.data.page + 1 : 1,
      pageSize: this.data.pageSize,
      sort: this.data.currentSort
    };

    api.getTopicPosts(params).then(res => {
      if (res.code === 0) {
        const newPosts = res.data.list || [];
        this.setData({
          posts: loadMore ? [...this.data.posts, ...newPosts] : newPosts,
          page: params.page,
          hasMore: newPosts.length >= this.data.pageSize
        });
      }
    }).catch(err => {
      console.error('加载帖子失败', err);
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPosts(true);
    }
  },

  onPullDownRefresh: function () {
    this.setData({ page: 1, posts: [], hasMore: true });
    Promise.all([this.loadTopicDetail(), this.loadPosts()]).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // ========== 排序切换 ==========
  switchSort: function (e) {
    const sort = e.currentTarget.dataset.sort;
    this.setData({
      currentSort: sort,
      page: 1,
      posts: [],
      hasMore: true
    });
    this.loadPosts();
  },

  // ========== 点赞 ==========
  handleLike: function (e) {
    if (!app.checkAuth()) return;

    const postId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const post = this.data.posts[index];
    const isLiked = !post.isLiked;
    const likes = isLiked ? post.likes + 1 : post.likes - 1;

    const posts = [...this.data.posts];
    posts[index].isLiked = isLiked;
    posts[index].likes = likes;
    this.setData({ posts });

    const apiName = isLiked ? 'likePost' : 'unlikePost';
    api[apiName](postId).then(res => {
      if (res.code !== 0) {
        const posts = [...this.data.posts];
        posts[index].isLiked = !isLiked;
        posts[index].likes = likes;
        this.setData({ posts });
      }
    });
  },

  // ========== 收藏 ==========
  handleCollect: function (e) {
    if (!app.checkAuth()) return;

    const postId = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const post = this.data.posts[index];
    const isCollected = !post.isCollected;

    const posts = [...this.data.posts];
    posts[index].isCollected = isCollected;
    this.setData({ posts });

    const apiName = isCollected ? 'collectPost' : 'uncollectPost';
    api[apiName](postId).then(res => {
      if (res.code === 0) {
        wx.showToast({
          title: isCollected ? '收藏成功' : '取消收藏',
          icon: 'success'
        });
      } else {
        const posts = [...this.data.posts];
        posts[index].isCollected = !isCollected;
        this.setData({ posts });
      }
    });
  },

  // ========== 跳转 ==========
  goToPostDetail: function (e) {
    const postId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/community/postDetail/postDetail?id=${postId}`
    });
  },

  goToPublish: function () {
    if (!app.checkAuth()) return;
    wx.navigateTo({
      url: `/pages/community/publish/publish?topicId=${this.data.topicId}&topicName=${this.data.topic.name}`
    });
  }
});
