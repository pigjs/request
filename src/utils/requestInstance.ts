import type { Config, Options } from '../types';
import { logContent } from './log';

function weappRequest(options: Options, instance: any) {
    const { headers, ...otherOptions } = options;
    return new Promise((resolve, reject) => {
        instance({
            ...otherOptions,
            header: headers,
            success: (res) => {
                resolve(res);
            },
            fail: (err) => {
                reject(err);
            }
        });
    });
}

function axiosRequest(options: Options, instance: any) {
    const axios = instance;
    return axios(options);
}

export function requestInstance(options: Options, config: Config, instance: any) {
    if (!instance) {
        throw new Error(logContent('requestInstance cannot be empty'));
    }
    if (config.requestType === 'axios') {
        return axiosRequest(options, instance);
    } else if (config.requestType === 'weapp') {
        return weappRequest(options, instance);
    } else {
        throw new Error(logContent('requestType cannot be empty'));
    }
}
