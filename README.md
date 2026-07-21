# ToyBox

> **Always Standard, Forever Standalone, All in One.**

ToyBox は、単一の HTML ファイルとして自己完結して動作するポータブルな Web アプリケーション群と、それらを統合管理するポータル環境を提供するプロジェクトです。

---

## 💡 特徴

- **スタンドアロン動作**: サーバー不要でブラウザ上で完全に動作します（IndexedDB を活用したローカルデータ保存）。
- **シングルファイル出力**: Vite + `vite-plugin-singlefile` により、HTML 1ファイルに JS/CSS/アセットをバンドルしてポータブルに配布可能です。
- **コンポーネント指向**: Lit (Web Components) と TypeScript を採用し、軽量かつ標準規格に準拠した UI コンポーネントで構築されています。

---

## 📱 収録アプリケーション

| アプリ名 | ターゲット | 説明 |
| :--- | :--- | :--- |
| **ToyBox Portal** | `toybox` | 収録アプリをシームレスに切り替えて利用できる統合ポータルコンテナ |
| **StepNote** | `stepnote` | タスク・メモ・手順を管理・整理できるステップノートアプリ |
| **HubAddress** | `hubaddress` | 連絡先情報をクライアントサイドで管理するハブ型アドレス帳 |

---

## 🛠 技術スタック

- **Core / Framework**: Lit (Web Components), TypeScript
- **Build Tool**: Vite, `vite-plugin-singlefile`
- **UI & Styling**: WebAwesome, Sass (SCSS), GitHub Markdown CSS
- **Data & Storage**: Dexie.js (IndexedDB), PapaParse (CSV Parsing)
- **Charts / Renderers**: ApexCharts, Marked (Markdown parser)

---

## 🚀 開発・ビルド手順

### 開発サーバーの起動

```bash
npm run dev
```

### ビルドコマンド

用途に応じたターゲットをビルドできます。成果物は `dist/` 配下に単一 HTML ファイル（`[app_name].html`）として生成されます。

- **ToyBox Portal のみビルド**:

  ```bash
  npm run build
  ```

- **StepNote のみビルド**:

  ```bash
  npm run build-sn
  ```

- **HubAddress のみビルド**:

  ```bash
  npm run build-ha
  ```

- **全ターゲットを一括ビルド**:

  ```bash
  npm run build-all
  ```
