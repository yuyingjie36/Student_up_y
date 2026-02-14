<template>
  <div class="student-manager-container">
    <!-- 搜索和操作区域 - 合并为单个搜索框 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="输入学生ID或姓名（模糊）"
        style="width: 220px;"
        clearable
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button type="success" @click="handleAdd">新增学生</el-button>
      <el-button
        type="danger"
        @click="handleBatchDelete"
        :disabled="selectedStudents.length === 0"
        style="margin-left: 10px;"
      >
        批量删除
      </el-button>
    </div>

    <!-- 学生表格 -->
    <el-table
      ref="studentTableRef"
      :data="showStudentList"
      border
      stripe
      style="width: 100%; margin-top: 20px;"
      highlight-current-row
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <!-- 全选列 -->
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="studentId" label="学生ID" align="center" width="100" />
      <el-table-column prop="studentName" label="姓名" align="center" width="100" />
      <el-table-column prop="sex" label="性别" align="center" width="80">
        <template #default="scope">
          {{ scope.row.sex === '1' ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column prop="birthday" label="出生日期" align="center" width="120" />
      <el-table-column prop="phone" label="电话" align="center" width="150" />
      <el-table-column prop="classId" label="班级ID" align="center" width="100" />
      <el-table-column prop="majorId" label="专业ID" align="center" width="100" />
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
      :page-sizes="[5, 10, 15, 20]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px; text-align: right;"
    >
    </el-pagination>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? '新增学生' : '编辑学生'"
      width="500px"
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="姓名">
          <el-input v-model="form.studentName" placeholder="请输入学生姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.sex" placeholder="请选择性别">
            <el-option label="男" value="1" />
            <el-option label="女" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="出生日期">
          <el-date-picker
            v-model="form.birthday"
            type="date"
            placeholder="请选择出生日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%;"
          />
        </el-form-item>
        <el-form-item label="电话">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="班级ID">
          <el-select v-model="form.classId" placeholder="请选择班级" filterable>
            <el-option 
              v-for="item in classOptions" 
              :key="item.classId" 
              :label="`${item.classId} - ${item.className}`" 
              :value="item.classId" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="专业ID">
          <el-select v-model="form.majorId" placeholder="请选择专业" filterable>
            <el-option 
              v-for="item in majorOptions" 
              :key="item.majorId" 
              :label="`${item.majorId} - ${item.majorName}`" 
              :value="item.majorId" 
            />
          </el-select>
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
import { ElMessage, ElMessageBox, ElTable, TableInstance } from 'element-plus';
import { getStudentList, insertStudent, updateStudent, deleteBatchByIds } from '../api/student';
import { getClassList } from '../api/class';
import { getMajorList } from '../api/major';

// 类型定义
interface Student {
  studentId: string | number;
  studentName: string;
  sex: string; // 1-男 0-女（后端字段是sex，不是gender）
  birthday: string; // 格式 YYYY-MM-DD
  phone: string;
  createTime: string;
  updateTime: string;
  status: string; // 1-启用 0-禁用
  classId: string | number;
  majorId: string | number;
  majorName?: string;
  collegeName?: string;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

// 学生列表数据
const studentDB = ref<Student[]>([]);

// 下拉选项数据
const classOptions = ref<any[]>([]);
const majorOptions = ref<any[]>([]);

// 响应式数据
const studentTableRef = ref<TableInstance>();
const selectedStudents = ref<Student[]>([]);
const searchKeyword = ref(''); // 合并后的搜索关键词（ID/姓名）
const dialogVisible = ref(false);
const isAdd = ref(true);
const loading = ref(false);
const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 表单数据（字段名与后端一致）
const form = reactive({
  studentName: '',
  sex: '1', // 后端使用sex字段
  birthday: '',
  phone: '',
  status: '1',
  classId: '',
  majorId: ''
});

// 分页后的显示列表
const showStudentList = computed(() => {
  return studentDB.value;
});

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

// 加载班级选项
const loadClassOptions = async () => {
  try {
    const response = await getClassList();
    if (response && response.code === 200 && response.data) {
      classOptions.value = Array.isArray(response.data) ? response.data : [];
    } else if (Array.isArray(response)) {
      classOptions.value = response;
    }
  } catch (error: any) {
    console.error('加载班级选项失败:', error);
  }
};

// 加载专业选项
const loadMajorOptions = async () => {
  try {
    const response = await getMajorList();
    if (response && response.code === 200 && response.data) {
      majorOptions.value = Array.isArray(response.data) ? response.data : [];
    } else if (Array.isArray(response)) {
      majorOptions.value = response;
    }
  } catch (error: any) {
    console.error('加载专业选项失败:', error);
  }
};

// 页面初始化 - 加载数据
onMounted(() => {
  form.sex = '1';
  form.status = '1';
  loadStudentList();
  loadClassOptions();
  loadMajorOptions();
});

// 加载学生列表
const loadStudentList = async () => {
  loading.value = true;
  try {
    // 判断搜索关键词是ID还是姓名
    const params: any = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    };
    
    if (searchKeyword.value) {
      // 如果关键词是纯数字，可能是学生ID，否则是姓名
      // 注意：后端参数名是StudentId（大写的S），不是studentId
      if (/^\d+$/.test(searchKeyword.value)) {
        params.StudentId = searchKeyword.value;
      } else {
        params.studentName = searchKeyword.value;
      }
    }
    
    const response = await getStudentList(params);
    // 后端返回 Result.success(pageBean)，所以 response.data 是 pageBean 对象
    if (response && response.code === 200 && response.data) {
      const pageBean = response.data;
      studentDB.value = (pageBean.rows || []);
      pagination.total = pageBean.total || 0;
      if (studentDB.value.length === 0 && pagination.total === 0) {
        ElMessage.info('暂无数据');
      }
    } else {
      studentDB.value = [];
      pagination.total = 0;
    }
  } catch (error: any) {
    console.error('加载学生列表失败:', error);
    ElMessage.error(error.message || '加载学生列表失败');
    studentDB.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

// 选择事件（批量删除用）
const handleSelectionChange = (val: Student[]) => {
  selectedStudents.value = val;
};

// 查询功能 - 适配单个搜索关键词
const handleSearch = () => {
  pagination.currentPage = 1;
  loadStudentList();
};

// 新增功能
const handleAdd = () => {
  isAdd.value = true;
  dialogVisible.value = true;
  Object.assign(form, {
    studentName: '',
    sex: '1',
    birthday: '',
    phone: '',
    status: '1',
    classId: '',
    majorId: ''
  });
  studentTableRef.value?.clearSelection();
};

// 编辑功能
const handleEdit = (row: Student) => {
  isAdd.value = false;
  dialogVisible.value = true;
  Object.assign(form, {
    studentName: row.studentName,
    sex: row.sex,
    birthday: row.birthday,
    phone: row.phone,
    status: row.status,
    classId: row.classId,
    majorId: row.majorId
  });
  // 保存 studentId 用于更新
  (form as any).studentId = row.studentId;
  studentTableRef.value?.clearSelection();
};

// 单个删除功能
const handleDelete = async (row: Student) => {
  try {
    await ElMessageBox.confirm('确定要删除该学生信息吗？', '提示', { type: 'warning' });
    await deleteBatchByIds([row.studentId.toString()]);
      ElMessage.success('删除成功！');
    loadStudentList();
  } catch (error: any) {
    if (error.message !== '已取消删除') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 批量删除功能
const handleBatchDelete = async () => {
  if (selectedStudents.value.length === 0) {
    ElMessage.warning('请至少选择一条记录');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedStudents.value.length} 条学生信息吗？`, 
      '批量删除', 
      { type: 'warning' }
    );
    const selectedIds = selectedStudents.value.map(item => item.studentId.toString());
    await deleteBatchByIds(selectedIds);
    ElMessage.success(`成功删除 ${selectedStudents.value.length} 条学生信息！`);
    studentTableRef.value?.clearSelection();
    loadStudentList();
  } catch (error: any) {
    if (error.message !== '已取消删除') {
      ElMessage.error(error.message || '批量删除失败');
    }
  }
};

// 提交表单（新增/编辑）
const handleSubmit = async () => {
  if (!form.studentName) {
    ElMessage.warning('请填写学生姓名！');
    return;
  }
  
  // 编辑时必须填写学生ID
  if (!isAdd.value && !(form as any).studentId) {
    ElMessage.warning('学生ID不能为空！');
    return;
  }

  try {
    if (isAdd.value) {
      // 新增时，后端会自动生成studentId，不传递studentId字段
      const submitData = { ...form };
      delete (submitData as any).studentId;
      const response = await insertStudent(submitData);
      if (response && response.code === 200) {
        ElMessage.success(response.msg || '新增成功！');
        dialogVisible.value = false;
        loadStudentList();
      }
    } else {
      // 编辑时必须传递studentId
      const response = await updateStudent((form as any).studentId.toString(), form);
      if (response && response.code === 200) {
        ElMessage.success(response.msg || '编辑成功！');
        dialogVisible.value = false;
        loadStudentList();
      }
    }
  } catch (error: any) {
    console.error('提交表单失败:', error);
    ElMessage.error(error.message || '操作失败');
  }
};

// 分页相关
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  pagination.currentPage = 1;
  loadStudentList();
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  studentTableRef.value?.clearSelection();
  loadStudentList();
};
</script>

<style scoped>
.student-manager-container {
  max-width: 1800px;
  margin: 0 auto;
  padding: 30px 20px;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.el-dialog__body {
  padding: 20px;
}

.el-table {
  --el-table-header-text-color: #333;
  --el-table-row-hover-bg-color: #f5f7fa;
}
</style>