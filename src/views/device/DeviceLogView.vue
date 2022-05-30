<template>
  <Panel class="device-log-view" @contextmenu="rightMenu">
    <template v-if="device" #header>
      设备日志：{{ device.name }}
    </template>
    <DataTable :value="logs" :paginator="true" class="p-datatable-sm"
               paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
               :rowsPerPageOptions="[10,20,50]" responsiveLayout="scroll"
               currentPageReportTemplate="第 {first} 到 {last} 项， 总数 {totalRecords}"
               :rows="pageSize" :total-records="pageTotal" :striped-rows="true">
      <Column v-for="col of columns" :field="col.field" :header="col.header" :key="col.field"></Column>
      <Column header="起始时间">
        <template #body="s">
          {{ moment(s.data.startTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </Column>
      <Column header="截止时间">
        <template #body="s">
          {{ moment(s.data.endTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </Column>
      <Column header="上传时间">
        <template #body="s">
          {{ moment(s.data.createdAt).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </Column>
      <Column header="详情">
        <template #body="{data}">
          <Button @click="readContent(data)" label="查看" class="p-button-sm"/>
        </template>
      </Column>
    </DataTable>
  </Panel>
  <ContextMenu ref="menu" :model="menu" :global="false"/>
  <Dialog :modal="true" v-model:visible="dialogSwitch_logView" class="view-log-dialog">
    <template #header>
      <div style="display: flex; justify-content: space-between; width: 100%; padding: 0 20px 0 0">
        <div>{{ '设备日志查看：' + device?.name }}</div>
        <div style="display: flex;">
          <a :href="logDownloadLink" target="_self">下载日志 ( {{ logSizeReadable }} )</a>
          <div style="width: 20px;"></div>
          <div>
            <Checkbox v-model="optWrapLines" :binary="true"/>
            折行
          </div>
        </div>
      </div>
    </template>
    <Codemirror
        ref="logBox"
        class="code-box"
        v-model:value="logContent"
        :options="{
          mode: 'log', // Language mode
          theme: 'idea', // Theme
          lineNumbers: true, // Show line number
          smartIndent: true, // Smart indent
          indentUnit: 4, // The smart indent unit is 2 spaces in length
          foldGutter: true, // Code folding
          styleActiveLine: true, // Display the style of the selected row
          lineWrapping: optWrapLines
        }"
        :KeepCursorInEnd="keepCursorInEnd"
        border
        placeholder=""
    />
  </Dialog>
</template>

<script>
import Api from '@/api';
import {formatBytes} from '@/util';
import moment from 'moment';

export default {
  name: 'DeviceLogView',
  inject: ['setLoading'],
  data() {
    return {
      moment,
      deviceId: this.$route.params.id,
      device: null,
      pageNum: 1,
      pageSize: 20,
      pageTotal: 0,
      logs: [],
      columns: [
        {field: 'id', header: 'ID'},
      ],
      menu: [],
      dialogSwitch_logView: false,
      logContent: '',
      logSize: 0,
      logDownloadLink: '',
      keepCursorInEnd: false,
      optWrapLines: false,
    };
  },
  computed: {
    logSizeReadable() {
      return formatBytes(this.logSize);
    },
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
    refreshDeviceLog() {
      this.setLoading(true, '加载设备日志');
      return Api.deviceLog.getList(this.deviceId).then(res => {
        this.logs = res.result;
        this.keepCursorInEnd = false;
      }).finally(() => {
        this.setLoading(false);
      });
    },
    rightMenu(e) {
      this.menu = [];
      this.menu.push({
        label: '刷新',
        command: () => {
          this.refreshDeviceLog();
        },
      });
      this.$refs.menu.show(e);
    },
    readContent(log) {
      this.dialogSwitch_logView = true;
      this.setLoading(true, '载入日志内容');
      Api.deviceLog.getContent(log.id).then((res => {
        this.logContent = res.result.content;
        this.logSize = res.result.size;
        this.logDownloadLink = Api.deviceLog.getDownloadUrl(log.id);
      })).finally(() => {
        this.setLoading(false);
      });
    },
  },
  mounted() {
    this.refreshDevice().then(() => {
      this.refreshDeviceLog();
    });
  },
};
</script>

<style lang="scss">
.device-log-view {
  width: 100%;
  height: 100%;

  .code-box {
    height: 100%;
    overflow: auto;
  }
}

.view-log-dialog {
  width: 100%;
}
</style>