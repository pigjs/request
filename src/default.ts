import type { Config } from './types';

export const defaultOptions: Config = {
    type: 'restful',
    successCode: [200, 204],
    loadingDelay: 0,
    showError: true,
    needLoading: false,
    timeout: 60000,
    resKeys: {
        code: 'status',
        data: 'data',
        message: 'message'
    },
    unknownMessage: '网络繁忙,请稍后再试'
};

export const default_header = {
    'Content-Type': 'application/json'
};
