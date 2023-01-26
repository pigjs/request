export interface ResKeys {
    /** 返回状态的key */
    code: string;
    /** 返回data的key */
    data: string;
    /** 提示信息的key */
    message: string | ((res: any) => string);
}

export type Method = 'OPTIONS' | 'GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT';

export interface ExtConfig {
    /** 请求规范类型 默认 restful */
    type?: 'restful' | 'code';
    /** 请求类型 默认 axios */
    requestType?: 'axios' | 'weapp';
    /** 请求成功的状态码 默认 [200,204] */
    successCode?: number[];
    /** 请求失败的状态码处理 */
    errorCode?: Record<number, (res: any, retryRequest?: any) => void>;
    /** 请求头参数配置 */
    headers?: any;
    /** loading 的延迟时间，避免闪烁 默认 0 */
    loadingDelay?: number;
    /** 是否提示错误 默认 true */
    showError?: boolean;
    /** 是否需要loading 默认 false */
    needLoading?: boolean;
    /** 超时时间 默认 60000 */
    timeout?: number;
    /** 请求返回格式 */
    resKeys?: ResKeys;
    /** 默认错误提示信息 默认 网络繁忙,请稍后再试 */
    unknownMessage?: string;
    /** 请求前缀 */
    baseURL?: string | ((options: Options, config: ExtConfig) => string);
    /** 是否走 mock 数据，url 前缀会加上一个/mock */
    mock?: boolean;
    /** 请求失败重试次数 */
    retryCount?: number;
}

export interface Config extends ExtConfig {
    /** 最大同时并发请求数 */
    concurrencyCount?: number;
    /** 请求类型实例 axios weapp */
    requestInstance?: any;
}

export interface Options {
    /** 接口地址 */
    url: string;
    /** 请求参数 body */
    data?: any;
    /** 请求参数 params */
    params?: any;
    /** 请求头 */
    headers?: any;
    /** 超时时间 */
    timeout?: number;
    /** 请求方法 */
    method?: Method;
    [key: string | number]: any;
}

export interface Message {
    loading: (content: string) => void;
    error: (content: any) => void;
    destroy: () => void;
}

export interface PendingQueue {
    // 请求参数
    options: () => Options;
    // 请求配置
    config: ExtConfig;
    // 重试次数 error Code 中会默认给一个 重试请求标记 -1，只请求一次，其他 >= 0的正常走
    retryCount: number;
    // 成功回调
    resolve: (value: unknown) => void;
    // 失败回调
    reject: (reason?: any) => void;
}
