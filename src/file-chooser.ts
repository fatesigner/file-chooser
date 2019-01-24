/**
 * file-chooser
 */

import to from 'await-to-js';
import { merge } from 'lodash';
import { ConvertToBytesUnit } from '@fatesigner/utils';
import { BrowserClient } from '@fatesigner/utils/user-agent';
import { CompressImg } from '@fatesigner/img-compressor/img-compressor';
import { FilterExtensions, GetContentSize } from '@fatesigner/utils/document';

import {
  IFileChooser,
  IFileChooserChangeResponse,
  IFileChooserConfig,
  IFileChooserErrorType,
  IFileChooserOptions,
  IFileChooserService
} from './interfaces';

import './file-chooser.scss';

/**
 * 定义错误包装类
 */
export class FileChooserError extends Error {
  constructor(type: IFileChooserErrorType, message: string) {
    super(message);
    this.name = type;
  }
}

export const DefaultOptions: IFileChooserOptions = {
  accept: '',
  multiple: false,
  fileTypeLimits: [],
  compress: {
    quality: 0.8
  },
  clickable: true
};

// 验证文件
export function ValidateFile(files: File[], options: IFileChooserOptions): Error {
  let error: Error;

  if (options.multiple && options.maxCount && files.length > options.maxCount) {
    error = new FileChooserError('InvalidCount', `最多仅支持选择${options.maxCount}个文件！`);
  }

  for (let i = 0, l = files.length; i < l; i++) {
    const file = files[i];

    if (
      options.fileTypeLimits.length &&
      !FilterExtensions(file, options.fileTypeLimits.map((x) => `.${x}`).join(','))
    ) {
      error = new FileChooserError('InvalidType', `仅支持${options.fileTypeLimits.join(',')}的文件格式！`);
    }

    const fileSize = GetContentSize(file);

    if (options.minSize && fileSize < options.minSize * 1024) {
      error = new FileChooserError('InvalidSize', `最小支持${ConvertToBytesUnit(options.minSize * 1024)}的文件`);
    }

    if (options.maxSize && fileSize > options.maxSize * 1024) {
      error = new FileChooserError('InvalidSize', `最大支持${ConvertToBytesUnit(options.maxSize * 1024)}的文件`);
    }

    if (error) {
      break;
    }
  }

  return error;
}

export async function CompressImage(files: File[], options: IFileChooserOptions): Promise<File[]> {
  const filesRes = [];

  for (let file of files) {
    let filename = file.name;

    if (IsImage(file)) {
      // 对于图片类型文件，先进行压缩
      const [err, res] = await to(CompressImg(file, options.compress));

      if (err) {
        throw new FileChooserError('Compress', err.message);
      } else {
        filename = res.origin.name;
        file = res.file as any;
      }
    }

    if (file) {
      try {
        const f = new File([file], filename);
        filesRes.push(f);
      } catch (e) {
        const f: any = new Blob([file]);
        f.name = filename;
        f.lastModifiedDate = new Date();
        filesRes.push(f);
      }
    }
  }

  return filesRes;
}

const ImageTypeReg = /\.(gif|jpg|jpeg|png|GIF|JPG|PNG)$/;

/**
 * 获取文件的路径
 * @param {File} file
 * @returns {string}
 */
export function GetPath(file: File): string {
  if (file) {
    return file.name;
  }
  return null;
}

/**
 * 获取 File 对象的文件名
 * @param {File} file 对象
 * @return {string} filename
 */
export function GetFileName(file: File): string {
  const path = GetPath(file);
  if (path) {
    const array = path.split('/');
    return array[array.length - 1];
  }
  return null;
}

/**
 * 获取 File 对象的后缀名
 * @param {File} file
 * @returns {string} extname
 */
export function GetExtension(file: File): string {
  const name = GetFileName(file);
  if (name) {
    const i = name.lastIndexOf('.');
    return name.substring(i, name.length);
  }
  return null;
}

/**
 * 判断 File 对象是否为图片类型
 * @param {File} file
 * @returns {boolean}
 */
export function IsImage(file: File): boolean {
  const extension = GetExtension(file);
  return ImageTypeReg.test(extension);
}

/**
 * 重置 input file 元素，实现对相同文件的选择均可触发 change 事件
 * @param file
 * @constructor
 */
export function ResetInputFile(file: HTMLInputElement): void {
  file.value = '';
}

/**
 * 触发指定元素的 click 事件
 * @param el
 * @constructor
 */
export function DispatchClick(el) {
  el.dispatchEvent(new MouseEvent('click'));

  if (el && document.createEvent) {
    // const evt = document.createEvent('MouseEvents');
    // evt.initEvent('click', true, false);
    // el.dispatchEvent(evt);
  }
}

class FileChooserCreator implements IFileChooserService {
  config: IFileChooserConfig = {
    options: DefaultOptions,
    core: BrowserClient.Wechat ? 'wechat' : 'H5'
  };

  private core: IFileChooserService = null;

  constructor() {
    this.init();
  }

  async openFileChooser(options?: IFileChooserOptions): Promise<any> {
    if (!this.core) {
      const res = await import(`./platforms/${this.config.core}`);
      this.core = res.default;
    }
    return (this.core as any).openFileChooser(merge({}, this.config.options, options));
  }

  async createFileChooser(
    targetEl: HTMLElement,
    options?: IFileChooserOptions,
    onSelected?: (res: IFileChooserChangeResponse) => void,
    onFailed?: (error: Error) => void
  ): Promise<IFileChooser> {
    if (!this.core) {
      const res = await import(`./platforms/${this.config.core}`);
      this.core = res.default;
    }
    return this.core.createFileChooser(targetEl, merge({}, this.config.options, options), onSelected, onFailed);
  }

  async init() {
    // 判断所处平台
    /* if (BrowserClient.Wechat) {
      const _ = await import('./platforms/wechat');
      this.openFileChooser = _.FileChooserService.openFileChooser;
      this.createFileChooser = _.FileChooserService.createFileChooser;
    } else {
      const _ = await import('./platforms/H5');
      this.openFileChooser = _.FileChooserService.openFileChooser;
      this.createFileChooser = _.FileChooserService.createFileChooser;
    } */
  }
}

const FileChooserService = new FileChooserCreator();

export function RegisterFileChooser(config: IFileChooserConfig): void {
  FileChooserService.config = merge({}, FileChooserService.config, config);
}

export { FileChooserService };
