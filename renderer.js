'use strict';

/**
 * モジュールのロード
 */
const os = require('os'),
      path = require('path'),
      { EventEmitter } = require('events'),
      { ipcRenderer } = require('electron'),
      browsersync = require('browser-sync'),
      escape = require('escape-html'),
      marked = require('marked');

/**
 * 定数：イベント
 * @type {String}
 */
const EVENT_SELECTED_BASE_DIR = 'selected-base-dir';
const EVENT_OPEN_LICENSE = 'open-license';
const EVENT_OPEN_LICENSE_ERROR = 'open-license-error';
const EVENT_OPEN_LICENSE_SUCCESS = 'open-license-success';
const EVENT_BS_START = 'bs-start';
const EVENT_BS_END = 'bs-end';

/**
 * 定数：UI
 */
const UI_LABEL_BTN_LAUNCH_START = 'Browsersync を起動する';
const UI_LABEL_BTN_LAUNCH_END = 'Browsersync を停止する';
const UI_LABEL_LINK_STOP = '停止中';

/**
 * 定数：Browsersync の起動オプション
 */
const BS_OPTIONS = {
  server: {
    baseDir: os.homedir(),
    directory: true,
    index: 'index.html'
  },
  files: '**/*.*',
  host: getExternalIps()[0],
  port: 8000,
  https: false,
  ui: false,
  open: false
};

/**
 * BrowsersyncLauncher の初期化オプション
 */
const BS_LAUNCHER_OPTIONS = {

  // インスタンスの ID
  id: ''
};

/**
 * @class BrowsersyncLauncher
 */
class BrowsersyncLauncher extends EventEmitter {

