<template>
  <div class="teacher-manager-container">
    <!-- 搜索与操作区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchTeacherId"
        placeholder="请输入教师ID查询详情"
        style="width: 180px;"
        clearable
      />
      <el-button type="primary" @click="handleSearch">查询教师</el-button>
      <el-button type="success" @click="handleAdd">新增教师</el-button>
      <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 水平滚动容器：核心内容包裹，超出宽度显示水平滑块 -->
    <div class="horizontal-scroll-wrapper">
      <!-- 教师详情卡片（查询到单条数据时显示） -->
      <div v-if="teacherDetail" class="teacher-detail-card" style="margin: 20px 0; padding: 20px; border: 1px solid #e6e6e6; border-radius: 4px; min-width: 800px;">
        <h3>教师详情</h3>
        <el-descriptions :column="3" border style="margin-top: 10px;">
          <el-descriptions-item label="教师ID" width="120px">{{ teacherDetail.teacherId }}</el-descriptions-item>
          <el-descriptions-item label="教师姓名" width="150px">{{ teacherDetail.name || teacherDetail.teacherName }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ (teacherDetail.gender === '1' || teacherDetail.teacherSex === '1') ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="部门">{{ teacherDetail.department || teacherDetail.dept }}</el-descriptions-item>
          <el-descriptions-item label="学院ID">{{ teacherDetail.collegeId || teacherDetail.academyId }}</el-descriptions-item>
          <el-descriptions-item label="电话号码">{{ teacherDetail.phone }}</el-descriptions-item>
          <el-descriptions-item label="电子邮箱">{{ teacherDetail.email }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="(teacherDetail.status === '1' || teacherDetail.status === 1) ? 'success' : 'danger'">
              {{ (teacherDetail.status === '1' || teacherDetail.status === 1) ? '启用' : '禁用' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ teacherDetail.createTime ? formatDateTime(teacherDetail.createTime) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="修改时间" :span="3">{{ teacherDetail.updateTime ? formatDateTime(teacherDetail.updateTime) : '-' }}</el-descriptions-item>
        </el-descriptions>
        <el-button type="primary" style="margin-top: 15px;" @click="handleEdit(teacherDetail)">编辑此教师</el-button>
        <el-button type="danger" style="margin-top: 15px; margin-left: 10px;" @click="handleDelete(teacherDetail)">删除此教师</el-button>
      </div>

      <!-- 教师表格（无详情时显示列表） -->
      <el-table
        v-else
        :data="showTeacherList"
        border
        stripe
        style="width: 100%; margin-top: 20px; min-width: 1700px;"
        highlight-current-row
        v-loading="loading"
        @selection-change="handleSelectionChange"
      >
        <!-- 勾选列：用于批量删除 -->
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="teacherId" label="教师ID" align="center" width="120" />
        <el-table-column prop="name" label="教师姓名" align="center" width="150">
          <template #default="scope">
            {{ scope.row.name || scope.row.teacherName }}
          </template>
        </el-table-column>
        <el-table-column prop="gender" label="性别" align="center" width="80">
          <template #default="scope">
            {{ (scope.row.gender === '1' || scope.row.teacherSex === '1') ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column prop="department" label="部门名称" align="center" width="180">
          <template #default="scope">
            {{ scope.row.deptName}}
          </template>
        </el-table-column>
        <el-table-column prop="collegeId" label="学院名称" align="center" width="120">
          <template #default="scope">
            {{ scope.row.academyName }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话号码" align="center" width="150" />
        <el-table-column prop="email" label="电子邮箱" align="center" width="200" />
        <el-table-column prop="status" label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag :type="(scope.row.status === '1' || scope.row.status === 1) ? 'success' : 'danger'">
              {{ (scope.row.status === '1' || scope.row.status === 1) ? '启用' : '禁用' }}
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
        <!-- 操作列：恢复编辑、删除按钮 -->
        <el-table-column label="操作" align="center" width="160">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件（无详情时显示，固定在底部） -->
    <el-pagination
      v-if="!teacherDetail"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[5, 10, 15]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px; text-align: right;"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? '新增教师' : '编辑教师'"
      width="550px"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="教师姓名">
          <el-input v-model="form.teacherName" placeholder="请输入教师姓名" />
        </el-form-item>
        <el-form-item label="性别">
          <el-select v-model="form.teacherSex" placeholder="请选择性别">
            <el-option label="男" value="1" />
            <el-option label="女" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="form.dept" placeholder="请选择部门" filterable>
            <el-option 
              v-for="item in deptOptions" 
              :key="item.deptId || item.id" 
              :label="item.deptName || item.name" 
              :value="item.deptId || item.id" 
            />
          </el-select>
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
        <el-form-item label="电话号码">
          <el-input v-model="form.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="电子邮箱">
          <el-input v-model="form.email" placeholder="请输入电子邮箱" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
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
import { getTeacherList, getTeacher, addTeacher, updateTeacher, deleteTeacher, getDeptList } from '../api/teacher';
import { getAllAcademy } from '../api/academy';

// 类型定义：教师信息结构（映射后端字段）
interface Teacher {
  teacherId: string | number;
  teacherName?: string;  // 后端字段
  name?: string;         // 前端显示字段
  teacherSex?: string;   // 后端字段：1-男 0-女
  gender?: string;       // 前端显示字段
  dept?: string;         // 后端字段
  department?: string;   // 前端显示字段
  academyId?: string | number;  // 后端字段
  collegeId?: string | number;  // 前端显示字段
  phone: string;
  email: string;
  status: number | string; // 后端是int，前端显示用string
  createTime?: string;
  updateTime?: string;
  deptName?: string;
  academyName?: string;
}

// 分页配置类型
interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

// 教师列表数据
const teacherDB = ref<Teacher[]>([]);
// 表格多选数据（用于批量删除）
const multipleSelection = ref<Teacher[]>([]);

// 响应式数据
const searchTeacherId = ref('');
const teacherDetail = ref<Teacher | null>(null);
const dialogVisible = ref(false);
const isAdd = ref(true);
const loading = ref(false);
const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 下拉选项数据
const academyOptions = ref<any[]>([]);
const deptOptions = ref<any[]>([]);

// 表单数据（使用后端字段名）
const form = reactive({
  teacherName: '',
  teacherSex: '1',
  dept: '',
  academyId: '',
  phone: '',
  email: '',
  status: 1
});

// 显示列表（从后端数据映射）
const showTeacherList = computed(() => {
  return teacherDB.value.map(item => mapTeacherFromBackend(item));
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

// 加载部门选项
const loadDeptOptions = async () => {
  try {
    const response = await getDeptList();
    if (response && response.code === 200 && response.data) {
      deptOptions.value = Array.isArray(response.data) ? response.data : [];
    } else if (Array.isArray(response)) {
      deptOptions.value = response;
    } else {
      // 如果后端没有API，使用硬编码的部门列表
      deptOptions.value = [
        { deptId: 1, deptName: '技术部' },
        { deptId: 2, deptName: '教学部' },
        { deptId: 3, deptName: '办公室' },
        { deptId: 4, deptName: '财务部' },
        { deptId: 5, deptName: '团委' },
        { deptId: 6, deptName: '管理' }
      ];
    }
  } catch (error: any) {
    // 如果后端没有API，使用硬编码的部门列表
    console.warn('加载部门选项失败，使用默认列表:', error);
    deptOptions.value = [
      { deptId: 1, deptName: '技术部' },
      { deptId: 2, deptName: '教学部' },
      { deptId: 3, deptName: '办公室' },
      { deptId: 4, deptName: '财务部' },
      { deptId: 5, deptName: '团委' },
      { deptId: 6, deptName: '管理' }
    ];
  }
};

// 页面挂载时初始化 - 加载数据
onMounted(() => {
  loadTeacherList();
  loadAcademyOptions();
  loadDeptOptions();
});

// 后端数据映射到前端显示格式
const mapTeacherFromBackend = (item: any): Teacher => {
  return {
    ...item,
    name: item.teacherName || item.name,
    gender: item.teacherSex || item.gender,
    department: item.dept || item.department,
    collegeId: item.academyId || item.collegeId,
    status: typeof item.status === 'number' ? String(item.status) : item.status
  };
};

// 前端数据映射到后端格式
const mapTeacherToBackend = (item: any) => {
  return {
    teacherId: item.teacherId,
    teacherName: item.teacherName || item.name,
    teacherSex: item.teacherSex || item.gender,
    dept: item.dept || item.department,
    academyId: item.academyId || item.collegeId,
    phone: item.phone,
    email: item.email,
    status: typeof item.status === 'string' ? parseInt(item.status) : item.status
  };
};

// 加载教师列表
const loadTeacherList = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    };
    
    if (searchTeacherId.value) {
      // 如果输入了教师ID，先查询详情
      try {
        const detailResponse = await getTeacher(searchTeacherId.value);
        if (detailResponse.code === 200 && detailResponse.data) {
          teacherDetail.value = mapTeacherFromBackend(detailResponse.data);
          teacherDB.value = [];
          return;
        }
      } catch (e) {
        // 如果查询详情失败，继续列表查询
      }
    }
    
    const response = await getTeacherList(params);
    if (response.code === 200 && response.data) {
      const pageBean = response.data;
      teacherDB.value = pageBean.rows || [];
      pagination.total = pageBean.total || 0;
      teacherDetail.value = null;
    }
  } catch (error) {
    ElMessage.error('加载教师列表失败');
  } finally {
    loading.value = false;
  }
};

// 查询功能
const handleSearch = () => {
  pagination.currentPage = 1;
  teacherDetail.value = null;
  loadTeacherList();
};

// 新增教师
const handleAdd = () => {
  isAdd.value = true;
  dialogVisible.value = true;
  Object.assign(form, {
    teacherName: '',
    teacherSex: '1',
    dept: '',
    academyId: '',
    phone: '',
    email: '',
    status: 1
  });
};

// 编辑教师
const handleEdit = (row: Teacher) => {
  isAdd.value = false;
  dialogVisible.value = true;
  Object.assign(form, {
    teacherName: row.teacherName || row.name,
    teacherSex: row.teacherSex || row.gender,
    dept: row.dept || row.department,
    academyId: row.academyId || row.collegeId,
    phone: row.phone,
    email: row.email,
    status: typeof row.status === 'string' ? parseInt(row.status) : row.status
  });
  // 保存 teacherId 用于更新
  (form as any).teacherId = row.teacherId;
};

// 删除教师
const handleDelete = async (row: Teacher) => {
  try {
    await ElMessageBox.confirm('确定要删除该教师信息吗？', '提示', { type: 'warning' });
    await deleteTeacher([row.teacherId.toString()]);
    ElMessage.success('删除成功！');
    if (teacherDetail.value && teacherDetail.value.teacherId === row.teacherId) {
      teacherDetail.value = null;
    }
    loadTeacherList();
  } catch (error: any) {
    if (error.message !== '已取消删除') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 表格勾选变化（用于批量删除）
const handleSelectionChange = (val: Teacher[]) => {
  multipleSelection.value = val;
};

// 批量删除教师
const handleBatchDelete = async () => {
  if (!multipleSelection.value.length) {
    ElMessage.warning('请先选择要删除的教师');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${multipleSelection.value.length} 位教师吗？`,
      '批量删除',
      { type: 'warning' }
    );
    const ids = multipleSelection.value.map(item => item.teacherId.toString());
    await deleteTeacher(ids);
    ElMessage.success('批量删除成功！');
    teacherDetail.value = null;
    multipleSelection.value = [];
    loadTeacherList();
  } catch (error: any) {
    if (error?.message !== 'cancel') {
      ElMessage.error(error?.message || '批量删除失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!form.teacherName) {
    ElMessage.warning('请填写教师姓名！');
    return;
  }

  try {
    const teacherData = mapTeacherToBackend(form);
    if (isAdd.value) {
      const response = await addTeacher(teacherData);
      if (response.code === 200) {
        ElMessage.success(response.msg || '新增教师成功！');
        dialogVisible.value = false;
        loadTeacherList();
      }
    } else {
      const teacherId = (form as any).teacherId;
      if (!teacherId) {
        ElMessage.error('无法获取教师ID');
        return;
      }
      const response = await updateTeacher(teacherId.toString(), teacherData);
      if (response.code === 200) {
        ElMessage.success(response.msg || '编辑教师成功！');
        dialogVisible.value = false;
        if (teacherDetail.value && teacherDetail.value.teacherId === teacherId) {
          try {
            const detailResponse = await getTeacher(teacherId.toString());
            if (detailResponse.code === 200 && detailResponse.data) {
              teacherDetail.value = mapTeacherFromBackend(detailResponse.data);
            }
          } catch (e) {
            loadTeacherList();
          }
        } else {
          loadTeacherList();
        }
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

// 分页相关方法
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  pagination.currentPage = 1;
  loadTeacherList();
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  loadTeacherList();
};
</script>

<style scoped>
.teacher-manager-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 30px 20px;
  box-sizing: border-box;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

/* 核心：水平滚动容器样式 */
.horizontal-scroll-wrapper {
  width: 100%;
  overflow-x: auto; /* 超出宽度显示水平滑块 */
  margin: 10px 0;
  padding-bottom: 10px; /* 避免滚动条遮挡内容 */
}

.teacher-detail-card h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.el-dialog__body {
  padding: 20px;
}

.el-table {
  --el-table-header-text-color: #333;
  --el-table-row-hover-bg-color: #f5f7fa;
}
</style>