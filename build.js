'use strict';

/**
 * モジュールのロード
 */
const packager = require('electron-packager'),
      pkg = require('./package.json');

packager({

  name: 'Browsersync Launcher',
  dir: './',
  out: './dist',
  platform: 'darwin',
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
