// pages/community/publish/publish.js
const api = require('../../../api/api.js');
const app = getApp();

Page({
  data: {
    // 内容
    content: '',
    contentLength: 0,
    maxLength: 1000,

    // 图片/视频
    images: [],
    videos: [],
    maxImages: 9,
    maxVideos: 1,

    // 话题
    topics: [],
    recommendTopics: [],  // 推荐话题
    selectedTopic: null,
    showTopicPicker: false,

    // 位置
    location: '',
    showLocationPicker: false,

    // 可见性
    visibilityOptions: [
      { id: 'public', name: '公开', icon: '/assets/icons/world.png', desc: '所有用户可见' },
      { id: 'friends', name: '好友可见', icon: '/assets/icons/team.png', desc: '仅好友可见' },
      { id: 'private', name: '仅自己', icon: '/assets/icons/lock.png', desc: '仅自己可见' }
    ],
    visibility: 'public',
    showVisibilityPicker: false,

    // 提交状态
    isSubmitting: false
  },

  onLoad: function (options) {
    // 如果从话题页进入，预选话题
    if (options.topicId) {
      this.setData({ 
        selectedTopic: { id: options.topicId, name: options.topicName },
        showTopicPicker: false
      });
    }

    // 加载话题列表
    this.loadTopics();
  },

  // ========== 内容输入 ==========
  onContentInput: function (e) {
    const value = e.detail.value;
    this.setData({
      content: value,
      contentLength: value.length
    });
  },

  // ========== 取消 ==========
  onCancel: function () {
    if (this.data.content || this.data.images.length || this.data.videos.length) {
      wx.showModal({
        title: '提示',
        content: '确定放弃编辑吗？',
        confirmText: '放弃',
        cancelText: '继续编辑',
        success: (res) => {
          if (res.confirm) {
            wx.navigateBack();
          }
        }
      });
    } else {
      wx.navigateBack();
    }
  },

  // ========== 图片上传 ==========
  chooseImage: function () {
    const remain = this.data.maxImages - this.data.images.length;
    if (remain <= 0) {
      wx.showToast({ title: '最多上传9张图片', icon: 'none' });
      return;
    }

    wx.chooseMedia({
      count: remain,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newImages = res.tempFiles.map(f => f.tempFilePath);
        this.setData({
          images: [...this.data.images, ...newImages]
        });
      }
    });
  },

  // 删除图片
  removeImage: function (e) {
    const index = e.currentTarget.dataset.index;
    const images = [...this.data.images];
    images.splice(index, 1);
    this.setData({ images });
  },

  // 预览图片
  previewImage: function (e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.images
    });
  },

  // ========== 视频上传 ==========
  chooseVideo: function () {
    if (this.data.videos.length >= this.data.maxVideos) {
      wx.showToast({ title: '最多上传1个视频', icon: 'none' });
      return;
    }

    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: (res) => {
        const videoPath = res.tempFiles[0].tempFilePath;
        this.setData({
          videos: [{ url: videoPath, cover: '' }]
        });
      }
    });
  },

  removeVideo: function () {
    this.setData({ videos: [] });
  },

  // ========== 话题 ==========
  loadTopics: function () {
    // 模拟话题数据
    const allTopics = [
      { id: 1, name: '新娘妆', postCount: 2340 },
      { id: 2, name: '日常妆', postCount: 5621 },
      { id: 3, name: '古风妆', postCount: 1892 },
      { id: 4, name: '约会妆', postCount: 3421 },
      { id: 5, name: '面试妆', postCount: 1234 },
      { id: 6, name: '派对妆', postCount: 2156 },
      { id: 7, name: ' Cos妆', postCount: 4521 },
      { id: 8, name: '影视特效', postCount: 892 },
      { id: 9, name: '护肤心得', postCount: 6782 },
      { id: 10, name: '好物推荐', postCount: 9123 }
    ];
    
    // 设置推荐话题（取前3个）
    const recommendTopics = allTopics.slice(0, 3);
    
    this.setData({ 
      topics: allTopics,
      recommendTopics: recommendTopics
    });
  },

  toggleTopicPicker: function () {
    this.setData({ showTopicPicker: !this.data.showTopicPicker });
  },

  selectTopic: function (e) {
    const topic = e.currentTarget.dataset.topic;
    this.setData({
      selectedTopic: topic,
      showTopicPicker: false
    });
  },

  clearTopic: function () {
    this.setData({ selectedTopic: null });
  },

  // ========== 位置 ==========
  chooseLocation: function () {
    wx.chooseLocation({
      success: (res) => {
        this.setData({ location: res.name });
      },
      fail: () => {
        wx.showToast({ title: '请开启位置权限', icon: 'none' });
      }
    });
  },

  clearLocation: function () {
    this.setData({ location: '' });
  },

  // ========== 可见性 ==========
  toggleVisibility: function () {
    this.setData({ showVisibilityPicker: !this.data.showVisibilityPicker });
  },

  selectVisibility: function (e) {
    const visibility = e.currentTarget.dataset.id;
    this.setData({ 
      visibility,
      showVisibilityPicker: false
    });
  },

  // ========== 提交 ==========
  submit: function () {
    // 验证
    if (!this.data.content.trim() && this.data.images.length === 0 && this.data.videos.length === 0) {
      wx.showToast({ title: '请输入内容或上传图片/视频', icon: 'none' });
      return;
    }

    if (this.data.isSubmitting) return;

    this.setData({ isSubmitting: true });

    const params = {
      content: this.data.content,
      images: this.data.images,
      videos: this.data.videos,
      topicId: this.data.selectedTopic?.id || null,
      location: this.data.location,
      visibility: this.data.visibility
    };

    // 模拟发布成功
    wx.showLoading({ title: '发布中...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: '发布成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }, 1000);
  }
});
