<template>
  <div class="home-view">
    <div class="menubar">
      <Menubar :model="sidebarMenu"/>
    </div>
    <div class="content">
      <a-spin :spinning="loading" :tip="loadingTip" wrapperClassName="outer-a-spin">
        <router-view ref="child"/>
      </a-spin>
    </div>
    <div ref="footer"
         class="footer p-ripple red"
         :style="{animation:needRipple?(this.malfunc?.length>0?'fade3':'fade2')+' 800ms infinite':''}"
         v-ripple>
      <div style="flex-basis: 20px">
        <Tag style="min-width: 50px; justify-content: space-between;" icon="pi pi-check" severity="success"
             :value="this.running?.length || 0"/>
      </div>
      <div style="flex-basis: 20px; display: flex;">
        <Tag v-if="this.stopped?.length > 0"
             style="min-width: 50px; justify-content: space-between; animation: fade 800ms infinite;"
             icon="pi pi-exclamation-triangle" severity="warning" :value="this.stopped.length"/>
        <div style="width: 20px;"></div>
        <Tag v-if="this.malfunc?.length > 0"
             style="min-width: 50px; justify-content: space-between; animation: fade 800ms infinite;"
             icon="pi pi-times" severity="danger" :value="this.malfunc.length"/>
      </div>
      <div style="flex-basis: 20px">

      </div>
    </div>
  </div>
  <Toast/>
  <ConfirmDialog/>
</template>

<script>
import Api from '@/api';
import {setServiceInterceptors} from '@/api/request';
import {sidebarMenu} from '@/router/menu';
import Menubar from 'primevue/menubar';

export default {
  name: 'HomeView',
  components: {Menubar},
  data() {
    return {
      sidebarMenu,
      loading: false,
      loadingTip: '',
      interval: -1,
      stopped: [],
      malfunc: [],
      running: [],
    };
  },
  computed: {
    needRipple() {
      return this.malfunc?.length > 0 || this.stopped?.length > 0 || false;
    },
  },
  methods: {
    getMalfuncAndStoppedDevices() {
      return Api.device.getAllStatus().then((res) => {
        this.stopped = res.result['stopped'];
        this.malfunc = res.result['malfunc'];
        this.running = res.result['running'];
        if (this.needRipple) {
          // this.$refs.footer.$el.click();
        }
      });
    },
  },
  mounted() {
    this.interval = setInterval(() => {
      this.getMalfuncAndStoppedDevices();
    }, 1000);
  },
  created() {
    setServiceInterceptors(
        (res) => {
          if (res.data.respCode !== 200) {
            if (res.data.respMsg !== '' && res.data.respMsg.length > 0) {
              const msgs = res.data.respMsg.split('|');
              this.$toast.add({severity: 'warn', summary: msgs[0], detail: msgs[1] || ''/*, life: 3000*/});
              // notification.warning({message: msgs[0], description: msgs[1] || ''});
            }
            return Promise.reject(res.data);
          }
          if (res.data.respMsg !== '' && res.data.respMsg.length > 0) {
            const msgs = res.data.respMsg.split('|');
            this.$toast.add({severity: 'success', summary: msgs[0], detail: msgs[1] || ''/*, life: 3000*/});
          }
          return res.data;
        },
        (error) => {
          this.$toast.add({severity: 'error', summary: '预料之外的错误', detail: error.message/*, life: 3000*/});
          // notification.error({message: '预料之外的错误', description: error.message/*, duration: 0*/});
        },
    );
  },
  provide() { // because of using this, so `provide` must be a function
    return {
      setLoading: (loading, tip) => {
        this.loading = loading;
        this.loadingTip = tip;
      },
    };
  },
};
</script>

<style lang="scss">
.home-view {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;

  .menubar {
    flex: none;
    box-shadow: 0 3px 3px -3px #666;
    z-index: 5;
  }

  .content {
    flex: 1;
    overflow: hidden;

    .outer-a-spin {
      width: 100%;
      height: 100%;
      padding: 2px;
    }
  }

  .footer {
    width: 100%;
    padding: 1px 10px 1px 10px;
    flex-basis: 30px;

    display: flex;
    justify-content: space-between;

    background-color: #f2f2f2;
    border-top: 1px solid #d1d1d1;
  }
}

@keyframes fade {
  from {
    opacity: 1.0;
  }
  70% {
    opacity: 0;
  }
  to {
    opacity: 1.0;
  }
}

@-webkit-keyframes fade {
  from {
    opacity: 1.0;
  }
  70% {
    opacity: 0;
  }
  to {
    opacity: 1.0;
  }
}

@keyframes fade2 {
  from {
    background-color: #fcedb2;
  }
  70% {
    background-color: #f2f2f2;
  }
  to {
    background-color: #fcedb2;
  }
}

@-webkit-keyframes fade2 {
  from {
    background-color: #fcedb2;
  }
  70% {
    background-color: #f2f2f2;
  }
  to {
    background-color: #fcedb2;
  }
}

@keyframes fade3 {
  from {
    background-color: #fdcbcb;
  }
  70% {
    background-color: #f2f2f2;
  }
  to {
    background-color: #fdcbcb;
  }
}

@-webkit-keyframes fade3 {
  from {
    background-color: #fdcbcb;
  }
  70% {
    background-color: #f2f2f2;
  }
  to {
    background-color: #fdcbcb;
  }
}

.animation {
  position: relative;
  width: 10px;
  height: 10px;
  background: #409eff;
  border-radius: 50%;

  &:after {
    content: '';
    position: absolute;
    top: -5px;
    left: -5px;
    width: 100%;
    height: 100%;
    border: 5px solid #ff1883;
    border-radius: 50%;
    animation: antStatusProcessing 1.2s ease-in-out infinite;
  }
}

@keyframes antStatusProcessing {
  0% {
    -webkit-transform: scale(.8);
    transform: scale(.8);
    opacity: .5
  }
  to {
    -webkit-transform: scale(2.4);
    transform: scale(2.4);
    opacity: 0
  }
}
</style>