  /**
   * コンストラクタ
   * @param {BS_LAUNCHER_OPTIONS} options
   * @return {Void}
   */
  constructor(options) {
    super();

    const opts = Object.assign({}, BS_LAUNCHER_OPTIONS, options);

    /* +++++++++++++++
     *
     * プロパティの初期化
     *
     * +++++++++++++ */

    this.id = opts.id;

    // BrowserSync のインスタンス
    this.bs = browsersync.create();

    // UI 要素
    this.uis = {
      droppable: document.getElementById('js-droppable'),
      overlay: document.getElementById('js-overlay'),
      btnLaunch: document.getElementById('js-btn--launch'),
      btnReset: document.getElementById('js-btn--reset'),
      licenseInfo: document.getElementById('js-license-info'),
      licenseInfoLink: document.getElementById('js-license-info-link'),
      licenseInfoClose: document.getElementById('js-license-info-close'),
      licenseInfoBody: document.getElementById('js-license-info-body')
    };

    // リンク要素
    this.links = {
      local: document.getElementById('js-link--url-local'),
      external: document.getElementById('js-link--url-external'),
      ui: document.getElementById('js-link--url-ui')
    };

    // フィールド要素
    this.fields = {
      baseDir: document.getElementById('js-field--base-dir'),
      files: document.getElementById('js-field--files'),
      host: document.getElementById('js-field--host'),
      port: document.getElementById('js-field--port'),
      https: document.getElementById('js-field--https'),
      ui: document.getElementById('js-field--ui'),
      open: document.getElementById('js-field--open')
    };

    // フィールドの placeholder を設定
    this.fields.baseDir.setAttribute('placeholder', BS_OPTIONS.server.baseDir);
    this.fields.files.setAttribute('placeholder', BS_OPTIONS.files);
    this.fields.host.setAttribute('placeholder', BS_OPTIONS.host);
    this.fields.port.setAttribute('placeholder', BS_OPTIONS.port);

    // フィールドの値を復元
    this.restoreFieldsValue();

    /* +++++++++++++++
     *
     * イベントの監視
     *
     * +++++++++++++ */

    // baseDir が選択された際に発生するイベントを監視して
    // フィールドの値を更新する
    this.on(EVENT_SELECTED_BASE_DIR, (path) => {
      if (path) {
        this.fields.baseDir.value = path;
      }
    });

    // Browsersync の起動時に発生するイベントを監視して
    // フィールドの値を localStorage に保存する
    this.on(EVENT_BS_START, (newOpts) => {
      const newOptsCache = Object.assign({}, newOpts);

      // newOpts.files は baseDir と連結しているので、その部分を除去して保存する
      newOptsCache.files = newOpts.files.replace(`${newOpts.server.baseDir}/`, '');
      localStorage.setItem(`${this.id}_config`, JSON.stringify(newOptsCache));
    });

    // Browsersync の起動終了時に発生するイベントを監視して
    // フィールド・リセットボタンの有効・無効を切り替える
    this.on(EVENT_BS_START, (newOpts) => {
      Object.keys(this.fields).forEach((key) => {
        this.fields[key].disabled = 'disabled';
      });
      this.uis.btnReset.disabled = 'disabled';
    });
    this.on(EVENT_BS_END, () => {
      Object.keys(this.fields).forEach((key) => {
        this.fields[key].disabled = '';
      });
      this.uis.btnReset.disabled = '';
    });

    // Browsersync の起動終了時に発生するイベントを監視して
    // リンクの値を切り替える
    Object.keys(this.links).forEach((key) => {
      const element = this.links[key];

      this.on(EVENT_BS_START, (newOpts) => {
        const host = key === 'external' ? newOpts.host : 'localhost',
              port = newOpts.port,
              protocol = newOpts.https ? 'https' : 'http';

        let url = `${protocol}://${host}:${port}`;

        // UI 用の URL の作成
        // UI が有効な時だけ作成する
        if (key === 'ui') {
          if (!newOpts.ui) { return; }
          else {
            url = `http://${host}:${newOpts.ui.port}`;
          }
        }

        element.setAttribute('href', url);
        element.setAttribute('target', '_blank');
        element.querySelector('.js-link--url-message').textContent = url;
      });
      this.on(EVENT_BS_END, () => {
        element.setAttribute('href', 'javascript:;');
        element.removeAttribute('target');
        element.querySelector('.js-link--url-message').textContent = UI_LABEL_LINK_STOP;
      });
    });

    // Browsersync の起動終了時に発生するイベントを監視して
    // ボタンの有効・無効を切り替える
    this.on(EVENT_BS_START, (newOpts) => {
      this.uis.btnLaunch.textContent = UI_LABEL_BTN_LAUNCH_END;
      this.uis.btnLaunch.classList.add('btn-negative');
    });
    this.on(EVENT_BS_END, () => {
      this.uis.btnLaunch.textContent = UI_LABEL_BTN_LAUNCH_START;
      this.uis.btnLaunch.classList.remove('btn-negative');
    });

    /* +++++++++++++++
     *
     * 機能の有効化
     *
     * +++++++++++++ */

    this.enableBtnReset();
    this.enableBtnLaunch();
    this.enableSelectBaseDir();
    this.enableDragDropBaseDir();
    this.enableLicenseInfo();
  }

  /**
   * OS のファイル選択ダイアログでの baseDir 設定機能を有効にする
   * @return {BrowsersyncLauncher}
   */
  enableSelectBaseDir() {
    const fieldBaseDir = this.fields.baseDir;
    let isDialogOpen = false;

    // 必要な要素がなければエラーを投げる
    if (!fieldBaseDir) {
      throw new Error(`enableSelectBaseDir: "fieldBaseDir" element is required.`);
    }

    // fieldBaseDir クリック時の処理
    this.fields.baseDir.addEventListener('click', (event) => {
      if (!isDialogOpen) {
        isDialogOpen = true;
        ipcRenderer.send('open-file-dialog');
      }
    });

    // ディレクトリが選択された時の処理
    // baseDir 選択イベントを発生させる
    ipcRenderer.on('selected-directory', (event, files) => {
      this.emit(EVENT_SELECTED_BASE_DIR, files[0]);
      isDialogOpen = false;
    });

    // ディレクトリが選択されなかった時の処理
    ipcRenderer.on('cancel-select-directory', (event) => {
      isDialogOpen = false;
    });

    return this;
  }

