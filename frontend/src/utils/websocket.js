import { ref } from 'vue';

const logs = ref(''); // 用于存储日志内容
let ws = null; // WebSocket 实例

/**
 * 初始化 WebSocket 连接
 * @param {string} url WebSocket 服务地址
 */
export const initWebSocket = (url) => {
  ws = new WebSocket(url);

  // 监听 WebSocket 打开事件
  ws.onopen = () => {
    console.log('WebSocket 已连接');
  };

  // 监听 WebSocket 消息事件
  ws.onmessage = (event) => {
    logs.value += `${event.data}\n`; // 将接收到的日志信息追加到 logs 中
  };

  // 监听 WebSocket 关闭事件
  ws.onclose = () => {
    console.log('WebSocket 已关闭');
    ws = null;
  };

  // 监听 WebSocket 错误事件
  ws.onerror = (error) => {
    console.error('WebSocket 错误:', error);
  };
};

/**
 * 关闭 WebSocket 连接
 */
export const closeWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};

/**
 * 获取日志内容
 * @returns {Ref<string>} 返回日志内容的引用
 */
export const getLogs = () => logs;