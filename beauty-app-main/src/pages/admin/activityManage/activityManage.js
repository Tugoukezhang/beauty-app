const app = getApp();

Page({
  data: {
    activities: [],
    loading: false,
    showAddModal: false,
    isEdit: false,
    editId: null,
    typeIndex: 0,
    form: {
      title: '',
      type: 'discount',
      cover: '',
      startTime: '',
      endTime: '',
      content: '',
      status: 0
    },
    typeOptions: [
      { label: '限时折扣', value: 'discount' },
      { label: '满减优惠', value: 'reduce' },
      { label: '新用户专享', value: 'newuser' },
      { label: '充值返利', value: 'recharge' }
    ],
    statusOptions: [
      { label: '未开始', value: 0 },
      { label: '进行中', value: 1 },
      { label: '已结束', value: 2 }
    ]
  },

  onLoad() {
    this.loadActivities();
  },

  // 加载活动列表
  loadActivities() {
    this.setData({ loading: true });
    
    // 模拟数据
    setTimeout(() => {
      const mockActivities = [
        {
          id: 1,
          title: '春季美妆节',
          type: 'discount',
          cover: 'https://picsum.photos/400/200?random=1',
          startTime: '2026-04-01',
          endTime: '2026-04-15',
          content: '全场课程8折优惠，限时抢购！',
          status: 1,
          participants: 1256,
          orders: 328
        },
        {
          id: 2,
          title: '新用户专享礼包',
          type: 'newuser',
          cover: 'https://picsum.photos/400/200?random=2',
          startTime: '2026-04-01',
          endTime: '2026-04-30',
          content: '新用户注册即送100妆币+7天会员',
          status: 1,
          participants: 892,
          orders: 0
        },
        {
          id: 3,
          title: '充值返利活动',
          type: 'recharge',
          cover: 'https://picsum.photos/400/200?random=3',
          startTime: '2026-03-15',
          endTime: '2026-03-31',
          content: '充值满100返20，多充多送',
          status: 2,
          participants: 567,
          orders: 234
        }
      ];
      
      this.setData({
        activities: mockActivities,
        loading: false
      });
    }, 500);
  },

  // 显示添加弹窗
  showAddModal() {
    const today = new Date().toISOString().split('T')[0];
    this.setData({
      showAddModal: true,
      isEdit: false,
      editId: null,
      typeIndex: 0,
      form: {
        title: '',
        type: 'discount',
        cover: '',
        startTime: today,
        endTime: today,
        content: '',
        status: 0
      }
    });
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const id = e.currentTarget.dataset.id;
    const activity = this.data.activities.find(a => a.id === id);
    const typeIndex = this.data.typeOptions.findIndex(t => t.value === activity.type) || 0;
    
    this.setData({
      showAddModal: true,
      isEdit: true,
      editId: id,
      typeIndex: typeIndex,
      form: {
        title: activity.title,
        type: activity.type,
        cover: activity.cover,
        startTime: activity.startTime,
        endTime: activity.endTime,
        content: activity.content,
        status: activity.status
      }
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showAddModal: false });
  },

  stopPropagation() {},

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const { value } = e.detail;
    this.setData({
      [`form.${field}`]: value
    });
  },

  // 选择活动类型
  onTypeChange(e) {
    const { value } = e.detail;
    const typeIndex = parseInt(value);
    this.setData({
      typeIndex: typeIndex,
      'form.type': this.data.typeOptions[typeIndex].value
    });
  },

  // 选择状态
  onStatusChange(e) {
    const { value } = e.detail;
    this.setData({ 'form.status': parseInt(value) });
  },

  // 选择封面
  chooseCover() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          'form.cover': res.tempFilePaths[0]
        });
      }
    });
  },

  // 选择开始时间
  onStartTimeChange(e) {
    this.setData({ 'form.startTime': e.detail.value });
  },

  // 选择结束时间
  onEndTimeChange(e) {
    this.setData({ 'form.endTime': e.detail.value });
  },

  // 保存活动
  saveActivity() {
    const { form, isEdit, editId } = this.data;
    
    if (!form.title.trim()) {
      wx.showToast({ title: '请输入活动标题', icon: 'none' });
      return;
    }
    if (!form.content.trim()) {
      wx.showToast({ title: '请输入活动内容', icon: 'none' });
      return;
    }

    wx.showLoading({ title: '保存中' });

    setTimeout(() => {
      let activities = this.data.activities;
      
      if (isEdit) {
        const index = activities.findIndex(a => a.id === editId);
        activities[index] = { ...activities[index], ...form };
      } else {
        const newActivity = {
          id: Date.now(),
          ...form,
          participants: 0,
          orders: 0
        };
        activities.unshift(newActivity);
      }

      this.setData({
        activities,
        showAddModal: false
      });

      wx.hideLoading();
      wx.showToast({
        title: isEdit ? '修改成功' : '添加成功',
        icon: 'success'
      });
    }, 500);
  },

  // 删除活动
  deleteActivity(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      success: (res) => {
        if (res.confirm) {
          const activities = this.data.activities.filter(a => a.id !== id);
          this.setData({ activities });
          wx.showToast({ title: '删除成功', icon: 'success' });
        }
      }
    });
  },

  // 获取类型名称
  getTypeName(type) {
    const map = {
      discount: '限时折扣',
      reduce: '满减优惠',
      newuser: '新用户专享',
      recharge: '充值返利'
    };
    return map[type] || type;
  },

  // 获取状态文本
  getStatusText(status) {
    const map = { 0: '未开始', 1: '进行中', 2: '已结束' };
    return map[status] || '未知';
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadActivities();
    wx.stopPullDownRefresh();
  }
});
