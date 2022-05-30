<template>
  <!--  <a-spin :spinning="loading" wrapperClassName="device-status-view">-->
  <div class="device-status-view">
    <div class="sidebar">
      <Tree :value="instSiteTree" selectionMode="single" v-model:selectionKeys="instSiteSelectedIdMap"
            scrollHeight="flex"></Tree>
    </div>
    <div class="status-panel" @contextmenu="rightMenu($event)">
      <device-status-cube v-for="d in deviceList" :key="d.uuid"
                          :status="deviceStatus[d.id]" :device="d"
                          @click="showDeviceDetail(d)"
                          @contextmenu="rightMenu($event,d)"/>
    </div>
  </div>
  <!--  </a-spin>-->
  <ContextMenu ref="deviceMenu" :model="deviceMenu" :global="false"/>
  <Dialog :modal="true" header="添加设备"
          v-model:visible="dialogSwitch_addDevice" content-class="add-device-dialog">
    <a-form @keydown.enter.prevent="submitAddDevice">
      <a-form-item label="安装场所">
        <TreeSelect v-model="deviceToAdd.installationSiteId" :options="instSiteTreeForAddDeviceDialog"
                    placeholder="选择安装场所"/>
      </a-form-item>
      <a-form-item label="设备名称">
        <InputText type="text" v-model="deviceToAdd.deviceName"/>
      </a-form-item>
      <a-form-item label="详细描述">
        <Textarea v-model="deviceToAdd.description"/>
      </a-form-item>
      <a-form-item label="连接密钥">
        <InputText type="text" v-model="deviceToAdd.secretKey"/>
      </a-form-item>
      <a-form-item style="text-align: center">
        <Button label="确定" @click="submitAddDevice" :loading="loading_submitAddDeviceButton"/>
      </a-form-item>
    </a-form>
  </Dialog>
  <Sidebar class="device-info-detail" v-model:visible="sidebarSwitch_deviceDetail" position="right"
           style="min-width: 500px">
    <p style="display: flex; justify-content: center;">
      <device-status-cube :status="deviceStatus && deviceStatus[deviceSelected.id] || 0x0000" :device="deviceSelected"/>
    </p>
    <div>
      <p>设备名称：{{ deviceSelected.name }}</p>
      <p>设备描述：{{ deviceSelected.description }}</p>
      <p class="device-info-uuid" v-tooltip="'点击复制'" @click="copyToClipboard(deviceSelected.uuid)">
        <span style="user-select: none">UUID：</span>{{ deviceSelected.uuid }}
      </p>
      <p class="device-info-secret-key" v-tooltip="'点击复制'" @click="copyToClipboard(deviceSelected.secretKey)">
        密钥：{{ deviceSelected.secretKey }}
      </p>
      <p>安装场所：{{ selectedDeviceInstSiteString }}</p>
      <p>创建时间：{{ selectedDeviceCreatedAt }}</p>
      <Fieldset legend="设备维护信息">
        <p v-if="deviceSelected.deviceInfo === null">暂无记录</p>
        <template v-else>
          <p>更新时间：{{ selectedDeviceInfoCreatedAt }}</p>
          <p>软件信息：{{ deviceSelected.deviceInfo?.softwareInfo }}</p>
          <p>硬件信息：{{ deviceSelected.deviceInfo?.hardwareInfo }}</p>
          <p>备注：{{ deviceSelected.deviceInfo?.remark }}</p>
        </template>
      </Fieldset>
    </div>
  </Sidebar>
  <Toast/>
</template>

<script>
import Api from '@/api';
import Tree from 'primevue/tree';
import DeviceStatusCube from '@/components/device/DeviceStatusCube';
// import ScrollPanel from 'primevue/scrollpanel'
import Button from 'primevue/button';
import ContextMenu from 'primevue/contextmenu';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import TreeSelect from 'primevue/treeselect';
import Sidebar from 'primevue/sidebar';
import Fieldset from 'primevue/fieldset';
import Toast from 'primevue/toast';
import moment from 'moment';
// import {inject} from 'vue'

