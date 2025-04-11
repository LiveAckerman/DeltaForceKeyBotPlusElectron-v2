const path = require('path'); // 用于处理文件路径
const { app } = require('electron'); // 引入 electron


/**
 * 获取语言路径
 * @returns {string} - 返回语言路径
 */
 function getStaticDirPath() {
  const isDev = !app.isPackaged; // 检查是否为开发环境
  if (isDev) {
    // 开发环境
    return path.join(app.getAppPath(), 'public/static');
  } else {
    // 生产环境
    return path.join(process.resourcesPath, 'public/static');
  }
}

module.exports = {
  getStaticDirPath
};
