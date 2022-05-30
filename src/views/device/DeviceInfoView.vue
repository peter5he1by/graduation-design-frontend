<template>
  <Panel class="device-info-view" @contextmenu="rightMenu">
    <template v-if="device" #header>
      设备维护信息：{{ device.name }}
    </template>
    <DataTable :value="infos" :paginator="true" class="p-datatable-sm"
               paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
               :rowsPerPageOptions="[10,20,50]" responsiveLayout="scroll"
               currentPageReportTemplate="第 {first} 到 {last} 项， 总数 {totalRecords}"
               :rows="pageSize" :total-records="pageTotal" :striped-rows="true">
      <Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field"></Column>
      <Column header="更新时间">
        <template #body="s">
          {{ moment(s.data.updatedAt).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </Column>
    </DataTable>
  </Panel>
  <ContextMenu ref="menu" :model="menu" :global="false"/>
</template>

<script>
import Api from '@/api';
import moment from 'moment';

export default {
  name: 'DeviceInfoView',
  inject: ['setLoading'],
  data() {
    return {
      moment,
      deviceId: this.$route.params.id,
      device: null,
      pageNum: 1,
      pageSize: 20,
      pageTotal: 0,
      infos: [],
      columns: [
        {field: 'id', header: 'ID'},
        {field: 'softwareInfo', header: '软件信息'},
        {field: 'hardwareInfo', header: '硬件信息'},
        {field: 'remark', header: '备注'},
      ],
      menu: [],
    };
  },
  methods: {
    refreshDevice() {
      this.setLoading(true);
      return Api.device.get(this.deviceId).then(res => {
        this.device = res.result;
      }).finally(() => {
        this.setLoading(false);
      });
    },
    refreshDeviceInfo() {
      this.setLoading(true);
      // this.infos = [];
      return Api.deviceInfo.get(this.deviceId, this.pageNum, this.pageSize).then(res => {
        const ret = res.result;
        // this.pageNum = ret.pageNum;
        // this.pageSize = ret.pageSize;
        // this.total = ret.total;
        this.infos = ret.infos;
      }).finally(() => {
        this.setLoading(false);
      });
    },
    rightMenu(e) {
      this.menu = [];
      this.menu.push({
        label: '刷新',
        command: () => {
          this.refreshDeviceInfo();
        },
      });
      this.$refs.menu.show(e);
    },
  },
  mounted() {
    this.refreshDevice().then(() => {
      this.refreshDeviceInfo();
    });
  },
};
</script>

<style lang="scss">
.device-info-view {
  width: 100%;
  height: 100%;
}
</style>