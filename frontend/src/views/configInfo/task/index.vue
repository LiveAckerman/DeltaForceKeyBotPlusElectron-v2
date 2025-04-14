<template>
  <div class="app-container">
    <el-row gutter="20" class="w-full">
      <el-col :xs="24" :span="10">
        <div class="h-full w-full">
          <el-transfer class="w-full" v-model="selectValue" :titles="['钥匙卡列表', '当前抢卡列表']" filterable
            filter-placeholder="State Abbreviations" :data="keyList" />
          <el-space direction="vertical" class="w-full mt-4">
            <el-button type="primary" @click="handleRunTest">测试执行任务</el-button>
            <div class="text-red ">注：测试执行任务不会真正执行，不会点击购买按钮，只是模拟执行，实际执行请点击“开始执行任务”</div>
            <el-button type="success" @click="handleRun">开始执行任务</el-button>
          </el-space>
        </div>
      </el-col>
      <el-col :xs="24" :span="14">
        <!-- 日志信息 -->
        <div>日志信息</div>
        <div class="bg-coolgray text-white break-all w-full h-full relative top--13px">
          <!-- 设置换行  class-->
          <pre class="break-all">{{ logs }}</pre>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script setup lang='ts'>
import { ipc } from '@/utils/ipcRenderer';
import { test, task } from '@/api/ipcApi';
import { listKey } from "@/api/configInfo/key";
import { onMounted, ref, toRaw } from 'vue';
import { initWebSocket, closeWebSocket, getLogs } from '@/utils/websocket';

const logs = getLogs()

interface Option {
  key: number
  label: string
  [key: string]: any
}

const selectValue = ref([])


const keyList = ref<Option[]>([])
const getListKey = () => {
  let tl = []
  listKey({}).then(res => {
    console.log(res);
    tl = res.rows
  }).finally(() => {
    keyList.value = tl.map(item => {
      return {
        key: item.id,
        label: item.keyName,
        ...item
      }
    })

    selectValue.value = tl.map(item => item.id)
  });
}

const handleRunTest = () => {
  // ipc.invoke('controller/task/run').then(res => {
  //   console.log(res);
  // }).catch(err => {
  //   console.log(err);
  // })
  ipc.invoke('controller/task/runTest').then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  })
}
const handleRun = () => {
  let tl = selectValue.value.map(item => toRaw(keyList.value.find(i => i.key === item)))
  console.log(tl);

  ipc.invoke(task.run, tl).then(res => {
    console.log(res);
  }).catch(err => {
    console.log(err);
  })
}

onMounted(() => {
  getListKey()
  // 初始化 WebSocket
  initWebSocket('ws://localhost:8090'); // 替换为后端 WebSocket 服务地址
})

// const handleRun1 = () => {
//   ipc.invoke(test.test).then(res => {
//     console.log(res);
//   })
// }
// const handleRun2 = () => {
//   ipc.invoke(test.runTest).then(res => {
//     console.log(res);
//   })
// }
</script>