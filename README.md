# file-chooser

[![npm][npm-image]][npm-url]
[![build][travis-image]][travis-url]
[![codecov][codecov-image]][codecov-url]
[![download][download-image]][download-url]
[![commitizen][commitizen-image]][commitizen-url]
[![semantic][semantic-image]][semantic-url]

[npm-image]: https://img.shields.io/npm/v/@fatesigner/file-chooser.svg?color=red
[npm-url]: https://npmjs.com/package/@fatesigner/file-chooser
[travis-image]: https://travis-ci.com/fatesigner/file-chooser.svg?token=i21P7stb8bZPNjZakvsi&branch=master&color=success
[travis-url]: https://travis-ci.com/fatesigner/file-chooser
[codecov-image]: https://codecov.io/gh/fatesigner/file-chooser/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/fatesigner/file-chooser
[download-image]: https://img.shields.io/npm/dw/@fatesigner/file-chooser.svg?color=green
[download-url]: https://npmjs.com/package/@fatesigner/file-chooser
[commitizen-image]: https://img.shields.io/badge/commitizen-friendly-green.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
[semantic-image]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square
[semantic-url]: https://opensource.org/licenses/MIT

web 文件选择器的函数式封装.

## 说明
- 为 Web [input file](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Element/Input/file) 操作提供函数式的调用
- 使用 typescript 编写，定义了一套接口，以适用不同类型的客户端，如 H5、wechat（微信）
- 支持对图片文件的压缩，使用 [@fatesigner/img-compressor](https://github.com/fatesigner/img-compressor)
- 利用 Webpack 的 [dynamic import](https://webpack.docschina.org/guides/code-splitting/) 以减少首屏加载时间
## 安装

```bash
npm i -S @fatesigner/file-chooser
```

## 使用
#### startup.ts
```ts
import { RegisterFileChooser } from '@fatesigner/file-chooser';

// 预先配置 file-chooser 默认选项（全局）
RegisterFileChooser({
  // 指定使用 H5 版本
  core: 'H5',
  options: {
    // 指定文件类型限制
    fileTypeLimits: ['jpg', 'png']
  }
});
```
#### main.ts
```ts
import { FileChooserService } from '@fatesigner/file-chooser';
import { IFileChooserChangeResponse } from '@fatesigner/file-chooser/interfaces';

// 直接打开
FileChooserService.openFileChooser({
  accept: '.jpg,.png'
}).then((res) => {
  // show selected files
  console.log(res);
}).catch((err) => {
  console.log(err);
});

// 设置页面上指定的一个元素，点击后打开
let chooser = await FileChooserService.createFileChooser(
  document.querySelector('#btnChooseFile'), {
  accept: '.jpg,.png'
}, (res: IFileChooserChangeResponse) => {
  // show selected files
  console.log(res);
}, (err: Error) => {
  console.log(err);
});

// 手动打开
chooser.trigger();

// 移除
chooser.destroy();
```

### 在 Vue 中使用
```html
<div title="选择文件"
    v-file-chooser="fileChooser.options"
    @fileChooserChange="onFileChooserChange"
    @fileChooserError="onFileChooserError"
>
  <img :src="src" alt="" title="" />
</div>
```
```ts
import { Vue } from 'vue';
import { GetImageSrc } from '@fatesigner/file-chooser/document';
import { FileChooserDirectiveForVue } from '@fatesigner/file-chooser/directives/file-chooser.directive';

Vue.use(FileChooserDirectiveForVue);

export default {
  data() {
    return {
      src: '',
      fileChooser: {
        options: {
          accept: '.jpg,.png',
          multiple: false,
          maxSize: 10 * 1024,
          compress: {
            quality: 0.6
          }
        }
      }
    };
  },
  methods: {
    onFileChooserChange(res) {
      // set src from file.
      GetImageSrc(res.files[0]).then((src) => {
        this.src = src;
      });
    },
    onFileChooserError(err) {
      console.log(err);
    }
  }
}
```

## API
### openFileChooser
> 以函数调用的方式打开文件选择框，无需操作 document.

| Param | Description |
| --- | --- |
| options | [IFileChooserOptions](#IFileChooserOptions) |

### createFileChooser
> 将界面上指定的元素设置绑定点击事件，打开文件选择框.

| Param | Description |
| --- | --- |
| targetEl | ElementRef |
| options | [IFileChooserOptions](#IFileChooserOptions) |
| onSelected | 文件选择成功后触发，返回 [IFileChooserChangeResponse](#IFileChooserChangeResponse) |
| onFailed | 文件类型、尺寸、数量不符后触发，返回 Error |

### IFileChooserOptions
| Param | default | Description |
| --- | --- | --- |
| accept  | null | 允许的文件类型， [HTML attribute: accept](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes/accept) |
| capture | null | 需要捕获的系统设备， [HTML attribute: capture](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Attributes/capture) |
| multiple | null | 允许用户选择多个文件，默认为 false  |
| maxCount | null | 允许用户选择的文件的数量，默认为 null，即无限制  |
| minSize | null | 允许用户选择的文件的最小尺寸，默认为 null，即无限制  |
| maxSize | null | 允许用户选择的文件的最大尺寸，默认为 null，即无限制  |
| id | GUID | 设置元素id，默认设置为一个GUID  |
| fileTypeLimits | [ ] | 在accept参数的基础上限制用户选择的文件类型，默认为空数组，即无限制  |
| data | null | 绑定任意值，在选择文件事件回调中返回  |
| clickable | true | 允许用户点击触发  |
| compress | { quality: 0.8 } | 图片压缩选项，具体参数可查看 [@fatesigner/img-compressor](https://github.com/fatesigner/img-compressor)  |

### IFileChooserOptions
| Param | Description |
| --- | --- |
| data | 初始化时绑定的data  |
| files | 用户选择的图片列表 File[]  |
