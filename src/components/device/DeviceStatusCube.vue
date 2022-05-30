<template>
  <Button class="device-status-cube" :class="statusCssClass">
    <div v-if="!small" class="label">{{ device.name }}</div>
    <div v-if="!small" class="info">{{ device.description }}</div>
    <div class="status">{{ statusLabel }}</div>
  </Button>
</template>

<script>
import Button from 'primevue/button';

export default {
  name: 'DeviceStatusCube',
  components: {Button},
  props: {
    device: {
      type: Object,
      default: null,
    },
    status: {
      type: Number,
      default: 0,
    },
    small: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // status: 0
    };
  },
  computed: {
    statusContent() {
      return {
        0b0000: [['status-unknown', 'p-button-outlined', 'p-button-secondary'], '未知'],
        0b0001: [['status-running', 'p-button-success'], this.small ? '上线' : '正常'],
        0b0010: [['status-stopped', 'p-button-warning'], '停止'],
        0b0100: [['status-malfunc', 'p-button-danger'], '故障'],
        0b1000: [['status-offline', 'p-button-secondary'], '脱机'],
      }[this.status] || [[], 'error'];
    },
    statusCssClass() {
      return [...this.statusContent[0], this.small ? 'small' : ''];
    },
    statusLabel() {
      return this.statusContent[1];
    },
    tooltip() {
      const device = this.device;
      return `UUID: ${device.uuid}
      名称: ${device.name}
      软件信息: ${device?.deviceInfo?.softwareInfo}
      硬件信息: ${device?.deviceInfo?.hardwareInfo}`;
    },
  },
};
</script>

<style lang="scss" scoped>
.device-status-cube {
  width: 8rem;
  height: 6rem;
  padding: 0.25rem;
  flex-direction: column;

  .label {
    flex-basis: 1em;
  }

  .info {
    flex-basis: 1em;
  }

  .status {
    font-size: 1.5rem;
  }

  &.small {
    width: 3em;
    height: 1.2em;
    padding: 0;

    .status {
      font-size: 1em;
      line-height: 1em;
    }
  }
}
</style>