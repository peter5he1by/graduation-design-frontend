<template>
  <div class="device-real-time-data-temperature-view" @contextmenu="rightMenu">
    <div id="my-chart" ref="myChart">

    </div>
  </div>
  <ContextMenu ref="menu" :model="menu" :global="false"/>
</template>

<script>
import Api from '@/api';
import * as echarts from 'echarts';
import moment from 'moment';

export default {
  name: 'DeviceRealTimeDataTemperatureView',
  inject: ['setLoading'],
  data() {
    return {
      moment,
      deviceId: this.$route.params['id'],
      option: {
        tootip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
          },
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        },
        axisPointer: {
          link: { xAxisIndex: 'all' },
          label: {
            backgroundColor: '#777'
          }
        },
        xAxis: {
          type: 'category',
          data: [],
        },
        yAxis: {
          type: 'value',
        },
        series: [
          {
            data: [],
            type: 'line',
          },
        ],
      },
      timeAfter: moment(),
      interval: -1,
      myChart: null,
      menu: [],
    };
  },
  methods: {
    rightMenu(e) {
      this.menu = [];
      this.menu.push({
        label: '刷新',
        command: () => {
          this.startRefreshing();
        },
      });
      this.$refs.menu.show(e);
    },
    startRefreshing() {
      this.setLoading(true, '加载实时数据');
      clearInterval(this.interval);
      this.option.xAxis.data.length = 0;
      this.option.series[0].data.length = 0;
      this.interval = setInterval(() => {
        Api.deviceData.getTemperature(this.deviceId, this.timeAfter.format()).then((res) => {
          if (res.result?.length > 0) {
            this.timeAfter = moment(res.result[res.result.length - 1].time);
            for (const d of res.result) {
              this.option.xAxis.data.push(moment(d.time).format('HH:mm:ss'));
              this.option.series[0].data.push(d.data);
              if (this.option.xAxis.data.length > 20) {
                this.option.xAxis.data.shift();
                this.option.series[0].data.shift();
              }
            }
            this.myChart.setOption(this.option);
          }
        }).catch(() => {
          clearInterval(this.interval);
        }).finally(() => this.setLoading(false));
      }, 1000);
    },
  },
  mounted() {
    // console.log(this.$refs.myChart);
    this.myChart = echarts.init(this.$refs.myChart);
    this.myChart.setOption(this.option);
    this.startRefreshing();
  },
};
</script>

<style lang="scss">
.device-real-time-data-temperature-view {
  width: 100%;
  height: 100%;

  #my-chart {
    width: 100%;
    height: 100%;
  }
}

</style>