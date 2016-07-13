<!--
Don't edit readme.md directly.
If you want to change README.md:
1. Edit README.md.tmpl
2. Run `./bin/readme`
-->
# scaffold

## 実行ファイル

- `bin/develop`: 開発用のコンテナを立ち上げる
- `bin/glide`: `go` コンテナ内で `glide` する。引数を引き継ぐことができる。
- `bin/npm`: `node` コンテナ内で `npm` する。引数を引き継ぐことができる。
- `bin/readme`: README.md.tmpl から README.md を生成する。
- `bin/typings`: `node` コンテナ内で `typings` する。引数を引き継ぐことができる。
- `bin/const/env.sh`: 環境変数

## ローカル

Docker Compose でネットワーキングする。

### コンテナとポート

- `nginx`: Nginxが動いている
  - `:80`: httpリクエストを受ける
    - `/`: `node:8001` にプロキシする
    - `/api`: `go:5001` にプロキシする
- `node`: Nodeが動いている
  - `:8000`: Expressサーバを介してHTMLをサーバサイドレンダリングする
  - `:8001`: BrowserSyncを介して `node:8000` にプロキシする
  - `:8002`: BrowserSyncのWebUIをレンダリングする
  - `:8080`: InspectorがWebUIをレンダリングする
  - `:5858`: Nodeのデバッグ用ポート
- `go`: Goが動いている
  - `:5000`: APIサーバ
  - `:5001`: Ginを介して `go:5000` にプロキシする

### 開発ツール

#### クライアント

|URL|説明|
|:--|:--|
|[http://localhost](http://localhost)|デバッグ用URL（ブラウザの開発者ツールでデバッグする）|
|[http://localhost:8002](http://localhost:8002)|Browser Sync 設定画面|

---

- [Webpack](https://webpack.github.io/): JavaScriptアプリケーションのソースコードを監視し、変更時に自動ビルドするビルドツール
- [Hot Module Replacement](https://webpack.github.io/docs/hot-module-replacement.html): JavaScriptアプリケーションを監視し、ビルド後にブラウザをリロードすることなく差分モジュールだけを動的に置き換える開発補助ツール
- [Browser Sync](https://www.browsersync.io/): 同じサーバを参照しているブラウザに対して、ユーザ入力を共有するデバッグ補助ツール

#### SSRサーバー

|URL|説明|
|:--|:--|
|[http://localhost:8080](http://localhost:8080)|デバッグ用URL|

---

- [Webpack](https://webpack.github.io/): Nodeアプリケーションのソースコードを監視し、変更時に自動ビルドするビルドツール
- [Nodemon](https://github.com/remy/nodemon): Nodeアプリケーションを監視し、ビルド後に再起動する開発補助ツール
- [Node Inspector](https://github.com/node-inspector/node-inspector): Nodeアプリケーションのデバッグ用UIをブラウザに出力するデバッグ補助ツール

#### APIサーバー

- [Gin](https://github.com/codegangsta/gin): Goアプリケーションのソースコードを監視し、変更時に自動ビルドと再起動を行う開発補助ツール

## サーバー

Kubernetes でネットワーキング・クラスタリングする。

### コンテナとポート

- `nginx`: Nginxが動いている
  - `:80`: httpリクエストを受けける
    - `/`: `node:8000` にプロキシする
    - `/assets`: GCSのバケットにリダイレクトする
    - `/api`: `go:5000` にプロキシする
- `node`: Nodeが動いている
  - `:8000`: Expressサーバを介してHTMLをサーバサイドレンダリングする
- `go`: Goが動いている
  - `:5000`: APIサーバ

## ブランチ戦略

- `master`: デフォルトブランチ
  - `master`ブランチから開発用ブランチを切ってコミットする
  - コミットしたコードを統合する際は、`master`ブランチに Pull Request を作成し、コードレビューを経て`master`ブランチにマージする
    - Pull Request 作成者はレビュアーを設定する
  - マージするとCI経由でmaster環境にデプロイされる
- `production`: CI経由で本番環境にデプロイされる
  - 必ず`master`ブランチから`production`ブランチにPRを出し、確認を経て`production`ブランチにマージする
    - Pull Request 作成者はレビュアーを設定する
  - マージするとCI経由でproduction環境にデプロイされる