export default {
  name: 'DeviceStatusView',
  components: {
    DeviceStatusCube,
    Tree,
    ContextMenu,
    Button,
    Dialog,
    InputText,
    Textarea,
    TreeSelect,
    Sidebar,
    Fieldset,
    Toast,
  },
  inject: ['setLoading'],
  data() {
    return {
      instSiteTree: [],
      instSiteSelectedIdMap: {0: true},
      deviceList: [],
      deviceStatus: {},
      deviceStatusRefreshHandle: undefined,

      /* 菜单 */

      deviceMenu: [],
      deviceMenuItem_Refresh: {label: '刷新', command: this.refreshAll},
      dialogSwitch_addDevice: false,
      deviceToAdd: {
        deviceName: '',
        description: '',
        secretKey: '',
        installationSiteId: '',
      },
      loading_submitAddDeviceButton: false,

      /* 侧边栏详情 */
      deviceSelected: null,
      sidebarSwitch_deviceDetail: false,
    };
  },
  computed: {
    instSiteTreeForAddDeviceDialog() {
      return this.instSiteTree.slice(1);
    },
    selectedDeviceInstSiteString() {
      let ret = '', a = this.deviceSelected.installationSite;
      while (a instanceof Object) {
        ret += a.name;
        a = a?.parentInstallationSite;
        if (a) {
          ret += '-';
        }
      }
      return ret;
    },
    selectedDeviceCreatedAt() {
      return moment(this.deviceSelected.createdAt).format('YYYY-MM-DD HH:mm:ss');
    },
    selectedDeviceInfoCreatedAt() {
      return moment(this.deviceSelected?.deviceInfo.createdAt).format('YYYY-MM-DD HH:mm:ss');
    },
  },
  methods: {
    wrapAsTreeNode(item) {
      item.key = item.id;
      item.label = item.name;
      // item.data = item.description
      // item.icon = 'pi pi-fw pi-home'
      const raw_children = item.subInstallationSites;
      if (!(raw_children instanceof Array) || raw_children.length < 1) {
        return item;
      }
      item.children = [];
      for (const c of raw_children) {
        item.children.push(this.wrapAsTreeNode(c));
      }
      return item;
    },
    refreshInstSiteTree() {
      this.setLoading(true, '加载安装场所树形目录');
      return Api.deviceInstallationSite.getTree().then(res => {
        // 转换格式
        this.instSiteTree = res.result;
        this.instSiteTree.unshift({id: 0, name: '所有设备', description: '所有设备'});
        for (const item of this.instSiteTree) {
          this.wrapAsTreeNode(item);
        }
      }).finally(() => {
        this.setLoading(false);
      });
    },
    refreshDeviceList() {
      this.setLoading(true, '加载设备列表');
      clearInterval(this.deviceStatusRefreshHandle);
      this.deviceList = [];
      const instSiteId = Object.getOwnPropertyNames(this.instSiteSelectedIdMap)[0];
      return Api.device.getList(instSiteId).then(res => {
        this.deviceList = res.result;
        if (this.deviceList.length < 1) {
          this.setLoading(false);
          return;
        }
        this.deviceStatusRefreshHandle = setInterval(() => {
          Api.device.getStatus(this.deviceList.map((e) => e.id)).then((res) => {
            this.deviceStatus = res.result;
          }).finally(() => {
            this.setLoading(false);
          });
        }, 1000);
      }).catch(() => this.setLoading(false)).finally(() => {
        // this.startLoading()
      });
    },
    refreshAll() {
      return Promise.all([this.refreshInstSiteTree().then(() => this.refreshDeviceList())]);
    },
    rightMenu(e, d) {
      this.deviceMenu = [];
      if (d && d.id > 0) {
        this.deviceMenu.push({
          label: '查看',
          items: [
            {
              label: '维护信息',
              command: () => {
                this.$router.push({path: `/device/info/${d.id}`});
              },
            },
            {
              label: '使用信息',
              command: () => {
                this.$router.push({path: `/device/event/${d.id}`});
              },
            },
            {
              label: '日志文件',
              command: () => {
                this.$router.push({path: `/device/log/${d.id}`});
              },
            },
          ],
        });
        this.deviceMenu.push({
          label: '配置',
          command: () => {
            this.$router.push({path: `/device/config/${d.id}`});
          },
        });
        this.deviceMenu.push({
          label: '实时数据',
          items: [
            {
              label: '温度',
              command: () => {
                this.$router.push({path: `/device/real-time/${d.id}/temperature`});
              },
            },
          ],
        });
        this.deviceMenu.push({
          separator: true,
        });
      }
      this.deviceMenu.push(this.deviceMenuItem_Refresh);
      this.deviceMenu.push({
        label: '添加设备',
        command: this.deviceMenuItem_addDevice,
      });
      this.$refs.deviceMenu.show(e);
    },
    deviceMenuItem_addDevice() {
      this.dialogSwitch_addDevice = true;
      this.$nextTick(() => {
        if (!this.instSiteSelectedIdMap[0]) {
          this.deviceToAdd.installationSiteId = this.instSiteSelectedIdMap;
        }
      });
    },
    submitAddDevice() {
      this.loading_submitAddDeviceButton = true;
      Api.device.add(
          this.deviceToAdd.deviceName,
          this.deviceToAdd.description,
          this.deviceToAdd.secretKey,
          Object.getOwnPropertyNames(this.deviceToAdd.installationSiteId)[0],
      ).then(() => {
        this.dialogSwitch_addDevice = false;
        this.refreshDeviceList().then(() => {
          this.$toast.add({severity: 'success', summary: '设备添加成功', life: 3000});
        });
        // 清空旧数据
        for (const key in this.deviceToAdd) {
          this.deviceToAdd[key] = '';
        }
      }).finally(() => {
        this.loading_submitAddDeviceButton = false;
      });
    },
    showDeviceDetail(device) {
      this.deviceSelected = device;
      this.$nextTick(() => {
        this.sidebarSwitch_deviceDetail = true;
      });
    },
    copyToClipboard(text) {
      navigator.clipboard.writeText(text).then(() => {
        this.$toast.add({severity: 'success', summary: '已复制到剪切板！', life: 2000});
      }).catch(() => {
        this.$confirm.require({
          message: text,
          header: '请手动复制：',
          rejectClass: 'hide-button',
          acceptLabel: '好的',
        });
      });
    },
  },
  watch: {
    instSiteSelectedIdMap() {
      // console.log(Object.getOwnPropertyNames(b))
      this.refreshDeviceList();
    },
  },
  mounted() {
    this.refreshAll();
  },
  unmounted() {
    clearInterval(this.deviceStatusRefreshHandle);
  },
};
</script>

<style lang="scss">
.device-status-view {
  width: 100%;
  height: 100%;
  display: flex;

  //.outer {
  //  width: 100%;
  //  height: 100%;
  //}

  .sidebar {
    width: fit-content;
    min-width: 256px;
    height: 100%;
    //overflow-y: scroll;
  }

  .status-panel {
    height: 100%;
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;

    .device-status-cube {
      margin: 10px;
    }
  }

}

.device-info-detail {
  .device-info-uuid, .device-info-secret-key {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    user-select: none;

    &:hover {
      background-color: #eee;
    }

    &:active {
      background-color: #ddd;
    }
  }
}

.p-dialog .p-dialog-footer .hide-button {
  display: none;
}

.add-device-dialog {
  min-width: 600px;

  .p-inputtext {
    width: 100%;
  }
}
</style>