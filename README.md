# Museum Compass

企業博物館・産業遺産・歴史館への訪問を支援するWebアプリ。

- **地図 + リストで施設を探す** — カテゴリ絞り込み、リスト/地図の切替表示
- **訪問前に詳細を確認する** — 入場料、営業時間（曜日別）、休館情報、公式サイトリンク
- **レビューを読む・書く** — 星評価 + コメントで訪問体験を共有（要ログイン）

## 技術スタック

| レイヤー       | 技術                           |
| -------------- | ------------------------------ |
| フレームワーク | Next.js (App Router)           |
| スタイル       | Tailwind CSS / shadcn/ui v4    |
| データ取得     | SWR                            |
| 地図           | react-map-gl + MapLibre GL JS  |
| DB             | Prisma v7 + PostgreSQL (Neon)  |
| 認証           | Auth.js v5                     |
| テスト         | Vitest + Testing Library + MSW |
| デプロイ       | Vercel                         |

## セットアップ

```bash
# 依存関係のインストール
npm install

# PostgreSQL 起動
docker compose up -d

# 環境変数の設定
cp .env.sample .env
# .env を編集し AUTH_SECRET を設定

# DB マイグレーション + シード
npm run db:migrate

# 開発サーバー起動
npm run dev
```

http://localhost:3000 で確認できます。

## npm scripts

| コマンド               | 用途                       |
| ---------------------- | -------------------------- |
| `npm run dev`          | 開発サーバー起動           |
| `npm run build`        | プロダクションビルド       |
| `npm run lint`         | ESLint                     |
| `npm run format`       | Prettier（修正）           |
| `npm run format:check` | Prettier（チェックのみ）   |
| `npx vitest run`       | テスト実行                 |
| `npm run db:migrate`   | マイグレーション作成・適用 |
| `npm run db:seed`      | シードデータ投入           |
| `npm run db:reset`     | DB 初期化                  |

## 施設データについて

- 施設は随時追加・更新されます。追加方法は `src/data/museums-*.json` を編集して `npm run db:seed` を実行するだけです
- 営業時間・入場料などの情報は実際と異なる場合があります。定期的に公式サイトと照合し、データの正確性を維持してください
- 休館・閉館が判明した場合は `isClosed` フラグと `closedMessage` を更新してください

## ディレクトリ構成

```
src/
  app/           # ページ + API routes
  components/    # UI コンポーネント
  lib/           # ユーティリティ・Prisma・マッパー
  types/         # 型定義
  data/          # JSON フィクスチャ
  mocks/         # MSW ハンドラー
prisma/          # schema / seed / migrations
docs/
  openapi.yaml   # API 仕様 (OpenAPI 3.0)
  specs/         # 機能仕様書
```
