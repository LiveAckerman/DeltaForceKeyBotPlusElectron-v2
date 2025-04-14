<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
      <el-form-item label="钥匙卡名称" prop="keyName">
        <el-input v-model="queryParams.keyName" placeholder="请输入钥匙卡名称" clearable style="width: 200px"
          @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" @click="handleAdd"
          v-hasPermi="['configInfo:key:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate"
          v-hasPermi="['configInfo:key:edit']">修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete"
          v-hasPermi="['configInfo:key:remove']">删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="keyList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="序号" align="center" prop="id" width="100" />
      <el-table-column label="钥匙卡名称" align="center" prop="keyName" :show-overflow-tooltip="true" />
      <el-table-column label="钥匙卡价格" align="center" prop="keyPrice" width="100" />
      <el-table-column label="X位置" align="center" prop="keyPositionX" width="100" />
      <el-table-column label="Y位置" align="center" prop="keyPositionY" width="100" />
      <el-table-column label="价格浮动(%)" align="center" prop="keyPriceFloatPercen" width="100" />
      <el-table-column label="更新者" align="center" prop="updateBy" width="100" />
      <el-table-column label="更新时间" align="center" prop="updateTime" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="创建者" align="center" prop="createBy" width="100" />
      <el-table-column label="创建时间" align="center" prop="createTime" width="150">
        <template #default="scope">
          <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)"
            v-hasPermi="['configInfo:key:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)"
            v-hasPermi="['configInfo:key:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize" @pagination="getList" />

    <!-- 添加或修改钥匙卡对话框 -->
    <el-dialog :title="title" v-model="open" width="780px" append-to-body>
      <el-form ref="keyRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="钥匙卡名称" prop="keyName">
              <el-input v-model="form.keyName" placeholder="请输入钥匙卡名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="钥匙卡价格" prop="keyPrice">
              <el-input-number v-model="form.keyPrice" placeholder="请输入钥匙卡价格" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="X位置" prop="keyPositionX">
              <el-input-number v-model="form.keyPositionX" placeholder="请输入X位置" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Y位置" prop="keyPositionY">
              <el-input-number v-model="form.keyPositionY" placeholder="请输入Y位置" style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格浮动(%)" prop="keyPriceFloatPercen">
              <el-input-number min="0" max="100" v-model="form.keyPriceFloatPercen" placeholder="请输入价格浮动"
                style="width: 100%;" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input type="textarea" v-model="form.remark" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Key">
import { listKey, getKey, addKey, updateKey, delKey } from "@/api/configInfo/key";

const { proxy } = getCurrentInstance();

const keyList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    keyName: undefined,
  },
  rules: {
    keyName: [{ required: true, message: "钥匙卡名称不能为空", trigger: "blur" }],
    keyPrice: [{ required: true, message: "钥匙卡价格不能为空", trigger: "blur" }],
    keyPositionX: [{ required: true, message: "X位置不能为空", trigger: "blur" }],
    keyPositionY: [{ required: true, message: "Y位置不能为空", trigger: "blur" }],
  },
});

const { queryParams, form, rules } = toRefs(data);

/** 查询钥匙卡列表 */
function getList() {
  loading.value = true;
  listKey(queryParams.value).then(response => {
    keyList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}

/** 取消按钮 */
function cancel() {
  open.value = false;
  reset();
}

/** 表单重置 */
function reset() {
  form.value = {
    id: undefined,
    keyName: undefined,
    keyPrice: undefined,
    keyPositionX: undefined,
    keyPositionY: undefined,
    keyPriceFloatPercen: undefined,
    remark: undefined,
  };
  proxy.resetForm("keyRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 多选框选中数据 */
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加钥匙卡";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
  getKey(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改钥匙卡";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["keyRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updateKey(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addKey(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  const idsToDelete = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除编号为 "' + idsToDelete + '" 的钥匙卡？').then(function () {
    return delKey(idsToDelete);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => { });
}

getList();
</script>
