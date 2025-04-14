'use strict';
const { sendLog } = require('../utils/websocket'); // 使用 require 引入模块
const { screen, Region, mouse, Button, Point, keyboard, Key } = require('@nut-tree/nut-js'); // 引入 nut-js
const Tesseract = require('tesseract.js'); // 引入 tesseract.js
const path = require('path'); // 用于处理文件路径
const sharp = require('sharp'); // 用于图片处理
const { windowManager } = require('node-window-manager'); // 引入窗口管理库
const { getMainWindow } = require('ee-core/electron');
const { getExtraResourcesDir, getBaseDir } = require('ee-core/ps');
const { getStaticDirPath } = require("../utils")


const cardNameRange = [1962, 204, 347, 55]
const cardPriceRange = [390, 205, 367, 89]


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
    return outputPath;
  } catch (error) {
    throw new Error(`图片预处理时发生错误: ${error.message}`);
  }
}

/**
 * 获取语言路径
 * @returns {string} - 返回语言路径
 */
function getLangPath() {
  return getExtraResourcesDir() + '/tessdataLang'; // 获取语言路径
}

let currentWindow = null;
let targetWindow = null;


async function _run(carList) {
  for (let index = 0; index < carList.length; index++) {
    const item = carList[index];
    sendLog(`正在执行购买卡片: ${index + 1}、${item.keyName}`);

    // 最小化当前窗口
    !currentWindow && (currentWindow = getMainWindow())
    if (currentWindow) {
      currentWindow.minimize();
      sendLog(`当前窗口已最小化`);
    }

    // 查找目标窗口
    if (!targetWindow) {
      targetWindow = windowManager.getWindows().find(window => window.getTitle() === '三角洲行动  ');
    }
    if (!targetWindow) {
      sendLog('未找到标题为 "三角洲行动" 的窗口');
    } else {
      targetWindow.restore();
      targetWindow.bringToTop();
      sendLog('已将标题为 "三角洲行动" 的窗口置顶');
    }

    // 模拟鼠标点击
    const targetPosition = new Point(item.keyPositionX, item.keyPositionY);
    await mouse.setPosition(targetPosition);
    sendLog(`鼠标已移动到【${item.keyPositionX}, ${item.keyPositionY}】位置`);
    await mouse.click(Button.LEFT);
    sendLog(`鼠标已点击目标位置`);

    /* 睡眠 0.2s */
    await new Promise(resolve => setTimeout(resolve, 400));

    sendLog(`正在获取钥匙卡名称，钥匙卡名称范围：${cardNameRange}`);
    const staticDir = getStaticDirPath();
    const cardNamePath = path.join(staticDir, 'cardName.png');
    const cardNameProcessedPath = path.join(staticDir, 'processed-cardName.png');
    let [x, y, width, height] = cardNameRange
    await screen.captureRegion('cardName', new Region(x, y, width, height), '.png', staticDir);
    sendLog(`截图已保存: ${cardNamePath}`);
    await preprocessImage(cardNamePath, cardNameProcessedPath);
    sendLog(`图片已处理: ${cardNameProcessedPath}`);

    /* 计算ocr识别时间 */
    const startTime = Date.now();
    sendLog(`正在进行OCR识别...`);
    const langPath = getLangPath();
    const result = await Tesseract.recognize(cardNameProcessedPath, 'chi_sim', {
      langPath,
      oem: Tesseract.OEM.LSTM_ONLY,
      psm: Tesseract.PSM.SINGLE_LINE,
    });
    const endTime = Date.now();
    sendLog(`OCR 识别完成，耗时: ${endTime - startTime}ms`);
    let _cardName = result.data.text;
    sendLog(`OCR 识别原始结果: ${_cardName}`);
    /* 去除空格 */
    _cardName = _cardName.replace(/\s+/g, '');
    sendLog(`OCR 识别处理结果: ${_cardName}`);
    /* 判断识别到的钥匙卡名称是否等于要抢的钥匙卡名称 */
    if (_cardName !== item.keyName) {
      sendLog(`钥匙卡名称不匹配，需要购买的钥匙卡名称：${item.keyName}，识别到的钥匙卡名称：${_cardName}，跳过...`);
      continue; // 跳过当前循环
    } else {
      sendLog(`钥匙卡名称匹配，继续执行...`);
    }
    sendLog(`正在获取钥匙卡价格，钥匙卡价格范围：${cardPriceRange}`);

    const cardPricePath = path.join(staticDir, 'cardPrice.png');
    const cardPriceProcessedPath = path.join(staticDir, 'processed-cardPrice.png');
    let [x1, y1, width1, height1] = cardPriceRange
    await screen.captureRegion('cardPrice', new Region(x1, y1, width1, height1), '.png', staticDir);
    sendLog(`截图已保存: ${cardPricePath}`);
    await preprocessImage(cardPricePath, cardPriceProcessedPath);
    sendLog(`图片已处理: ${cardPriceProcessedPath}`);
    /* 计算ocr识别时间 */
    const startTime1 = Date.now();
    sendLog(`正在进行OCR识别...`);
    const langPath1 = getLangPath();
    /* 只识别数字 */
    const result1 = await Tesseract.recognize(cardPriceProcessedPath, 'eng', {
      langPath: langPath1,
      oem: Tesseract.OEM.LSTM_ONLY,
      psm: Tesseract.PSM.SINGLE_LINE,
      tessedit_char_whitelist: '0123456789' // 只识别数字
    });
    const endTime1 = Date.now();
    sendLog(`OCR 识别完成，耗时: ${endTime1 - startTime1}ms`);
    let _cardPrice = result1.data.text;
    sendLog(`OCR 识别原始结果: ${_cardPrice}`);
    /* 比如 _cardPrice 是 39,000 提取成 39000 的数值*/
    _cardPrice = _cardPrice.replace(/,/g, ''); // 去掉逗号
    _cardPrice = _cardPrice.replace(/\s+/g, ''); // 去掉空格
    /* 把只提取数字结果转成 int  */
    _cardPrice = parseInt(_cardPrice);
    sendLog(`OCR 识别处理结果: ${_cardPrice}`);
    /* 判断识别到的钥匙卡价格是否小于等于要抢的钥匙卡价格 */
    if (_cardPrice > item.keyPrice) {
      sendLog(`钥匙卡价格不匹配，需要购买的钥匙卡价格：${item.keyPrice}，识别到的钥匙卡价格：${_cardPrice}，跳过...`);
    } else {
      sendLog(`钥匙卡价格匹配，继续执行...`);
    }

    /* 模拟按 ESC 键 */
    await keyboard.pressKey(Key.Escape);
    await keyboard.releaseKey(Key.Escape);

    /* 睡眠 0.2s */
    await new Promise(resolve => setTimeout(resolve, 200));
  }
}

