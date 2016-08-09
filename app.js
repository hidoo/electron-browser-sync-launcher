'use strict';

/**
 * モジュールのロード
 */
const browserSync = require('browser-sync').create(),
      escape = require('escape-html');

/**
 * 定数：BrowserSync の起動オプション
 */
const BROWSER_SYNC_OPTIONS = {
  server: {
    baseDir: './',
    directory: true,
    index: 'index.html'
  },
  files: './**/*.{html,css,js,png,jpg,jpeg,gif,svg}',
  host: '0.0.0.0',
  port: 8000,
  https: false,
  ui: false,
  open: false
};

/**
 * UI 要素の取得
 */
const fieldBaseDir = document.querySelector('#js-field--base-dir'),
      fieldFiles = document.querySelector('#js-field--files'),
      fieldHost = document.querySelector('#js-field--host'),
      fieldPort = document.querySelector('#js-field--port'),
      fieldHttps = document.querySelector('#js-field--https'),
      fieldUi = document.querySelector('#js-field--ui'),
      fieldOpen = document.querySelector('#js-field--open'),
      linkUrlLocal = document.querySelector('#js-link--url-local'),
      linkUrlExternal = document.querySelector('#js-link--url-external'),
      btnLaunch = document.querySelector('#js-btn--launch');

fieldBaseDir.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.server.baseDir);
fieldFiles.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.files);
fieldHost.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.host);
fieldPort.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.port);

/**
 * btnLaunch クリック時の処理
 */
btnLaunch.addEventListener('click', (event) => {
  const opts = {
    server: {
      baseDir: escape(fieldBaseDir.value) || BROWSER_SYNC_OPTIONS.server.baseDir,
      directory: BROWSER_SYNC_OPTIONS.server.directory,
      index: BROWSER_SYNC_OPTIONS.server.index
    },
    files: escape(fieldFiles.value) || BROWSER_SYNC_OPTIONS.files,
    host: escape(fieldHost.value) || BROWSER_SYNC_OPTIONS.host,
    port: escape(fieldPort.value) || BROWSER_SYNC_OPTIONS.port,
    https: !!fieldHttps.checked || BROWSER_SYNC_OPTIONS.https,
    ui: !!fieldUi.checked || BROWSER_SYNC_OPTIONS.ui,
    open: !!fieldOpen.checked || BROWSER_SYNC_OPTIONS.open
  };

  // browserSync のインスタンスがアクティブの時は停止し、
  // そうでない時は起動する
  if (browserSync.active) {
    browserSync.exit();

    // ボタンの見た目の変更
    btnLaunch.innerHTML = 'Launch BrowserSync';
    btnLaunch.classList.remove('btn-negative');

    // リンクの非表示
    linkUrlLocal.setAttribute('href', 'javascript:;');
    linkUrlLocal.removeAttribute('target');
    linkUrlLocal.querySelector('.js-link--url-message').innerHTML = 'Not Available';
    linkUrlExternal.setAttribute('href', 'javascript:;');
    linkUrlExternal.removeAttribute('target');
    linkUrlExternal.querySelector('.js-link--url-message').innerHTML = 'Not Available';
  }
  else {
    browserSync.init(opts, (...args) => {
      console.log(args);
    });

    // ボタンの見た目の変更
    btnLaunch.innerHTML = 'Stop BrowserSync';
    btnLaunch.classList.add('btn-negative');

    // リンクの生成
    let urlLocal = `${opts.https ? 'https' : 'http'}://localhost:${opts.port}`;
    let urlExternal = `${opts.https ? 'https' : 'http'}://${opts.host}:${opts.port}`;
    linkUrlLocal.setAttribute('href', urlLocal);
    linkUrlLocal.setAttribute('target', '_blank');
    linkUrlLocal.querySelector('.js-link--url-message').innerHTML = urlLocal;
    linkUrlExternal.setAttribute('href', urlExternal);
    linkUrlExternal.setAttribute('target', '_blank');
    linkUrlExternal.querySelector('.js-link--url-message').innerHTML = urlExternal;
  }

  event.preventDefault();
});
