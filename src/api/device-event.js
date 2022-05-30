import service from '@/api/request';

const root = '/device/event';
const deviceEvent = {
    get(id) {
        return service({
            url: `${root}/get`,
            method: 'POST',
            data: {
                id,
            },
        });
    },
};
export default deviceEvent;