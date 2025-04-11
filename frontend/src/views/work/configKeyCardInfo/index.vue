<template>
  <div>
    <a-input v-model:value="filter.keyCardName" placeholder="请输入钥匙卡名称筛选" style="width: 300px; margin-bottom: 20px;"
      @change="fetchTasks" />


    <a-button type="primary" @click="showAddModal">新增任务</a-button>
    <a-table :data-source="tasks" :pagination="pagination" row-key="id" @change="handleTableChange">
      <!-- 钥匙卡名称 -->
      <a-table-column title="钥匙卡名称" data-index="keyCardName" key="keyCardName">
        <template #default="{ record }">
          {{ record.keyCardName }}
        </template>
      </a-table-column>

      <!-- 钥匙卡位置 -->
      <a-table-column title="钥匙卡位置" data-index="keyCardPosition" key="keyCardPosition">
        <template #default="{ record }">
          {{ record.keyCardPosition }}
        </template>
      </a-table-column>

      <!-- 钥匙卡价格 -->
      <a-table-column title="钥匙卡价格" data-index="keyCardPrice" key="keyCardPrice">
        <template #default="{ record }">
          {{ record.keyCardPrice }}
        </template>
      </a-table-column>

      <!-- 是否购买 -->
      <a-table-column title="是否购买" data-index="isBuyEnd" key="isBuyEnd">
        <template #default="{ record }">
          {{ record.isBuyEnd ? '是' : '否' }}
        </template>
      </a-table-column>

      <!-- 卡片浮动百分比 -->
      <a-table-column title="卡片浮动百分比" data-index="keyCardFloatingRange" key="keyCardFloatingRange">
        <template #default="{ record }">
          {{ record.keyCardFloatingRange }}
        </template>
      </a-table-column>

      <!-- 操作列 -->
      <a-table-column title="操作" key="actions">
        <template #default="{ record }">
          <a-button type="link" @click="editTask(record)">编辑</a-button>
          <a-button type="link" danger @click="deleteTask(record.id)">删除</a-button>
        </template>
      </a-table-column>
    </a-table>

    <a-modal v-model:visible="isModalVisible" title="新增任务" @ok="handleOk" @cancel="handleCancel">
      <a-form :model="form" :rules="rules" ref="formRef" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }">
        <a-form-item label="钥匙卡名称" name="keyCardName">
          <a-input v-model:value="form.keyCardName" />
        </a-form-item>
        <a-form-item label="钥匙卡位置" name="keyCardPosition">
          <a-input v-model:value="form.keyCardPosition" />
        </a-form-item>
        <a-form-item label="钥匙卡价格" name="keyCardPrice">
          <a-input-number v-model:value="form.keyCardPrice" :min="0" />
        </a-form-item>
        <a-form-item label="是否购买" name="isBuyEnd">
          <a-switch :checkedValue="1" :unCheckedValue="0" v-model:checked="form.isBuyEnd" />
        </a-form-item>
        <a-form-item label="卡片浮动百分比" name="keyCardFloatingRange">
          <a-input-number v-model:value="form.keyCardFloatingRange" :step="0.1" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="tsx">
import { ref, reactive, onMounted, toRaw } from 'vue';
import { ipc } from '@/utils/ipcRenderer';
import { ipcApiRoute } from '@/api';
import { message } from 'ant-design-vue';

const tasks = ref([]);
const filter = ref({ keyCardName: '' });
const pagination = reactive({ current: 1, pageSize: 10 });
const isModalVisible = ref(false);
const form = reactive({
  id: null, // 添加 id 字段，用于编辑时标识任务
  keyCardName: '',
  keyCardPosition: '',
  keyCardPrice: 0,
  isBuyEnd: 0,
  keyCardFloatingRange: 0.0,
});
const rules = {
  keyCardName: [{ required: true, message: '请输入钥匙卡名称' }],
  keyCardPosition: [{ required: true, message: '请输入钥匙卡位置' }],
  keyCardPrice: [{ required: true, type: 'number', message: '请输入钥匙卡价格' }],
  keyCardFloatingRange: [{ required: true, type: 'number', message: '请输入卡片浮动百分比' }],
};

// 获取任务列表
const fetchTasks = async () => {
  const rawFilter = toRaw(filter.value); // 将响应式对象转换为普通对象
  const res = await ipc.invoke(ipcApiRoute.task.getTasks, rawFilter);
  console.log(res);
  tasks.value = res; // 如果返回值是数组，确保它是普通数组
};

// 显示新增任务模态框
const showAddModal = () => {
  form.id = null; // 清空 id，表示新增任务
  form.keyCardName = '';
  form.keyCardPosition = '';
  form.keyCardPrice = 0;
  form.isBuyEnd = 0;
  form.keyCardFloatingRange = 0.0;
  isModalVisible.value = true;
};

// 编辑任务
const editTask = (task) => {
  form.id = task.id; // 设置 id，表示编辑任务
  form.keyCardName = task.keyCardName;
  form.keyCardPosition = task.keyCardPosition;
  form.keyCardPrice = task.keyCardPrice;
  form.isBuyEnd = task.isBuyEnd;
  form.keyCardFloatingRange = task.keyCardFloatingRange;
  isModalVisible.value = true;
};

// 删除任务
const deleteTask = async (id) => {
  await ipc.invoke(ipcApiRoute.task.deleteTask, { id });
  /* 提示信息 成功 */
  message.success('删除成功');
  fetchTasks();
};

// 提交任务（新增或编辑）
const handleOk = async () => {
  const rawForm = toRaw(form); // 将响应式对象转换为普通对象

  rawForm.isBuyEnd = Number(rawForm.isBuyEnd); // 将布尔值转换为数字

  if (form.id) {
    // 编辑任务
    await ipc.invoke(ipcApiRoute.task.updateTask, rawForm);
  } else {
    // 新增任务
    await ipc.invoke(ipcApiRoute.task.addTask, rawForm);
  }
  /* 提示信息 成功 */
  message.success(form.id ? '编辑成功' : '新增成功');
  isModalVisible.value = false;
  fetchTasks();
};

// 取消模态框
const handleCancel = () => {
  isModalVisible.value = false;
};

// 表格分页变化
const handleTableChange = (pagination) => {
  pagination.current = pagination.current;
  fetchTasks();
};

onMounted(() => {
  fetchTasks();
});
</script>
