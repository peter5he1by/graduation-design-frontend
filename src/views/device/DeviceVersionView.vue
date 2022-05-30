<template>
  <Panel class="device-version-view" @contextmenu="rightMenu">
    <template #header>
      软件版本管理
    </template>
    <template #icons>
      <Button @click="addVersion">添加</Button>
    </template>
    <DataTable :value="versions" :paginator="true" class="p-datatable-sm"
               paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
               :rowsPerPageOptions="[10,20,50]" responsiveLayout="scroll"
               currentPageReportTemplate="第 {first} 到 {last} 项， 总数 {totalRecords}"
               :rows="pageSize" :total-records="pageTotal" :striped-rows="true">
      <Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field"></Column>
      <Column header="记录时间">
        <template #body="s">
          {{ moment(s.data.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </Column>
      <Column header="更新时间">
        <template #body="s">
          {{ moment(s.data.updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </Column>
      <Column header="操作">
        <template #body="{data}">
          <Button @click="editVersion(data)" label="编辑" class="p-button-sm"/>
        </template>
      </Column>
    </DataTable>
  </Panel>
  <ContextMenu ref="menu" :model="menu" :global="false"/>
  <Dialog :modal="true" header="添加新版本"
          v-model:visible="dialogSwitch_addVersion" content-class="add-version-dialog">
    <a-form @keydown.enter="submitAddVersion">
      <a-form-item label="代号">
        <InputText type="text" v-model="versionToAdd.codeName"/>
      </a-form-item>
      <a-form-item label="内部版本">
        <InputText type="number" v-model="versionToAdd.internalVersion"/>
      </a-form-item>
      <a-form-item label="外部版本">
        <InputText v-model="versionToAdd.externalVersion"/>
      </a-form-item>
      <a-form-item label="文件下载链接">
        <Textarea type="text" v-model="versionToAdd.fileUrl"/>
      </a-form-item>
      <a-form-item label="文件校验值">
        <Textarea type="text" v-model="versionToAdd.hashValue"/>
      </a-form-item>
      <a-form-item style="text-align: center">
        <Button label="确定" @click="submitAddVersion" :loading="loading_submitAddVersion"/>
      </a-form-item>
    </a-form>
  </Dialog>
  <Dialog :modal="true" header="修改版本信息"
          v-model:visible="dialogSwitch_editVersion" content-class="add-version-dialog">
    <a-form @keydown.enter="submitAddVersion">
      <a-form-item label="代号">
        <InputText type="text" v-model="versionToEdit.codeName"/>
      </a-form-item>
      <a-form-item label="内部版本">
        <InputText type="number" v-model="versionToEdit.internalVersion"/>
      </a-form-item>
      <a-form-item label="外部版本">
        <InputText v-model="versionToEdit.externalVersion"/>
      </a-form-item>
      <a-form-item label="文件下载链接">
        <Textarea type="text" v-model="versionToEdit.fileUrl"/>
      </a-form-item>
      <a-form-item label="文件校验值">
        <Textarea type="text" v-model="versionToEdit.hashValue"/>
      </a-form-item>
      <a-form-item style="text-align: center">
        <Button label="确定" @click="submitEditVersion" :loading="loading_submitEditVersion"/>
      </a-form-item>
    </a-form>
  </Dialog>
</template>

<script>
import Api from '@/api';
import moment from 'moment';

export default {
  name: 'DeviceVersionView',
  inject: ['setLoading'],
  data() {
    return {
      moment,
      pageNum: 1,
      pageSize: 20,
      pageTotal: 0,
      versions: [],
      columns: [
        {field: 'id', header: 'ID'},
        {field: 'codeName', header: '代号'},
        {field: 'internalVersion', header: '内部版本'},
        {field: 'externalVersion', header: '外部版本'},
        {field: 'fileUrl', header: '文件下载链接'},
        {field: 'hashValue', header: '文件校验值'},
      ],
      menu: [],
      versionToAdd: {
        codeName: undefined,
        internalVersion: undefined,
        externalVersion: undefined,
        fileUrl: undefined,
        hashValue: undefined,
      },
      versionToEdit: {},
      dialogSwitch_addVersion: false,
      dialogSwitch_editVersion: false,
      loading_submitAddVersion: false,
      loading_submitEditVersion: false,
    };
  },
  methods: {
    refreshVersions() {
      this.setLoading(true, '加载软件版本信息');
      return Api.deviceVersion.getList().then(res => {
        this.versions = res.result;
      }).finally(() => {
        this.setLoading(false);
      });
    },
    rightMenu(e) {
      this.menu = [];
      this.menu.push({
        label: '刷新',
        command: () => {
          this.refreshVersions();
        },
      });
      this.$refs.menu.show(e);
    },
    addVersion() {
      this.dialogSwitch_addVersion = true;
    },
    submitAddVersion() {
      this.loading_submitAddVersion = true;
      const {codeName, internalVersion, externalVersion, fileUrl, hashValue} = this.versionToAdd;
      Api.deviceVersion.add(
          codeName, internalVersion, externalVersion, fileUrl, hashValue,
      ).then((res) => {
        this.$toast.add({severity: 'success', summary: '版本已添加', life: 3000});
        for (const key in this.versionToAdd) {
          this.versionToAdd[key] = undefined;
        }
        this.dialogSwitch_addVersion = false;
      }).finally(() => {
        this.loading_submitAddVersion = false;
      });
    },
    editVersion(v) {
      this.versionToEdit = v;
      this.dialogSwitch_editVersion = true;
    },
    submitEditVersion() {
      this.loading_submitEditVersion = true;
      const {id, codeName, internalVersion, externalVersion, fileUrl, hashValue} = this.versionToEdit;
      Api.deviceVersion.edit(
          id, codeName, internalVersion, externalVersion, fileUrl, hashValue,
      ).then((res) => {
        this.$toast.add({severity: 'success', summary: '版本信息已修改', life: 3000});
        this.dialogSwitch_editVersion = false;
      }).finally(() => {
        this.loading_submitEditVersion = false;
      });
    },
  },
  mounted() {
    this.refreshVersions();
  },
};
</script>

<style lang="scss">
.device-version-view {
  width: 100%;
  height: 100%;
}

.add-version-dialog {
  min-width: 600px;

  .p-inputtext {
    width: 100%;
  }
}
</style>