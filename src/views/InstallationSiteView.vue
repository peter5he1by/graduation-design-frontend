<template>
  <a-spin :spinning="loading" wrapperClassName="location-view">
    <vue3-tree-org :data="tree"
                   :clone-node-drag="false" :only-one-node="false" :node-draggable="true"
                   @contextmenu="(e)=>{rightMenu(e);this.$refs.locationMenu.show(e)}">
      <template v-slot="{node}">
        <Button :class="{'p-button-success':selected === node}" :label="node.name" @click="select(node)"
                @contextmenu="(e)=>{rightMenu(e,node);this.$refs.locationMenu.show(e)}"/>
      </template>
    </vue3-tree-org>
  </a-spin>
  <ContextMenu ref="locationMenu" :model="menu" :global="true"/>
  <!-- 添加下级场所对话框 -->
  <Dialog :modal="true" :header="`为“${toOperate?.name}”添加下级场所`"
          v-model:visible="dialogSwitch_addSub" content-class="add-sub-location-dialog">
    <a-form @keydown.enter="submitAddSub">
      <a-form-item label="上级场所">
        <InputText type="text" v-model="toOperate.name" disabled/>
      </a-form-item>
      <a-form-item label="场所名称">
        <InputText type="text" v-model="toAdd.name"/>
      </a-form-item>
      <a-form-item label="详细描述">
        <Textarea v-model="toAdd.description"/>
      </a-form-item>
      <a-form-item style="text-align: center">
        <Button label="确定" @click="submitAddSub" :loading="loading_submitAddSubButton"/>
      </a-form-item>
    </a-form>
  </Dialog>
  <!-- 编辑对话框 -->
  <Dialog :modal="true" :header="`编辑“${toOperate?.name}”`"
          v-model:visible="dialogSwitch_edit" content-class="add-sub-location-dialog">
    <a-form @keydown.enter="submitEditSub">
      <a-form-item label="场所名称">
        <InputText type="text" v-model="editResult.name"/>
      </a-form-item>
      <a-form-item label="详细描述">
        <Textarea v-model="editResult.description"/>
      </a-form-item>
      <a-form-item style="text-align: center">
        <Button label="确定" @click="submitEditSub" :loading="loading_submitEditSubButton"/>
      </a-form-item>
    </a-form>
  </Dialog>
</template>

<script>

import Api from '@/api';
import Button from 'primevue/button';
import ContextMenu from 'primevue/contextmenu';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import {notification} from 'ant-design-vue';

