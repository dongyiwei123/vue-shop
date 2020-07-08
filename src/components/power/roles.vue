<template>
  <div class="roles">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAdd">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="roleList" border :stripe="true">
        <!-- 展开列 -->
        <el-table-column type="expand" v-slot="{row}">
          <el-row v-for="(item1) in row.children" :key="item1.id" class="bdBottom vcenter">
            <!-- 一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="removeRolesRights(row,item1.id)">{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 二级,三级权限 -->
            <el-col :span="19">
              <el-row
                v-for="(item2,i2) in item1.children"
                :key="item2.id"
                :class="{bdTop:i2!==0}"
                class="vcenter"
              >
                <!-- 左边列 -->
                <el-col :span="6">
                  <el-tag
                    type="success"
                    closable
                    @close="removeRolesRights(row,item2.id)"
                  >{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <!-- 右边列 -->
                <el-col :span="18">
                  <el-tag
                    type="warning"
                    v-for="(item3) in item2.children"
                    :key="item3.id"
                    closable
                    @close="removeRolesRights(row,item3.id)"
                  >{{item3.authName}}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="{row}">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEdit(row.id)">编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="showDelete(row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRight(row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%" @close="closeAddForm">
      <el-form ref="addformRef" :model="addForm" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="getAddFromList">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑框 -->
    <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="closeEditForm">
      <el-form ref="editformRef" :model="editForm" :rules="rules" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="getEditFromList">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 赋予权限 -->
    <el-dialog
      title="赋予权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="closeRightsForm"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    return {
      roleList: [],
      // 添加
      addDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改
      editDialogVisible: false,
      editForm: {
        roleName: '',
        roleDesc: ''
      },
      // 赋予权限
      setRightDialogVisible: false,
      rightsList: [],
      // tree
      treeProps: {
        children: 'children',
        label: 'authName'
      },
      // tree显示id
      defKeys: [],
      // 分配角色id
      roleId: '',
      rules: {
        roleName: [
          {
            required: true,
            message: '请填写角色名称',
            trigger: 'blur'
          },
          {
            min: 2,
            max: 10,
            message: '3-10位',
            trigger: 'blur'
          }
        ],
        roleDesc: [
          {
            required: true,
            message: '请填写角色描述',
            trigger: 'blur'
          },
          {
            max: 15,
            message: '6-15位',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.roleList = res.data
    },
    // 添加
    showAdd() {
      this.addDialogVisible = true
    },
    getAddFromList() {
      this.$refs.addformRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('roles', {
          roleName: this.addForm.roleName,
          roleDesc: this.addForm.roleDesc
        })
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.getRoleList()
        this.addDialogVisible = false
        this.$message.success('添加角色成功')
      }
      )
    },
    closeAddForm() {
      this.$refs.addformRef.resetFields()
    },
    // 修改
    async showEdit(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败')
      this.editForm = res.data
    },
    getEditFromList() {
      this.$refs.editformRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, {
          roleName: this.editForm.roleName,
          roleDesc: this.editForm.roleDesc
        })
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('用户修改失败')
        this.editDialogVisible = false
        this.getRoleList()
        this.$message.success('用户修改成功')
      })
    },
    closeEditForm() {
      this.$refs.editformRef.resetFields()
    },
    // 删除
    async showDelete(id) {
      try {
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        await this.$http.delete(`roles/${id}`)
        this.$message.success('删除成功')
        this.getRoleList()
      } catch {
        this.$message.success('取消删除')
      }
    },
    // 删除权限
    async removeRolesRights(role, rightId) {
      try {
        await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        this.$message.success('删除成功')
        role.children = res.data
      } catch {
        this.$message.success('取消删除')
      }
    },
    // 显示赋予权限框
    async showSetRight(role) {
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rightsList = res.data
      this.roleId = role.id
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 获取三级id
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafKeys(item, arr))
    },
    closeRightsForm() {
      this.defKeys = []
    },
    // 分配权限
    async  allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败')
      this.$message.success('分配权限成功')
      this.getRoleList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdTop {
  border-top: 1px solid #eee;
}
.bdBottom {
  &:first-child {
    border-top: 1px solid #eee;
  }
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
