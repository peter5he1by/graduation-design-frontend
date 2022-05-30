/**
 * 在对象上拷贝一些字段以装载到某些组件
 * @param o
 * @param fields 字段对应关系
 * @param recursiveFields
 */
export function cloneObjectFields(o, fields, recursiveFields) {
    if (fields.length % 2 !== 0) {
        throw 'Fields length must be even number !';
    }
    for (let i = 0; i < fields.length; i += 2) {
        o[fields[i + 1]] = o[fields[i]];
    }
    if (recursiveFields.length % 2 !== 0) {
        throw 'Recursive-Fields length must be even number !';
    }
    if (recursiveFields) {
        for (let i = 0; i < fields.length; i += 2) {
            o[fields[i + 1]] = o[fields[i]];
            for (const item of o[fields[i + 1]]) {
                cloneObjectFields(item, fields, recursiveFields);
            }
        }
    }
}

export function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const Util = {
    download: function (filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    },
};

export default Util;