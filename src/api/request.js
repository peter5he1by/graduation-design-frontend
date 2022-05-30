import axios from 'axios';
import {notification} from 'ant-design-vue';

export const apiHost = 'http://127.0.0.1:9090';

const service = axios.create({
    baseURL: apiHost, // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 5 * 1000, // request timeout
});

export function setServiceInterceptors(a, b) {
    service.interceptors.response.use(a, b);
}

export default service;