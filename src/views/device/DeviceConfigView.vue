<template>
  <Panel class="device-config-view" @contextmenu="rightMenu">
    <template #header>
      <div style="display: flex; align-items: center;">
        <span v-if="device">配置管理：{{ device.name }}</span>
        <Divider layout="vertical"/>
        <span v-if="deviceConfig">更新时间：{{ formatDeviceConfigTime }}</span>
        <Divider layout="vertical"/>
        <span v-if="deviceConfig" v-tooltip="'设备配置发生变化时将会存储至数据库，索引递增'">
          数据库索引：{{ deviceConfig.id }}
        </span>
        <Divider layout="vertical"/>
        <Button class="p-button-sm p-button-outlined" @click="refreshDeviceConfig">拉取最新配置</Button>
        <Divider layout="vertical"/>
        <Button class="p-button-sm" @click="exportConfig">导出</Button>
        <Divider layout="vertical"/>
      </div>
    </template>
    <template #icons>
      <div style="display: flex;">
        <FileUpload mode="basic" choose-label="导入" class="p-button-sm" :auto="true"
                    @select="selectFile" invalidFileSizeMessage="文件过大（限制{1}）"/>
        <Divider layout="vertical"/>
        <Button class="p-button-sm p-button-outlined p-button-danger" @click="issue">下发配置</Button>
        <Divider layout="vertical"/>
      </div>
    </template>
    <Codemirror
        v-if="deviceConfig"
        class="code-box"
        v-model:value="deviceConfig.content"
        @keydown.ctrl.s.prevent="exportConfig"
        :options="{
          mode: language, // Language mode
          theme: 'idea', // Theme
          lineNumbers: true, // Show line number
          smartIndent: true, // Smart indent
          indentUnit: 4, // The smart indent unit is 2 spaces in length
          foldGutter: true, // Code folding
          styleActiveLine: true, // Display the style of the selected row
        }"
        border
        placeholder=""
    />
  </Panel>
  <ContextMenu ref="menu" :model="menu" :global="false"/>
</template>

<script>
import Api from '@/api';
import ContextMenu from 'primevue/contextmenu';
import Button from 'primevue/button';
import Panel from 'primevue/panel';
import Divider from 'primevue/divider';
import moment from 'moment';
import Util from '@/util';

export default {
  name: 'DeviceConfigView',
  components: {ContextMenu, Panel, Divider, Button},
  inject: ['setLoading'],
  data() {
    return {
      deviceId: this.$route.params.id,
      device: null,
      deviceConfig: null,
      menu: [],
      moment,
    };
  },
  computed: {
    language() {
      return {
        'json': 'application/json',
        'xml': 'application/xml',
        'yaml': 'text/x-yaml',
      }[this.deviceConfig?.type] || '';
    },
    formatDeviceConfigTime() {
      return moment(this.deviceConfig?.updatedAt).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  methods: {
    refreshDeviceConfig() {
      this.setLoading(true, '等待设备上报配置信息');
      Api.device.get(this.deviceId).then(res => {
        this.device = res.result;
      }).then(() => {
        Api.deviceConfig.get(this.deviceId).then(res => {
          this.deviceConfig = res.result;
        });
      }).finally(() => {
        this.setLoading(false);
      });
    },
    rightMenu(e) {
      this.menu = [];
      this.menu.push({
        label: '刷新',
        command: () => {
          this.refreshDeviceConfig();
        },
      });
      this.menu.push({
        label: '下发',
        command: this.issue,
      });
      this.$refs.menu.show(e);
    },
    issue() {
      this.$confirm.require({
        message: `确定要下发配置到 ${this.device.name} 吗？`,
        header: '危险操作',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: '是的',
        acceptClass: 'p-button-danger',
        accept: () => {
          this.setLoading(true, '下发配置');
          Api.deviceConfig.set(this.deviceConfig.deviceId, this.deviceConfig.content).then(() => {
            this.$toast.add({severity: 'success', summary: '下发成功', detail: '请等待片刻手动拉取最新配置', life: 3000});
          }).finally(() => {
            this.setLoading(false);
          });
        },
        rejectLabel: '取消',
        reject: () => {
          //callback to execute when user rejects the action
        },
      });
    },
    selectFile(e) {
      this.setLoading(true, '读取配置文件');
      const file = e.files[0];
      console.log(file);
      if (file.size > 1000000) {
        this.$toast.add({severity: 'warning', summary: '文件过大（限制1MB）'});
        return;
      }
      const reader = new window.FileReader();
      reader.readAsText(file, 'UTF-8');
      reader.onload = (e) => {
        this.deviceConfig.content = e.target.result;
        this.setLoading(false);
      };
      reader.onerror = (e) => {
        this.setLoading(false);
        this.$toast.add({severity: 'error', summary: '读取文件失败'});
      };
    },
    exportConfig() {
      Util.download(`config.${this.deviceConfig.type}`, this.deviceConfig.content);
    },
  },
  mounted() {
    this.refreshDeviceConfig();
  },
};
</script>

<style lang="scss">
.device-config-view {
  width: 100%;
  height: 100%;


  .code-box {
    //width: 100%;
    //height: min-content;
    //flex: 1;
    font-size: 1.1em;
  }
}
</style>