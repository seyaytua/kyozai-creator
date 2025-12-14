# Tauri セットアップ手順

TauriでWindowsデスクトップアプリをビルドするには、Rustのインストールが必要です。

## 1. Rustのインストール（Mac）

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

インストール後、ターミナルを再起動するか：
```bash
source ~/.cargo/env
```

## 2. Tauri CLIのインストール

```bash
npm install -D @tauri-apps/cli
```

## 3. Tauriプロジェクトの初期化

```bash
cd /Users/syuta/Documents/Antigravity/教材作成アプリ
npx tauri init
```

質問に以下のように回答：
- App name: `教材作成ツール`
- Window title: `教材作成ツール`
- Frontend dev command: `npm run dev`
- Frontend build command: `npm run build`
- Frontend directory: `dist`

## 4. 開発モードで起動

```bash
npm run tauri dev
```

## 5. Windowsビルド（クロスコンパイル）

Mac上でWindowsビルドをするには追加設定が必要。
推奨：Windows環境またはGitHub Actionsで行う。

### GitHub Actions例

`.github/workflows/build.yml`:
```yaml
name: Build
on: push
jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm run build
      - uses: tauri-apps/tauri-action@v0
```

## 次のステップ

1. Rustをインストール
2. `npx tauri init` を実行
3. 開発モードで動作確認
4. Windowsビルドの設定
