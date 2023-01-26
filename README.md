## @pigjs/request

前端通用请求库，兼容 web/h5/小程序

### 安装

```jsx
npm i @pigjs/request -S
// or yarn
yarn add @pigjs/request -S
// or pnpm
pnpm add @pigjs/request -S
```

### 注意

如果不是在 小程序项目中使用的话，需要自行安装 axios

### 使用

```jsx
import { request, setConfig, setMessage } from '@pigjs/request';
import { message } from 'antd';
import axios from 'axios';

// 初始化请求库配置
setConfig({
    errorCode: {
        // 错误状态
        401: () => {
            // 未登录
        },
        502: () => {
            // 服务器部署中
        },
        504: () => {
            // 请求超时
        }
    },
    headers: () => {
        // headers 配置
        // 可以设置token等
    },
    resKeys: {
        // 后端返回到格式
        code: 'status',
        data: 'data',
        message: 'message'
    },
    requestInstance: axios
});

setMessage({
    loading: (content) => {
        message.loading(content);
    },
    destroy: () => {
        message.destroy();
    },
    error: (content) => {
        message.error(content);
    }
});

const getData = () => {
    request(
        {
            method: 'GET',
            url: '',
            data: {}
        },
        {
            needLoading: false
        }
    );
};

const uploadFile = () => {
    request(
        {
            method: 'GET',
            url: '',
            data: {}
        },
        {
            responseType: 'blob'
        }
    );
};

const setList = () => {
    request({
        method: 'POST',
        url: '',
        data: {}
    });
};
```

### API

#### 方法

|    参数    |    说明    |            类型             | 默认值 |
| :--------: | :--------: | :-------------------------: | :----: |
|  request   |  请求方法  | function(options,extConfig) |   -    |
| setConfig  | 初始化配置 |      function(config)       |   -    |
| setMessage | 初始化配置 |   function(message)=>void   |   -    |

#### options

|  参数   |     说明      |  类型  | 默认值 |
| :-----: | :-----------: | :----: | :----: |
|   url   |   请求地址    | string |   -    |
|  data   | 请求参数 body |  any   |   -    |
| params  |   请求参数    |  any   |   -    |
| method  |   请求方式    | string | 'GET'  |
| headers |    请求头     |  any   |   -    |
| timeout |   超时时间    | number |   -    |

兼容其他 axios/weapp 请求参数

注意: GET 和 DELETE 请求时，param 如果没有填写，会自动填充为 data 的参数，如果不需要这种效果的，请 使用小写的 get、delete 在 weapp 中使用时，没有 params 参数的，@pigjs/request 请求层中做了一个兼容，但最终会把 params 变成 data 的

#### extConfig

| 参数 | 说明 | 类型 | 默认值 |
| :-: | :-: | :-: | :-: |
| type | 请求规范类型 | 'restful' \| 'code' | 'restful' |
| requestType | 请求类型 | 'axios' \| 'weapp' | - |
| successCode | 请求成功的状态码 | number[] | [200,204] |
| errorCode | 请求失败的状态码处理 | [key: number]: (res: any, retryRequest?: any) => void | - |
| headers | 请求头 | any | - |
| showError | 是否提示错误 | boolean | true |
| needLoading | 是否需要 loading | boolean | false |
| loadingDelay | loading 的延迟时间，避免闪烁 | number | 0 |
| timeout | 超时时间 | number | 60000 |
| resKeys | 返回格式 | ResKeys | {code:'status',data:'data',message:'message'} |
| unknownMessage | 默认错误提示信息 | string | '网络繁忙,请稍后再试' |
| baseURL | 请求前缀 | string \| ((options: Options,config: ExtConfig) => string) | - |
| mock | 是否走 mock 数据，url 前缀会加上一个/mock | boolean | false |
| retryCount | 请求失败重试次数 | number | - |

#### config

基础 ExtConfig

|       参数       |           说明           |  类型  | 默认值 |
| :--------------: | :----------------------: | :----: | :----: |
| concurrencyCount |    最大同时并发请求数    | number |   -    |
| requestInstance  | 请求类型实例 axios weapp |  any   |   -    |

#### message

|  参数   |         说明          |           类型            | 默认值 |
| :-----: | :-------------------: | :-----------------------: | :----: |
| loading | 请求加载 loading 方法 | (content: string) => void |   -    |
|  error  |   请求报错提示方法    |  (content: any) => void   |   -    |
| destroy | 请求清除 loading 方法 |        () => void         |   -    |

#### ResKeys

|  参数   |       说明       |  类型   |         默认值         |
| :-----: | :--------------: | :-----: | :--------------------: |
|  code   |  返回状态的 key  | string  |           -            |
|  data   | 返回 data 的 key | string  |           -            |
| message |  提示信息的 key  | (string | ((res: any) => string) |

#### weapp

请求实例 weapp 可以是 wx.request 或者 taro.request
