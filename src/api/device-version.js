import service from '@/api/request';

const root = '/device/version';
const deviceVersion = {
    getList() {
        return service({
            url: `${root}/get_list`,
            method: 'POST',
        });
    },
    add(codeName, internalVersion, externalVersion, fileUrl, hashValue) {
        return service({
            url: `${root}/add`,
            method: 'POST',
            data: {
                codeName, internalVersion, externalVersion, fileUrl, hashValue,
            },
        });
    },
    edit(id, codeName, internalVersion, externalVersion, fileUrl, hashValue) {
        return service({
            url: `${root}/edit`,
            method: 'POST',
            data: {
                id, codeName, internalVersion, externalVersion, fileUrl, hashValue,
            },
        });
    },
};

export default deviceVersion;