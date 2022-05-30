<template>
  <div class="device-real-time-data-view">
    <TabMenu class="tab-menu"
             :model="menu" v-model:activeIndex="active"/>
    <div class="page-container">
      <router-view/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DeviceRealTimeDataView',
  data() {
    return {
      deviceId: this.$route.params['id'],
      device: null,
      menu: [
        {
          label: '温 度',
          command: () => {
            this.$router.push({path: `/device/real-time/${this.$route.params['id']}/temperature`});
          },
        },
      ],
      active: 0,
    };
  },
  computed: {},
  methods: {},
};
</script>

<style lang="scss">
.device-real-time-data-view {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .tab-menu {
    flex: 0;
    flex-basis: fit-content;
  }

  .page-container {
    flex: 1;
    overflow-y: auto;
  }
}
</style>