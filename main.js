'use strict';

/**
 * Electron のモジュールの読み込み
 */
const { shell, app, ipcMain, dialog, BrowserWindow } = require('electron'),
      fs = require('fs');

/**
 * Electron のデバッグツールの使用
 */
// require('electron-debug')();

/**
 * 新しいウィンドウの生成
 */
let mainWindow;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 780,
    height: 500,
    minWidth: 780,
    minHeight: 500
  });

  // index.htmlを表示
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // アプリ内部からブラウザへのリンクを開く
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
 * OS のファイル選択ダイアログを開き、ディレクトリが選択、またキャンセルされたら、
 * renderer プロセスにイベントを送信する
 */
ipcMain.on('open-file-dialog', (event) => {

  dialog.showOpenDialog({ properties: ['openDirectory'] }, (files) => {

    if (files) {
      event.sender.send('selected-directory', files);
    }
    else {
      event.sender.send('cancel-select-directory');
    }
  });
});

/**
 * ライセンス表示を開くイベントが発生した時の処理
 * OS のファイル選択ダイアログを開き、ディレクトリが選択、またキャンセルされたら、
 * renderer プロセスにイベントを送信する
 */
ipcMain.on('open-license', (event) => {

  fs.readFile(`${__dirname}/LICENSE.md`, 'utf8', (error, data) => {
    if (error) {
      event.sender.send('open-license-error');
    }
    else {
      event.sender.send('open-license-success', data);
    }
  });
});
