'use strict';

/**
 * モジュールのロード
 */
const bs = require('browser-sync').create(),
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

// フィールドの配列の作成と、placeholder の初期値を設定
const fields = [fieldBaseDir, fieldFiles, fieldHost, fieldPort, fieldHttps, fieldUi, fieldOpen];
fieldBaseDir.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.server.baseDir);
fieldFiles.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.files);
fieldHost.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.host);
fieldPort.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.port);

/**
 * btnLaunch クリック時の処理
 */
btnLaunch.addEventListener('click', handleClickBtnLaunch);

/**
 * 起動ボタンクリック時の処理。イベントハンドラとして設定される
 * @param  {DOMEvent} event イベント
 * @return {void}
 */
function handleClickBtnLaunch(event) {
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

  // Browsersync のインスタンスがアクティブの時は停止し、
  // そうでない時は起動する
  if (bs.active) {
    bs.exit();

    // ボタン・フィールドの見た目の変更
    toggleBtnLaunch(btnLaunch, bs.active);
    toggleFields(fields, bs.active);

    // リンクの非表示
    toogleLinkUrl(linkUrlLocal, null);
    toogleLinkUrl(linkUrlExternal, null);
  }
  else {
    bs.init(opts, (...args) => {
      console.log(args);

      // ボタン・フィールドの見た目の変更
      toggleBtnLaunch(btnLaunch, bs.active);
      toggleFields(fields, bs.active);

      // リンクの生成
      toogleLinkUrl(linkUrlLocal, `${opts.https ? 'https' : 'http'}://localhost:${opts.port}`);
      toogleLinkUrl(linkUrlExternal, `${opts.https ? 'https' : 'http'}://${opts.host}:${opts.port}`);
    });
  }

  event.preventDefault();
}

/**
 * リンク表示の表示切り替え
 * @param  {HTMLElement} element 対象の <a> 要素
 * @param  {String} url リンク先の URL 文字列
 * @return {Element}
 */
function toogleLinkUrl(element, url) {
  if (!element) {
    throw new Error(`"element" arg is required. (from toogleLinkUrl)`);
  }

  if (url) {
    element.setAttribute('href', url);
    element.setAttribute('target', '_blank');
    element.querySelector('.js-link--url-message').textContent = url;
  }
  else {
    element.setAttribute('href', 'javascript:;');
    element.removeAttribute('target');
    element.querySelector('.js-link--url-message').textContent = 'Not Available';
  }

  return element;
}

/**
 * リンク表示の表示切り替え
 * @param  {HTMLElement} element 対象の <button> 要素
 * @param  {String} active Browsersync が起動中か否かの真偽値
 * @return {Element}
 */
function toggleBtnLaunch(element, active) {
  if (!element) {
    throw new Error(`"element" arg is required. (from toggleBtnLaunch)`);
  }

  if (active) {
    element.textContent = 'Stop BrowserSync';
    element.classList.add('btn-negative');
  }
  else {
    element.textContent = 'Launch BrowserSync';
    element.classList.remove('btn-negative');
  }

  return element;
}

/**
 * フィールドの表示切り替え
 * @param  {Array} elements 対象のフィールド要素
 * @param  {String} active Browsersync が起動中か否かの真偽値
 * @return {Element}
 */
function toggleFields(elements, active) {
  if (!elements[0]) {
    throw new Error(`"elements" arg is required. (from toggleFields)`);
  }

  elements.forEach((element) => {

    if (active) {
      element.disabled = 'disabled';
    }
    else {
      element.disabled = '';
    }
  });
}
