'use strict';

/**
 * Electron のモジュールの読み込み
 */
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

/**
 * Electron のデバッグツールの使用の使用
 */
require('electron-debug')();

/**
 * 新しいウィンドウの生成
 */
let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({width: 600, height: 400});

  // index.htmlを表示
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // デバッグするためのDevToolsを表示
  mainWindow.webContents.openDevTools();

  // ウィンドウを閉じたら参照を破棄
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * 準備が整ったらウィンドウを生成する
 */
app.on('ready', createMainWindow);

/**
 * アクティブになった際にウィンドウが生成されていなければ生成する
 */
app.on('activate', () => {
  if (!mainWindow) {
    mainWindow = createMainWindow();
  }
});

/**
 * 全てのウィンドウを閉じたらアプリを終了
 */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
