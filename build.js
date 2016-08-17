'use strict';

/**
 * モジュールのロード
 */
const os = require('os'),
      packager = require('electron-packager'),
      pkg = require('./package.json');

packager({

  name: 'BrowsersyncLauncher',
  dir: './',
  out: './dist',
  platform: os.platform(), // プラットフォームごとのアプリをビルド
  arch: 'x64',
  version: '1.3.2',
  overwrite: true,
  asar: false,

  // アプリのバージョン、コピーライト
  'app-version': pkg.version,
  'app-copyright': `Copyright (C) ${pkg.author.name}`

}, (err, appPaths) => {// 完了時のコールバック
    if (err) {
      console.log(err);
    }
    console.log('Done: ' + appPaths);
});
