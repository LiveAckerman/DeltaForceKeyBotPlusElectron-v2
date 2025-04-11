<template>
  <div class="bg-white h-full">
    <a-button type="primary" @click="handleClick1">TEST</a-button>
    <a-button type="primary" @click="handleClick">开始</a-button>
    <div class="log-container">
      <pre>{{ logs }}</pre>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { ipc } from '@/utils/ipcRenderer';
import { ipcApiRoute } from '@/api';

const logs = ref(''); // 用于存储日志内容

const handleClick = () => {
  logs.value += '开始执行任务...\n'; // 添加日志
  ipc.invoke(ipcApiRoute.test.runTest, { id: 666 }).then(res => {
    logs.value += `任务完成: ${JSON.stringify(res)}\n`; // 添加任务完成日志
  }).catch(err => {
    logs.value += `任务失败: ${err.message}\n`; // 添加错误日志
  });
};
const handleClick1 = () => {
  ipc.invoke(ipcApiRoute.test.test, { id: 666 }).then(res => {
    console.log(JSON.stringify(res));
  }).catch(err => {
  });
};
</script>

<style scoped lang="less">
.log-container {
  margin-top: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  height: 300px;
  overflow-y: auto;

  pre {
    white-space: pre-wrap;
  }
}
</style>
