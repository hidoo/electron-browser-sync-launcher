# electron-browser-sync-launcher

コマンドラインツール [Browsersync] の [Electron] 製ランチャーアプリです。     
ファイル選択ダイアログ、またはドラッグ&ドロップでドキュメントルートとなるディレクトリの指定を行い、[Browsersync] を起動することができます。

## オプション

対応している [Browsersync] の起動オプションは以下の通りです。

|項目|名前|
|:--|:--|
|[server.baseDir]|ドキュメントルートとなるディレクトリの指定|
|[files]|変更を監視してブラウザをリロードするファイルの指定（`server.baseDir` で指定したディレクトリ以下が対象となります）|
|[host]|IP アドレスの指定（デフォルトでは自動でローカルの IP アドレスが指定されます）|
|[port]|ポート番号の指定|
|[https]|https の有効化の指定|
|[ui]|UI の有効化の指定|
|[open]|ブラウザの自動起動の有効化の指定|

## 利用方法

まずは Node を導入し、npm でパッケージを導入してください。

```
$ npm install
```

### 修正、機能追加などの作業時

以下のコマンドでアプリが立ち上がります。Renderer プロセス修正時はリロードすることで反映されます。     
Main プロセス修正時は `Ctr` + `C` でプロセスを落とした上で、再度立ち上げ直してください。

```
$ npm start
```

### ビルド

以下のコマンドで使用しているプラットフォームに応じたアプリがビルドされます。     
ビルダーには [electron-packager] を使用しています。

```
$ npm run build
```

## License

MIT © Hideo Marunaga

[Browsersync]: https://www.browsersync.io/
[Electron]: http://electron.atom.io/
[server.baseDir]: https://www.browsersync.io/docs/options#option-server
[files]: https://www.browsersync.io/docs/options#option-files
[host]: https://www.browsersync.io/docs/options#option-host
[port]: https://www.browsersync.io/docs/options#option-port
[https]: https://www.browsersync.io/docs/options#option-https
[ui]: https://www.browsersync.io/docs/options#option-ui
[open]: https://www.browsersync.io/docs/options#option-open
[electron-packager]: https://github.com/electron-userland/electron-packager
