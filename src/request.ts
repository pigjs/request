import Config from './config';
import { default_header } from './default';
import { combineURLs, isAbsoluteURL } from './utils';
import { logContent } from './utils/log';
import { mergeProps } from './utils/mergeProps';
import { requestInstance } from './utils/requestInstance';

import type { Config as YConfig, ExtConfig, Message, Options, PendingQueue } from './types';

class Request extends Config {
    pendingQueue: PendingQueue[] = [];

    /** 当前并发请求数 */
    currentConcurrencyCount: number = 0;

    getUrl = (options: Options, config: ExtConfig) => {
        if (isAbsoluteURL(options.url)) {
            return options.url;
        }
        const baseURL = typeof config.baseURL === 'function' ? config.baseURL(options, config) : config.baseURL;
        if (baseURL && config.mock) {
            const prefixUrl = combineURLs('/mock', baseURL);
            return combineURLs(prefixUrl, options.url);
        }
        if (baseURL || config.mock) {
            const prefixUrl = config.mock ? '/mock' : baseURL ? baseURL : '';
            return combineURLs(prefixUrl, options.url);
        }
        return options.url;
    };

    getConfig(options: Options, extConfig: ExtConfig = {}) {
        const { config: globalConfig } = this;
        const config = mergeProps(globalConfig, extConfig);
        if (!options.url) {
            throw new Error('The URL cannot be empty');
        }
        const url = this.getUrl(options, config);
        // 处理 method
        if (!options.method || options.method === 'GET' || options.method === 'DELETE') {
            if (config.requestType === 'weapp') {
                if (options.data && options.params) {
                    console.error(logContent('data and params cannot coexist in a weapp'));
                }
                options.data = options.params || options.data || {};
            } else {
                options.params = options.params || options.data || {};
            }
        }
        const headers = {
            ...default_header,
            ...this.getHeaders(globalConfig),
            ...this.getHeaders(options),
            ...this.getHeaders(extConfig)
        };
        return {
            options: { ...options, url, headers },
            config
        };
    }

    async run(options: Options, extConfig: ExtConfig = {}) {
        const { config } = this.getConfig(options, extConfig);

        const getOptions = () => {
            const { options: resetOptions } = this.getConfig(options, extConfig);
            return resetOptions;
        };

        return new Promise((resolve, reject) => {
            const data = {
                options: getOptions,
                config,
                resolve,
                reject,
                retryCount: config.retryCount
            };
            this.pendingQueue.push(data);
            this.whetherRequest();
        });
    }

    /** 检查是否可以请求 */
    whetherRequest() {
        if (
            this.concurrencyCount === 0 ||
            (this.currentConcurrencyCount < this.concurrencyCount && this.pendingQueue.length > 0)
        ) {
            const item = this.pendingQueue.shift();
            if (!item) {
                return;
            }
            this.netRequest(item);
        }
    }
    /** 当前请求结束，开始下一个请求 */
    nextRequest() {
        this.currentConcurrencyCount -= 1;
        this.whetherRequest();
    }
    /** 请求 */
    async netRequest(item: PendingQueue) {
        const { options: opts, config, resolve, reject, retryCount } = item;
        this.currentConcurrencyCount += 1;

        let loading = true;
        let loadingDelayTimer: any;
        if (config.needLoading) {
            loadingDelayTimer = setTimeout(() => {
                if (loading) {
                    this.message.loading('加载中...');
                }
            }, config.loadingDelay);
        }

        const options = opts();

        try {
            let resBody;
            try {
                resBody = await requestInstance(options, config, this.requestInstance);
                this.nextRequest();
            } catch (err) {
                this.nextRequest();
                throw new Error(err);
            }
            if (loadingDelayTimer) {
                clearTimeout(loadingDelayTimer);
            }
            loading = false;
            if (config.needLoading) {
                this.message.destroy();
            }
            if (!resBody) {
                // this.nextRequest();
                throw new Error('网络已断开!');
            }
            // 不是json 格式的直接返回 比如 blob
            if (options.responseType && options.responseType !== 'json') {
                // this.nextRequest();
                return resolve(resBody);
            }
            const { data } = resBody;
            const code: number = config.type === 'restful' ? resBody[config.resKeys.code] : data[config.resKeys.code];
            if (config.successCode.indexOf(code) === -1) {
                const data = {
                    ...item,
                    retryCount: item.retryCount - 1
                };
                // 是否重试请求
                let isRetryRequest = false;
                const retryRequest = () => {
                    isRetryRequest = true;
                    // 重试请求
                    this.currentConcurrencyCount += 1;
                    this.netRequest(data);
                };
                if (config.errorCode?.[code]) {
                    // 重试完了
                    if (retryCount === -1) {
                        config.errorCode[code](resBody);
                        reject(resBody);
                        // this.nextRequest();
                    } else {
                        await config.errorCode[code](resBody, retryRequest);
                        // 没有调用重试接口，返回错误信息，继续下一个请求
                        if (!isRetryRequest) {
                            reject(resBody);
                            // this.nextRequest();
                        }
                    }
                } else if (retryCount > 0) {
                    retryRequest();
                } else {
                    // this.nextRequest();
                    throw resBody;
                }
            } else {
                resolve(resBody);
                // this.nextRequest();
            }
        } catch (error: any) {
            const err = typeof error === 'string' ? new Error(error) : error || {};
            loading = false;
            // 清除loading
            if (config.needLoading) {
                this.message.destroy();
            }
            let isShowError = true;
            err.hideMessageError = () => {
                isShowError = false;
            };
            setTimeout(() => {
                if (config.showError && isShowError) {
                    this.message.destroy();
                    let content;
                    if (typeof config.resKeys.message === 'function') {
                        content = config.resKeys.message(err.data || {});
                    } else if (typeof config.resKeys.message === 'string') {
                        content = err.data?.[config.resKeys.message];
                    }
                    this.message.error(content || config.unknownMessage);
                }
            });
            reject(err);
        }
    }
}

const http = new Request();

export default function request(options: Options, extConfig?: ExtConfig) {
    return http.run(options, extConfig);
}

export function setMessage(message: Message) {
    http.setMessage(message);
}

export function setConfig(config: YConfig) {
    http.setConfig(config);
}
