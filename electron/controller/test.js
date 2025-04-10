'use strict';

const { testService } = require('../service/test');
const { screen, Region, mouse, Button, Point, keyboard, Key } = require('@nut-tree/nut-js'); // 引入 nut-js
const Tesseract = require('tesseract.js'); // 引入 tesseract.js
const path = require('path'); // 用于处理文件路径
const sharp = require('sharp'); // 用于图片处理
const { windowManager } = require('node-window-manager'); // 引入窗口管理库
const { app, BrowserWindow } = require('electron'); // 引入 electron
const fs = require('fs'); // 引入文件系统模块
const { getMainWindow } = require('ee-core/electron');

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


function getAssetPath(relativePath) {
  return path.join(app.getPath('appData'), 'resources', relativePath);
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
      const logs = [];
      logs.push('开始执行测试任务...');

      // 最小化当前窗口
      const currentWindow = getMainWindow();
      if (currentWindow) {
        currentWindow.minimize();
        logs.push('当前窗口已最小化');
      }

      // 查找目标窗口
      const windows = windowManager.getWindows();
      const targetWindow = windows.find(window => window.getTitle() === '三角洲行动  ');
      if (!targetWindow) {
        logs.push('未找到标题为 "三角洲行动" 的窗口');
        return { logs, error: '未找到目标窗口' };
      } else {
        targetWindow.restore();
        targetWindow.bringToTop();
        logs.push('目标窗口已恢复并置顶');
      }

      // 模拟鼠标点击
      const targetPosition = new Point(500, 300);
      await mouse.setPosition(targetPosition);
      await mouse.click(Button.LEFT);
      logs.push('鼠标已点击目标位置');

      // 截图并处理
      const staticDir = getAssetPath('public/static');
      const screenshotPath = path.join(staticDir, 'screenshot.png');
      const processedPath = path.join(staticDir, 'processed-screenshot.png');
      await screen.captureRegion('screenshot', new Region(1475, 154, 242, 39), '.png', staticDir);
      logs.push(`截图已保存: ${screenshotPath}`);
      await preprocessImage(screenshotPath, processedPath);
      logs.push(`图片已处理: ${processedPath}`);

      // OCR 识别
      const langPath = path.join(app.getAppPath(), 'tessdata-lang');
      const result = await Tesseract.recognize(processedPath, 'chi_sim', {
        langPath,
        oem: Tesseract.OEM.LSTM_ONLY,
        psm: Tesseract.PSM.SINGLE_LINE,
      });
      logs.push(`OCR 识别结果: ${result.data.text.trim()}`);

      return { logs, text: result.data.text.trim() };
    } catch (error) {
      console.error('执行测试时发生错误:', error);
      return { logs: [`执行测试时发生错误: ${error.message}`], error: error.message };
    }
  }
}

TestController.toString = () => '[class TestController]';

module.exports = TestController;