const WebSocket = require('ws');

let wss = null;

/**
 * 初始化 WebSocket 服务
 * @param {number} port WebSocket 服务监听的端口
 */
const initWebSocketServer = (port) => {
  wss = new WebSocket.Server({ port });

  wss.on('connection', (ws) => {
    console.log('客户端已连接');

    // 监听客户端断开连接
    ws.on('close', () => {
      console.log('客户端已断开连接');
    });

    // 监听客户端发送的消息
    ws.on('message', (message) => {
      console.log('收到客户端消息:', message);
    });
  });

  console.log(`WebSocket 服务已启动，监听端口 ${port}`);
};

/**
 * 向所有已连接的客户端发送日志信息
 * @param {string} msg 要发送的日志信息
 */
const sendLog = (msg) => {
  if (!wss || wss.clients.size === 0) {
    console.log('没有客户端连接，无法发送消息');
    return;
  }

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(`日志信息：${new Date().toLocaleString()} - ${msg}`);
    }
  });
};

module.exports = {
  initWebSocketServer,
  sendLog,
};