import DeviceConfigView from '@/views/device/DeviceConfigView';
import DeviceInfoView from '@/views/device/DeviceInfoView';
import DeviceLogView from '@/views/device/DeviceLogView';
import DeviceEventView from '@/views/device/DeviceEventView';
import DeviceRealTimeDataTemperatureView from '@/views/device/DeviceRealTimeDataTemperatureView';
import DeviceRealTimeDataView from '@/views/device/DeviceRealTimeDataView';
import DeviceVersionView from '@/views/device/DeviceVersionView';
// import DeviceWorkInfoView from "@/views/device/DeviceWorkInfoView";
// import Visualization2dHistoryView from "@/views/device/Visualization2dHistoryView";
// import Visualization2dRealTimeView from "@/views/device/Visualization2dRealTimeView";
import {createRouter, createWebHashHistory} from 'vue-router';
import HomeView from '@/views/HomeView.vue';
import InstallationSiteView from '@/views/InstallationSiteView';
import DeviceStatusView from '@/views/device/DeviceStatusView';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView,
        redirect: '/device/status',
        children: [
            {
                path: 'device/status',
                name: '运行状态监控', // +设备维护信息（预览） +当前工作信息
                component: DeviceStatusView,
            },
            {
                path: 'device/version', // 设备升级、版本管理、更新包上传
                name: '软件版本管理',
                component: DeviceVersionView,
            },
            {
                path: 'installation-site',
                name: '安装场所管理',
                component: InstallationSiteView,
            },
            {
                path: 'device/info/:id', // 针对单个设备
                name: '设备维护信息概览', // 设备维护信息（历史记录）
                component: DeviceInfoView,
            },
            {
                path: 'device/event/:id', // 针对单个设备
                name: '设备使用信息统计及跟踪', //
                component: DeviceEventView,
            },
            {
                path: 'device/config/:id', // 设备配置管理，支持导入
                name: '设备配置管理',
                component: DeviceConfigView,
            },
            {
                path: 'device/log/:id', // 针对单个设备
                name: '运行日志',
                component: DeviceLogView,
            },
            {
                path: '/device/real-time/:id', // 实时数据展示，根据不同类型的图表、不同的表
                name: '实时监测',
                component: DeviceRealTimeDataView,
                redirect: '/device/real-time/:id/temperature',
                children: [
                    {
                        path: 'temperature',
                        name: '温度监测',
                        component: DeviceRealTimeDataTemperatureView,
                    },
                ],
            },
            // {
            //     path: 'visualization/2d/{type}/{table}/history/:id', // 历史数据展示，根据不同类型的图表、不同的表，支持导出
            //     name: '历史数据可视化',
            //     component: Visualization2dHistoryView
            // },
        ],
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
