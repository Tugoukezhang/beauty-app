/**
 * 支付云函数
 * 处理妆币充值和会员购买的支付流程
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

// 生成订单号
function generateOrderNo() {
  const date = new Date();
  const timestamp = date.getTime().toString();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `PAY${timestamp}${random}`;
}

// 统一下单（妆币充值）
async function createCoinOrder(event, context) {
  const { OPENID } = cloud.getWXContext();
  const { packageId, amount, coins } = event;
  
  const orderNo = generateOrderNo();
  
  // 创建订单记录
  const orderData = {
    orderNo,
    openid: OPENID,
    type: 'coin',
    packageId,
    amount: amount * 100, // 转为分
    coins,
    status: 'pending',
    createTime: db.serverDate(),
    updateTime: db.serverDate()
  };
  
  try {
    // 保存订单到数据库
    await db.collection('orders').add({ data: orderData });
    
    // 调用微信支付统一下单
    const res = await cloud.openapi.wxpay.unifiedOrder({
      body: `i妆-妆币充值${coins}个`,
      outTradeNo: orderNo,
      spbillCreateIp: context.CLIENTIP,
      subMchId: '', // 你的商户号
      totalFee: amount * 100,
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'paymentCallback'
    });
    
    return {
      success: true,
      orderId: orderNo,
      ...res
    };
  } catch (err) {
    console.error('创建订单失败', err);
    return {
      success: false,
      message: err.message
    };
  }
}

// 统一下单（会员购买）
async function createVipOrder(event, context) {
  const { OPENID } = cloud.getWXContext();
  const { packageId, duration, amount } = event;
  
  const orderNo = generateOrderNo();
  
  const orderData = {
    orderNo,
    openid: OPENID,
    type: 'vip',
    packageId,
    duration,
    amount: amount * 100,
    status: 'pending',
    createTime: db.serverDate(),
    updateTime: db.serverDate()
  };
  
  try {
    await db.collection('orders').add({ data: orderData });
    
    const res = await cloud.openapi.wxpay.unifiedOrder({
      body: `i妆-会员${duration}个月`,
      outTradeNo: orderNo,
      spbillCreateIp: context.CLIENTIP,
      subMchId: '', // 你的商户号
      totalFee: amount * 100,
      envId: cloud.DYNAMIC_CURRENT_ENV,
      functionName: 'paymentCallback'
    });
    
    return {
      success: true,
      orderId: orderNo,
      ...res
    };
  } catch (err) {
    console.error('创建订单失败', err);
    return {
      success: false,
      message: err.message
    };
  }
}

// 查询订单状态
async function queryOrderStatus(event) {
  const { orderId } = event;
  
  try {
    const { data } = await db.collection('orders')
      .where({ orderNo: orderId })
      .get();
    
    if (data.length === 0) {
      return { success: false, message: '订单不存在' };
    }
    
    const order = data[0];
    
    // 获取用户信息
    const { data: users } = await db.collection('users')
      .where({ openid: order.openid })
      .get();
    
    return {
      success: true,
      status: order.status,
      coins: users[0]?.coins || 0,
      isVip: users[0]?.isVip || false,
      vipExpireTime: users[0]?.vipExpireTime || ''
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// 主入口
exports.main = async (event, context) => {
  const { action } = event;
  
  switch (action) {
    case 'createCoinOrder':
      return await createCoinOrder(event, context);
    case 'createVipOrder':
      return await createVipOrder(event, context);
    case 'queryOrderStatus':
      return await queryOrderStatus(event);
    default:
      return { success: false, message: '未知操作' };
  }
};
