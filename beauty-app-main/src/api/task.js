/**
 * 任务相关 API
 */

const { request } = require('./request');

module.exports = {
  /**
   * 获取任务列表及状态
   */
  getTaskStatus() {
    return request({
      url: '/api/task/status',
      method: 'GET'
    });
  },

  /**
   * 签到
   */
  signIn() {
    return request({
      url: '/api/task/signin',
      method: 'POST'
    });
  },

  /**
   * 领取任务奖励
   * @param {number} taskId - 任务ID
   */
  claimReward(taskId) {
    return request({
      url: `/api/task/${taskId}/claim`,
      method: 'POST'
    });
  },

  /**
   * 补签
   * @param {number} day - 补签日期
   */
  makeUpSign(day) {
    return request({
      url: '/api/task/makeup-sign',
      method: 'POST',
      data: { day }
    });
  }
};
