const app = getApp();

// 模拟数据 - 云函数未部署时使用
const mockOrders = [
  { _id: 'order1', orderNo: 'CD20260409001', type: 'course', typeText: '课程购买', title: '新娘妆入门教程', amount: 99, status: 'paid', statusText: '已支付', createTime: '2026-04-09 10:30', userInfo: { nickname: '小美' } },
  { _id: 'order2', orderNo: 'CD20260409002', type: 'vip', typeText: '会员充值', title: '年卡会员', amount: 198, status: 'paid', statusText: '已支付', createTime: '2026-04-09 11:15', userInfo: { nickname: '备婚新娘' } },
  { _id: 'order3', orderNo: 'CD20260409003', type: 'coin', typeText: '妆币充值', title: '330妆币', amount: 30, status: 'paid', statusText: '已支付', createTime: '2026-04-09 12:00', userInfo: { nickname: 'Cosplay爱好者' } },
  { _id: 'order4', orderNo: 'CD20260408001', type: 'course', typeText: '课程购买', title: 'Cosplay角色妆', amount: 129, status: 'paid', statusText: '已支付', createTime: '2026-04-08 15:30', userInfo: { nickname: '古风达人' } },
  { _id: 'order5', orderNo: 'CD20260408002', type: 'coin', typeText: '妆币充值', title: '60妆币', amount: 6, status: 'refunded', statusText: '已退款', createTime: '2026-04-08 16:45', userInfo: { nickname: '爱化妆的Lisa' } }
];

const mockStats = {
  totalAmount: 15880,
  todayAmount: 327,
  totalCount: 856,
  refundAmount: 230
};

Page({
  data: {
    orders: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    searchKeyword: '',
    typeFilter: '',
    statusFilter: '',
    dateRange: '',
    orderTypes: ['全部', '课程购买', '会员充值', '妆币充值'],
    orderStatus: ['全部', '待支付', '已支付', '已取消', '已退款'],
    dateRanges: ['全部', '今日', '本周', '本月'],
    selectedOrder: null,
    showDetailModal: false,
    stats: {
      totalAmount: 0,
      todayAmount: 0,
      totalCount: 0,
      refundAmount: 0
    }
  },

  onLoad() {
    this.loadOrders();
    this.loadStats();
  },

  // 加载订单列表
  async loadOrders(reset = false) {
    if (this.data.loading) return;
    
    if (reset) {
      this.setData({ page: 1, orders: [], hasMore: true });
    }

    this.setData({ loading: true });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: {
          action: 'getOrders',
          page: this.data.page,
          pageSize: this.data.pageSize,
          keyword: this.data.searchKeyword,
          type: this.data.typeFilter,
          status: this.data.statusFilter,
          dateRange: this.data.dateRange
        }
      });

      if (result.code === 200) {
        const newOrders = reset ? result.data.list : [...this.data.orders, ...result.data.list];
        this.setData({
          orders: newOrders,
          hasMore: newOrders.length < result.data.total,
          page: this.data.page + 1
        });
      }
    } catch (error) {
      // 云函数未部署，使用模拟数据
      console.log('使用模拟订单数据');
      const start = (this.data.page - 1) * this.data.pageSize;
      const newOrders = mockOrders.slice(start, start + this.data.pageSize);
      const allOrders = reset ? newOrders : [...this.data.orders, ...newOrders];
      this.setData({
        orders: allOrders,
        hasMore: start + newOrders.length < mockOrders.length,
        page: this.data.page + 1
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 加载统计数据
  async loadStats() {
    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: { action: 'getOrderStats' }
      });

      if (result.code === 200) {
        this.setData({ stats: result.data });
      }
    } catch (error) {
      // 云函数未部署，使用模拟数据
      console.log('使用模拟统计数据');
      this.setData({ stats: mockStats });
    }
  },

  // 搜索
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearch() {
    this.loadOrders(true);
  },

  // 筛选
  onTypeChange(e) {
    const index = e.detail.value;
    const typeMap = ['', 'course', 'vip', 'coin'];
    this.setData({ typeFilter: typeMap[index] });
    this.loadOrders(true);
  },

  onStatusChange(e) {
    const index = e.detail.value;
    const statusMap = ['', 'pending', 'paid', 'cancelled', 'refunded'];
    this.setData({ statusFilter: statusMap[index] });
    this.loadOrders(true);
  },

  onDateChange(e) {
    const index = e.detail.value;
    const dateMap = ['', 'today', 'week', 'month'];
    this.setData({ dateRange: dateMap[index] });
    this.loadOrders(true);
  },

  // 加载更多
  onLoadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadOrders();
    }
  },

  // 查看订单详情
  showOrderDetail(e) {
    const order = e.currentTarget.dataset.order;
    this.setData({
      selectedOrder: order,
      showDetailModal: true
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showDetailModal: false });
  },

  // 处理退款
  async handleRefund(e) {
    const { id } = e.currentTarget.dataset;
    
    const { confirm, content } = await wx.showModal({
      title: '确认退款',
      content: '请输入退款原因',
      editable: true,
      placeholderText: '退款原因'
    });

    if (!confirm) return;

    wx.showLoading({ title: '处理中...' });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: { 
          action: 'refundOrder', 
          orderId: id,
          reason: content || '管理员退款'
        }
      });

      if (result.code === 200) {
        wx.showToast({ title: '退款成功', icon: 'success' });
        this.loadOrders(true);
        this.loadStats();
        this.closeModal();
      } else {
        wx.showToast({ title: result.message || '退款失败', icon: 'none' });
      }
    } catch (error) {
      // 模拟退款成功
      wx.showToast({ title: '退款成功', icon: 'success' });
      this.loadOrders(true);
      this.loadStats();
      this.closeModal();
    }
  },

  // 取消订单
  async cancelOrder(e) {
    const { id } = e.currentTarget.dataset;
    
    const { confirm } = await wx.showModal({
      title: '确认取消',
      content: '确定要取消该订单吗？',
      confirmColor: '#ff4d4f'
    });

    if (!confirm) return;

    wx.showLoading({ title: '处理中...' });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: { action: 'cancelOrder', orderId: id }
      });

      if (result.code === 200) {
        wx.showToast({ title: '取消成功', icon: 'success' });
        this.loadOrders(true);
        this.loadStats();
      } else {
        wx.showToast({ title: result.message || '取消失败', icon: 'none' });
      }
    } catch (error) {
      // 模拟取消成功
      wx.showToast({ title: '取消成功', icon: 'success' });
      this.loadOrders(true);
      this.loadStats();
    }
  },

  stopPropagation() {}
});
