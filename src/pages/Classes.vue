<template>
  <div class="class-manager-container">
    <!-- 搜索和操作区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchClassId"
        placeholder="请输入班级ID或名称"
        style="width: 180px;"
        clearable
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="handleAdd">新增班级</el-button>
    </div>

    <!-- 班级表格 -->
    <el-table
      :data="showClassList"
      border
      stripe
      style="width: 100%; margin-top: 20px;"
      highlight-current-row
      v-loading="loading"
    >
      <el-table-column prop="classId" label="班级ID" align="center" width="100" />
      <el-table-column prop="className" label="班级名称" align="center" width="150" />
      <el-table-column prop="teacherId" label="老师ID" align="center" width="100" />
      <el-table-column prop="academyId" label="学院ID" align="center" width="100" />
      <el-table-column prop="grade" label="年级" align="center" width="100" />
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
      :total="showClassList.length"
      style="display: none; margin-top: 20px; text-align: right;"
    >
    </el-pagination>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? '新增班级' : '编辑班级'"
      width="450px"
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="班级名称">
          <el-input v-model="form.className" placeholder="请输入班级名称" />
        </el-form-item>
        <el-form-item label="老师ID">
          <el-input v-model="form.teacherId" placeholder="请输入老师ID" />
        </el-form-item>
        <el-form-item label="学院ID">
          <el-select v-model="form.academyId" placeholder="请选择学院" filterable>
            <el-option 
              v-for="item in academyOptions" 
              :key="item.academyId" 
              :label="`${item.academyId} - ${item.academyName}`" 
              :value="item.academyId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="年级">
          <el-input v-model="form.grade" placeholder="请输入年级" />
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
import { getClassList, addClass, updateClass, deleteClass } from '../api/class';
import { getAllAcademy } from '../api/academy';

// 类型定义：班级信息结构（后端字段）
interface ClassInfo {
  id?: number; // 后端自增主键
  classId: string | number;
  className: string;
  teacherId: string | number;
  academyId: string | number; // 后端字段是academyId，不是collegeId
  grade: string | number;
  createTime?: string;
  updateTime?: string;
}

// 班级列表数据
const classDB = ref<ClassInfo[]>([]);

// 下拉选项数据
const academyOptions = ref<any[]>([]);

// 响应式数据
const searchClassId = ref('');
const dialogVisible = ref(false);
const isAdd = ref(true);
const loading = ref(false);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 表单数据（使用后端字段名）
const form = reactive<ClassInfo>({
  className: '',
  teacherId: '',
  academyId: '',
  grade: new Date().getFullYear().toString()
});

// 显示列表（映射显示字段）
const showClassList = computed(() => {
  if (!searchClassId.value) return classDB.value;
  return classDB.value.filter(item => 
    item.classId.toString().includes(searchClassId.value) ||
    item.className.includes(searchClassId.value)
  );
});

// 加载学院选项
const loadAcademyOptions = async () => {
  try {
    const response = await getAllAcademy();
    if (Array.isArray(response)) {
      academyOptions.value = response;
    } else if (response && response.code === 200 && response.data) {
      academyOptions.value = Array.isArray(response.data) ? response.data : [];
    }
  } catch (error: any) {
    console.error('加载学院选项失败:', error);
  }
};

// 页面挂载时初始化 - 加载数据
onMounted(() => {
  form.grade = new Date().getFullYear().toString();
  loadClassList();
  loadAcademyOptions();
});

// 加载班级列表
const loadClassList = async () => {
  loading.value = true;
  try {
    const response = await getClassList();
    console.log('班级列表响应:', response);
    // 后端返回 Result.success(classListInfo)，所以 response.data 是数组
    if (response && response.code === 200 && response.data) {
      classDB.value = Array.isArray(response.data) ? response.data : [];
      console.log('班级数据:', classDB.value);
      if (classDB.value.length === 0) {
        ElMessage.info('暂无班级数据');
      }
    } else if (Array.isArray(response)) {
      // 如果直接返回数组（不应该发生，但做兼容处理）
      classDB.value = response;
      console.log('班级数据（直接数组）:', classDB.value);
    } else {
      console.warn('返回数据格式异常:', response);
      classDB.value = [];
      ElMessage.warning('返回数据格式异常');
    }
  } catch (error: any) {
    console.error('加载班级列表失败:', error);
    ElMessage.error(error.message || '加载班级列表失败');
    classDB.value = [];
  } finally {
    loading.value = false;
  }
};

// 查询功能
const handleSearch = () => {
  // 前端过滤，无需重新请求
};

// 新增班级
const handleAdd = () => {
  isAdd.value = true;
  dialogVisible.value = true;
  Object.assign(form, {
    classId: '',
    className: '',
    teacherId: '',
    academyId: '',
    grade: new Date().getFullYear().toString()+"级"
  });
};

// 格式化日期时间
const formatDateTime = (dateTime: any) => {
  if (!dateTime) return '-';
  if (typeof dateTime === 'string') {
    // 如果是字符串，直接返回（可能已经是格式化后的）
    return dateTime;
  }
  // 如果是Date对象或LocalDateTime对象，格式化为字符串
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

// 编辑班级
const handleEdit = (row: ClassInfo) => {
  isAdd.value = false;
  dialogVisible.value = true;
  Object.assign(form, {
    className: row.className,
    teacherId: row.teacherId,
    academyId: row.academyId,
    grade: row.grade
  });
  // 保存 classId 用于更新
  (form as any).classId = row.classId;
  (form as any).id = row.id;
};

// 删除班级
const handleDelete = async (row: ClassInfo) => {
  try {
    await ElMessageBox.confirm('确定要删除该班级信息吗？', '提示', { type: 'warning' });
    // 后端删除接口需要id（Long类型的自增主键）
    if (!row.id) {
      ElMessage.error('无法获取班级ID，删除失败');
      return;
    }
    const response = await deleteClass(row.id.toString());
    if (response.code === 200) {
      ElMessage.success(response.msg || '删除成功！');
      loadClassList();
    }
  } catch (error: any) {
    if (error.message !== '已取消删除') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!form.className) {
    ElMessage.warning('请填写班级名称！');
    return;
  }

  try {
    if (isAdd.value) {
      // 新增时，后端会自动生成classId，不传递classId字段
      const submitData = { ...form };
      delete (submitData as any).classId;
      delete (submitData as any).id;
      const response = await addClass(submitData);
      if (response.code === 200) {
        ElMessage.success(response.msg || '新增班级成功！');
        dialogVisible.value = false;
        loadClassList();
      }
    } else {
      // 更新时需要传递id（自增主键）
      const updateId = (form as any).id;
      if (!updateId) {
        ElMessage.error('无法获取班级ID');
        return;
      }
      const submitData = { ...form };
      delete (submitData as any).id;
      const response = await updateClass(updateId.toString(), submitData);
      if (response.code === 200) {
        ElMessage.success(response.msg || '编辑班级成功！');
        dialogVisible.value = false;
        loadClassList();
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

// 分页方法（班级列表不分页，但保留接口）
const handleSizeChange = (val: number) => {
  // 保留接口，但不需要实现
};

const handleCurrentChange = (val: number) => {
  // 保留接口，但不需要实现
};
</script>

<style scoped>
.class-manager-container {
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

.el-table {
  --el-table-header-text-color: #333;
  --el-table-row-hover-bg-color: #f5f7fa;
}
</style>