import service from "@/api/request";

const root = '/device/config';
const deviceConfig = {
    get(id) {
        return service({
            url: `${root}/get_new`,
            method: 'post',
            data: {
                id
            }
        });
    },
    set(id, content) {
        return service({
            url: `${root}/set`,
            method: 'post',
            data: {
                id, content
            }
        });
    }
};

export default deviceConfig;