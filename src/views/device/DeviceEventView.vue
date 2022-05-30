<template>
  <Panel class="device-event-view" @contextmenu="rightMenu">
    <template v-if="device" #header>
      使用信息统计及跟踪：{{ device.name }}
    </template>
    <DataTable :value="events" :paginator="true" class="p-datatable-sm"
               paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
               :rowsPerPageOptions="[10,20,50]" responsiveLayout="scroll"
               currentPageReportTemplate="第 {first} 到 {last} 项， 总数 {totalRecords}"
               :rows="pageSize" :total-records="pageTotal" :striped-rows="true"
               v-model:filters="filters" filterDisplay="row">
      <Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field"></Column>
      <Column header="事件类型" filter-field="type" :showFilterMenu="false">
        <template #body="s">
          {{ eventTypes[s.data.type] }}
        </template>
        <template #filter="{filterModel,filterCallback}">
          <MultiSelect ref="typeFilterMultiSelect" v-model="filterModel.value" @change="filterCallback()"
                       :options="eventTypeOptions" placeholder="任意">
            <template #value="slotProps">
              {{ slotProps.value?.length > 0 ? slotProps?.value?.map((e) => eventTypes[e]).join('，') : '任意' }}
            </template>
            <template #option="slotProps">
              {{ eventTypes[slotProps.option] }}
            </template>
          </MultiSelect>
        </template>
      </Column>
      <!--      <Column v-if="ifShowUsernameColumn" header="用户名" filter-field="username" :showFilterMenu="false">-->
      <!--        <template #body="{data}">-->
      <!--          <Chip v-if="data.type===eventTypeOptions[2]" icon="pi pi-user" :label="data.username"-->
      <!--                style="background-color: #3b82f6;color: #ffffff"/>-->
      <!--          <Chip v-else icon="pi pi-user" :label="data.username"/>-->
      <!--        </template>-->
      <!--      </Column>-->
      <Column header="事件详情">
        <template #body="{data}">
          <template v-if="data.type === eventTypeOptions[0]">
            <DeviceStatusCube :small="true" :device="device" :status="data.status"/>
          </template>
          <template v-else-if="data.type === eventTypeOptions[1]">
            <Chip icon="pi pi-user" :label="data.username" style="background-color: #3b82f6;color: #ffffff"/>
            操作类型：{{ data.operation_type }} 具体信息：{{ data.detail }}
          </template>
          <template v-else-if="data.type === eventTypeOptions[2]">
            <Chip icon="pi pi-user" :label="data.username" style="background-color: #3b82f6;color: #ffffff"/>
            {{ data.loginPurpose }}
          </template>
          <template v-else-if="data.type === eventTypeOptions[3]">
            <Chip icon="pi pi-user" :label="data.username"/>
            {{ data.workContents }}
          </template>
        </template>
      </Column>
      <Column header="操作时间">
        <template #body="s">
          {{ moment(s.data.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </Column>
    </DataTable>
  </Panel>
  <ContextMenu ref="menu" :model="menu" :global="false"/>
</template>

<script>
import Api from '@/api';
import DeviceStatusCube from '@/components/device/DeviceStatusCube';
import moment from 'moment';
import {FilterMatchMode} from 'primevue/api';

export default {
  name: 'DeviceEventView',
  components: {DeviceStatusCube},
  inject: ['setLoading'],
  data() {
    return {
      moment,
      deviceId: this.$route.params.id,
      device: null,
      pageNum: 1,
      pageSize: 20,
      pageTotal: 0,
      events: [],
      menu: [],
      filters: {
        'type': {value: null, matchMode: FilterMatchMode.IN},
        'username': {value: null, matchMode: FilterMatchMode.EQUALS},
      },
      eventTypes: {
        'device_event_status_change': '状态变更',
        'device_event_operation': '操作记录',
        'device_event_login': '用户登录',
        'device_event_logout': '用户注销',
      },
      eventTypeOptions: [
        'device_event_status_change',
        'device_event_operation',
        'device_event_login',
        'device_event_logout',
      ],
    };
  },
  computed: {
    ifShowUsernameColumn() {
      const modelValue = this.$refs.typeFilterMultiSelect?.modelValue;
      if (!(modelValue instanceof Array) || modelValue.length === 0) return false;
      for (const e of modelValue) {
        if ([this.eventTypeOptions[2], this.eventTypeOptions[3]].indexOf(e) === -1) return false;
      }
      return true;
    },
    columns() {
      const columns = [
        {field: 'id', header: 'ID'},
      ];
      // if (this.$refs.typeFilterMultiSelect?.modelValue?.length === 1) {
      //   const type = this.$refs.typeFilterMultiSelect.modelValue[0];
      //   switch (type) {
      //       // 状态变更
      //     case this.eventTypeOptions[0]:
      //       // columns.push()
      //       break;
      //   }
      // }
      return columns;
    },
  },
  methods: {
    refreshDevice() {
      this.setLoading(true, '检索设备');
      return Api.device.get(this.deviceId).then(res => {
        this.device = res.result;
      }).finally(() => {
        this.setLoading(false);
      });
    },
    refreshDeviceEvents() {
      this.setLoading(true, '检索设备操作记录');
      // this.infos = [];
      return Api.deviceEvent.get(this.deviceId).then(res => {
        this.events = res.result;
      }).finally(() => {
        this.setLoading(false);
      });
    },
    refreshAll() {
      return this.refreshDevice().then(() => {
        this.refreshDeviceEvents();
      });
    },
    rightMenu(e) {
      this.menu = [];
      this.menu.push({
        label: '刷新',
        command: this.refreshAll,
      });
      this.$refs.menu.show(e);
    },
  },
  mounted() {
    this.refreshAll();
  },
};
</script>

<style lang="scss">
.device-event-view {
  width: 100%;
  height: 100%;


  .p-multiselect {
    max-width: 250px;
  }
}
</style>