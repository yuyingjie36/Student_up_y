<template>
  <div class="course-manager-container">
    <!-- 搜索和操作区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchCourseId"
        placeholder="请输入课程ID查询详情"
        style="width: 180px;"
        clearable
      />
      <el-button type="primary" @click="handleSearch">查询课程</el-button>
      <el-button type="success" @click="handleAdd">新增课程</el-button>
      <el-button type="danger" @click="handleBatchDelete">批量删除</el-button>
    </div>

    <!-- 课程详情卡片（查询到单条数据时显示） -->
    <div v-if="courseDetail" class="course-detail-card" style="margin: 20px 0; padding: 20px; border: 1px solid #e6e6e6; border-radius: 4px;">
      <h3>课程详情</h3>
      <el-descriptions :column="3" border style="margin-top: 10px;">
        <el-descriptions-item label="课程ID">{{ courseDetail.courseId }}</el-descriptions-item>
        <el-descriptions-item label="课程名称">{{ courseDetail.courseName }}</el-descriptions-item>
        <el-descriptions-item label="老师ID">{{ courseDetail.teacherId }}</el-descriptions-item>
        <el-descriptions-item label="课程属性">{{ (courseDetail.courseAttr === '1' || courseDetail.courseType === 1) ? '必修' : '选修' }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ (courseDetail.status === '1' || courseDetail.courseStatus === 1) ? '启用' : '禁用' }}</el-descriptions-item>
        <el-descriptions-item label="学分">{{ courseDetail.credit || '-' }}</el-descriptions-item>
        <el-descriptions-item label="修改时间" :span="3">{{ courseDetail.updateTime ? formatDateTime(courseDetail.updateTime) : '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-button type="primary" style="margin-top: 15px;" @click="handleEdit(courseDetail)">编辑此课程</el-button>
    </div>

    <!-- 课程表格（无详情时显示列表） -->
    <el-table
      v-else
      :data="showCourseList"
      border
      stripe
      style="width: 100%; margin-top: 20px;"
      highlight-current-row
      v-loading="loading"
      @selection-change="handleCourseSelectionChange"
    >
      <!-- 勾选列：用于批量删除 -->
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column prop="courseId" label="课程ID" align="center" width="120" />
      <el-table-column prop="courseName" label="课程名称" align="center" width="200" />
      <el-table-column prop="credit" label="学分" align="center" width="120" />
      <el-table-column prop="courseAttr" label="课程属性" align="center" width="120">
        <template #default="scope">
          <el-tag :type="(scope.row.courseAttr === '1' || scope.row.courseType === 1) ? 'primary' : 'info'">
            {{ (scope.row.courseAttr === '1' || scope.row.courseType === 1) ? '必修' : '选修' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center" width="100">
        <template #default="scope">
          <el-tag :type="(scope.row.status === '1' || scope.row.courseStatus === 1) ? 'success' : 'danger'">
            {{ (scope.row.status === '1' || scope.row.courseStatus === 1) ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="teacherName" label="老师姓名" align="center" width="100">
        <template #default="scope">
          {{ scope.row.teacherName ? formatDateTime(scope.row.teacherName) : '-' }}
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
      v-if="!courseDetail"
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
      :title="isAdd ? '新增课程' : '编辑课程'"
      width="500px"
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="课程名称">
          <el-input v-model="form.courseName" placeholder="请输入课程名称" />
        </el-form-item>
        <el-form-item label="教师ID">
          <el-input v-model="form.teacherId" placeholder="请输入教师ID" />
        </el-form-item>
        <el-form-item label="学分">
          <el-input v-model="form.credit" placeholder="请输入学分" />
        </el-form-item>
        <el-form-item label="课程属性">
          <el-select v-model="form.courseType" placeholder="请选择课程属性">
            <el-option label="必修" :value="1" />
            <el-option label="选修" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <!-- ✅ 修改点1：下拉框绑定字段改为【status】，和后端字段名完全一致 -->
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
import { getCourseList, getCourse, addCourse, updateCourse, deleteCourse } from '../api/course';

// 类型定义
interface Course {
  courseId: string | number;
  courseName: string;
  teacherName: string;
  teacherId?: string | number;
  academyName?: string;
  courseType?: number; // 后端字段：1-必修 2-选修
  courseAttr?: string; // 前端显示：1-必修 0-选修
  courseStatus?: number; // 兼容字段
  status?: string; // 后端核心字段 ✅ 前后端统一为status
  credit?: number; // 学分
  updateTime?: string;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

// 课程列表数据
const courseDB = ref<Course[]>([]);
// 多选的课程（用于批量删除）
const selectedCourses = ref<Course[]>([]);

// 响应式数据
const searchCourseId = ref(''); // 仅按课程ID查询
const courseDetail = ref<Course | null>(null); // 课程详情对象
const dialogVisible = ref(false);
const isAdd = ref(true);
const loading = ref(false);
const pagination = reactive<Pagination>({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 表单数据
const form = reactive({
  courseName: '',
  teacherId: '',
  courseType: 1, // 1-必修 2-选修
  status: 1, // ✅ 修改点2：表单字段名改为【status】，删除courseStatus，和后端字段名完全一致
  credit: ''
});

// 分页后的显示列表
const showCourseList = computed(() => {
  return courseDB.value;
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

// 页面初始化 - 加载数据
onMounted(() => {
  loadCourseList();
});

// 加载课程列表
const loadCourseList = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.currentPage,
      pageSize: pagination.pageSize
    };
    
    if (searchCourseId.value) {
      // 如果输入了课程ID，先查询详情
      try {
        const detailResponse = await getCourse(searchCourseId.value);
        if (detailResponse.code === 200 && detailResponse.data) {
          courseDetail.value = mapCourseFromBackend(detailResponse.data);
          courseDB.value = [];
          return;
        }
      } catch (e) {
        // 如果查询详情失败，继续列表查询
      }
    } else {
      // 如果没有搜索关键词，查询列表
      const response = await getCourseList(params);
      if (response.code === 200 && response.data) {
        const pageBean = response.data;
        courseDB.value = (pageBean.rows || []).map((item: any) => mapCourseFromBackend(item));
        pagination.total = pageBean.total || 0;
        courseDetail.value = null;
      }
    }
  } catch (error) {
    ElMessage.error('加载课程列表失败');
  } finally {
    loading.value = false;
  }
};

// ✅ 修改点3【核心修复】：后端数据映射函数，把后端返回的【status】赋值给前端status，修复显示错误的根源
const mapCourseFromBackend = (item: any): Course => {
  return {
    ...item,
    courseAttr: item.courseType === 1 ? '1' : '0', // 1必修 -> 1, 2选修 -> 0
    status: item.status === 1 ? '1' : '0' // ✅ 关键修复：原来是item.courseStatus → 现在改为 item.status 匹配后端真实返回字段
  };
};

// ✅ 修改点4【核心修复】：前端数据映射后端，返回的字段名是【status】，和后端完全一致，保证传参正确
const mapCourseToBackend = (item: any) => {
  return {
    courseId: item.courseId,
    courseName: item.courseName,
    teacherId: item.teacherId,
    courseType: item.courseType !== undefined ? item.courseType : (item.courseAttr === '1' ? 1 : 2),
    status: item.status !== undefined ? item.status : (item.status === '1' ? 1 : 0), // ✅ 字段名改为status，传给后端
    credit: item.credit || 0
  };
};

// 查询功能
const handleSearch = () => {
  pagination.currentPage = 1;
  courseDetail.value = null;
  if (!searchCourseId.value) {
    loadCourseList();
  } else {
    loadCourseList();
  }
};

// 新增课程
const handleAdd = () => {
  isAdd.value = true;
  dialogVisible.value = true;
  Object.assign(form, {
    courseName: '',
    teacherId: '',
    courseType: 1,
    status: 1 // ✅ 对应表单的status字段
  });
};

// 编辑课程
const handleEdit = (row: Course) => {
  isAdd.value = false;
  dialogVisible.value = true;
  Object.assign(form, {
    courseId: row.courseId,
    courseName: row.courseName,
    teacherId: row.teacherId,
    courseType: row.courseType || (row.courseAttr === '1' ? 1 : 2),
    status: row.status === '1' ? 1 : 0 // ✅ 回显的时候取row.status，赋值给表单status
  });
};

// 删除单个课程
const handleDelete = async (row: Course) => {
  try {
    await ElMessageBox.confirm('确定要删除该课程信息吗？', '提示', { type: 'warning' });
    await deleteCourse([row.courseId.toString()]);
    ElMessage.success('删除成功！');
    if (courseDetail.value && courseDetail.value.courseId === row.courseId) {
      courseDetail.value = null;
    }
    loadCourseList();
  } catch (error: any) {
    if (error.message !== '已取消删除') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 课程表格勾选变化（批量删除用）
const handleCourseSelectionChange = (val: Course[]) => {
  selectedCourses.value = val;
};

// 批量删除课程
const handleBatchDelete = async () => {
  if (!selectedCourses.value.length) {
    ElMessage.warning('请先选择要删除的课程');
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedCourses.value.length} 门课程吗？`,
      '批量删除',
      { type: 'warning' }
    );
    const ids = selectedCourses.value.map(item => item.courseId.toString());
    await deleteCourse(ids);
    ElMessage.success('批量删除成功！');
    courseDetail.value = null;
    selectedCourses.value = [];
    loadCourseList();
  } catch (error: any) {
    if (error?.message !== 'cancel') {
      ElMessage.error(error?.message || '批量删除失败');
    }
  }
};

// 提交表单（新增/编辑）
const handleSubmit = async () => {
  if ( !form.courseName) {
    ElMessage.warning('请填写课程名称！');
    return;
  }

  try {
    const courseData = mapCourseToBackend(form);
    if (isAdd.value) {
      const response = await addCourse(courseData);
      if (response.code === 200) {
        ElMessage.success(response.msg || '新增课程成功！');
        dialogVisible.value = false;
        loadCourseList();
      }
    } else {
      const response = await updateCourse(form.courseId.toString(), courseData);
      if (response.code === 200) {
        ElMessage.success(response.msg || '编辑课程成功！');
        dialogVisible.value = false;
        if (courseDetail.value && courseDetail.value.courseId === form.courseId) {
          // 重新加载详情
          try {
            const detailResponse = await getCourse(form.courseId.toString());
            if (detailResponse.code === 200 && detailResponse.data) {
              courseDetail.value = mapCourseFromBackend(detailResponse.data);
            }
          } catch (e) {
            loadCourseList();
          }
        } else {
          loadCourseList();
        }
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

// 分页方法
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  pagination.currentPage = 1;
  loadCourseList();
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  loadCourseList();
};
</script>

<style scoped>
.course-manager-container {
  max-width: 1600px;
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