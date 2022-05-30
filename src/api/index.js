import device from '@/api/device';
import deviceData from '@/api/device-data';
import deviceEvent from '@/api/device-event';
import deviceInfo from '@/api/device-info';
import deviceLog from '@/api/device-log';
import deviceVersion from '@/api/device-version';
import deviceConfig from '@/api/device_config';
import deviceInstallationSite from '@/api/device_installation_site';

const Api = {
    deviceInstallationSite,
    device,
    deviceConfig,
    deviceInfo,
    deviceEvent,
    deviceVersion,
    deviceLog,
    deviceData,
};

export default Api;