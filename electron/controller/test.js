'use strict';

const { testService } = require('../service/test');
const { screen, Region, mouse, Button, Point } = require('@nut-tree/nut-js'); // 引入 nut-js
const Tesseract = require('tesseract.js'); // 引入 tesseract.js
const path = require('path'); // 用于处理文件路径
const sharp = require('sharp'); // 用于图片处理
const { windowManager } = require('node-window-manager'); // 引入窗口管理库

/**
 * 对图片进行二值化等预处理操作
 * @param {string} imagePath - 原始图片路径
 * @param {string} outputPath - 处理后的图片保存路径
 * @returns {Promise<string>} - 返回处理后的图片路径
 */
async function preprocessImage(imagePath, outputPath) {
  try {
    await sharp(imagePath)
      .greyscale() // 转为灰度图
      .modulate({ brightness: 1.2, contrast: 1.5 }) // 调整亮度和对比度
      .threshold(128) // 二值化，阈值为 128
      .toFile(outputPath); // 保存处理后的图片

    console.log('图片预处理完成，保存路径:', outputPath);
    return outputPath;
  } catch (error) {
    console.error('图片预处理时发生错误:', error);
    throw error;
  }
}

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
        return;
      } else {
        // 显示并聚焦目标窗口
        targetWindow.bringToTop();
      }

      // 2. 将鼠标移动到指定位置并点击
      const targetPosition = new Point(500, 300); // 示例位置 (500, 300)
      await mouse.setPosition(targetPosition); // 移动鼠标到指定位置
      await mouse.click(Button.LEFT); // 左键点击

      // 3. 等待 1 秒钟以确保点击生效
      await new Promise(resolve => setTimeout(resolve, 1000)); // 等待 1 秒钟

      // 3. 定义截图区域
      const [x, y, width, height] = [261, 153, 279, 63];
      const region = new Region(x, y, width, height); // 定义截图区域
      console.log('截图区域:', region);

      const staticDir = path.join(__dirname, '../../static'); // 静态资源目录

      // 4. 截取屏幕区域并保存为图片
      const screenshotPath = await screen.captureRegion('screenshot', region, '.png', staticDir);
      console.log('截图已保存:', screenshotPath);

      // 5. 对截图进行二值化等预处理
      const processedPath = path.join(staticDir, 'processed-screenshot.png'); // 处理后的图片路径
      await preprocessImage(screenshotPath, processedPath);

      // 6. 使用 Tesseract.js 识别文字
      const langPath = path.join(__dirname, '../../tessdata-lang'); // 本地语言包路径
      console.log('语言包路径:', langPath);

      const result = await Tesseract.recognize(processedPath, 'eng', {
        langPath: langPath, // 指定语言包路径
        logger: (info) => console.log(info), // 打印日志
        oem: Tesseract.OEM.LSTM_ONLY, // 使用LSTM引擎
        psm: Tesseract.PSM.SINGLE_BLOCK, // 单块模式，适用于单个文本行
        tessedit_char_whitelist: '0123456789', // 仅允许识别数字
      });

      // 输出识别结果
      if (result.data && result.data.text) {
        console.log('识别到的文字:', result.data.text.trim());

        // 使用正则过滤，只提取数字
        const regex = /\d+/g; // 匹配数字的正则表达式
        const matches = result.data.text.match(regex); // 查找所有匹配的数字
        if (matches) {
          console.log('提取到的数字:', parseInt(matches.join('')));
        } else {
          console.log('未能提取到数字');
        }
        return parseInt(matches.join(''));
      } else {
        console.log('未能识别到文字');
        return '未能识别到文字';
      }
    } catch (error) {
      console.error('执行测试时发生错误:', error);
      return `执行测试时发生错误: ${error.message}`;
    }
  }
}

TestController.toString = () => '[class TestController]';

module.exports = TestController;