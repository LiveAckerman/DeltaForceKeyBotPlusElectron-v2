'use strict';

const { logger } = require('ee-core/log');

/**
 * test
 * @class
 */
class TestService {

  constructor() {
    // 在构造函数中初始化一些变量
    // this.taskForJob = {};
  }

  /**
   * test
   */
  async test(args) {
    let obj = {
      status:'ok',
      params: args
    }
    logger.info('TestService obj:', obj);
    return obj;
  }
}
TestService.toString = () => '[class TestService]';

module.exports = {
  TestService,
  testService: new TestService()
};