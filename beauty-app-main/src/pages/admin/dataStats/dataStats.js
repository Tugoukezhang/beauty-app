const app = getApp();

Page({
  data: {
    dateRange: 'today',
    dateRangeIndex: 0,
    dateRangeLabel: '今日',
    dateRangeOptions: [
      { label: '今日', value: 'today' },
      { label: '昨日', value: 'yesterday' },
      { label: '近7天', value: 'week' },
      { label: '近30天', value: 'month' }
    ],
    // 核心数据
    coreStats: {
      newUsers: 0,
      activeUsers: 0,
      totalRevenue: 0,
      totalOrders: 0,
      courseSales: 0,
      vipSales: 0
    },
    courseSalesPercent: 0,
    vipSalesPercent: 0,
    // 趋势数据
    trendData: {
      dates: [],
      newUsers: [],
      activeUsers: [],
      revenue: []
    },
    // 课程排行
    courseRanking: [],
    // 用户画像
    userProfile: {
      gender: { male: 0, female: 0, unknown: 0 },
      age: { '18-24': 0, '25-34': 0, '35-44': 0, '45+': 0 },
      source: { search: 0, share: 0, ad: 0, other: 0 }
    }
  },

  onLoad() {
    this.loadDataStats();
  },

  // 切换时间范围
  onDateRangeChange(e) {
    const index = parseInt(e.detail.value);
    const options = [
      { label: '今日', value: 'today' },
      { label: '昨日', value: 'yesterday' },
      { label: '近7天', value: 'week' },
      { label: '近30天', value: 'month' }
    ];
    this.setData({
      dateRangeIndex: index,
      dateRange: options[index].value,
      dateRangeLabel: options[index].label
    });
    this.loadDataStats();
  },

  // 加载数据统计
  loadDataStats() {
    wx.showLoading({ title: '加载中' });
    
    // 模拟数据
    setTimeout(() => {
      const mockData = this.getMockData();
      // 计算百分比
      const total = mockData.coreStats.totalRevenue || 1;
      const coursePercent = Math.round(mockData.coreStats.courseSales / total * 100);
      const vipPercent = 100 - coursePercent;
      this.setData({
        coreStats: mockData.coreStats,
        trendData: mockData.trendData,
        courseRanking: mockData.courseRanking,
        userProfile: mockData.userProfile,
        courseSalesPercent: coursePercent,
        vipSalesPercent: vipPercent
      });
      wx.hideLoading();
    }, 500);
  },

  // 模拟数据
  getMockData() {
    const ranges = {
      today: { newUsers: 45, activeUsers: 320, totalRevenue: 2580, totalOrders: 23 },
      yesterday: { newUsers: 52, activeUsers: 380, totalRevenue: 3120, totalOrders: 28 },
      week: { newUsers: 312, activeUsers: 2150, totalRevenue: 18560, totalOrders: 168 },
      month: { newUsers: 1256, activeUsers: 8900, totalRevenue: 75680, totalOrders: 685 }
    };
    
    const current = ranges[this.data.dateRange];
    
    return {
      coreStats: {
        ...current,
        courseSales: Math.floor(current.totalRevenue * 0.6),
        vipSales: Math.floor(current.totalRevenue * 0.4)
      },
      trendData: {
        dates: ['04-01', '04-02', '04-03', '04-04', '04-05', '04-06', '04-07'],
        newUsers: [42, 38, 45, 52, 48, 55, 45],
        activeUsers: [280, 295, 310, 380, 365, 390, 320],
        revenue: [2200, 1850, 2400, 3120, 2900, 3250, 2580]
      },
      courseRanking: [
        { id: 1, title: '新娘妆入门教程', sales: 156, revenue: 7800 },
        { id: 2, title: 'Cosplay妆容精讲', sales: 128, revenue: 6400 },
        { id: 3, title: '古风妆容基础', sales: 98, revenue: 4900 },
        { id: 4, title: '日常通勤妆', sales: 87, revenue: 4350 },
        { id: 5, title: '晚宴妆技巧', sales: 65, revenue: 3250 }
      ],
      userProfile: {
        gender: { male: 8, female: 88, unknown: 4 },
        age: { '18-24': 35, '25-34': 45, '35-44': 15, '45+': 5 },
        source: { search: 40, share: 35, ad: 15, other: 10 }
      }
    };
  },

  // 刷新数据
  onRefresh() {
    this.loadDataStats();
  },

  // 导出报表
  onExportReport() {
    wx.showModal({
      title: '导出报表',
      content: '确定导出当前数据报表吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '导出成功',
            icon: 'success'
          });
        }
      }
    });
  }
});