/**
 * 用户相关接口
 * @description 用户登录、个人信息、会员相关API
 * @note 本地调试版本：使用模拟数据
 */

// ==================== 模拟数据 ====================

const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 模拟用户信息
const mockUserInfo = {
  id: 1001,
  nickname: '美妆爱好者',
  avatar: 'https://picsum.photos/100/100?random=avatar',
  phone: '138****8888',
  gender: 1,
  birthday: '1995-06-15',
  city: '上海',
  points: 2580,
  vipLevel: 1,
  isVip: false,
  vipExpireTime: '',
  signDays: 3,
  totalSignDays: 15,
  followers: 128,
  following: 256,
  coins: 200,
  learnHours: 24.5
};

// 模拟积分明细
const mockPointsDetail = [
  { id: 1, type: 'earn', amount: 10, reason: '每日签到', createTime: '2024-01-20' },
  { id: 2, type: 'earn', amount: 20, reason: '观看课程', createTime: '2024-01-19' },
  { id: 3, type: 'spend', amount: -100, reason: '兑换课程', createTime: '2024-01-18' }
];

// 模拟订单列表
const mockOrders = [
  { id: 1, orderNo: 'ORD20240120001', type: 'course', title: '新娘妆入门必修课', amount: 299, status: 'completed', createTime: '2024-01-20' },
  { id: 2, orderNo: 'ORD20240118002', type: 'recharge', title: '充值妆币', amount: 30, status: 'completed', createTime: '2024-01-18' }
];

// 模拟消息列表
const mockMessages = [
  { id: 1, type: 'system', title: '欢迎加入i妆', content: '恭喜您成为i妆用户，开始您的美妆之旅吧！', isRead: false, createTime: '2024-01-20' },
  { id: 2, type: 'course', title: '新课上线通知', content: '您关注的课程《古风妆容设计》已上线', isRead: true, createTime: '2024-01-19' }
];

// ==================== API 函数 ====================

/**
 * 微信登录
 */
export function wxLogin(code) {
  return delay(500).then(() => ({
    token: 'mock_token_' + Date.now(),
    userInfo: mockUserInfo
  }));
}

/**
 * 手机号登录
 */
export function phoneLogin(phone, code) {
  return delay(500).then(() => ({
    token: 'mock_token_' + Date.now(),
    userInfo: { ...mockUserInfo, phone }
  }));
}

/**
 * 获取用户信息
 */
export function getUserInfo() {
  return delay(200).then(() => mockUserInfo);
}

/**
 * 更新用户信息
 */
export function updateUserInfo(data) {
  return delay(300).then(() => ({
    ...mockUserInfo,
    ...data
  }));
}

/**
 * 获取用户学习记录
 */
export function getLearningHistory(page = 1, pageSize = 10) {
  return delay(200).then(() => ({
    list: [],
    total: 0,
    page,
    pageSize
  }));
}

/**
 * 获取用户收藏
 */
export function getUserCollections(type, page = 1, pageSize = 10) {
  return delay(200).then(() => ({
    list: [],
    total: 0,
    type,
    page,
    pageSize
  }));
}

/**
 * 添加收藏
 */
export function addCollection(type, id) {
  return delay(200).then(() => ({
    success: true,
    id: Date.now()
  }));
}

/**
 * 取消收藏
 */
export function cancelCollection(type, id) {
  return delay(200).then(() => ({ success: true }));
}

/**
 * 获取用户积分
 */
export function getUserPoints() {
  return delay(200).then(() => ({
    points: mockUserInfo.points,
    coins: mockUserInfo.coins
  }));
}

/**
 * 获取用户积分明细
 */
export function getPointsDetail(page = 1, pageSize = 20) {
  return delay(200).then(() => ({
    list: mockPointsDetail,
    total: mockPointsDetail.length,
    page,
    pageSize
  }));
}

/**
 * 获取会员信息
 */
export function getVipInfo() {
  return delay(200).then(() => ({
    vipLevel: mockUserInfo.vipLevel,
    isVip: mockUserInfo.isVip,
    vipExpireTime: mockUserInfo.vipExpireTime,
    rights: [
      { name: '专属课程', desc: '会员专享课程免费学', enabled: true },
      { name: '高清视频', desc: '会员专享高清画质', enabled: true },
      { name: '优先客服', desc: '专属客服快速响应', enabled: true }
    ]
  }));
}

/**
 * 获取签到信息
 */
export function getSignInfo() {
  return delay(200).then(() => ({
    signed: false,
    signDays: mockUserInfo.signDays,
    totalSignDays: mockUserInfo.totalSignDays,
    todayPoints: 10
  }));
}

/**
 * 签到
 */
export function doSign() {
  return delay(300).then(() => ({
    success: true,
    points: 10,
    signDays: mockUserInfo.signDays + 1,
    totalSignDays: mockUserInfo.totalSignDays + 1
  }));
}

/**
 * 获取邀请码
 */
export function getInviteCode() {
  return delay(200).then(() => ({
    code: 'IZHUANG' + Math.random().toString(36).substring(2, 8).toUpperCase()
  }));
}

/**
 * 获取邀请列表
 */
export function getInviteList(page = 1, pageSize = 20) {
  return delay(200).then(() => ({
    list: [],
    total: 0,
    page,
    pageSize
  }));
}

/**
 * 获取订单列表
 */
export function getOrderList(type, page = 1, pageSize = 10) {
  return delay(200).then(() => {
    let list = mockOrders;
    if (type) {
      list = list.filter(o => o.type === type);
    }
    return {
      list,
      total: list.length,
      page,
      pageSize
    };
  });
}

/**
 * 申请退款
 */
export function applyRefund(orderId, reason) {
  return delay(300).then(() => ({ success: true, refundId: 'REF' + Date.now() }));
}

/**
 * 获取消息列表
 */
export function getMessageList(page = 1, pageSize = 20) {
  return delay(200).then(() => ({
    list: mockMessages,
    total: mockMessages.length,
    page,
    pageSize
  }));
}

/**
 * 获取未读消息数
 */
export function getUnreadCount() {
  return delay(100).then(() => ({
    count: mockMessages.filter(m => !m.isRead).length
  }));
}

/**
 * 阅读消息
 */
export function readMessage(messageId) {
  return delay(100).then(() => ({ success: true }));
}
