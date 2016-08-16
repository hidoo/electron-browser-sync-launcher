'use strict';

/**
 * Electron のモジュールの読み込み
 */
const electron = require('electron');
const shell = electron.shell;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const dialog = electron.dialog;

/**
 * Electron のデバッグツールの使用の使用
 */
// require('electron-debug')();

/**
 * 新しいウィンドウの生成
 */
let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({width: 720, height: 450});

  // index.htmlを表示
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  })

  // デバッグするためのDevToolsを表示
  // mainWindow.webContents.openDevTools();

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

/**
 * ファイル選択ダイアログを開くイベントが発生した時の処理
 * OS のファイル選択ダイアログを開き、ディレクトリが選択されたら、
 * renderer プロセスにイベントを送信する
 */
ipc.on('open-file-dialog', (event) => {

  dialog.showOpenDialog({ properties: ['openDirectory'] }, (files) => {
    if (files) {
      event.sender.send('selected-directory', files);
    }
  });
});
