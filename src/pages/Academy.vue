<template>
  <div class="college-manager-container">
    <!-- 搜索和新增区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchId"
        placeholder="请输入学院ID查询"
        style="width: 200px;"
        clearable
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="handleAdd">新增学院</el-button>
    </div>

    <!-- 学院表格 -->
    <el-table
      :data="showCollegeList"
      border
      stripe
      style="width: 100%; margin-top: 20px;"
      v-loading="loading"
    >
      <el-table-column prop="academyId" label="学院ID" align="center" width="120" />
      <el-table-column prop="academyName" label="学院名称" align="center" width="180" />
      <el-table-column prop="status" label="状态" align="center" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '1' ? 'success' : 'danger'">
            {{ scope.row.status === '1' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center" width="200">
        <template #default="scope">
          {{ scope.row.createTime ? formatDateTime(scope.row.createTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="updateTime" label="修改时间" align="center" width="200">
        <template #default="scope">
          {{ scope.row.updateTime ? formatDateTime(scope.row.updateTime) : '-' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[5, 10, 15]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="showCollegeList.length"
      style="margin-top: 20px; text-align: right;"
    >
    </el-pagination>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? '新增学院' : '编辑学院'"
      width="400px"
    >
      <el-form :model="form" label-width="80px">
        <el-form-item label="学院ID">
          <el-input v-model="form.academyId" :disabled="!isAdd" placeholder="请输入学院ID" />
        </el-form-item>
        <el-form-item label="学院名称">
          <el-input v-model="form.academyName" placeholder="请输入学院名称" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="启用" value="1" />
            <el-option label="禁用" value="0" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getAllAcademy, insertAcademy, updateAcademy, deleteAcademy } from '../api/academy';

// 类型定义（后端字段）
interface Academy {
  academyId: string | number;
  academyName: string;
  status: string;
  createTime?: string;
  updateTime?: string;
}

// 学院列表数据
const collegeDB = ref<Academy[]>([]);

// 响应式数据
const searchId = ref('');
const dialogVisible = ref(false);
const isAdd = ref(true);
const loading = ref(false);

// 表单数据（使用后端字段名）
const form = reactive<Academy>({
  academyId: '',
  academyName: '',
  status: '1'
});

// 显示列表
const showCollegeList = computed(() => {
  if (!searchId.value) return collegeDB.value;
  return collegeDB.value.filter(item => 
    item.academyId.toString().includes(searchId.value) || 
    item.academyName.includes(searchId.value)
  );
});

// 页面加载时初始化 - 加载数据
onMounted(() => {
  loadAcademyList();
});

// 加载学院列表
const loadAcademyList = async () => {
  loading.value = true;
  try {
    const response = await getAllAcademy();
    // 后端直接返回 List<Academy>，没有Result包装
    // request.js会直接返回数组
    if (Array.isArray(response)) {
      collegeDB.value = response;
      if (response.length === 0) {
        ElMessage.info('暂无学院数据');
      }
    } else if (response && response.code === 200 && response.data) {
      // 如果被包装成了Result对象（不应该发生，但做兼容处理）
      collegeDB.value = Array.isArray(response.data) ? response.data : [];
    } else {
      collegeDB.value = [];
      ElMessage.warning('返回数据格式异常');
    }
  } catch (error: any) {
    console.error('加载学院列表失败:', error);
    ElMessage.error(error.message || '加载学院列表失败');
    collegeDB.value = [];
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (dateTime: any) => {
  if (!dateTime) return '-';
  if (typeof dateTime === 'string') {
    return dateTime;
  }
  const date = new Date(dateTime);
  if (isNaN(date.getTime())) return dateTime;
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// 查询功能
const handleSearch = () => {
  // 前端过滤，无需重新请求
};

// 新增功能
const handleAdd = () => {
  isAdd.value = true;
  dialogVisible.value = true;
  Object.assign(form, {
    academyId: '',
    academyName: '',
    status: '1'
  });
};

// 编辑功能
const handleEdit = (row: Academy) => {
  isAdd.value = false;
  dialogVisible.value = true;
  Object.assign(form, { ...row });
};

// 删除功能
const handleDelete = async (row: Academy) => {
  try {
    await ElMessageBox.confirm('确定要删除该学院吗？', '提示', { type: 'warning' });
    const response = await deleteAcademy(row.academyId.toString());
    if (response.code === 200) {
      ElMessage.success(response.msg || '删除成功！');
      loadAcademyList();
    }
  } catch (error: any) {
    if (error.message !== '已取消删除') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 提交表单（新增/编辑）
const handleSubmit = async () => {
  if (!form.academyId || !form.academyName) {
    ElMessage.warning('请填写学院ID和名称！');
    return;
  }

  try {
    if (isAdd.value) {
      const response = await insertAcademy(form);
      if (response.code === 200) {
        ElMessage.success(response.msg || '新增成功！');
        dialogVisible.value = false;
        loadAcademyList();
      }
    } else {
      const response = await updateAcademy(form.academyId.toString(), form);
      if (response.code === 200) {
        ElMessage.success(response.msg || '编辑成功！');
        dialogVisible.value = false;
        loadAcademyList();
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

// 分页相关（学院列表不需要分页，但保留接口）
const handleSizeChange = (val: number) => {
  // 学院列表不分页，此方法保留为空
};

const handleCurrentChange = (val: number) => {
  // 学院列表不分页，此方法保留为空
};
</script>

<style scoped>
.college-manager-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 30px 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.el-dialog__body {
  padding: 20px;
}
</style>