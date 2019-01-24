/**
 * interfaces
 */

import { ICompressImgOptions } from '@fatesigner/img-compressor/interfaces';

export type IFileChooserPlatforms = 'H5' | 'wechat';

export type IFileType = 'png' | 'jpeg' | 'jpg' | 'gif' | 'pdf';

export interface IFileChooserOptions {
  accept?: string;
  capture?: 'camera' | 'camcorder';
  multiple?: boolean;
  maxCount?: number;
  minSize?: number;
  maxSize?: number;
  id?: string;
  fileTypeLimits?: IFileType[];
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

export interface IFileChooserService {
  openFileChooser: IOpenFileChooser;
  createFileChooser: ICreateFileChooser;
}

export type IOpenFileChooser = (
  this: IFileChooser,
  options?: IFileChooserOptions
) => Promise<IFileChooserChangeResponse>;

export type ICreateFileChooser = (
  targetEl: HTMLElement,
  options?: IFileChooserOptions,
  onSelected?: (res: IFileChooserChangeResponse) => void,
  onFailed?: (error: Error) => void
) => Promise<IFileChooser>;

export interface IFileChooserConfig {
  core: IFileChooserPlatforms;
  options?: IFileChooserOptions;
}
