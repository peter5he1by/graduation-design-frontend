import service from '@/api/request';

const root = '/device/info';
const deviceInfo = {
    get(id, pageNum, pageSize) {
        return service({
            url: `${root}/get`,
            method: 'POST',
            data: {
                id, pageNum, pageSize,
            },
        });
    },
};
export default deviceInfo;