<template>
  <div class="text-red">
    <a-button type="primary" @click="handleClick">开始</a-button>
  </div>
</template>
<script lang="ts" setup>
import { ipc } from '@/utils/ipcRenderer';
import { ipcApiRoute } from '@/api';

const handleClick = () => {
  console.log('Button clicked!');
  // 这里可以添加其他逻辑
  ipc.invoke(ipcApiRoute.test.runTest, { id: 666 }).then(res => {
    console.log(res);
  })
};
</script>