/**
 * framework - demo
 * @class
 */
class TaskController {  /**
   * 执行抢卡任务
   */
  async run(carList) {
    try {
      sendLog('开始执行...');
      if (!carList || carList.length === 0) {
        /* 弹出错误信息到 catch 块中 */
        throw new Error('没有可执行的任务，请检查配置文件。');
      }
      // while (false) {
      sendLog('=============================================');
      sendLog('');
      _run(carList).then(() => {
        sendLog('执行完成...');
        sendLog('');
        sendLog('=============================================');
      }).catch(error => {
        sendLog(`执行时发生错误: ${error.message}`);
      }).finally(() => {
              currentWindow.show();
      targetWindow.minimize();
      sendLog(`当前窗口已显示，目标窗口已最小化`);
      })
      // }
    } catch (error) {
      sendLog(`执行时发生错误: ${error.message}`);
      return { logs: [`执行时发生错误: ${error.message}`], error: error.message };
    }
    return 'run';
  }

  /**
   * 检查是否有新版本
   */
  runTest(carList) {
    try {
      console.log(carList);
      sendLog('开始执行测试...');
    } catch (error) {
      sendLog(`执行测试时发生错误: ${error.message}`);
      return { logs: [`执行测试时发生错误: ${error.message}`], error: error.message };
    }
    return 'runTest';
  }
}
TaskController.toString = () => '[class TaskController]';

module.exports = TaskController;