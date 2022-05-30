import service from '@/api/request';

const root = '/device';
const device = {
    getList(installationSiteId) {
        return service({
            url: `${root}/get_list`,
            method: 'post',
            data: {
                installationSiteId,
            },
        });
    },
    add(deviceName, description, secretKey, installationSiteId) {
        return service({
            url: `${root}/add`,
            method: 'post',
            data: {
                deviceName,
                description,
                secretKey,
                installationSiteId,
            },
        });
    },
    getStatus(...ids) {
        return service({
            url: `${root}/get_status`,
            method: 'post',
            data: {
                ids,
            },
        });
    },
    get(id) {
        return service({
            url: `${root}/get`,
            method: 'post',
            data: {
                id,
            },
        });
    },
    getAllStatus() {
        return service({
            url: `${root}/get_all_status`,
            method: 'post',
        });
    },
};

export default device;