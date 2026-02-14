<template>
  <div class="score-manager-container">
    <!-- 搜索与操作区域 - 合并为单个搜索框 -->
    <div class="search-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入学生ID查询成绩"
        style="width: 220px;"
        clearable
      />
      <el-button type="primary" @click="handleSearch">查询成绩</el-button>
      <el-button type="success" @click="handleAdd">录入成绩</el-button>
    </div>

    <!-- 水平滚动容器：解决表格过宽问题 -->
    <div class="horizontal-scroll-wrapper">
      <!-- 成绩表格 -->
      <el-table
        :data="showScoreList"
        border
        stripe
        style="width: 100%; min-width: 600px; margin-top: 20px;"
        highlight-current-row
        v-loading="loading"
      >
        <el-table-column prop="studentId" label="学生ID" align="center" width="140" />
        <el-table-column prop="studentName" label="学生姓名" align="center" width="140" />
        <el-table-column prop="courseId" label="课程ID" align="center" width="140" />
        <el-table-column prop="courseName" label="课程名称" align="center" width="200" />
        <el-table-column prop="score" label="分数" align="center" width="100">
          <template #default="scope">
            {{ scope.row.score || scope.row.classScore }}
          </template>
        </el-table-column>
        <el-table-column prop="credit" label="学分" align="center" width="80" />
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">修改</el-button>
            <!-- 后端未提供删除接口，暂时隐藏删除按钮 -->
            <!-- <el-button type="danger" size="small" @click="handleDelete(scope.row)" style="margin-left: 8px;">删除</el-button> -->
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页组件 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[5, 10, 15]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pagination.total"
      style="margin-top: 20px; text-align: right;"
    />

    <!-- 录入/修改成绩弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? '录入成绩' : '修改成绩'"
      width="450px"
    >
      <el-form :model="form" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="学生ID" prop="studentId">
          <el-input v-model="form.studentId" :disabled="!isAdd" placeholder="请输入学生ID" />
        </el-form-item>
        <el-form-item label="课程ID" prop="courseId">
          <el-input v-model="form.courseId" :disabled="!isAdd" placeholder="请输入课程ID" />
        </el-form-item>
        <el-form-item label="分数" prop="classScore">
          <el-input v-model.number="form.classScore" type="number" placeholder="请输入分数（0-100）" />
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
import type { FormInstance, FormRules } from 'element-plus';
import { getScoreList, insertScore, updateScore, getScoreByStudentId } from '../api/score';

// 类型定义：成绩信息结构（后端ScoreStudentCourseVO）
interface Score {
  scoreId?: string;
  studentId: string | number; // 学生ID
  courseId: string | number;  // 课程ID
  classScore?: number | string; // 后端字段：分数（可能是BigDecimal）
  score?: number;              // 前端显示字段
  studentName?: string;        // 关联学生姓名
  studentPhone?: string;       // 关联学生电话
  courseName?: string;         // 关联课程名称
  credit?: number;             // 关联课程学分
  createTime?: string;         // 录入时间
  updateTime?: string;         // 修改时间
}

// 成绩列表数据
const scoreDB = ref<Score[]>([]);

// 响应式数据
const searchKeyword = ref('');
const dialogVisible = ref(false);
const isAdd = ref(true);
const loading = ref(false);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 表单实例和表单数据
const formRef = ref<FormInstance>();
const form = reactive({
  studentId: '',
  courseId: '',
  classScore: 0 // 后端字段名
});

// 表单验证规则
const formRules = ref<FormRules>({
  studentId: [{ required: true, message: '请输入学生ID', trigger: 'blur' }],
  courseId: [{ required: true, message: '请输入课程ID', trigger: 'blur' }],
  classScore: [
    { required: true, message: '请输入分数', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '分数必须在0-100之间', trigger: 'blur' }
  ]
});

// 显示列表（映射显示字段并分页）
const showScoreList = computed(() => {
  let list = scoreDB.value.map(item => ({
    ...item,
    score: item.classScore !== undefined ? Number(item.classScore) : item.score
  }));
  
  // 前端过滤（如果需要）
  if (searchKeyword.value) {
    list = list.filter(item => {
      const studentMatch = item.studentId.toString() === searchKeyword.value;
      const courseMatch = item.courseId.toString() === searchKeyword.value;
      return studentMatch || courseMatch;
    });
  }
  
  // 前端分页
  const start = (pagination.currentPage - 1) * pagination.pageSize;
  const end = start + pagination.pageSize;
  return list.slice(start, end);
});

// 页面挂载时初始化 - 加载数据
onMounted(() => {
  loadScoreList();
});

// 加载成绩列表
const loadScoreList = async () => {
  loading.value = true;
  try {
    let response;
    if (searchKeyword.value) {
      // 如果输入了学生ID，查询该学生的成绩
      response = await getScoreByStudentId(searchKeyword.value);
    } else {
      // 查询所有成绩
      response = await getScoreList();
    }
    
    // 处理返回结果：可能是Result对象或直接数组
    if (response.code === 200 && response.data) {
      scoreDB.value = Array.isArray(response.data) ? response.data : [];
    } else if (Array.isArray(response)) {
      // 如果直接返回数组
      scoreDB.value = response;
    } else if (response && response.data && Array.isArray(response.data)) {
      scoreDB.value = response.data;
    }
    pagination.total = scoreDB.value.length;
  } catch (error: any) {
    ElMessage.error(error.message || '加载成绩列表失败');
  } finally {
    loading.value = false;
  }
};

// 查询功能
const handleSearch = () => {
  pagination.currentPage = 1;
  loadScoreList();
};

// 录入成绩
const handleAdd = () => {
  isAdd.value = true;
  dialogVisible.value = true;
  formRef.value?.resetFields();
  Object.assign(form, {
    studentId: '',
    courseId: '',
    classScore: 0
  });
};

// 修改成绩
const handleEdit = (row: Score) => {
  isAdd.value = false;
  dialogVisible.value = true;
  Object.assign(form, {
    studentId: row.studentId,
    courseId: row.courseId,
    classScore: row.classScore !== undefined ? Number(row.classScore) : (row.score || 0)
  });
};

// 删除成绩（后端没有删除接口，这里保留前端逻辑但不调用API）
const handleDelete = async (row: Score) => {
  ElMessage.warning('后端未提供删除成绩接口');
  // 如果需要删除功能，需要后端添加对应接口
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (!valid) return;

  try {
    if (isAdd.value) {
      const response = await insertScore({
        studentId: form.studentId,
        courseId: form.courseId,
        classScore: form.classScore.toString()
      });
      if (response.code === 200) {
        ElMessage.success(response.msg || '成绩录入成功！');
        dialogVisible.value = false;
        loadScoreList();
      }
    } else {
      const response = await updateScore(form.studentId.toString(), {
        studentId: form.studentId,
        courseId: form.courseId,
        classScore: form.classScore.toString()
      });
      if (response.code === 200) {
        ElMessage.success(response.msg || '成绩修改成功！');
        dialogVisible.value = false;
        loadScoreList();
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

// 分页相关方法（成绩列表已全部加载，前端分页）
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  pagination.currentPage = 1;
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
};
</script>

<style scoped>
.score-manager-container {
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

/* 水平滚动容器：解决表格过宽问题 */
.horizontal-scroll-wrapper {
  width: 100%;
  overflow-x: auto;
  margin: 10px 0;
  padding-bottom: 10px;
}

.el-dialog__body {
  padding: 20px;
}

.el-table {
  --el-table-header-text-color: #333;
  --el-table-row-hover-bg-color: #f5f7fa;
}
</style>