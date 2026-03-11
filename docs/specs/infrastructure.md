# インフラ構成仕様

## 1. 概要

Prisma + PostgreSQL によるデータ永続化。Vercel でホスティング。
API レスポンス形式は OpenAPI 仕様（`docs/openapi.yaml`）に準拠する。

データモデルの定義は [museum.md](./museum.md)、[review.md](./review.md)、[auth.md](./auth.md) を参照。

## 2. DB 構成

### 技術選定

| 技術              | 理由                                             |
| ----------------- | ------------------------------------------------ |
| Prisma            | 型安全、マイグレーション管理、Next.js との親和性 |
| PostgreSQL (Neon) | Vercel Postgres として統合可能、無料枠あり       |

### ID 戦略

| モデル              | ID 型            | 生成方式      | 理由                                         |
| ------------------- | ---------------- | ------------- | -------------------------------------------- |
| Museum, Review, Tag | INTEGER (SERIAL) | autoincrement | シンプル、URL が短い、インデックス効率が良い |
| User, Account 等    | STRING (cuid)    | cuid()        | Auth.js の規約に準拠                         |

### DB 固有の制約

| フィールド         | DB 型            | 制約                     |
| ------------------ | ---------------- | ------------------------ |
| Museum.id          | SERIAL (int)     | PK, autoincrement        |
| Museum.name        | VARCHAR(255)     | NOT NULL                 |
| Museum.description | TEXT             | -                        |
| Museum.latitude    | DOUBLE PRECISION | NOT NULL                 |
| Museum.longitude   | DOUBLE PRECISION | NOT NULL                 |
| Museum.address     | VARCHAR(500)     | -                        |
| Museum.websiteUrl  | VARCHAR(2048)    | -                        |
| Review.id          | SERIAL (int)     | PK, autoincrement        |
| Review.rating      | INTEGER          | NOT NULL, CHECK 1-5      |
| Review.comment     | TEXT             | -                        |
| Review.userId      | VARCHAR(255)     | NOT NULL, FK → User.id   |
| Review.museumId    | INTEGER          | NOT NULL, FK → Museum.id |
| Tag.id             | SERIAL (int)     | PK, autoincrement        |
| Tag.name           | VARCHAR(100)     | NOT NULL, UNIQUE         |
| \_MuseumToTag      | -                | 暗黙的多対多結合テーブル |

### インデックス

- `Review.museumId` — 施設ごとのレビュー取得高速化
- `Museum.category` — カテゴリフィルタ高速化
- `Tag.name` — UNIQUE 制約によるインデックス

### シードデータ

`src/data/museums.json`、`src/data/reviews.json`、`src/data/tags.json` を Prisma seed スクリプトで投入する。

## 3. 環境変数

`.env.sample` を参照。`cp .env.sample .env` で作成し、値を設定する。

| 変数                  | 説明                                      | 必須     |
| --------------------- | ----------------------------------------- | -------- |
| DATABASE_URL          | PostgreSQL 接続文字列                     | yes      |
| DATABASE_URL_UNPOOLED | PostgreSQL 直接接続（マイグレーション用） | 本番のみ |
| AUTH_SECRET           | Auth.js セッション暗号化キー              | yes      |

### env ファイル構成

| ファイル                | 用途                                                  | Git 管理 |
| ----------------------- | ----------------------------------------------------- | -------- |
| `.env.sample`           | テンプレート                                          | yes      |
| `.env`                  | ローカル開発用（Prisma CLI / Next.js が自動読み込み） | no       |
| `.env.production.local` | 本番DB操作用（`dotenv -e` で明示的に読む）            | no       |

### 接続先の決定ロジック

- **ランタイム**（`src/lib/prisma.ts`）: `DATABASE_URL` を使用。本番は `@prisma/adapter-neon`、ローカルは `@prisma/adapter-pg` を自動切替
- **マイグレーション**（`prisma.config.ts`）: `DATABASE_URL_UNPOOLED` を優先、なければ `DATABASE_URL` にフォールバック

## 4. 環境構成

### ローカル開発

- Docker Compose で PostgreSQL を起動（`docker-compose.yml`）
- `.env` に環境変数を設定
- DB アダプター: `@prisma/adapter-pg`（標準 PostgreSQL ドライバー）

### Vercel 本番

