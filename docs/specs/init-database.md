# データベース導入仕様

## 1. 概要

JSON フィクスチャ直読みの API Routes を Prisma + PostgreSQL に置き換える。
既存の API レスポンス形式（OpenAPI 仕様）は変更しない。

データモデルの定義は [overview.md](./overview.md) を参照。

## 2. 技術選定

| 技術              | 理由                                             |
| ----------------- | ------------------------------------------------ |
| Prisma            | 型安全、マイグレーション管理、Next.js との親和性 |
| PostgreSQL (Neon) | Vercel Postgres として統合可能、無料枠あり       |

## 3. DB スキーマ補足

overview.md のデータモデルに加え、DB 固有の制約を定義する。

### 制約・型マッピング

| フィールド         | DB 型            | 制約                     |
| ------------------ | ---------------- | ------------------------ |
| Museum.id          | UUID             | PK, default uuid         |
| Museum.name        | VARCHAR(255)     | NOT NULL                 |
| Museum.description | TEXT             | -                        |
| Museum.latitude    | DOUBLE PRECISION | NOT NULL                 |
| Museum.longitude   | DOUBLE PRECISION | NOT NULL                 |
| Museum.address     | VARCHAR(500)     | -                        |
| Museum.websiteUrl  | VARCHAR(2048)    | -                        |
| Review.id          | UUID             | PK, default uuid         |
| Review.rating      | INTEGER          | NOT NULL, CHECK 1-5      |
| Review.comment     | TEXT             | -                        |
| Review.userId      | VARCHAR(255)     | NOT NULL                 |
| Review.museumId    | UUID             | NOT NULL, FK → Museum.id |
| Review.userName    | VARCHAR(255)     | NOT NULL                 |

### インデックス

- `Review.museumId` — 施設ごとのレビュー取得高速化
- `Museum.category` — カテゴリフィルタ高速化

## 4. API 変更

既存エンドポイントのレスポンス形式は変更しない（OpenAPI 仕様を維持）。
内部実装のみ JSON → Prisma クエリに置き換える。

### GET /api/museums

- 変更前: `museumsData` から読み込み + `reviewsData` でレビュー集計
- 変更後: Prisma で Museum 取得 + Review の集計（`_count`, `_avg`）

### GET /api/museums/:id

- 変更前: `museumsData.find()` + `reviewsData.filter()`
- 変更後: Prisma で Museum + Review を include で取得

## 5. シードデータ

既存の `src/data/museums.json` と `src/data/reviews.json` を Prisma seed スクリプトで投入する。

## 6. 環境構成

### ローカル開発

- Docker Compose で PostgreSQL を起動（`docker-compose.yml`）
- `.env` に `DATABASE_URL` を設定

### Vercel 本番

- Vercel Postgres（Neon）をプロジェクトに接続
- 環境変数 `DATABASE_URL` は Vercel が自動設定

### テスト

- テストは引き続き MSW モックを使用（DB 不要）

## 7. 実装手順

1. Prisma セットアップ（`prisma/schema.prisma` 作成）
2. Docker Compose でローカル PostgreSQL 起動
3. マイグレーション作成・実行
4. シードスクリプト作成・実行
5. `src/lib/prisma.ts` — Prisma Client シングルトン作成
6. `src/app/api/museums/route.ts` — JSON → Prisma クエリに書き換え
7. `src/app/api/museums/[id]/route.ts` — 同上
8. 動作確認（既存テスト + ブラウザ確認）
