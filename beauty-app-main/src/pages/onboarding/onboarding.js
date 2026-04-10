/**
 * i妆 - 新用户引导问卷页
 * 4步流程：蜕变方向 → 化妆水平 → 个人信息 → 方案生成
 * 登录后首次进入触发
 */

Page({
  data: {
    currentStep: 1,
    totalSteps: 4,
    progressPercent: 25,
    canNext: false,

    // Step1: 蜕变方向选项
    directionOptions: [
      { id: 'bride', emoji: '👰', name: '新娘妆', desc: '婚礼当天最美新娘', selected: false },
      { id: 'daily', emoji: '🌸', name: '日常妆', desc: '通勤约会自然妆容', selected: false },
      { id: 'ancient', emoji: '🏮', name: '古风妆', desc: '汉服古韵东方美', selected: false },
      { id: 'cos', emoji: '🎭', name: 'Cos妆', desc: '角色还原二次元', selected: false },
      { id: 'film', emoji: '🎬', name: '影视特效', desc: '特效化妆专业级', selected: false },
      { id: 'party', emoji: '🎉', name: '派对妆', desc: '蹦迪聚会闪亮登场', selected: false },
    ],

    // Step2: 化妆水平
    levelOptions: [
      { id: 'beginner', emoji: '🌱', name: '零基础小白', desc: '从没化过妆，想从零开始学', selected: false },
      { id: 'basic', emoji: '🌿', name: '初学者', desc: '会基本底妆和口红，想进阶', selected: false },
      { id: 'intermediate', emoji: '🌳', name: '有经验', desc: '日常化妆没问题，想学更多技巧', selected: false },
      { id: 'advanced', emoji: '🌟', name: '高手', desc: '化妆技术熟练，想挑战专业级', selected: false },
    ],

    // Step3: 肤质
    skinTypeOptions: [
      { id: 'dry', emoji: '🏜️', name: '干性', selected: false },
      { id: 'oily', emoji: '💧', name: '油性', selected: false },
      { id: 'combo', emoji: '🔄', name: '混合性', selected: false },
      { id: 'sensitive', emoji: '🌸', name: '敏感性', selected: false },
      { id: 'normal', emoji: '✨', name: '中性', selected: false },
    ],

    // Step3: 肌肤问题
    skinIssueOptions: [
      { id: 'acne', name: '痘痘', selected: false },
      { id: 'pores', name: '毛孔粗大', selected: false },
      { id: 'darkcircles', name: '黑眼圈', selected: false },
      { id: 'dull', name: '肤色暗沉', selected: false },
      { id: 'spots', name: '色斑', selected: false },
      { id: 'wrinkles', name: '细纹', selected: false },
      { id: 'redness', name: '泛红', selected: false },
      { id: 'dryness', name: '干燥脱皮', selected: false },
    ],

    // Step3: 化妆频率
    frequencyOptions: [
      { id: 'daily', name: '每天', selected: false },
      { id: 'often', name: '经常', selected: false },
      { id: 'sometimes', name: '偶尔', selected: false },
      { id: 'rarely', name: '很少', selected: false },
    ],

    // Step4: 结果
    isGenerating: false,
    planGenerated: false,
    selectedDirections: [],
    recommendedCourses: [],
  },

  onLoad() {
    this.updateCanNext();
  },

  // ======== Step1: 蜕变方向 ========
  toggleDirection(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.directionOptions.map(item => {
      if (item.id === id) return { ...item, selected: !item.selected };
      return item;
    });
    this.setData({ directionOptions: list });
    this.updateCanNext();
  },

  // ======== Step2: 化妆水平 ========
  selectLevel(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.levelOptions.map(item => ({
      ...item,
      selected: item.id === id
    }));
    this.setData({ levelOptions: list });
    this.updateCanNext();
  },

  // ======== Step3: 个人信息 ========
  selectSkinType(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.skinTypeOptions.map(item => ({
      ...item,
      selected: item.id === id
    }));
    this.setData({ skinTypeOptions: list });
    this.updateCanNext();
  },

  toggleSkinIssue(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.skinIssueOptions.map(item => {
      if (item.id === id) return { ...item, selected: !item.selected };
      return item;
    });
    this.setData({ skinIssueOptions: list });
  },

  selectFrequency(e) {
    const id = e.currentTarget.dataset.id;
    const list = this.data.frequencyOptions.map(item => ({
      ...item,
      selected: item.id === id
    }));
    this.setData({ frequencyOptions: list });
    this.updateCanNext();
  },

  // ======== 步骤导航 ========
  updateCanNext() {
    const { currentStep, directionOptions, levelOptions, skinTypeOptions } = this.data;
    let canNext = false;

    switch (currentStep) {
      case 1:
        canNext = directionOptions.some(i => i.selected);
        break;
      case 2:
        canNext = levelOptions.some(i => i.selected);
        break;
      case 3:
        canNext = skinTypeOptions.some(i => i.selected);
        break;
      default:
        canNext = true;
    }

    this.setData({ canNext });
  },

  nextStep() {
    if (!this.data.canNext) return;

    const next = this.data.currentStep + 1;
    this.setData({
      currentStep: next,
      progressPercent: (next / this.data.totalSteps) * 100
    });
    this.updateCanNext();

    // 进入第4步时生成方案
    if (next === 4) {
      this.generatePlan();
    }
  },

  prevStep() {
    const prev = this.data.currentStep - 1;
    this.setData({
      currentStep: prev,
      progressPercent: (prev / this.data.totalSteps) * 100
    });
    this.updateCanNext();
  },

  // ======== 方案生成 ========
  generatePlan() {
    this.setData({ isGenerating: true });

    // 收集选择结果
    const selectedDirections = this.data.directionOptions.filter(i => i.selected);
    const selectedLevel = this.data.levelOptions.find(i => i.selected);
    const selectedSkinType = this.data.skinTypeOptions.find(i => i.selected);
    const selectedIssues = this.data.skinIssueOptions.filter(i => i.selected);

    // 根据选择匹配课程（模拟推荐逻辑）
    const allCourses = {
      bride: [
        { id: 'b1', name: '新娘妆全流程教学', emoji: '👰', level: '初级', lessons: 12, price: 0, match: 98 },
        { id: 'b2', name: '敬酒服造型速成', emoji: '🥂', level: '中级', lessons: 8, price: 29, match: 92 },
      ],
      daily: [
        { id: 'd1', name: '5分钟通勤妆', emoji: '🌸', level: '初级', lessons: 6, price: 0, match: 97 },
        { id: 'd2', name: '约会心机妆', emoji: '💕', level: '中级', lessons: 10, price: 19, match: 90 },
      ],
      ancient: [
        { id: 'a1', name: '古风底妆与眉形', emoji: '🏮', level: '初级', lessons: 8, price: 0, match: 95 },
        { id: 'a2', name: '汉服造型进阶', emoji: '👘', level: '中级', lessons: 12, price: 39, match: 88 },
      ],
      cos: [
        { id: 'c1', name: 'Cos妆入门基础', emoji: '🎭', level: '初级', lessons: 10, price: 0, match: 96 },
        { id: 'c2', name: '角色还原进阶技巧', emoji: '⚔️', level: '中级', lessons: 8, price: 29, match: 85 },
      ],
      film: [
        { id: 'f1', name: '特效化妆入门', emoji: '🎬', level: '中级', lessons: 14, price: 49, match: 94 },
        { id: 'f2', name: '伤效妆速成', emoji: '🩹', level: '高级', lessons: 6, price: 59, match: 82 },
      ],
      party: [
        { id: 'p1', name: '派对闪亮妆容', emoji: '🎉', level: '初级', lessons: 6, price: 0, match: 95 },
        { id: 'p2', name: '节日特效妆', emoji: '🎆', level: '中级', lessons: 8, price: 19, match: 87 },
      ],
    };

    // 肤质相关推荐
    const skinCourses = {
      dry: { id: 's1', name: '干皮底妆不卡粉秘籍', emoji: '💧', level: '初级', lessons: 4, price: 0, match: 96 },
      oily: { id: 's2', name: '油皮持妆12小时', emoji: '✨', level: '初级', lessons: 4, price: 0, match: 96 },
      sensitive: { id: 's3', name: '敏感肌化妆安全指南', emoji: '🌸', level: '初级', lessons: 4, price: 0, match: 96 },
      combo: { id: 's4', name: '混合皮分区上妆法', emoji: '🔄', level: '初级', lessons: 4, price: 0, match: 95 },
      normal: { id: 's5', name: '完美底妆速成课', emoji: '✨', level: '初级', lessons: 4, price: 0, match: 94 },
    };

    // 组合推荐课程
    let recommendedCourses = [];

    // 添加方向课程
    selectedDirections.forEach(dir => {
      if (allCourses[dir.id]) {
        recommendedCourses.push(...allCourses[dir.id]);
      }
    });

    // 添加肤质课程
    if (selectedSkinType && skinCourses[selectedSkinType.id]) {
      recommendedCourses.push(skinCourses[selectedSkinType.id]);
    }

    // 按匹配度排序，最多展示5个
    recommendedCourses.sort((a, b) => b.match - a.match);
    recommendedCourses = recommendedCourses.slice(0, 5);

    // 模拟生成延迟
    setTimeout(() => {
      this.setData({
        isGenerating: false,
        planGenerated: true,
        selectedDirections,
        recommendedCourses
      });
    }, 2000);
  },

  // ======== 完成 / 跳过 ========
  finishOnboarding() {
    // 保存用户偏好到本地
    const preferences = {
      directions: this.data.directionOptions.filter(i => i.selected).map(i => i.id),
      level: (this.data.levelOptions.find(i => i.selected) || {}).id,
      skinType: (this.data.skinTypeOptions.find(i => i.selected) || {}).id,
      skinIssues: this.data.skinIssueOptions.filter(i => i.selected).map(i => i.id),
      frequency: (this.data.frequencyOptions.find(i => i.selected) || {}).id,
      completedAt: Date.now()
    };

    wx.setStorageSync('userPreferences', preferences);
    wx.setStorageSync('onboardingCompleted', true);

    // 跳转首页
    wx.switchTab({ url: '/pages/index/index' });
  },

  skipOnboarding() {
    wx.setStorageSync('onboardingCompleted', true);
    wx.switchTab({ url: '/pages/index/index' });
  }
});
