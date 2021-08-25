/**
 * file-chooser
 */

import { merge } from 'lodash-es';

import { ICreateFileChooser, IFileChooserChangeResponse, IFileChooserOptions, IOpenFileChooser, dispatchEvent } from './core';

import './file-chooser.css';

const defaultOptions: IFileChooserOptions = {
  accept: '',
  multiple: false,
  fileTypeLimits: [],
  compress: {
    quality: 0.8
  },
  clickable: true
};

/**
 * 指定文件选择器的全局默认配置
 * @param options
 */
export function fileChooserConfigure(options: IFileChooserOptions): void {
  merge(defaultOptions, options);
}

/**
 * 打开文件选择框
 * @param options 选项
 * @param onChanged 文件选中
 * @param onFailed 文件校验、压缩失败
 */
export const openFileChooser: IOpenFileChooser = async function (
  options?: IFileChooserOptions,
  onChanged?: (res: IFileChooserChangeResponse) => void,
  onFailed?: (error: Error) => void
) {
  const ins = await import('./platforms/h5');
  await ins.openFileChooser(merge({}, defaultOptions, options), onChanged, onFailed);
};

/**
 * 创建文件选择器实例
 * @param targetEl 目标元素
 * @param options 选项
 * @param onChanged 文件选中
 * @param onFailed 文件校验、压缩失败
 */
export const createFileChooser: ICreateFileChooser = async function (
  targetEl: HTMLElement,
  options?: IFileChooserOptions,
  onChanged?: (res: IFileChooserChangeResponse) => void,
  onFailed?: (error: Error) => void
) {
  const ins = await import('./platforms/h5');
  return ins.createFileChooser(targetEl, merge({}, defaultOptions, options), onChanged, onFailed);
};

/**
 * 用于 Vue2.x 的指令
 * @param vue
 */
export function fileChooserDirective(vue: any): void {
  vue.directive('file-chooser', {
    bind(el: any, binding: any, vnode: any) {
      createFileChooser(
        el,
        binding.value,
        (res) => {
          dispatchEvent(vnode, 'fileChooserChange', res);
        },
        (reason) => {
          dispatchEvent(vnode, 'fileChooserError', reason);
        }
      ).then(function (res) {
        el.chooser = res;
      });
    },
    unbind(el: any) {
      if (el.chooser && el.chooser.destroy) {
        el.chooser.destroy();
      }
    }
  });
}
