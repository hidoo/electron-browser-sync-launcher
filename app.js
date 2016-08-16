'use strict';

/**
 * モジュールのロード
 */
const os = require('os'),
      bs = require('browser-sync').create(),
      escape = require('escape-html');

/**
 * 定数：BrowserSync の起動オプション
 */
const BROWSER_SYNC_OPTIONS = {
  server: {
    baseDir: os.homedir(),
    directory: true,
    index: 'index.html'
  },
  files: '**/*.{html,css,js,png,jpg,jpeg,gif,svg}',
  host: '0.0.0.0',
  port: 8000,
  https: false,
  ui: false,
  open: false
};

/**
 * UI 要素の取得
 */
const droppable = document.querySelector('#js-droppable'),
      overlay = document.querySelector('#js-overlay'),
      fieldBaseDir = document.querySelector('#js-field--base-dir'),
      fieldFiles = document.querySelector('#js-field--files'),
      fieldHost = document.querySelector('#js-field--host'),
      fieldPort = document.querySelector('#js-field--port'),
      fieldHttps = document.querySelector('#js-field--https'),
      fieldUi = document.querySelector('#js-field--ui'),
      fieldOpen = document.querySelector('#js-field--open'),
      linkUrlLocal = document.querySelector('#js-link--url-local'),
      linkUrlExternal = document.querySelector('#js-link--url-external'),
      linkUrlUi = document.querySelector('#js-link--url-ui'),
      btnLaunch = document.querySelector('#js-btn--launch');

// フィールドの配列の作成と、placeholder の初期値を設定
const fields = [fieldBaseDir, fieldFiles, fieldHost, fieldPort, fieldHttps, fieldUi, fieldOpen];
fieldBaseDir.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.server.baseDir);
fieldFiles.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.files);
fieldHost.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.host);
fieldPort.setAttribute('placeholder', BROWSER_SYNC_OPTIONS.port);

// btnLaunch クリック時の処理
btnLaunch.addEventListener('click', handleClickBtnLaunch);

// ドラッグ&ドロップの処理
enableDragDropBaseDir();

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

  // 監視対象のファイルは、ドキュメントルート直下に指定する
  opts.files = `${opts.server.baseDir}/${opts.files}`;

  // UI が有効な時はオプションを設定する
  opts.ui = opts.ui ? {port: opts.port + 1} : false;

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
    if (opts.ui) {
      toogleLinkUrl(linkUrlUi, null);
    }
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
      if (opts.ui) {
        toogleLinkUrl(linkUrlUi, `${opts.https ? 'https' : 'http'}://localhost:${opts.ui.port}`);
      }
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
    element.querySelector('.js-link--url-message').textContent = '停止中';
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
    element.textContent = 'Browsersync を停止する';
    element.classList.add('btn-negative');
  }
  else {
    element.textContent = 'Browsersync を起動する';
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

/**
 * ドラッグ＆ドロップでの baseDir 設定機能を有効にする
 * @return {Void}
 */
function enableDragDropBaseDir() {

  // 不要なイベントをキャンセル
  droppable.addEventListener('dragenter', (event) => event.preventDefault());
  droppable.addEventListener('dragend', (event) => event.preventDefault());

  // ドラッグ開始時の処理
  // オーバーレイを表示して、ドロップ可能な領域であることをフィードバックする
  droppable.addEventListener('dragover', (event) => {
    event.preventDefault();

    if (bs.active) { return false; }

    if (event.currentTarget === droppable) {
      overlay.style.zIndex = 10000;
      overlay.style.opacity = 1;
    }
  });

  // ドロップ領域を離れた時の処理
  // オーバーレイを非表示にして、ドロップ可能な領域外であることをフィードバックする
  droppable.addEventListener('dragleave', (event) => {
    event.preventDefault();

    if (bs.active) { return false; }

    if (event.target === overlay) {
      overlay.style.zIndex = 0;
      overlay.style.opacity = 0;
    }
  });

  // ドロップ時の処理
  // オーバーレイを非表示にして、ドロップされたオブジェクトを処理する
  droppable.addEventListener('drop', (event) => {
    const files = event.dataTransfer.files;

    event.preventDefault();

    if (bs.active) { return false; }

    overlay.style.zIndex = 0;
    overlay.style.opacity = 0;

    // ファイルがない場合、
    // ファイルがディレクトリではない場合は無視する
    if (!files || !files[0]) { return false; }
    if (files[0].type !== '') { return false; }

    fieldBaseDir.value = files[0].path;
  })
}
