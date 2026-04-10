/**
 * 搜索页面
 * 功能：搜索历史、热门搜索、搜索结果
 */

const courseApi = require('../../api/course');

Page({
  data: {
    // 搜索词
    searchWord: '',
    // 搜索历史
    historyList: [],
    maxHistory: 10,
    // 热门搜索
    hotList: [
      { id: 1, keyword: '新娘妆', hot: 9860 },
      { id: 2, keyword: '古风妆', hot: 8530 },
      { id: 3, keyword: '日常妆', hot: 7650 },
      { id: 4, keyword: '眼妆教程', hot: 6420 },
      { id: 5, keyword: '底妆技巧', hot: 5890 },
      { id: 6, keyword: '口红试色', hot: 5340 },
      { id: 7, keyword: '新手化妆', hot: 4980 },
      { id: 8, keyword: '美妆博主', hot: 4560 }
    ],
    // 搜索结果
    resultList: [],
    // 状态
    showResult: false,
    loading: false,
    empty: false
  },

  onLoad() {
    this.loadHistory();
  },

  onShow() {},

  // 加载历史记录
  loadHistory() {
    const history = wx.getStorageSync('searchHistory') || [];
    this.setData({ historyList: history });
  },

  // 保存历史记录
  saveHistory(keyword) {
    if (!keyword) return;

    let { historyList, maxHistory } = this.data;

    // 移除重复
    historyList = historyList.filter(item => item !== keyword);

    // 添加到开头
    historyList.unshift(keyword);

    // 限制数量
    if (historyList.length > maxHistory) {
      historyList = historyList.slice(0, maxHistory);
    }

    // 保存
    wx.setStorageSync('searchHistory', historyList);
    this.setData({ historyList });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({ searchWord: e.detail.value });
  },

  // 搜索确认
  onSearchConfirm(e) {
    const keyword = e.detail.value || this.data.searchWord;
    if (keyword) {
      this.doSearch(keyword);
    }
  },

  // 点击搜索按钮
  onSearchBtnTap() {
    const { searchWord } = this.data;
    if (searchWord) {
      this.doSearch(searchWord);
    }
  },

  // 执行搜索
  async doSearch(keyword) {
    if (!keyword) return;

    this.setData({
      showResult: true,
      loading: true,
      searchWord: keyword
    });

    // 保存历史
    this.saveHistory(keyword);

    try {
      const result = await courseApi.searchCourses({ keyword, page: 1, pageSize: 20 });
      this.setData({
        resultList: result.list || [],
        empty: !result.list?.length,
        loading: false
      });
    } catch (err) {
      // 模拟数据
      this.setMockResult(keyword);
    }
  },

  // 模拟搜索结果
  setMockResult(keyword) {
    const mockList = [
      {
        id: 101,
        title: `${keyword}入门教程：零基础到专业`,
        cover: '/assets/images/course-cover-1.png',
        teacher: { name: '美妆导师Lily' },
        price: 299,
        studyCount: 12580,
        rating: 4.9,
        isFree: false
      },
      {
        id: 102,
        title: `${keyword}进阶课程：技巧提升`,
        cover: '/assets/images/course-cover-2.png',
        teacher: { name: '古风化妆师小雪' },
        price: 199,
        studyCount: 8932,
        rating: 4.8,
        isFree: false
      },
      {
        id: 103,
        title: `${keyword}实战案例：真实妆容演示`,
        cover: 'https://picsum.photos/300/200?random=course3',
        teacher: { name: '美妆博主Amy' },
        price: 0,
        studyCount: 25680,
        rating: 4.7,
        isFree: true
      }
    ];

    this.setData({
      resultList: mockList,
      empty: false,
      loading: false
    });
  },

  // 清除输入
  clearInput() {
    this.setData({
      searchWord: '',
      showResult: false,
      resultList: []
    });
  },

  // 点击历史/热门词
  onKeywordTap(e) {
    const { keyword } = e.currentTarget.dataset;
    this.doSearch(keyword);
  },

  // 删除单条历史
  deleteHistory(e) {
    const { keyword } = e.currentTarget.dataset;
    let { historyList } = this.data;
    historyList = historyList.filter(item => item !== keyword);
    wx.setStorageSync('searchHistory', historyList);
    this.setData({ historyList });
  },

  // 清除全部历史
  clearHistory() {
    wx.showModal({
      title: '确认清除',
      content: '确定要清除所有搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('searchHistory');
          this.setData({ historyList: [] });
        }
      }
    });
  },

  // 跳转到课程详情
  goToCourse(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/courseDetail/courseDetail?id=${id}` });
  },

  // 取消搜索
  cancelSearch() {
    wx.navigateBack();
  }
});
