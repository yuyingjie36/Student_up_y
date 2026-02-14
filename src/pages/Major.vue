<template>
  <div class="professional-manager-container">
    <!-- 搜索与操作区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchProId"
        placeholder="请输入专业ID查询详情"
        style="width: 180px;"
        clearable
      />
      <el-button type="primary" @click="handleSearch">查询专业</el-button>
      <el-button type="success" @click="handleAdd">新增专业</el-button>
    </div>

    <!-- 专业详情卡片（查询到单条数据时显示） -->
    <div v-if="proDetail" class="pro-detail-card" style="margin: 20px 0; padding: 20px; border: 1px solid #e6e6e6; border-radius: 4px;">
      <h3>专业详情</h3>
      <el-descriptions :column="2" border style="margin-top: 10px;">
        <el-descriptions-item label="专业ID" width="120px">{{ proDetail.proId }}</el-descriptions-item>
        <el-descriptions-item label="专业名称" width="180px">{{ proDetail.proName }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="proDetail.status === '1' ? 'success' : 'danger'">
            {{ proDetail.status === '1' ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ proDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="修改时间" :span="2">{{ proDetail.updateTime }}</el-descriptions-item>
      </el-descriptions>
      <el-button type="primary" style="margin-top: 15px;" @click="handleEdit(proDetail)">编辑此专业</el-button>
    </div>

    <!-- 专业表格（无详情时显示列表） -->
    <el-table
      v-else
      :data="filterProList"
      border
      stripe
      style="width: 100%; margin-top: 20px;"
      highlight-current-row
      v-loading="loading"
    >
      <el-table-column prop="proId" label="专业ID" align="center" width="120">
        <template #default="scope">
          {{ scope.row.proId || scope.row.majorId }}
        </template>
      </el-table-column>
      <el-table-column prop="proName" label="专业名称" align="center" width="180">
        <template #default="scope">
          {{ scope.row.proName || scope.row.majorName }}
        </template>
      </el-table-column>
      <el-table-column prop="academyId" label="学院ID" align="center" width="120" />
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
      <el-table-column label="操作" align="center" width="160">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页组件（无详情时显示） -->
    <el-pagination
      v-if="!proDetail"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagination.currentPage"
      :page-sizes="[5, 10, 15]"
      :page-size="pagination.pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="filterProList.length"
      style="display: none; margin-top: 20px; text-align: right;"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? '新增专业' : '编辑专业'"
      width="450px"
    >
      <el-form :model="form" label-width="90px">
        <el-form-item label="专业名称">
          <el-input v-model="form.majorName" placeholder="请输入专业名称" />
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
import { getMajorList, getMajorById, addMajor, updateMajor, deleteMajor } from '../api/major';
import { getAllAcademy } from '../api/academy';

// 类型定义：专业信息结构（后端字段）
interface Professional {
  id?: number;                  // 后端自增主键
  majorId: string | number;     // 后端字段：专业ID
  proId?: string | number;      // 前端显示字段（兼容）
  majorName: string;            // 后端字段：专业名称
  proName?: string;             // 前端显示字段（兼容）
  academyId?: string | number;  // 学院ID
  status: number | string;      // 后端是int，前端显示用string
  createTime?: string;
  updateTime?: string;
}

// 专业列表数据
const proDB = ref<Professional[]>([]);

// 响应式数据
const searchProId = ref('');
const proDetail = ref<Professional | null>(null);
const dialogVisible = ref(false);
const isAdd = ref(true);
const loading = ref(false);
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
});

// 下拉选项数据
const academyOptions = ref<any[]>([]);

// 表单数据（使用后端字段名）
const form = reactive({
  majorName: '',
  academyId: '',
  status: 1 // 后端是int类型
});

// 显示列表（映射显示字段）
const showProList = computed(() => {
  return proDB.value.map(item => ({
    ...item,
    proId: item.majorId || item.proId,
    proName: item.majorName || item.proName,
    status: typeof item.status === 'number' ? String(item.status) : item.status
  }));
});

// 过滤后的专业列表
const filterProList = computed(() => {
  if (!searchProId.value) return showProList.value;
  return showProList.value.filter(item => {
    const id = item.proId || item.majorId;
    return id?.toString() === searchProId.value;
  });
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

// 页面挂载时初始化 - 加载数据
onMounted(() => {
  loadMajorList();
  loadAcademyOptions();
});

// 加载专业列表
const loadMajorList = async () => {
  loading.value = true;
  try {
    const response = await getMajorList();
    console.log('专业列表响应:', response);
    // 后端直接返回 List<Major>，没有Result包装
    // request.js会直接返回数组
    if (Array.isArray(response)) {
      proDB.value = response;
      console.log('专业数据:', proDB.value);
      if (response.length === 0) {
        ElMessage.info('暂无专业数据');
      }
    } else if (response && response.code === 200 && response.data) {
      // 如果被包装成了Result对象（不应该发生，但做兼容处理）
      proDB.value = Array.isArray(response.data) ? response.data : [];
      console.log('专业数据（Result包装）:', proDB.value);
    } else {
      console.warn('返回数据格式异常:', response);
      proDB.value = [];
      ElMessage.warning('返回数据格式异常');
    }
    proDetail.value = null;
  } catch (error: any) {
    console.error('加载专业列表失败:', error);
    ElMessage.error(error.message || '加载专业列表失败');
    proDB.value = [];
    proDetail.value = null;
  } finally {
    loading.value = false;
  }
};

// 查询功能
const handleSearch = async () => {
  if (!searchProId.value) {
    loadMajorList();
    return;
  }

  loading.value = true;
  try {
    const response = await getMajorById(searchProId.value);
    // 后端直接返回 Major对象，没有Result包装
    // request.js会直接返回对象
    let majorData = null;
    if (response && response.majorId) {
      // 直接返回对象
      majorData = response;
    } else if (response && response.code === 200 && response.data) {
      // 如果被包装成了Result对象（不应该发生，但做兼容处理）
      majorData = response.data;
    } else if (response && typeof response === 'object' && !response.code) {
      majorData = response;
    }

    if (majorData && majorData.majorId) {
      proDetail.value = {
        ...majorData,
        proId: majorData.majorId,
        proName: majorData.majorName,
        status: typeof majorData.status === 'number' ? String(majorData.status) : majorData.status
      };
      ElMessage.success(`查询到专业ID为【${searchProId.value}】的详情`);
    } else {
      ElMessage.error(`未找到专业ID为【${searchProId.value}】的专业`);
      proDetail.value = null;
      loadMajorList();
    }
  } catch (error: any) {
    console.error('查询专业详情失败:', error);
    ElMessage.error(error.message || '查询失败');
    proDetail.value = null;
    loadMajorList();
  } finally {
    loading.value = false;
  }
};

// 新增专业
const handleAdd = () => {
  isAdd.value = true;
  dialogVisible.value = true;
  Object.assign(form, {
    majorId: '',
    majorName: '',
    academyId: '',
    status: 1
  });
};

// 编辑专业
const handleEdit = (row: Professional) => {
  isAdd.value = false;
  dialogVisible.value = true;
  Object.assign(form, {
    majorName: row.majorName || row.proName,
    academyId: row.academyId,
    status: typeof row.status === 'string' ? parseInt(row.status) : row.status
  });
  // 保存 majorId 用于更新
  (form as any).majorId = row.majorId || row.proId;
};

// 删除专业
const handleDelete = async (row: Professional) => {
  try {
    await ElMessageBox.confirm('确定要删除该专业信息吗？', '提示', { type: 'warning' });
    const majorId = row.majorId || row.proId;
    if (!majorId) {
      ElMessage.error('无法获取专业ID');
      return;
    }
    const response = await deleteMajor(majorId.toString());
    if (response.code === 200) {
      ElMessage.success(response.msg || '删除成功！');
      if (proDetail.value && (proDetail.value.proId === row.proId || proDetail.value.majorId === row.majorId)) {
        proDetail.value = null;
      }
      loadMajorList();
    }
  } catch (error: any) {
    if (error.message !== '已取消删除') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!form.majorName) {
    ElMessage.warning('请填写专业名称！');
    return;
  }

  try {
    if (isAdd.value) {
      // 新增时，后端会自动生成majorId，不传递majorId字段
      const submitData = { ...form };
      delete (submitData as any).majorId;
      const response = await addMajor(submitData);
      if (response.code === 200) {
        ElMessage.success(response.msg || '新增专业成功！');
        dialogVisible.value = false;
        loadMajorList();
      }
    } else {
      // 编辑时需要传递majorId
      const majorId = (form as any).majorId;
      if (!majorId) {
        ElMessage.error('无法获取专业ID');
        return;
      }
      const response = await updateMajor(majorId.toString(), form);
      if (response.code === 200) {
        ElMessage.success(response.msg || '编辑专业成功！');
        dialogVisible.value = false;
        if (proDetail.value && (proDetail.value.proId === majorId || proDetail.value.majorId === majorId)) {
          try {
            const detailResponse = await getMajorById(majorId.toString());
            if (detailResponse && detailResponse.majorId) {
              proDetail.value = {
                ...detailResponse,
                proId: detailResponse.majorId,
                proName: detailResponse.majorName,
                status: typeof detailResponse.status === 'number' ? String(detailResponse.status) : detailResponse.status
              };
            }
          } catch (e) {
            loadMajorList();
          }
        } else {
          loadMajorList();
        }
      }
    }
  } catch (error: any) {
    ElMessage.error(error.message || '操作失败');
  }
};

// 分页方法（专业列表不分页，但保留接口）
const handleSizeChange = (val: number) => {
  // 保留接口，但不需要实现
};

const handleCurrentChange = (val: number) => {
  // 保留接口，但不需要实现
};
</script>

<style scoped>
.professional-manager-container {
  max-width: 1200px;
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

.pro-detail-card h3 {
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