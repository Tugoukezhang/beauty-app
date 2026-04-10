/**
 * i妆 - 换装中心
 * CSS组件化换装系统
 * 发型/发饰/衣服/手持/肤色
 * 免费基础款 + 付费高级款
 */

Page({
  data: {
    activeCategory: 'hair',
    showUnlockModal: false,
    unlockItem: {},
    unlockType: '',
    coinBalance: 0,
    charAnimation: {},

    // 当前形象配置
    avatar: {
      hairStyle: '',
      accessory: '',
      dressStyle: '',
      handItem: '',
      skinTone: 'light',
    },

    // 已解锁项目
    unlockedItems: [],

    // ====== 发型选项 ======
    hairOptions: [
      { value: '', name: '短发', emoji: '💇‍♀️', locked: false, price: 0 },
      { value: 'long', name: '长发', emoji: '💇‍♀️', locked: false, price: 0 },
      { value: 'twintail', name: '双马尾', emoji: '🎀', locked: false, price: 0 },
      { value: 'bob', name: '波波头', emoji: '💁‍♀️', locked: true, price: 30 },
      { value: 'curly', name: '卷发', emoji: '🌊', locked: true, price: 50 },
      { value: 'bun', name: '丸子头', emoji: '🍡', locked: true, price: 60 },
    ],

    // ====== 发饰选项 ======
    accessoryOptions: [
      { value: '', name: '无', emoji: '🚫', locked: false, price: 0 },
      { value: 'bow', name: '蝴蝶结', emoji: '🎀', locked: false, price: 0 },
      { value: 'flower', name: '花朵', emoji: '🌸', locked: false, price: 0 },
      { value: 'crown', name: '皇冠', emoji: '👑', locked: true, price: 80 },
      { value: 'stars', name: '星星发夹', emoji: '⭐', locked: true, price: 60 },
      { value: 'ribbon', name: '丝带', emoji: '🎗️', locked: true, price: 50 },
    ],

    // ====== 衣服选项 ======
    dressOptions: [
      { value: '', name: '粉裙', emoji: '👗', locked: false, price: 0 },
      { value: 'princess', name: '公主裙', emoji: '👸', locked: false, price: 0 },
      { value: 'ancient', name: '古风', emoji: '🏮', locked: false, price: 0 },
      { value: 'cos', name: 'Cos装', emoji: '🎭', locked: true, price: 80 },
      { value: 'elegant', name: '晚礼服', emoji: '🥂', locked: true, price: 120 },
      { value: 'wedding', name: '婚纱', emoji: '💒', locked: true, price: 198 },
    ],

    // ====== 手持选项 ======
    handOptions: [
      { value: '', name: '无', emoji: '🚫', locked: false, price: 0 },
      { value: 'lipstick', name: '口红', emoji: '💄', locked: false, price: 0 },
      { value: 'brush', name: '化妆刷', emoji: '🖌️', locked: false, price: 0 },
      { value: 'perfume', name: '香水', emoji: '🧴', locked: true, price: 40 },
      { value: 'mirror', name: '小镜子', emoji: '🪞', locked: true, price: 50 },
      { value: 'rose', name: '玫瑰花', emoji: '🌹', locked: true, price: 60 },
    ],

    // ====== 肤色选项 ======
    faceOptions: [
      { value: 'fair', name: '白皙', color: '#FFE8D6', locked: false, price: 0 },
      { value: 'light', name: '自然白', color: '#FFE0CC', locked: false, price: 0 },
      { value: 'medium', name: '小麦色', color: '#E8C8A0', locked: false, price: 0 },
      { value: 'tan', name: '健康棕', color: '#C8A878', locked: true, price: 30 },
      { value: 'cool', name: '冷白皮', color: '#E0D4E8', locked: true, price: 50 },
    ],
  },

  onLoad() {
    this.loadAvatarConfig();
    this.loadCoinBalance();
    this.loadUnlockedItems();
  },

  onShow() {
    this.loadAvatarConfig();
    this.loadCoinBalance();
  },

  // ====== 数据加载 ======

  loadAvatarConfig() {
    const avatarConfig = wx.getStorageSync('avatarConfig');
    if (avatarConfig) {
      this.setData({ avatar: avatarConfig });
    }
  },

  loadCoinBalance() {
    const userInfo = wx.getStorageSync('userInfo');
    const balance = userInfo ? (userInfo.balance || 0) : 0;
    this.setData({ coinBalance: balance });
  },

  loadUnlockedItems() {
    const unlocked = wx.getStorageSync('unlockedAvatarItems');
    if (unlocked) {
      this.setData({ unlockedItems: unlocked });

      // 更新选项的锁定状态
      this.updateLockStatus(unlocked);
    }
  },

  updateLockStatus(unlocked) {
    const categories = ['hairOptions', 'accessoryOptions', 'dressOptions', 'handOptions', 'faceOptions'];
    const updates = {};

    categories.forEach(catKey => {
      const items = this.data[catKey];
      items.forEach(item => {
        if (item.price > 0 && unlocked.includes(`${catKey}_${item.value}`)) {
          updates[`${catKey}.${items.indexOf(item)}.locked`] = false;
        }
      });
    });

    if (Object.keys(updates).length > 0) {
      this.setData(updates);
    }
  },

  // ====== 交互逻辑 ======

  /** 切换分类 */
  switchCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ activeCategory: cat });
  },

  /** 选择项目 */
  selectItem(e) {
    const { type, value, locked, price } = e.currentTarget.dataset;

    // 付费且未解锁
    if (locked) {
      // 找到对应选项的详情
      const optionItem = this.findOptionItem(type, value);
      if (optionItem) {
        this.setData({
          showUnlockModal: true,
          unlockItem: optionItem,
          unlockType: type,
        });
      }
      return;
    }

    // 免费/已解锁 → 直接应用
    this.applyItem(type, value);
  },

  /** 应用选项到人物 */
  applyItem(type, value) {
    const typeMap = {
      hairStyle: 'hairStyle',
      accessory: 'accessory',
      dressStyle: 'dressStyle',
      handItem: 'handItem',
      skinTone: 'skinTone',
    };

    const avatarKey = typeMap[type];
    if (!avatarKey) return;

    // 切换动画
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    });
    animation.scale(1.35).step();
    animation.scale(1.3).step();
    this.setData({ charAnimation: animation.export() });

    // 更新数据
    this.setData({
      [`avatar.${avatarKey}`]: value,
    });
  },

  /** 找到选项详情 */
  findOptionItem(type, value) {
    const catMap = {
      hairStyle: 'hairOptions',
      accessory: 'accessoryOptions',
      dressStyle: 'dressOptions',
      handItem: 'handOptions',
      skinTone: 'faceOptions',
    };
    const items = this.data[catMap[type]];
    return items.find(item => item.value === value);
  },

  /** 关闭解锁弹窗 */
  closeUnlockModal() {
    this.setData({ showUnlockModal: false, unlockItem: {}, unlockType: '' });
  },

  /** 确认解锁 */
  confirmUnlock() {
    const { unlockItem, unlockType, coinBalance } = this.data;

    if (coinBalance < unlockItem.price) {
      wx.showToast({ title: '妆币不足，请先充值', icon: 'none' });
      return;
    }

    // 扣除妆币
    const newBalance = coinBalance - unlockItem.price;
    this.setData({ coinBalance: newBalance });

    // 更新用户余额
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      userInfo.balance = newBalance;
      wx.setStorageSync('userInfo', userInfo);
    }

    // 记录解锁
    const catMap = {
      hairStyle: 'hairOptions',
      accessory: 'accessoryOptions',
      dressStyle: 'dressOptions',
      handItem: 'handOptions',
      skinTone: 'faceOptions',
    };
    const unlockKey = `${catMap[unlockType]}_${unlockItem.value}`;
    const unlockedItems = [...this.data.unlockedItems, unlockKey];
    wx.setStorageSync('unlockedAvatarItems', unlockedItems);

    // 更新选项锁定状态
    this.updateLockStatus(unlockedItems);

    // 应用选择
    this.applyItem(unlockType, unlockItem.value);

    // 关闭弹窗
    this.setData({ showUnlockModal: false, unlockItem: {}, unlockType: '' });

    wx.showToast({ title: '解锁成功！', icon: 'success' });
  },

  /** 保存形象 */
  saveAvatar() {
    const { avatar } = this.data;
    wx.setStorageSync('avatarConfig', avatar);

    wx.showToast({ title: '形象已保存', icon: 'success' });

    setTimeout(() => {
      wx.navigateBack();
    }, 1000);
  },

  /** 重置形象 */
  resetAvatar() {
    wx.showModal({
      title: '重置形象',
      content: '确定恢复默认形象吗？',
      confirmColor: '#FF6B9D',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            avatar: {
              hairStyle: '',
              accessory: '',
              dressStyle: '',
              handItem: '',
              skinTone: 'light',
            },
          });
        }
      },
    });
  },

  /** 充值 */
  goToRecharge() {
    wx.navigateTo({ url: '/pages/recharge/recharge' });
  },

  /** 返回 */
  goBack() {
    wx.navigateBack();
  },

  // ====== 计算属性 ======

  get avatarName() {
    // 根据搭配自动生成名称（备用）
    return '我的形象';
  },
});
