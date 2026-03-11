# Museum Compass 仕様書

## 1. プロダクト概要

**目的:** 企業博物館・歴史館の「地図検索」と「ユーザーレビュー閲覧」のコア体験を提供する。

**初期データ戦略:** 全国網羅ではなく、「明治期の産業遺産」や小樽・神戸・門司などの「歴史的な港町」に関連する施設に絞って初期データを登録し、世界観を構築する。

## 2. 技術スタック

| レイヤー       | 技術                           | 備考                         |
| -------------- | ------------------------------ | ---------------------------- |
| フレームワーク | Next.js (App Router)           | フルスタック                 |
| スタイリング   | Tailwind CSS                   | モバイルファースト           |
| UI ライブラリ  | shadcn/ui (v4) + Lucide React  | Base UI ベース               |
| 地図           | react-map-gl + MapLibre GL JS  | OSS、API キー不要            |
| データフェッチ | SWR                            | stale-while-revalidate       |
| ORM            | Prisma                         | 型安全、マイグレーション管理 |
| DB             | PostgreSQL (Neon)              | Vercel Postgres              |
| DB ドライバー  | @prisma/adapter-pg / adapter-neon | ローカル: pg、本番: Neon サーバレス |
| 認証           | Auth.js v5                     | Credentials 認証             |
| API 仕様       | OpenAPI 3.0                    | `docs/openapi.yaml`          |
| テスト         | Vitest + Testing Library + MSW | MSW で API モック            |
| デプロイ       | Vercel                         | -                            |

## 3. 共通データモデル

### Category（enum）

| 値           | 説明       |
| ------------ | ---------- |
| CORPORATE    | 企業博物館 |
| CITY_HISTORY | 市の歴史館 |
