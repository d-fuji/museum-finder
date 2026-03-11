# 施設機能仕様

## 1. 概要

施設の一覧表示・詳細表示・地図表示を提供する。

## 2. データモデル

### Museum

| フィールド  | 型                | 必須 | 説明       |
| ----------- | ----------------- | ---- | ---------- |
| id          | string (UUID)     | yes  | 施設 ID    |
| name        | string            | yes  | 施設名     |
| category    | Category          | yes  | カテゴリ   |
| description | string            | no   | 概要       |
| latitude    | number            | yes  | 緯度       |
| longitude   | number            | yes  | 経度       |
| address     | string            | no   | 住所       |
| websiteUrl  | string            | no   | Web サイト |
| createdAt   | string (ISO 8601) | yes  | 登録日時   |
| updatedAt   | string (ISO 8601) | yes  | 更新日時   |

## 3. 機能

### 施設一覧表示

- リスト形式で施設を一覧表示
- 地図上にピン表示（react-map-gl + MapLibre GL JS）
- リスト / 地図の表示切替
- カテゴリで絞り込み

### 施設詳細表示

- 施設名、カテゴリ、住所、概要、Web サイトリンク
- 平均評価の表示
- レビュー一覧の閲覧

## 4. API

### GET /api/museums

施設一覧を取得する。

**パラメータ:**

| パラメータ | 位置  | 必須 | 説明               |
| ---------- | ----- | ---- | ------------------ |
| category   | query | no   | カテゴリで絞り込み |

**レスポンス:** `200` — `MuseumSummary[]`

### GET /api/museums/:id

施設詳細を取得する。

**レスポンス:**

- `200` — `MuseumDetail`（レビュー含む）
- `404` — 施設が見つからない

## 5. 実装ファイル

| ファイル                            | 内容               |
| ----------------------------------- | ------------------ |
| `src/app/page.tsx`                  | 施設一覧ページ     |
| `src/app/museums/[id]/page.tsx`     | 施設詳細ページ     |
| `src/app/api/museums/route.ts`      | 施設一覧 API       |
| `src/app/api/museums/[id]/route.ts` | 施設詳細 API       |
| `src/components/MuseumCard.tsx`     | 施設カード         |
| `src/components/MuseumMap.tsx`      | 地図表示           |
| `src/components/CategoryFilter.tsx` | カテゴリフィルター |
