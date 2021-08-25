/**
 * core
 */

import to from 'await-to-js';
import { convertToBytesUnit } from '@fatesigner/utils';
import { compressImg } from '@fatesigner/img-compressor';
import { ICompressImgOptions } from '@fatesigner/img-compressor/types';
import { filterExtensions, getContentSize } from '@fatesigner/utils/document';

import { isImage } from './utils';

export interface IFileChooserOptions {
  accept?: string;
  capture?: 'camera' | 'camcorder';
  multiple?: boolean;
  maxCount?: number;
  minSize?: number;
  maxSize?: number;
  id?: string;
  fileTypeLimits?: string[];
  data?: any;
  clickable?: boolean;
  compress?: ICompressImgOptions;
}

export interface IFileChooserChangeResponse {
  data?: any;
  files: File[];
}

export type IFileChooserErrorType = 'Compress' | 'InvalidCount' | 'InvalidSize' | 'InvalidType' | 'Other';

export interface IFileChooser {
  trigger: () => void;
  destroy: () => void;
}

export type IOpenFileChooser = (
  options?: IFileChooserOptions,
  onChanged?: (res: IFileChooserChangeResponse) => void,
  onFailed?: (error: Error) => void
) => Promise<void>;

export type ICreateFileChooser = (
  targetEl: HTMLElement,
  options?: IFileChooserOptions,
  onChanged?: (res: IFileChooserChangeResponse) => void,
  onFailed?: (error: Error) => void
) => Promise<IFileChooser>;

/**
 * 定义错误包装类
 */
export class FileChooserError extends Error {
  constructor(type: IFileChooserErrorType, message: string) {
    super(message);
    this.name = type;
  }
}

/**
 * 为指定的 vnode 分发自定义事件
 * @param vnode
 * @param eventName
 * @param data
 * @constructor
 */
export function dispatchEvent(vnode: any, eventName: string, data: any) {
  const handlers: any = (vnode.data && vnode.data.on) || (vnode.componentOptions && vnode.componentOptions.listeners);

  if (handlers && handlers[eventName]) {
    handlers[eventName].fns(data);
  }

  /* if (vnode.componentInstance) {
    vnode.componentInstance.$emit(eventName, {
      detail: data
    });
  } else {
    vnode.elm.dispatchEvent(new CustomEvent('onFileChooserChange', {
      detail: data
    }));
  } */
}

/**
 * 校验文件
 * @param files
 * @param options
 */
export function validateFile(files: File[], options: IFileChooserOptions): Error {
  let error: Error;

  if (options.multiple && options.maxCount && files.length > options.maxCount) {
    error = new FileChooserError('InvalidCount', `最多仅支持选择${options.maxCount}个文件！`);
  }

  for (let i = 0, l = files.length; i < l; i++) {
    const file = files[i];

    if (options.fileTypeLimits.length && !filterExtensions(file, options.fileTypeLimits.map((x) => `.${x}`).join(','))) {
      error = new FileChooserError('InvalidType', `仅支持${options.fileTypeLimits.join(',')}的文件格式！`);
    }

    const fileSize = getContentSize(file);

    if (options.minSize && fileSize < options.minSize * 1024) {
      error = new FileChooserError('InvalidSize', `最小支持${convertToBytesUnit(options.minSize * 1024)}的文件`);
    }

    if (options.maxSize && fileSize > options.maxSize * 1024) {
      error = new FileChooserError('InvalidSize', `最大支持${convertToBytesUnit(options.maxSize * 1024)}的文件`);
    }

    if (error) {
      break;
    }
  }

  return error;
}

/**
 * 压缩文件
 * @param files
 * @param options
 */
export async function compressImage(files: File[], options: IFileChooserOptions): Promise<File[]> {
  const filesRes = [];

  for (let file of files) {
    let filename = file.name;

    if (isImage(file)) {
      // 对于图片类型文件，先进行压缩
      const [err, res] = await to(compressImg(file, options.compress));

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
