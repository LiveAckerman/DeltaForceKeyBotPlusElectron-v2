'use strict';

const { testService } = require('../service/test');
const { mouse, screen, Region, Button, Point } = require('@nut-tree/nut-js'); // 替换 robotjs
const fs = require('fs'); // 用于保存截图
const path = require('path'); // 用于处理文件路径
const Tesseract = require('tesseract.js'); // 用于 OCR 识别
const { windowManager } = require('node-window-manager'); // 用于窗口管理

/**
 * Cross
 * @class
 */
class TestController {

  /* test */
  async test(args) {
    const data = await testService.test(args);
    return data;
  }

  /* test */
  async runTest(args) {
    try {
      // 0. 最小化当前程序窗口
      const currentWindow = windowManager.getActiveWindow();
      if (currentWindow) {
        currentWindow.minimize(); // 最小化当前窗口
      }

      // 1. 查找标题为 "三角洲行动" 的窗口
      const windows = windowManager.getWindows();
      const targetWindow = windows.find(window => window.getTitle().includes('三角洲行动  '));

      if (!targetWindow) {
        console.error('未找到标题为 "三角洲行动" 的窗口');
        return '未找到标题为 "三角洲行动" 的窗口';
      }

      // 显示并聚焦目标窗口
      targetWindow.bringToTop();
      // targetWindow.focus();

      // 2. 移动鼠标到指定位置并点击
      const [x, y, width, height] = [1470, 149, 223, 45]; // 从参数中获取位置和尺寸
      await mouse.setPosition(new Point(879, 1380)); // 移动鼠标到指定位置
      await mouse.click(Button.LEFT); // 点击鼠标左键

      // 3. 截取指定区域的屏幕
      const region = new Region(x, y, width, height); // 定义截图区域
      const screenshot = await screen.captureRegion('screenshot', region);

      // 4. 保存截图到静态资源目录
      const staticDir = path.join(__dirname, '../../public/static'); // 静态资源目录
      const screenshotPath = path.join(staticDir, 'screenshot.png');

      // 确保目录存在
      if (!fs.existsSync(staticDir)) {
        fs.mkdirSync(staticDir, { recursive: true }); // 递归创建目录
      }

      fs.writeFileSync(screenshotPath, screenshot);

      // 5. 使用 OCR 识别截图中的文字
      const result = await Tesseract.recognize(screenshotPath, 'eng');
      /* , {
        logger: info => console.log(info), // 可选：打印 OCR 识别过程日志
      } */

      // 6. 打印识别结果
      if (result.data && result.data.text.trim()) {
        console.log('识别到的文字:', result.data.text.trim());
        return `识别到的文字: ${result.data.text.trim()}`;
      } else {
        console.error('未能识别到文字');
        return '未能识别到文字，请检查截图内容';
      }
    } catch (error) {
      console.error('执行测试时发生错误:', error);
      return `执行测试时发生错误: ${error.message}`;
    }
  }
}

TestController.toString = () => '[class TestController]';

module.exports = TestController;