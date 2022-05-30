import {installCodeMirrorEditor} from "@/plugins/code-mirror";
import {createApp} from 'vue';
import App from './App.vue';
import router from './router';
import {installAntd} from "@/plugins/antd";
import {installPrimeVue} from "@/plugins/prime-vue";
// import {installElementPlus} from "@/plugins/element";
import {installTreeOrg} from "@/plugins/tree-org";

import './style/global.scss';

const app = createApp(App);
app.config.unwrapInjectedRef = true;
app.use(router);
installAntd(app);
// installElementPlus(app);
installPrimeVue(app);
installTreeOrg(app);
installCodeMirrorEditor(app);
app.mount('#app');