- Vercel Postgres（Neon）をプロジェクトに接続
- `DATABASE_URL`（プール）、`DATABASE_URL_UNPOOLED`（ダイレクト）は Vercel が自動設定
- `AUTH_SECRET` は手動で設定
- DB アダプター: `@prisma/adapter-neon`（Neon サーバレスドライバー）
- ランタイムは `DATABASE_URL`（pgbouncer 経由）、マイグレーションは `DATABASE_URL_UNPOOLED`（直接接続）を使用

### テスト

- MSW モックを使用（DB 不要）

## 5. マイグレーション運用

### ローカル: 初回セットアップ

1. `docker compose up -d` — PostgreSQL 起動
2. `cp .env.sample .env` — 環境変数ファイル作成、`AUTH_SECRET` を設定
3. `npm run db:migrate` — マイグレーション適用 + Prisma Client 生成 + シードデータ投入
4. `npm run dev` — 開発サーバー起動

### ローカル: スキーマ変更の手順

1. `prisma/schema.prisma` を編集
2. `npm run db:migrate` — マイグレーションファイル生成 + ローカルDB適用 + Prisma Client 再生成（名前を聞かれるので入力）
3. マイグレーションファイルを Git にコミット
4. 動作確認

**DB をまっさらにしたい場合:**

1. `npm run db:reset` — 全テーブル削除 + 全マイグレーション再適用 + シード

### 本番: マイグレーション適用の手順

前提: `.env.production.local` に `DATABASE_URL_UNPOOLED` が設定済みであること

1. `npm run db:migrate:status:prod` — 未適用のマイグレーションを確認
2. `npm run db:migrate:deploy:prod` — 本番DBにマイグレーション適用
3. Vercel にデプロイ（Git push）
4. 動作確認

**初回 or シードデータの投入:**

1. `npm run db:seed:prod` — 本番DBにシードデータ投入

### マイグレーションのルール

- マイグレーションファイルは手動で編集しない
- 本番適用済みのマイグレーションは削除・変更しない
- ローカルでのみ `prisma migrate dev` を使用し、本番では `prisma migrate deploy` のみ
- 破壊的変更（カラム削除・型変更等）を含む場合は段階的に行う:
  1. 新カラム追加 → マイグレーション適用 → デプロイ
  2. アプリを新カラム参照に切り替え → デプロイ
  3. 旧カラム削除 → マイグレーション適用 → デプロイ
- スケール後は Vercel CI での自動適用（`build` に `prisma migrate deploy` 追加）に移行を検討

## 6. npm scripts

### ローカル開発用

| コマンド                    | 実行内容                | 用途                                                         |
| --------------------------- | ----------------------- | ------------------------------------------------------------ |
| `npm run db:migrate`        | `prisma migrate dev`    | マイグレーション作成・適用（Client 生成 + シードも自動実行） |
| `npm run db:migrate:status` | `prisma migrate status` | マイグレーション適用状況の確認                               |
| `npm run db:generate`       | `prisma generate`       | Prisma Client 再生成（スキーマ変更後にビルドだけしたい場合） |
| `npm run db:seed`           | `prisma db seed`        | シードデータのみ投入                                         |
| `npm run db:reset`          | `prisma migrate reset`  | DB 初期化（全テーブル削除 + 再作成 + シード）                |

### 本番操作用（ローカルから実行）

| コマンド                         | 実行内容                                                   | 用途                         |
| -------------------------------- | ---------------------------------------------------------- | ---------------------------- |
| `npm run db:migrate:deploy:prod` | `dotenv -e .env.production.local -- prisma migrate deploy` | 本番マイグレーション適用     |
| `npm run db:migrate:status:prod` | `dotenv -e .env.production.local -- prisma migrate status` | 本番マイグレーション状況確認 |
| `npm run db:seed:prod`           | `dotenv -e .env.production.local -- prisma db seed`        | 本番シードデータ投入         |

### Vercel CI

| コマンド        | 実行内容                        | 用途                      |
| --------------- | ------------------------------- | ------------------------- |
| `npm run build` | `prisma generate && next build` | クライアント生成 + ビルド |

## 7. 実装ファイル

| ファイル               | 内容                      |
| ---------------------- | ------------------------- |
| `prisma/schema.prisma` | DB スキーマ定義           |
| `prisma/seed.ts`       | シードスクリプト          |
| `prisma.config.ts`     | Prisma 設定               |
| `src/lib/prisma.ts`    | PrismaClient シングルトン |
| `docker-compose.yml`   | ローカル PostgreSQL       |
