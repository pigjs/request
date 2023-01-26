import { defaultOptions } from './default';
import { logContent } from './utils/log';
import { mergeProps } from './utils/mergeProps';

import type { Config as YConfig, ExtConfig, Message } from './types';

export default class Config {
    config: ExtConfig;
    message: Message = {
        loading(): void {
            throw new Error(logContent('message.loading Function not implemented.'));
        },
        error(): void {
            throw new Error(logContent('message.error Function not implemented.'));
        },
        destroy(): void {
            throw new Error(logContent('message.destroy Function not implemented.'));
        }
    };

    // 最大同时并发请求数
    concurrencyCount: number = 0;
    // 请求类型实例
    requestInstance: any;

    constructor() {
        this.config = defaultOptions;
    }

    setConfig(c: YConfig) {
        const config = mergeProps(this.config, c);
        const { concurrencyCount, requestInstance, ...otherConfig } = config;
        this.concurrencyCount = concurrencyCount || 0;
        this.requestInstance = requestInstance;
        this.config = otherConfig;
    }

    setMessage(message: Message) {
        this.message = message;
    }

    getHeaders(config: ExtConfig = {}) {
        let headers = config.headers || {};
        if (typeof config.headers === 'function') {
            headers = config.headers();
        }
        return headers;
    }
}
