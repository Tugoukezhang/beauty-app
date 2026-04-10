/**
 * 支付回调云函数
 * 处理微信支付结果通知
 */

const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

exports.main = async (event, context) => {
  const { outTradeNo, resultCode, openid } = event;
  
  // 支付成功
  if (resultCode === 'SUCCESS') {
    try {
      // 查询订单
      const { data: orders } = await db.collection('orders')
        .where({ orderNo: outTradeNo })
        .get();
      
      if (orders.length === 0) {
        return { code: 'FAIL', message: '订单不存在' };
      }
      
      const order = orders[0];
      
      // 更新订单状态
      await db.collection('orders').doc(order._id).update({
        data: {
          status: 'success',
          payTime: db.serverDate(),
          updateTime: db.serverDate()
        }
      });
      
      // 查询用户信息
      const { data: users } = await db.collection('users')
        .where({ openid })
        .get();
      
      if (users.length > 0) {
        const user = users[0];
        
        if (order.type === 'coin') {
          // 充值妆币
          await db.collection('users').doc(user._id).update({
            data: {
              coins: db.command.inc(order.coins),
              updateTime: db.serverDate()
            }
          });
        } else if (order.type === 'vip') {
          // 开通会员
          const now = new Date();
          const expireDate = new Date(now);
          expireDate.setMonth(expireDate.getMonth() + order.duration);
          
          await db.collection('users').doc(user._id).update({
            data: {
              isVip: true,
              vipExpireTime: expireDate.toISOString().split('T')[0],
              updateTime: db.serverDate()
            }
          });
        }
      }
      
      return { code: 'SUCCESS' };
    } catch (err) {
      console.error('处理支付回调失败', err);
      return { code: 'FAIL', message: err.message };
    }
  }
  
  // 支付失败
  try {
    await db.collection('orders')
      .where({ orderNo: outTradeNo })
      .update({
        data: {
          status: 'fail',
          updateTime: db.serverDate()
        }
      });
  } catch (err) {
    console.error('更新订单失败状态失败', err);
  }
  
  return { code: 'SUCCESS' };
};
