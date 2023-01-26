/** 是否为绝对url */
export function isAbsoluteURL(url: string) {
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

/** 组合创建一个新的url */
export function combineURLs(baseURL: string, relativeURL: string) {
    return relativeURL ? `${baseURL.replace(/\/+$/, '')}/${relativeURL.replace(/^\/+/, '')}` : baseURL;
}
