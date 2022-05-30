import service from '@/api/request';

const root = '/device/data';
const deviceData = {
    getTemperature(id, timeAfter) {
        return service({
            url: `${root}/get_temperature`,
            method: 'POST',
            data: {
                id, timeAfter,
            },
        });
    },
};

export default deviceData;