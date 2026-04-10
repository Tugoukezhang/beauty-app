const app = getApp();

Page({
  data: {
    settings: {
      appName: 'i妆',
      appLogo: '',
      contactPhone: '',
      contactEmail: '',
      customerServiceWechat: '',
      aboutUs: '',
      userAgreement: '',
      privacyPolicy: '',
      rechargeRatio: 10,
      vipPrices: {
        monthly: 30,
        quarterly: 78,
        yearly: 198
      },
      coinPackages: [
        { amount: 6, coins: 60, bonus: 0 },
        { amount: 30, coins: 330, bonus: 30 },
        { amount: 98, coins: 1150, bonus: 150 }
      ]
    },
    showEditModal: false,
    editField: '',
    editValue: '',
    editTitle: ''
  },

  onLoad() {
    this.loadSettings();
  },

  // 加载设置
  loadSettings() {
    // 从本地存储或服务器加载设置
    const savedSettings = wx.getStorageSync('systemSettings');
    if (savedSettings) {
      this.setData({ settings: savedSettings });
    }
  },

  // 显示编辑弹窗
  showEditModal(e) {
    const { field, title } = e.currentTarget.dataset;
    const value = this.data.settings[field];
    
    this.setData({
      showEditModal: true,
      editField: field,
      editValue: typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value),
      editTitle: title
    });
  },

  // 关闭弹窗
  closeModal() {
    this.setData({ showEditModal: false });
  },

  stopPropagation() {},

  // 输入变化
  onInputChange(e) {
    this.setData({ editValue: e.detail.value });
  },

  // 保存设置
  saveSetting() {
    const { editField, editValue, settings } = this.data;
    
    let value = editValue;
    
    // 尝试解析JSON
    if (editField === 'vipPrices' || editField === 'coinPackages') {
      try {
        value = JSON.parse(editValue);
      } catch (e) {
        wx.showToast({ title: 'JSON格式错误', icon: 'none' });
        return;
      }
    } else if (editField === 'rechargeRatio') {
      value = parseInt(editValue) || 10;
    }

    const newSettings = {
      ...settings,
      [editField]: value
    };

    this.setData({
      settings: newSettings,
      showEditModal: false
    });

    // 保存到本地
    wx.setStorageSync('systemSettings', newSettings);
    
    wx.showToast({ title: '保存成功', icon: 'success' });
  },

  // 选择Logo
  chooseLogo() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const newSettings = {
          ...this.data.settings,
          appLogo: res.tempFilePaths[0]
        };
        this.setData({ settings: newSettings });
        wx.setStorageSync('systemSettings', newSettings);
        wx.showToast({ title: '上传成功', icon: 'success' });
      }
    });
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定清除所有本地缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage();
          wx.showToast({ title: '缓存已清除', icon: 'success' });
        }
      }
    });
  },

  // 导出数据
  exportData() {
    wx.showActionSheet({
      itemList: ['导出用户数据', '导出订单数据', '导出课程数据'],
      success: (res) => {
        const types = ['users', 'orders', 'courses'];
        wx.showToast({
          title: `正在导出${['用户', '订单', '课程'][res.tapIndex]}数据...`,
          icon: 'none'
        });
      }
    });
  },

  // 查看日志
  viewLogs() {
    wx.navigateTo({
      url: '/pages/admin/systemLogs/systemLogs'
    });
  },

  // 系统维护
  systemMaintenance() {
    wx.showModal({
      title: '系统维护',
      content: '开启维护模式后，用户将无法访问小程序。确定开启吗？',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: '维护模式已开启', icon: 'success' });
        }
      }
    });
  }
});