  /**
   * ドラッグ＆ドロップでの baseDir 設定機能を有効にする
   * @return {BrowsersyncLauncher}
   */
  enableDragDropBaseDir() {
    const droppable = this.uis.droppable,
          overlay = this.uis.overlay,
          bs = this.bs;

    // 必要な要素がなければエラーを投げる
    if (!droppable || !overlay) {
      throw new Error(`enableDragDropBaseDir: "droppable" and "overlay" elements are required.`);
    }

    // 不要なイベントをキャンセル
    droppable.addEventListener('dragenter', (event) => event.preventDefault());
    droppable.addEventListener('dragend', (event) => event.preventDefault());

    // ドラッグ開始時の処理
    // オーバーレイを表示して、ドロップ可能な領域であることをフィードバックする
    droppable.addEventListener('dragover', (event) => {
      event.preventDefault();

      // Brosersync 起動中の場合は何もしない
      if (bs.active) {
        return false;
      }

      // 現在のイベントの発生元がドロップ可能領域の場合、
      // オーバーレイ表示する
      if (event.currentTarget === droppable) {
        overlay.classList.add('js-active');
      }
    });

    // ドロップ領域を離れた時の処理
    // オーバーレイを非表示にして、ドロップ可能な領域外であることをフィードバックする
    droppable.addEventListener('dragleave', (event) => {
      event.preventDefault();

      // Brosersync 起動中の場合は何もしない
      if (bs.active) {
        return false;
      }

      // 現在のイベントの発生元がオーバーレイの場合、
      // オーバーレイ非表示にする
      if (event.target === overlay) {
        overlay.classList.remove('js-active');
      }
    });

    // ドロップ時の処理
    // オーバーレイを非表示にして、ドロップされたオブジェクトを処理する
    droppable.addEventListener('drop', (event) => {
      event.preventDefault();

      // Brosersync 起動中の場合は何もしない
      if (bs.active) {
        return false;
      }

      // オーバーレイ非表示にする
      overlay.classList.remove('js-active');

      // ファイルがない場合、
      // ファイルがディレクトリではない場合は無視する
      const files = event.dataTransfer.files;
      if (!files || !files[0]) { return false; }
      if (files[0].type !== '') { return false; }

      // baseDir 選択イベントを発生させる
      this.emit(EVENT_SELECTED_BASE_DIR, files[0].path);
    });

    return this;
  }

  /**
   * 起動ボタンクリック時の処理。
   * @return {BrowsersyncLauncher}
   */
  enableBtnLaunch() {
    const bs = this.bs,
          btnLaunch = this.uis.btnLaunch;

    // 必要な要素がなければエラーを投げる
    if (!btnLaunch) {
      throw new Error(`enableBtnLaunch: "btnLaunch" element is required.`);
    }

    btnLaunch.addEventListener('click', (event) => {
      const newOpts = Object.assign({}, BS_OPTIONS),
            baseDir = escape(this.fields.baseDir.value),
            files = escape(this.fields.files.value),
            host = escape(this.fields.host.value),
            port = parseInt(escape(this.fields.port.value), 10),
            https = !!this.fields.https.checked,
            ui = !!this.fields.ui.checked,
            open = !!this.fields.open.checked ? 'external' : false;

      // Object.assign ではディープコピーされないので
      // 内部のオブジェクトについては個別にコピー
      newOpts.server = Object.assign({}, BS_OPTIONS.server);

      // デフォルトイベントを抑制
      event.preventDefault();

      // オプションの調整
      newOpts.server.baseDir = path.resolve(baseDir || newOpts.server.baseDir);
      newOpts.host = host || newOpts.host;
      newOpts.port = port || newOpts.port;
      newOpts.https = https || newOpts.https;
      newOpts.open = open || newOpts.open;

      // オプションの調整
      // 監視対象のファイルは、ドキュメントルート直下に指定する
      newOpts.files = path.resolve(path.join(newOpts.server.baseDir, files || newOpts.files));

      // オプションの調整
      // UI が有効な時はオプションを設定する
      newOpts.ui = ui ? {port: newOpts.port + 1} : false;

      // Browsersync のインスタンスがアクティブの時は停止し、
      // そうでない時は起動する
      if (bs.active) {
        bs.exit();
        this.emit(EVENT_BS_END);
      }
      else {
        bs.init(newOpts, (...args) => {
          this.emit(EVENT_BS_START, newOpts, args);
        });
      }
    });

    return this;
  }

