<template>
  <div class="user-manager-container">
    <!-- 搜索与操作区域 -->
    <div class="search-bar">
      <el-input
        v-model="searchForm.adminId"
        placeholder="请输入用户ID"
        style="width: 160px;"
        clearable
      />
      <el-input
        v-model="searchForm.phone"
        placeholder="请输入电话"
        style="width: 160px;"
        clearable
      />
      <el-button type="primary" @click="handleSearch">查询用户</el-button>
      <el-button type="success" @click="handleAdd">新增用户</el-button>
    </div>

    <!-- 水平滚动容器：解决表格过宽问题 -->
    <div class="horizontal-scroll-wrapper">
      <!-- 用户表格 -->
      <el-table
        :data="showUserList"
        stripe
        style="width: 100%; min-width: 800px; margin-top: 20px;"
        highlight-current-row
        v-loading="loading"
      >
        <el-table-column prop="userId" label="用户ID" align="center" width="120">
          <template #default="scope">
            {{ scope.row.userId || scope.row.adminId }}
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" align="center" width="150">
          <template #default="scope">
            {{ scope.row.username || scope.row.adminId }}
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" align="center" width="150" />
        <el-table-column prop="status" label="状态" align="center" width="120">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              active-value="1"
              inactive-value="0"
              @change="handleStatusChange(scope.row)"
              active-text="启"
              inactive-text="禁"
            />
          </template>
        </el-table-column>
        <el-table-column prop="updateTime" label="修改时间" align="center" width="200" />
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)" style="margin-left: 8px;">删除</el-button>
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

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isAdd ? '新增用户' : '编辑用户'"
      width="450px"
    >
      <el-form :model="form" label-width="100px" :rules="formRules" ref="formRef">
        <el-form-item label="用户ID" prop="adminId">
          <el-input v-model="form.adminId" :disabled="!isAdd" placeholder="请输入用户ID(至少3位)" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="isAdd">
          <el-input v-model="form.password" type="password" placeholder="请输入密码（至少6位）" />
        </el-form-item>
        <el-form-item label="修改密码" prop="password" v-else>
          <el-input v-model="form.password" type="password" placeholder="留空则不修改密码" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
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
import type { FormInstance, FormRules } from 'element-plus';
import { getUserList, addUser, updateUser, deleteUser } from '../api/user';

// 类型定义：用户信息结构（后端字段）
interface User {
  id?: string;              // 后端UUID主键
  adminId: string;          // 后端字段：用户ID
  userId?: string;          // 前端显示字段（兼容）
  username?: string;        // 前端显示字段（兼容，后端没有此字段）
  password?: string;        // 密码
  phone?: string;           // 电话
  status: string;           // 状态：1-启用 / 0-禁用
  salt?: string;            // 盐值
  updateTime?: string;      // 修改时间
}

// 用户列表数据
const userDB = ref<User[]>([]);

// 响应式数据
const searchForm = reactive({
  adminId: '',  // 使用后端字段名
  phone: ''     // 后端有phone字段，可以用作搜索
});

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
  adminId: '',
  password: '',
  phone: '',
  status: '1'
});

// 表单验证规则
const formRules = ref<FormRules>({
  adminId: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, 
             { min: 6, message: '密码长度至少6位', trigger: 'blur' }],
  phone: [{ required: false, message: '请输入电话', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
});

// 显示列表（映射显示字段）
const showUserList = computed(() => {
  let list = userDB.value.map(item => ({
    ...item,
    userId: item.adminId,
    username: item.adminId // 后端没有username字段，使用adminId显示
  }));

  // 前端过滤
  if (searchForm.adminId) {
    list = list.filter(item => item.adminId.includes(searchForm.adminId));
  }
  if (searchForm.phone) {
    list = list.filter(item => item.phone?.includes(searchForm.phone));
  }

  return list;
});

// 页面挂载时初始化 - 加载数据
onMounted(() => {
  loadUserList();
});

// 加载用户列表
const loadUserList = async () => {
  loading.value = true;
  try {
    const response = await getUserList();
    if (response.code === 200 && response.data) {
      userDB.value = Array.isArray(response.data) ? response.data : [];
      pagination.total = userDB.value.length;
    }
  } catch (error) {
    ElMessage.error('加载用户列表失败');
  } finally {
    loading.value = false;
  }
};

// 查询功能
const handleSearch = () => {
  pagination.currentPage = 1;
  // 前端过滤，无需重新请求
};

// 新增用户
const handleAdd = () => {
  isAdd.value = true;
  dialogVisible.value = true;
  formRef.value?.resetFields();
  Object.assign(form, {
    adminId: '',
    password: '',
    phone: '',
    status: '1'
  });
};

// 编辑用户
const handleEdit = (row: User) => {
  isAdd.value = false;
  dialogVisible.value = true;
  Object.assign(form, {
    adminId: row.adminId || row.userId,
    password: '', // 编辑时不回显密码
    phone: row.phone || '',
    status: row.status
  });
};

// 删除用户
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该用户吗？',
      '删除确认',
      { type: 'warning', confirmButtonText: '确定', cancelButtonText: '取消' }
    );
    const adminId = row.adminId || row.userId;
    if (!adminId) {
      ElMessage.error('无法获取用户ID');
      return;
    }
    const response = await deleteUser(adminId.toString());
    if (response.code === 200) {
      ElMessage.success(response.msg || '用户删除成功！');
      loadUserList();
    }
  } catch (error: any) {
    if (error.message !== '已取消删除') {
      ElMessage.error(error.message || '删除失败');
    }
  }
};

// 状态快速切换
const handleStatusChange = async (row: User) => {
  try {
    const adminId = row.adminId || row.userId;
    if (!adminId) {
      ElMessage.error('无法获取用户ID');
      return;
    }
    const response = await updateUser(adminId.toString(), {
      status: row.status
    });
    if (response.code === 200) {
      ElMessage.success(`用户状态已切换为：${row.status === '1' ? '启用' : '禁用'}`);
      loadUserList();
    }
  } catch (error: any) {
    ElMessage.error(error.message || '状态切换失败');
    // 恢复原状态
    loadUserList();
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (!valid) return;

  try {
    if (isAdd.value) {
      const response = await addUser(form);
      if (response.code === 200) {
        ElMessage.success(response.msg || '用户新增成功！');
        dialogVisible.value = false;
        loadUserList();
      }
    } else {
      const adminId = form.adminId;
      if (!adminId) {
        ElMessage.error('无法获取用户ID');
        return;
      }
      // 编辑时，如果不修改密码，则不传递password字段
      const updateData: any = {
        phone: form.phone,
        status: form.status
      };
      if (form.password) {
        updateData.password = form.password;
      }
      const response = await updateUser(adminId.toString(), updateData);
      if (response.code === 200) {
        ElMessage.success(response.msg || '用户编辑成功！');
        dialogVisible.value = false;
        loadUserList();
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
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
};
</script>

<style scoped>
.user-manager-container {
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