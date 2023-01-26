export default {
    esm: {
        type: 'babel',
        minify: false, // 是否压缩
        importLibToEs: true // 是否在 esm 模式下把 import 项里的 /lib/ 转换为 /es/
    },
    cjs: {
        type: 'babel',
        lazy: true
    },
    runtimeHelpers: true
};
