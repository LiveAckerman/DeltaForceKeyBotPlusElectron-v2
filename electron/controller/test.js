'use strict';

const { testService } = require('../service/test');
const { screen, Region, mouse, Button, Point, keyboard, Key } = require('@nut-tree/nut-js'); // 引入 nut-js
const Tesseract = require('tesseract.js'); // 引入 tesseract.js
const path = require('path'); // 用于处理文件路径
const sharp = require('sharp'); // 用于图片处理
const { windowManager } = require('node-window-manager'); // 引入窗口管理库
const { app, BrowserWindow } = require('electron'); // 引入 electron
const { getMainWindow } = require('ee-core/electron');
const fs = require('fs'); // 引入文件系统模块
const { getExtraResourcesDir, getBaseDir } = require('ee-core/ps');
const {getStaticDirPath} = require("../utils")

/**
 * 写入日志到 log.txt 文件
 * @param {string} message - 要写入的日志信息
 */
function writeLog(message) {
  const logDir = app.getPath('logs'); // 获取日志目录
  const logFilePath = path.join(logDir, 'log.txt'); // 日志文件路径

  // 确保日志目录存在
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  // 写入日志（追加模式）
  const timestamp = new Date().toISOString(); // 添加时间戳
  fs.appendFileSync(logFilePath, `[${timestamp}] ${message}\n`, 'utf-8');
}

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

    const message = `图片预处理完成，保存路径: ${outputPath}`;
    console.log(message);
    writeLog(message); // 写入日志
    return outputPath;
  } catch (error) {
    const errorMessage = `图片预处理时发生错误: ${error.message}`;
    console.error(errorMessage);
    writeLog(errorMessage); // 写入日志
    throw error;
  }
}

function getAssetPath(relativePath) {
  let appDataPath = app.getPath('userData');
  writeLog('已获取appDataPath：' + appDataPath); // 写入日志
  let path2 = path.join(appDataPath, 'resources', relativePath);
  writeLog('已获取path：' + path2); // 写入日志
  return path2;
}

/**
 * 获取语言路径
 * @returns {string} - 返回语言路径
 */
function getLangPath() {
 return getExtraResourcesDir() + '/tessdataLang'; // 获取语言路径
}

/**
 * Cross
 * @class
 */
class TestController {
  /* test */
  async test(args) {
    const data = await testService.test(args);
    return {
     getExtraResourcesDir: getExtraResourcesDir(),
      getBaseDir: getBaseDir(),
      'app.getAppPath()': app.getAppPath(),
      'process.resourcesPath': process.resourcesPath,

    };
  }

  /* test */
  async runTest(args) {
    try {
      const logs = [];
      logs.push('开始执行测试任务...');
      writeLog('开始执行测试任务...'); // 写入日志

      // 最小化当前窗口
      const currentWindow = getMainWindow();
      if (currentWindow) {
        currentWindow.minimize();
        logs.push('当前窗口已最小化');
        writeLog('当前窗口已最小化'); // 写入日志
      }

      // 查找目标窗口
      const windows = windowManager.getWindows();
      const targetWindow = windows.find(window => window.getTitle() === '三角洲行动  ');
      if (!targetWindow) {
        const message = '未找到标题为 "三角洲行动" 的窗口';
        logs.push(message);
        writeLog(message); // 写入日志
        return { logs, error: '未找到目标窗口' };
      } else {
        targetWindow.restore();
        targetWindow.bringToTop();
        logs.push('目标窗口已恢复并置顶');
        writeLog('目标窗口已恢复并置顶'); // 写入日志
      }

      // 模拟鼠标点击
      const targetPosition = new Point(500, 300);
      await mouse.setPosition(targetPosition);
      await mouse.click(Button.LEFT);
      logs.push('鼠标已点击目标位置');
      writeLog('鼠标已点击目标位置'); // 写入日志

      /* 睡眠 0.2s */
      await new Promise(resolve => setTimeout(resolve, 200));

      // setTimeout(async () => {
      // 截图并处理
      const staticDir = getStaticDirPath();
      // const staticDir = getAssetPath('public/static');
      const screenshotPath = path.join(staticDir, 'screenshot.png');
      const processedPath = path.join(staticDir, 'processed-screenshot.png');
      await screen.captureRegion('screenshot', new Region(1475, 154, 242, 39), '.png', staticDir);
      const screenshotMessage = `截图已保存: ${screenshotPath}`;
      logs.push(screenshotMessage);
      writeLog(screenshotMessage); // 写入日志

      await preprocessImage(screenshotPath, processedPath);
      const processedMessage = `图片已处理: ${processedPath}`;
      logs.push(processedMessage);
      writeLog(processedMessage); // 写入日志

      // OCR 识别
      const langPath = getLangPath();
      const result = await Tesseract.recognize(processedPath, 'chi_sim', {
        langPath,
        oem: Tesseract.OEM.LSTM_ONLY,
        psm: Tesseract.PSM.SINGLE_LINE,
      });
      const ocrMessage = `OCR 识别结果: ${result.data.text.trim()}`;
      logs.push(ocrMessage);
      writeLog(ocrMessage); // 写入日志

      /* 模拟按 ESC 键 */
      await keyboard.pressKey(Key.Escape);
      await keyboard.releaseKey(Key.Escape);
      writeLog('按下并释放 ESC 键'); // 写入日志

      currentWindow.show();
      targetWindow.minimize();
      writeLog('当前窗口已显示，目标窗口已最小化'); // 写入日志

      return { logs, text: result.data.text.trim() };
      // }, 200);
    } catch (error) {
      const errorMessage = `执行测试时发生错误: ${error.message}`;
      console.error(errorMessage);
      writeLog(errorMessage); // 写入日志
      return { logs: [`执行测试时发生错误: ${error.message}`], error: error.message };
    }
  }
}

TestController.toString = () => '[class TestController]';

module.exports = TestController;