  /**
   * リセットボタンクリック時の処理。
   * @return {BrowsersyncLauncher}
   */
  enableBtnReset() {
    const bs = this.bs,
          fields = this.fields,
          btnReset = this.uis.btnReset;

    // 必要な要素がなければエラーを投げる
    if (!btnReset) {
      throw new Error(`enableBtnReset: "btnReset" element is required.`);
    }

    btnReset.addEventListener('click', () => {

      // localStorage の値をクリアの値をクリア
      localStorage.removeItem(`${this.id}_config`);
    });
  }

  /**
   * フィールドの値を復元する
   * @return {BrowsersyncLauncher}
   */
  restoreFieldsValue() {
    const oldConfig = JSON.parse(localStorage.getItem(`${this.id}_config`)),
          fields = this.fields;

    if (oldConfig) {
      Object.keys(fields).forEach((key) => {
        const field = fields[key],
              conf = key === 'baseDir' ? oldConfig.server[key] : oldConfig[key];

        if (field.type === 'text') {
          field.value = conf;
        }
        else {
          field.checked = conf ? 'checked' : '';
        }
      });
    }

    return this;
  }

  /**
   * ライセンス表示機能を有効にする
   * @return {BrowsersyncLauncher}
   */
  enableLicenseInfo() {
    const renderer = new marked.Renderer(),
          licenseInfo = this.uis.licenseInfo,
          licenseInfoLink = this.uis.licenseInfoLink,
          licenseInfoClose = this.uis.licenseInfoClose,
          licenseInfoBody = this.uis.licenseInfoBody;
    let isLoaded = false;

    // 必要な要素がなければエラーを投げる
    if (!licenseInfo || !licenseInfoLink || !licenseInfoClose || !licenseInfoBody) {
      throw new Error(`enableLicenseInfo: "licenseInfo" "licenseInfoLink" "licenseInfoClose" and "licenseInfoBody" elements are required.`);
    }

    // marked の renderer を拡張して、
    // リンクはすべて target="_blank" で開くように設定
    renderer.link = (href, title, text) => {
      return `<a href="${ href }" title="${ title }" target="_blank">${ text }</a>`
    };

    // LICENSE.md の読み込みに成功した場合の処理
    licenseInfoLink.addEventListener('click', () => {

      if (!isLoaded) {
        ipcRenderer.send(EVENT_OPEN_LICENSE);
      }

      licenseInfo.classList.add('js-active');
    });

    licenseInfoClose.addEventListener('click', () => {
      licenseInfo.classList.remove('js-active');
    });

    // LICENSE.md の読み込みに成功した場合の処理
    // ライセンス表記エリアに表示し、読み込みフラグを有効にする
    ipcRenderer.on(EVENT_OPEN_LICENSE_SUCCESS, (event, data) => {
      licenseInfoBody.innerHTML = marked(data, { renderer: renderer });
      isLoaded = true;
    });

    // LICENSE.md の読み込みに失敗した場合の処理
    ipcRenderer.on(EVENT_OPEN_LICENSE_ERROR, (event, data) => {
      licenseInfoBody.innerHTML = marked(`LICENSE.md is not loaded.`);
    });

    return this;
  }

}

/**
 * 端末の公開 IP アドレスを取得する。
 * @return {Array}
 */
function getExternalIps() {
  const ifaces = os.networkInterfaces(),
        ips = [];

  // ネットワークインターフェースの値から必要な値を取り出す
  Object.keys(ifaces).forEach((key) => {
    ifaces[key].forEach((iface) => {

      // 内部 IP は除外
      if (iface.internal) {
        return;
      }

      // 内部 IPv6 は除外
      if (iface.family === 'IPv6') {
        return;
      }

      // アドレスを格納
      ips.push(iface.address);
    });
  });

  // 値が返ってこなかった場合は 0.0.0.0 を優先で使用する
  if (!ips[0]) {
    ips.push('0.0.0.0');
  }

  return ips;
}

/**
 * モジュールのエクスポート
 */
module.exports.BrowsersyncLauncher = BrowsersyncLauncher;
