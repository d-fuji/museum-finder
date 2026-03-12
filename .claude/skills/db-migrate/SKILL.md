---
name: db-migrate
description: DB環境構築・マイグレーション・データ更新のワークフロー。
---

# DB 運用ワークフロー

## 環境構成

| 環境 | DB | アダプター | 備考 |
|------|-----|-----------|------|
| ローカル | Docker Compose PostgreSQL | `@prisma/adapter-pg` | `.env` で設定 |
| 本番 | Vercel Postgres (Neon) | `@prisma/adapter-neon` | Vercel が自動設定 |
| テスト | なし | — | MSW モックを使用 |

環境変数: `.env.sample` を参照（`DATABASE_URL`, `AUTH_SECRET` 必須）

## 初回セットアップ

1. `docker compose up -d` — PostgreSQL 起動
2. `cp .env.sample .env` — 環境変数設定
3. `npm run db:migrate` — マイグレーション適用 + Client 生成 + シード投入
4. `npm run dev` — 開発サーバー起動

## スキーマ変更

1. `prisma/schema.prisma` を編集
2. `npm run db:migrate` — マイグレーション生成 + 適用 + Client 再生成
3. マイグレーションファイルを Git にコミット

**DB リセット:** `npm run db:reset`

## 本番マイグレーション

前提: `.env.production.local` に `DATABASE_URL_UNPOOLED` が設定済み

1. `npm run db:migrate:status:prod` — 未適用の確認
2. `npm run db:migrate:deploy:prod` — 適用
3. Vercel にデプロイ（Git push）

## 施設データの更新

JSON を編集して seed を再実行するだけでよい。ユーザーのレビューは破壊されない。

1. `src/data/museums.json` を編集
2. `npm run db:seed`（ローカル確認）
3. `npm run db:seed:prod`（本番反映）

### seed の安全性

- **upsert by `code`**: 既存施設は update、新規は create
- **レビュー保護**: reviews リレーションに触れない。既存レビューはそのまま残る
- **孤立施設の安全削除**: レビュー 0 件の場合のみ DB から削除
- **タグ・営業時間**: 毎回 JSON の状態に同期（タグは set、営業時間は全置換）
- **トランザクション**: 全操作が1トランザクション。失敗時は全ロールバック
