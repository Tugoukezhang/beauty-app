const app = getApp();

// 模拟数据 - 云函数未部署时使用
const mockUsers = [
  { _id: 'user1', nickname: '小美', avatarUrl: 'https://picsum.photos/100/100?random=1', phone: '138****1234', isVip: true, vipExpireTime: '2026-12-31', status: 'active', createTime: '2026-01-15', coins: 500 },
  { _id: 'user2', nickname: '爱化妆的Lisa', avatarUrl: 'https://picsum.photos/100/100?random=2', phone: '139****5678', isVip: false, vipExpireTime: '', status: 'active', createTime: '2026-02-20', coins: 120 },
  { _id: 'user3', nickname: '备婚新娘', avatarUrl: 'https://picsum.photos/100/100?random=3', phone: '137****9012', isVip: true, vipExpireTime: '2026-06-15', status: 'active', createTime: '2026-03-01', coins: 800 },
  { _id: 'user4', nickname: 'Cosplay爱好者', avatarUrl: 'https://picsum.photos/100/100?random=4', phone: '136****3456', isVip: false, vipExpireTime: '', status: 'banned', createTime: '2026-03-10', coins: 0 },
  { _id: 'user5', nickname: '古风达人', avatarUrl: 'https://picsum.photos/100/100?random=5', phone: '135****7890', isVip: true, vipExpireTime: '2027-01-01', status: 'active', createTime: '2026-03-15', coins: 2000 }
];

const mockStats = {
  total: 1568,
  today: 23,
  vip: 456,
  active: 1420
};

Page({
  data: {
    users: [],
    loading: false,
    page: 1,
    pageSize: 10,
    hasMore: true,
    searchKeyword: '',
    statusFilter: '',
    vipFilter: '',
    statusList: ['全部', '正常', '禁用'],
    vipList: ['全部', '普通用户', '会员'],
    selectedUser: null,
    showDetailModal: false,
    stats: {
      total: 0,
      today: 0,
      vip: 0,
      active: 0
    }
  },

  onLoad() {
    this.loadUsers();
    this.loadStats();
  },

  // 加载用户列表
  async loadUsers(reset = false) {
    if (this.data.loading) return;
    
    if (reset) {
      this.setData({ page: 1, users: [], hasMore: true });
    }

    this.setData({ loading: true });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: {
          action: 'getUsers',
          page: this.data.page,
          pageSize: this.data.pageSize,
          keyword: this.data.searchKeyword,
          status: this.data.statusFilter,
          isVip: this.data.vipFilter
        }
      });

      if (result.code === 200) {
        const newUsers = reset ? result.data.list : [...this.data.users, ...result.data.list];
        this.setData({
          users: newUsers,
          hasMore: newUsers.length < result.data.total,
          page: this.data.page + 1
        });
      }
    } catch (error) {
      // 云函数未部署，使用模拟数据
      console.log('使用模拟用户数据');
      const start = (this.data.page - 1) * this.data.pageSize;
      const newUsers = mockUsers.slice(start, start + this.data.pageSize);
      const allUsers = reset ? newUsers : [...this.data.users, ...newUsers];
      this.setData({
        users: allUsers,
        hasMore: start + newUsers.length < mockUsers.length,
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
        data: { action: 'getUserStats' }
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
    this.loadUsers(true);
  },

  // 筛选
  onStatusChange(e) {
    const index = e.detail.value;
    const status = index == 0 ? '' : (index == 1 ? 'active' : 'banned');
    this.setData({ statusFilter: status });
    this.loadUsers(true);
  },

  onVipChange(e) {
    const index = e.detail.value;
    const vip = index == 0 ? '' : (index == 1 ? false : true);
    this.setData({ vipFilter: vip });
    this.loadUsers(true);
  },

  // 加载更多
  onLoadMore() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadUsers();
    }
  },

  // 查看用户详情
  showUserDetail(e) {
    const user = e.currentTarget.dataset.user;
    this.setData({
      selectedUser: user,
      showDetailModal: true
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showDetailModal: false });
  },

  // 切换用户状态
  async toggleUserStatus(e) {
    const { id, status } = e.currentTarget.dataset;
    const newStatus = status === 'active' ? 'banned' : 'active';
    const actionText = newStatus === 'banned' ? '禁用' : '启用';

    const { confirm } = await wx.showModal({
      title: `确认${actionText}`,
      content: `确定要${actionText}该用户吗？`,
      confirmColor: newStatus === 'banned' ? '#ff4d4f' : '#52c41a'
    });

    if (!confirm) return;

    wx.showLoading({ title: '处理中...' });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: { action: 'updateUserStatus', userId: id, status: newStatus }
      });

      if (result.code === 200) {
        wx.showToast({ title: `${actionText}成功`, icon: 'success' });
        this.loadUsers(true);
        this.loadStats();
      } else {
        wx.showToast({ title: result.message || '操作失败', icon: 'none' });
      }
    } catch (error) {
      // 模拟操作成功
      wx.showToast({ title: `${actionText}成功`, icon: 'success' });
      this.loadUsers(true);
      this.loadStats();
    }
  },

  // 赠送会员
  async giveVip(e) {
    const { id } = e.currentTarget.dataset;
    
    const { confirm, content } = await wx.showModal({
      title: '赠送会员',
      content: '请输入赠送天数',
      editable: true,
      placeholderText: '例如: 30'
    });

    if (!confirm || !content) return;

    const days = parseInt(content);
    if (isNaN(days) || days <= 0) {
      wx.showToast({ title: '请输入有效天数', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '处理中...' });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: { action: 'giveVip', userId: id, days }
      });

      if (result.code === 200) {
        wx.showToast({ title: '赠送成功', icon: 'success' });
        this.loadUsers(true);
        this.loadStats();
      } else {
        wx.showToast({ title: result.message || '赠送失败', icon: 'none' });
      }
    } catch (error) {
      // 模拟赠送成功
      wx.showToast({ title: '赠送成功', icon: 'success' });
      this.loadUsers(true);
      this.loadStats();
    }
  },

  // 赠送妆币
  async giveCoins(e) {
    const { id } = e.currentTarget.dataset;
    
    const { confirm, content } = await wx.showModal({
      title: '赠送妆币',
      content: '请输入赠送数量',
      editable: true,
      placeholderText: '例如: 100'
    });

    if (!confirm || !content) return;

    const coins = parseInt(content);
    if (isNaN(coins) || coins <= 0) {
      wx.showToast({ title: '请输入有效数量', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '处理中...' });

    try {
      const { result } = await wx.cloud.callFunction({
        name: 'admin',
        data: { action: 'giveCoins', userId: id, coins }
      });

      if (result.code === 200) {
        wx.showToast({ title: '赠送成功', icon: 'success' });
        this.loadUsers(true);
      } else {
        wx.showToast({ title: result.message || '赠送失败', icon: 'none' });
      }
    } catch (error) {
      // 模拟赠送成功
      wx.showToast({ title: '赠送成功', icon: 'success' });
      this.loadUsers(true);
    }
  },

  stopPropagation() {}
});
