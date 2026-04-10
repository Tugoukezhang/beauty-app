/**
 * 支付相关 API
 */

const { request } = require('./request');

module.exports = {
  /**
   * 创建妆币充值订单
   * @param {Object} data - 订单数据
   * @param {number} data.packageId - 套餐ID
   * @param {number} data.amount - 支付金额
   * @param {number} data.coins - 妆币数量
   */
  createCoinOrder(data) {
    return request({
      url: '/api/payment/coin-order',
      method: 'POST',
      data
    });
  },

  /**
   * 创建会员购买订单
   * @param {Object} data - 订单数据
   * @param {number} data.packageId - 套餐ID
   * @param {number} data.duration - 会员时长（月）
   * @param {number} data.amount - 支付金额
   */
  createVipOrder(data) {
    return request({
      url: '/api/payment/vip-order',
      method: 'POST',
      data
    });
  },

  /**
   * 查询订单状态
   * @param {string} orderId - 订单ID
   */
  queryOrderStatus(orderId) {
    return request({
      url: `/api/payment/order/${orderId}/status`,
      method: 'GET'
    });
  },

  /**
   * 获取支付配置（调起微信支付所需参数）
   * @param {string} orderId - 订单ID
   */
  getPaymentConfig(orderId) {
    return request({
      url: `/api/payment/order/${orderId}/config`,
      method: 'GET'
    });
  }
};