export default {
  name: 'InstallationSiteView',
  components: {Button, ContextMenu, Dialog, InputText, Textarea},
  data() {
    return {
      loading: true,
      tree: {id: null, name: '根', description: '这是根节点，没有意义', subInstallationSites: []},

      /* 菜单 */

      selected: null,
      menu: [],
      menuItem_refresh: {
        label: '刷新',
        command: this.refreshTreeAndMenu,
      },
      menuItem_setParent: [],

      /* 添加 */

      dialogSwitch_addSub: false,
      toOperate: null,
      toAdd: {
        name: '',
        description: '',
      },
      loading_submitAddSubButton: false,

      /* 编辑 */

      dialogSwitch_edit: false,
      editResult: {
        name: '',
        description: '',
      },
      loading_submitEditSubButton: false,

    };
  },
  methods: {
    /**
     * 包装installationSite树形结构以使其对tree组件可读
     * @param site
     * @returns {*}
     */
    wrapAsTreeNode(site) {
      site.label = site.name;
      site.children = site.subInstallationSites;
      if (!(site.children instanceof Array) || site.children.length < 1) {
        return site;
      }
      const raw_children = site.children;
      site.children = [];
      for (const c of raw_children) {
        site.children.push(this.wrapAsTreeNode(c));
      }
      return site;
    },
    /**
     * 包装installationSite成菜单项
     * @param site
     * @param func
     * @returns {*}
     */
    wrapAsMenuItem(site, func) {
      site.label = site.name;
      site.key = site.id;
      if (func !== undefined) {
        site.command = func;
      }
      const raw_items = site.subInstallationSites;
      if (!(raw_items instanceof Array) || raw_items.length < 1) {
        return site;
      }
      site.items = [];
      for (const c of raw_items) {
        site.items.push(this.wrapAsMenuItem(c, func));
      }
      return site;
    },
    refreshTree() {
      return Api.deviceInstallationSite.getTree().then(res => {
        // 转换格式
        this.tree.subInstallationSites = res.result;
        this.tree = this.wrapAsTreeNode(this.tree);
      });
    },
    refreshMenu() {
      return Api.deviceInstallationSite.getTree().then(res => {
        // 更新树形菜单
        const t = [
          {id: 0, name: '根', description: '这是根节点，没有意义', subInstallationSites: res.result},
        ];
        this.wrapAsMenuItem(t[0], this.menuCommand_setParent);
        this.menuItem_setParent = t;
      });
    },
    refreshTreeAndMenu() {
      this.loading = true;
      return Promise.all([this.refreshTree(), this.refreshMenu()]).finally(() => {
        this.loading = false;
      });
    },
    select(node) {
      if (node?.id !== 0) {
        this.selected = node;
      }
    },
    rightMenu(e, node) {
      this.menu = [];
      this.menu.push(this.menuItem_refresh);
      // 选中了节点才显示该菜单项
      if (node && node?.id !== 0) {
        this.selected = node;
        this.toOperate = node;
        this.menu.push({
          separator: true,
        });
        this.menu.push({
          label: node.name,
          disabled: true,
        });
        this.menu.push({
          label: '编辑',
          command: this.menuCommand_EditLocation,
        });
        this.menu.push({
          label: '变更上级场所', // 牛
          items: this.menuItem_setParent,
        });
        this.menu.push({
          label: '添加下级场所',
          command: this.menuCommand_addSub,
        });
        this.menu.push({
          label: '删除场所',
          command: this.menuCommand_DeleteLocation,
        });
      } else {
        this.toOperate = this.tree; // root
        this.menu.push({
          label: '添加场所',
          command: this.menuCommand_addSub,
        });
      }
    },
    menuCommand_setParent(e) {
      console.log(this.selected.id, '->', e.item.id);
      // TODO loading
      Api.deviceInstallationSite.setParent(
          this.selected.id,
          e.item.id,
      ).then(() => {
        this.refreshTreeAndMenu().then(() => {
          notification.success({message: '移动完毕'});
        });
      }).finally(() => {
        this.$refs.locationMenu.hide();
      });
    },
    menuCommand_addSub() {
      this.dialogSwitch_addSub = true;
    },
    submitAddSub() {
      this.loading_submitAddSubButton = true;
      Api.deviceInstallationSite.add(
          this.toOperate.id,
          this.toAdd.name,
          this.toAdd.description,
      ).then(() => {
        // 200 关闭对话框
        this.dialogSwitch_addSub = false;
        this.refreshTreeAndMenu().then(() => {
          notification.success({message: '添加成功'});
        });
        // 清空旧数据
        for (const key in this.toAdd) {
          delete this.toAdd[key];
        }
      }).finally(() => {
        this.loading_submitAddSubButton = false;
      });
    },
    menuCommand_DeleteLocation() {
      console.log(123);
      this.$confirm.require({
        message: `确认删除场所“${this.toOperate.name}”？`,
        header: '确认',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: '确认',
        acceptClass: 'p-button-danger',
        rejectLabel: '取消',
        accept: () => {
          return Api.deviceInstallationSite.delete(this.toOperate.id).then(() => {
            this.refreshTreeAndMenu().then(() => {
              notification.success({message: '场所已删除'});
            });
          });
        },
        reject: () => {
        },
      });
    },
    menuCommand_EditLocation() {
      this.editResult.name = this.toOperate.name;
      this.editResult.description = this.toOperate.description;
      this.dialogSwitch_edit = true;
    },
    submitEditSub() {
      this.loading_submitEditSubButton = true;
      Api.deviceInstallationSite.edit(
          this.toOperate.id,
          this.editResult.name,
          this.editResult.description,
      ).then(() => {
        this.dialogSwitch_edit = false;
        this.refreshTreeAndMenu().then(() => {
          notification.success({message: '修改完毕'});
        });
      }).finally(() => {
        this.loading_submitEditSubButton = false;
        // 清空旧数据
        for (const key in this.editResult) {
          this.editResult[key] = undefined;
        }
      });
    },
  },
  mounted() {
    this.refreshTreeAndMenu();
  },
};
</script>

<style lang="scss">
.location-view {
  width: 100%;
  height: 100%;

  // 加载遮罩
  .ant-spin-container {
    width: 100%;
    height: 100%;
  }
}

.add-sub-location-dialog {
  min-width: 600px;

  .p-inputtext {
    width: 100%;
  }
}
</style>