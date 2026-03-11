# Museum Compass 仕様書

## 1. プロダクト概要

**目的:** 企業博物館・歴史館の「地図検索」と「ユーザーレビュー閲覧」のコア体験を提供する。

**初期データ戦略:** 全国網羅ではなく、「明治期の産業遺産」や小樽・神戸・門司などの「歴史的な港町」に関連する施設に絞って初期データを登録し、世界観を構築する。

## 2. 技術スタック

| レイヤー | 技術 | 備考 |
| --- | --- | --- |
| フレームワーク | Next.js (App Router) | フルスタック |
| スタイリング | Tailwind CSS | モバイルファースト |
| UI ライブラリ | shadcn/ui (v4) + Lucide React | Base UI ベース |
| 地図 | react-map-gl + MapLibre GL JS | OSS、API キー不要 |
| データフェッチ | SWR | stale-while-revalidate |
| ORM | Prisma | 型安全、マイグレーション管理 |
| DB | PostgreSQL (Neon) | Vercel Postgres |
| API 仕様 | OpenAPI 3.0 | `docs/openapi.yaml` |
| テスト | Vitest + Testing Library + MSW | MSW で API モック |
| デプロイ | Vercel | - |

## 3. 機能スコープ

### 施設一覧表示

- リスト形式で施設を一覧表示
- 地図上にピン表示（react-map-gl + MapLibre GL JS）
- リスト / 地図の表示切替
- カテゴリで絞り込み

### 施設詳細表示

- 施設名、カテゴリ、住所、概要、Web サイトリンク
- 平均評価の表示
- レビュー一覧の閲覧

## 4. データモデル

### Category（enum）

| 値 | 説明 |
| --- | --- |
| CORPORATE | 企業博物館 |
| CITY_HISTORY | 市の歴史館 |

### Museum（施設）

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | string (UUID) | yes | 施設 ID |
| name | string | yes | 施設名 |
| category | Category | yes | カテゴリ |
| description | string | no | 概要 |
| latitude | number | yes | 緯度 |
| longitude | number | yes | 経度 |
| address | string | no | 住所 |
| websiteUrl | string | no | Web サイト |
| createdAt | string (ISO 8601) | yes | 登録日時 |
| updatedAt | string (ISO 8601) | yes | 更新日時 |

### Review（レビュー）

| フィールド | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| id | string (UUID) | yes | レビュー ID |
| rating | integer (1-5) | yes | 評価 |
| comment | string | no | コメント |
| userId | string | yes | ユーザー ID |
| museumId | string (UUID) | yes | 施設 ID (FK) |
| userName | string | yes | 表示用ユーザー名 |
| createdAt | string (ISO 8601) | yes | 投稿日時 |
