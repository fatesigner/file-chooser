/**
 * wechat
 */

import { On } from '@fatesigner/utils/document';
import { GetGUID } from '@fatesigner/utils/random';
import { ChooseImage, GetLocalImgData } from '@fatesigner/wx-jssdk';
import { ConvertBase64ToBlob, ConvertBlobToFile } from '@fatesigner/utils';

import { DefaultOptions } from '../file-chooser';
import {
  IFileChooserChangeResponse,
  IFileChooserErrorType,
  IFileChooserOptions,
  IFileChooserService
} from '../interfaces';

const FileChooserService: IFileChooserService = {
  openFileChooser(options?: IFileChooserOptions) {
    return new Promise<IFileChooserChangeResponse>((resolve, reject) => {
      const options_: IFileChooserOptions = Object.assign(
        DefaultOptions,
        {
          id: GetGUID(10)
        },
        options
      );
      ChooseImage({
        count: 5, // 默认 9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'] // 可以指定来源是相册还是相机，默认二者都有
      })
        .then(async (res) => {
          // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
          const localIds = res.localIds;
          const files: File[] = [];
          // eslint-disable-next-line no-useless-catch
          try {
            for (let localId of localIds) {
              localId = localId.toString();
              const res2 = await GetLocalImgData({
                localId
              });
              const blob = ConvertBase64ToBlob(res2.localData);
              const file = ConvertBlobToFile(blob, '', '');
              files.push(file);
            }
            resolve({
              data: options_.data,
              files
            });
          } catch (err) {
            throw err;
          }
        })
        .catch((err) => {
          throw err;
        });
    });
  },
  async createFileChooser(
    targetEl: HTMLElement,
    options?: IFileChooserOptions,
    onSelected?: (res: IFileChooserChangeResponse) => void,
    onFailed?: (error: Error) => void
  ) {
    const options_: IFileChooserOptions = Object.assign(
      {},
      DefaultOptions,
      {
        id: GetGUID(10),
        clickable: false
      },
      options
    );
    const trigger = () => {
      this.openFileChooser(options_).then(
        function (res: any) {
          if (onSelected) {
            onSelected(res);
          }
        },
        function (error: Error) {
          if (onFailed) {
            onFailed(error);
          }
        }
      );
    };

    let off: any;
    if (options_.clickable) {
      off = On(targetEl, 'click', undefined, function (e: any) {
        e.stopPropagation();
        trigger();
      });
    }

    const destroy = function () {
      if (off) {
        off();
      }
    };

    return {
      trigger,
      destroy
    };
  }
};

export default FileChooserService;
