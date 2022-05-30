import service from '@/api/request';

const root = '/device/log';

const deviceLog = {
    getList(id) {
        return service({
            url: `${root}/get_list`,
            method: 'POST',
            data: {
                id,
            },
        });
    },
    getContent(id) {
        return service({
            url: `${root}/get_content`,
            method: 'POST',
            data: {
                id,
            },
        });
    },
    getDownloadUrl(id) {
        return service.defaults.baseURL + service.getUri({url: `${root}/download`, params: {id}});
    },
};

export default deviceLog;