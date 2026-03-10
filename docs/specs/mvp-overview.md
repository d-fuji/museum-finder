# Museum Compass MVP 仕様書

## 1. プロダクト概要

**目的:** 企業博物館・歴史館の「地図検索」と「ユーザーレビュー閲覧」のコア体験を検証する。

**初期データ戦略:** 全国網羅ではなく、「明治期の産業遺産」や小樽・神戸・門司などの「歴史的な港町」に関連する施設に絞って初期データを登録し、世界観を構築する。

## 2. 技術スタック

| レイヤー       | 技術                                | 備考                     |
| -------------- | ----------------------------------- | ------------------------ |
| フロントエンド | Next.js (App Router) + Tailwind CSS | モバイルファースト       |
| UIライブラリ   | shadcn/ui (v4) + Lucide React       | Base UIベース            |
| 地図           | react-map-gl + MapLibre GL JS       | OSS、APIキー不要         |
| API仕様        | OpenAPI 3.0 (yaml)                  | `docs/openapi.yaml`      |
| モック         | MSW (Mock Service Worker)           | 開発時はMSWでAPIをモック |
| データ         | JSONフィクスチャ                    | `src/data/` に配置       |
| デプロイ       | Vercel                              | -                        |
| テスト         | Vitest + Testing Library            | -                        |

## 3. MVP機能スコープ（認証なし）

### 施設一覧表示

- リスト形式で施設を一覧表示
- 地図上にピン表示（Leaflet / react-leaflet）
- リスト / 地図の表示切替
- カテゴリ（企業博物館 / 市の歴史館）で絞り込み

### 施設詳細表示

- 施設名、カテゴリ、住所、概要、Webサイトリンク
- 平均評価の表示
- レビュー一覧の閲覧

## 4. MVP対象外（将来対応）

- ユーザー認証（Firebase Authentication）
- レビュー投稿
- お気に入り登録
- 地図上での絞り込み・検索
- バックエンドAPI（NestJS + PostgreSQL + Prisma）
- 管理画面

## 5. データモデル

### Museum（施設）

| フィールド  | 型                            | 必須 | 説明      |
| ----------- | ----------------------------- | ---- | --------- |
| id          | string                        | yes  | UUID      |
| name        | string                        | yes  | 施設名    |
| category    | "CORPORATE" \| "CITY_HISTORY" | yes  | カテゴリ  |
| description | string                        | no   | 概要      |
| latitude    | number                        | yes  | 緯度      |
| longitude   | number                        | yes  | 経度      |
| address     | string                        | no   | 住所      |
| websiteUrl  | string                        | no   | Webサイト |
| createdAt   | string (ISO 8601)             | yes  | 登録日時  |
| updatedAt   | string (ISO 8601)             | yes  | 更新日時  |

### Review（レビュー）

| フィールド | 型                | 必須 | 説明             |
| ---------- | ----------------- | ---- | ---------------- |
| id         | string            | yes  | UUID             |
| rating     | integer (1-5)     | yes  | 評価             |
| comment    | string            | no   | コメント         |
| userId     | string            | yes  | ユーザーID       |
| museumId   | string            | yes  | 施設ID           |
| userName   | string            | yes  | 表示用ユーザー名 |
| createdAt  | string (ISO 8601) | yes  | 投稿日時         |
