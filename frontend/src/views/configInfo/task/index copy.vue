<template>
  <div class="app-container">
    <el-button type="success" @click="handleRun1">执行1</el-button>
    <el-button type="success" @click="handleRun2">执行2</el-button>
  </div>
</template>
<script setup lang="tsx">
import { ipc } from '@/utils/ipcRenderer';
import { test } from '@/api/ipcApi';

const handleRun1 = () => {
  ipc.invoke(test.test).then(res => {
    console.log(res);
  })
}
const handleRun2 = () => {
  ipc.invoke(test.runTest).then(res => {
    console.log(res);
  })
}
</script>