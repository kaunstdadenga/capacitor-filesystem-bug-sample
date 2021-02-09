/**
 * (c) LBS logics
 *
 *     Mobile Business Technology GmbH
 *     4020 Linz, Austria
 *
 *     www.lbs-logics.com
 *
 *     created on 20190902 by Jan Brunner
 *     all rights reserved.
 */

import { Injectable } from '@angular/core';

import {
  Plugins,
  FilesystemDirectory,
  FilesystemEncoding,
  Device,
} from '@capacitor/core';

const { Filesystem } = Plugins;

/**
 * Interface Definition for a FileManager Service
 */
@Injectable({
  providedIn: 'root',
})
export class FileManagerService {
  public static readonly FILE_NOT_FOUND_ERR = 'File does not exist';

  // Public Member

  // Lifecycle
  constructor(
  ) {}

  // Public Functions

  // General Files
  public async saveFile(
    dir: string,
    file: string,
    data: string
  ): Promise<string> {
    await this.mkdir(dir);

    let fullpath = dir + '/' + file;
    Filesystem.writeFile({
      path: fullpath,
      data: data,
      directory: FilesystemDirectory.Documents,
      encoding: FilesystemEncoding.UTF8,
      recursive: true,
    });

    return fullpath;
  }

  public async getFile(fullpath: string): Promise<string> {
    let content = await Filesystem.readFile({
      path: fullpath,
      directory: FilesystemDirectory.Documents,
      encoding: FilesystemEncoding.UTF8,
    });
    return content.data;
  }

  public async deleteFile(fullpath: string): Promise<void> {
    await Filesystem.deleteFile({
      path: fullpath,
      directory: FilesystemDirectory.Documents,
    });
  }

  // Ext Files
  public async getExtFileUri(name: string): Promise<string> {
    let directory = await this.getExtFilesDirectory();

    let response = await Filesystem.getUri({
      directory: directory,
      path: '/extFiles/' + name,
    });

    return response.uri;
  }

  public async deleteExtFile(fullpath: string): Promise<void> {
    let directory = await this.getExtFilesDirectory();

    await Filesystem.deleteFile({
      path: fullpath,
      directory: directory,
    });
  }

  public async extFileExists(name: string): Promise<boolean> {
    let directory = await this.getExtFilesDirectory();
    try {
      let found = await Filesystem.readFile({
        directory: directory,
        path: '/extFiles/' + name,
      });
      return !!found;
    } catch (error) {
      console.log(
        this.constructor.name,
        '- Could not read file or directory of file -> File does not exist.'
      );
      return false;
    }
  }

  // Private Functions

  private async getExtFilesDirectory(): Promise<FilesystemDirectory> {
    const info = await Device.getInfo();
    console.log("JB2021 device info operatingSystem", info.operatingSystem);
    if (info.operatingSystem === 'ios' || info.operatingSystem === 'mac') {
      return FilesystemDirectory.Cache;
    } else if (info.operatingSystem === 'android') {
      return FilesystemDirectory.Documents;
    } else {
      return FilesystemDirectory.Documents;
    }
  }

  private async mkdir(dir: string) {
    try {
      await Filesystem.mkdir({
        path: dir,
        directory: FilesystemDirectory.Documents,
        recursive: true,
      });
    } catch (e) {
      console.log(
        this.constructor.name,
        '- Unable to make directory',
        e.message
      );
    }
  }
}
