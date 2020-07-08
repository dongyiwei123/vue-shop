<template>
  <div class="user">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 搜索添加 -->
      <el-row :gutter="20">
        <el-col :span="5">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-button type="primary" @click="dialogVisible=true">添加</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template v-slot="{row}">
            <el-switch
              v-model="row.mg_state"
              active-color="#13ce66"
              inactive-color="#ff4949"
              @change="userStateChange(row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template v-slot="{row}">
            <!-- 修改 -->
            <el-button type="primary" icon="el-icon-edit" @click="showEdit(row.id)"></el-button>
            <!-- 删除 -->
            <el-button type="danger" icon="el-icon-delete" @click="removeUser(row.id)"></el-button>
            <!-- 分配角色 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button type="warning" icon="el-icon-share" @click="showRole(row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="dialogVisible" width="50%" @close="close">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户资料" :visible.sync="editDialogVisible" width="50%" @close="editClose">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色 -->
    <el-dialog title="分配角色" :visible.sync="userDialogVisible" width="50%" @close="closeRightsForm">
      <p>当前用户:{{userInfo.username}}</p>
      <p>当前角色:{{userInfo.role_name}}</p>
      <p>
        分配角色:
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in roleList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="userDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 每页显示数据
        pagesize: 2
      },
      userList: [],
      total: 5,
      // 添加对话框显示隐藏
      dialogVisible: false,
      // 修改对话框显示
      editDialogVisible: false,
      // 分配角色
      userDialogVisible: false,
      userInfo: {},
      roleList: [],
      // 选中id值
      selectedRoleId: '',
      // 添加用户对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加验证规则
      addFormRules: {
        username: [
          {
            required: true,
            message: '请填写用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '3-10位',
            trigger: 'blur'
          }
        ],
        password: [
          {
            required: true,
            message: '请填写密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '6-15位',
            trigger: 'blur'
          }
        ],
        email: [
          {
            required: true,
            message: '请填写邮箱',
            trigger: 'blur'
          },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          {
            required: true,
            message: '请填写手机号',
            trigger: 'blur'
          },
          {
            pattern: /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0-35-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|6[2567]\d{2}|4(?:(?:10|4[01])\d{3}|[68]\d{4}|[579]\d{2}))\d{6}$/,
            message: '请输入正确手机号',
            trigger: 'blur'
          }
        ]
      },
      // 修改
      editForm: {},
      editRules: {
        email: [
          {
            required: true,
            message: '请填写邮箱',
            trigger: 'blur'
          },
          {
            type: 'email',
            message: '请输入正确的邮箱地址',
            trigger: ['blur', 'change']
          }
        ],
        mobile: [
          {
            required: true,
            message: '请填写手机号',
            trigger: 'blur'
          },
          {
            pattern: /^(?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0-35-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0-35-9]\d{2}|6[2567]\d{2}|4(?:(?:10|4[01])\d{3}|[68]\d{4}|[579]\d{2}))\d{6}$/,
            message: '请输入正确手机号',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const res = await this.$http.get('users',
        { params: this.queryInfo })
      const { data, meta } = res.data
      if (meta.status !== 200) return this.$message.error(meta.msg)
      this.userList = data.users
      this.total = data.total
      // console.log(this.userList)
    },
    handleSizeChange(newSize) {
      // console.log(newSize)
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    handleCurrentChange(newPage) {
      // console.log(newPage)
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    async userStateChange(userInfo) {
      const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)

      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('更新失败')
      }
      return this.$message.success('更新成功')
    },
    // 添加表单关闭后,清空表单
    close() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // console.log(valid)
        if (!valid) return
        // 发送请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('用户添加失败')
        this.$message.success('用户添加成功')
        this.dialogVisible = false
        this.getUserList()
      })
    },
    // 修改用户
    // 显示
    async showEdit(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`users/${id}`)
      console.log(res)
      const { data, meta } = res
      if (meta.status === 200) {
        this.editForm = data
      }
    },
    // 修改表单关闭后,清空表单
    editClose() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`users/${this.editForm.id}`, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('用户修改失败')
        this.editDialogVisible = false
        this.getUserList()
        this.$message.success('用户修改成功')
      })
    },
    // 移除用户
    async  removeUser(id) {
      try {
        await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$http.delete(`users/${id}`)
        this.getUserList()
        this.$message.success('删除成功')
      } catch {
        this.$message.success('删除失败')
      }
    },
    // 显示分配角色框
    async showRole(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) return this.$message.error('用户获取失败')
      this.roleList = res.data
      this.userDialogVisible = true
    },
    // 点击分配
    async  saveRoleInfo() {
      if (!this.selectedRoleId) {
        return this.$message.error('请选择要分配角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if (res.meta.status !== 200) return this.$message.error('角色更新失败')
      this.$message.success('角色更新成功')
      this.getUserList()
      this.userDialogVisible = false
    },
    closeRightsForm() {
      this.roleList = []
      this.selectedRoleId = ''
    }
  }
}
</script>

<style>
</style>
