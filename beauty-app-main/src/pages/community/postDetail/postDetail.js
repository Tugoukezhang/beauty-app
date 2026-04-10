// pages/community/postDetail/postDetail.js
const api = require('../../../api/api.js');
const app = getApp();

Page({
  data: {
    postId: null,
    post: null,

    // 评论
    comments: [],
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,

    // 评论输入
    showCommentInput: false,
    commentType: 'post', // post-评论帖子, reply-回复评论
    replyTo: null, // 回复的用户
    commentContent: '',
    focusCommentInput: false,

    // 用户信息
    userInfo: null
  },

  onLoad: function (options) {
    const postId = options.id;
    if (!postId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
      return;
    }

    this.setData({
      postId: postId,
      userInfo: app.globalData.userInfo
    });

    this.loadPostDetail();
    this.loadComments();
  },

  onShow: function () {
    this.setData({ userInfo: app.globalData.userInfo });
  },

  onShareAppMessage: function () {
    const post = this.data.post;
    return {
      title: post.nickname + '的美妆笔记',
      path: `/pages/community/postDetail/postDetail?id=${this.data.postId}`,
      imageUrl: (post.images && post.images.length > 0) ? post.images[0] : ''
    };
  },

  onShareTimeline: function () {
    const post = this.data.post;
    return {
      title: post.nickname + '的美妆笔记',
      query: `id=${this.data.postId}`,
      imageUrl: (post.images && post.images.length > 0) ? post.images[0] : ''
    };
  },

  // ========== 加载帖子详情 ==========
  loadPostDetail: function () {
    api.getPostDetail(this.data.postId).then(res => {
      if (res.code === 0) {
        this.setData({ post: res.data });
        wx.setNavigationBarTitle({ title: res.data.nickname + '的笔记' });
      } else {
        wx.showToast({ title: res.msg || '加载失败', icon: 'none' });
      }
    }).catch(err => {
      console.error('加载帖子详情失败', err);
    });
  },

  // ========== 加载评论 ==========
  loadComments: function (loadMore = false) {
    if (this.data.loading) return;

    this.setData({ loading: true });

    const params = {
      postId: this.data.postId,
      page: loadMore ? this.data.page + 1 : 1,
      pageSize: this.data.pageSize
    };

    api.getCommentList(params).then(res => {
      if (res.code === 0) {
        const newComments = res.data.list || [];
        this.setData({
          comments: loadMore ? [...this.data.comments, ...newComments] : newComments,
          page: params.page,
          hasMore: newComments.length >= this.data.pageSize
        });
      }
    }).catch(err => {
      console.error('加载评论失败', err);
    }).finally(() => {
      this.setData({ loading: false });
    });
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadComments(true);
    }
  },

  // ========== 点赞 ==========
  handleLike: function () {
    if (!app.checkAuth()) return;

    const post = this.data.post;
    const isLiked = !post.isLiked;
    const likes = isLiked ? post.likes + 1 : post.likes - 1;

    // 即时更新UI
    this.setData({ 'post.isLiked': isLiked, 'post.likes': likes });

    const apiName = isLiked ? 'likePost' : 'unlikePost';
    api[apiName](this.data.postId).then(res => {
      if (res.code !== 0) {
        this.setData({ 'post.isLiked': !isLiked, 'post.likes': likes });
      }
    });
  },

  // ========== 收藏 ==========
  handleCollect: function () {
    if (!app.checkAuth()) return;

    const post = this.data.post;
    const isCollected = !post.isCollected;

    this.setData({ 'post.isCollected': isCollected });

    const apiName = isCollected ? 'collectPost' : 'uncollectPost';
    api[apiName](this.data.postId).then(res => {
      if (res.code === 0) {
        wx.showToast({ title: isCollected ? '收藏成功' : '取消收藏', icon: 'success' });
      } else {
        this.setData({ 'post.isCollected': !isCollected });
      }
    });
  },

  // ========== 关注 ==========
  handleFollow: function () {
    if (!app.checkAuth()) return;

    const post = this.data.post;
    const isFollow = !post.isFollow;

    this.setData({ 'post.isFollow': isFollow });

    const apiName = isFollow ? 'followUser' : 'unfollowUser';
    api[apiName](post.userId).then(res => {
      if (res.code === 0) {
        wx.showToast({ title: isFollow ? '关注成功' : '取消关注', icon: 'success' });
      } else {
        this.setData({ 'post.isFollow': !isFollow });
      }
    });
  },

  // ========== 评论操作 ==========
  showCommentBox: function (e) {
    const type = e.currentTarget.dataset.type;
    const comment = e.currentTarget.dataset.comment;

    if (type === 'reply' && comment) {
      this.setData({
        showCommentInput: true,
        commentType: 'reply',
        replyTo: { id: comment.userId, nickname: comment.nickname },
        focusCommentInput: true
      });
    } else {
      this.setData({
        showCommentInput: true,
        commentType: 'post',
        replyTo: null,
        focusCommentInput: true
      });
    }
  },

  hideCommentBox: function () {
    this.setData({
      showCommentInput: false,
      commentContent: '',
      commentType: 'post',
      replyTo: null
    });
  },

  onCommentInput: function (e) {
    this.setData({ commentContent: e.detail.value });
  },

  submitComment: function () {
    if (!app.checkAuth()) return;
    if (!this.data.commentContent.trim()) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }

    const params = {
      postId: this.data.postId,
      content: this.data.commentContent.trim()
    };

    if (this.data.commentType === 'reply' && this.data.replyTo) {
      params.replyUserId = this.data.replyTo.id;
    }

    api.addComment(params).then(res => {
      if (res.code === 0) {
        wx.showToast({ title: '评论成功', icon: 'success' });
        this.hideCommentBox();
        // 刷新评论列表
        this.setData({ page: 1, comments: [] });
        this.loadComments();
        // 更新评论数
        this.setData({ 'post.comments': this.data.post.comments + 1 });
      } else {
        wx.showToast({ title: res.msg || '评论失败', icon: 'none' });
      }
    });
  },

  // 评论点赞
  likeComment: function (e) {
    if (!app.checkAuth()) return;

    const index = e.currentTarget.dataset.index;
    const comment = this.data.comments[index];
    const isLiked = !comment.isLiked;
    const likes = isLiked ? comment.likes + 1 : comment.likes - 1;

    const comments = [...this.data.comments];
    comments[index].isLiked = isLiked;
    comments[index].likes = likes;
    this.setData({ comments });

    const apiName = isLiked ? 'likeComment' : 'unlikeComment';
    api[apiName](comment.id).then(res => {
      if (res.code !== 0) {
        const comments = [...this.data.comments];
        comments[index].isLiked = !isLiked;
        comments[index].likes = likes;
        this.setData({ comments });
      }
    });
  },

  // 删除评论
  deleteComment: function (e) {
    const index = e.currentTarget.dataset.index;
    const comment = this.data.comments[index];

    wx.showModal({
      title: '提示',
      content: '确定删除这条评论吗？',
      success: (res) => {
        if (res.confirm) {
          api.deleteComment(comment.id).then(res => {
            if (res.code === 0) {
              wx.showToast({ title: '删除成功', icon: 'success' });
              const comments = [...this.data.comments];
              comments.splice(index, 1);
              this.setData({ comments });
              this.setData({ 'post.comments': Math.max(0, this.data.post.comments - 1) });
            } else {
              wx.showToast({ title: res.msg || '删除失败', icon: 'none' });
            }
          });
        }
      }
    });
  },

  // ========== 图片预览 ==========
  previewImage: function (e) {
    const urls = e.currentTarget.dataset.urls;
    const current = e.currentTarget.dataset.current;
    wx.previewImage({
      current,
      urls
    });
  },

  // ========== 跳转 ==========
  goToUserProfile: function (e) {
    const userId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/user?id=${userId}`
    });
  },

  goToTopicDetail: function (e) {
    const topicId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/community/topicDetail/topicDetail?id=${topicId}`
    });
  },

  goToCourseDetail: function (e) {
    const courseId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/courseDetail/courseDetail?id=${courseId}`
    });
  }
});
