# OGP 画像の動的生成仕様

## 1. 概要

施設詳細ページが SNS でシェアされた際に、施設名・カテゴリ・評価・レビュー件数を含むカード型の OGP 画像を動的に生成する。X や LINE でのシェア時に視覚的に訴求力のあるプレビューを表示し、CTR を向上させる。

## 2. データモデル

DB 変更なし。既存の Museum モデルの以下のフィールドを使用する。

| フィールド  | 型      | 必須 | 説明                        |
| ----------- | ------- | ---- | --------------------------- |
| id          | INTEGER | o    | 施設 ID                     |
| name        | STRING  | o    | 施設名                      |
| category    | STRING  | o    | カテゴリラベル              |
| description | STRING  | -    | 施設の説明（truncate 表示） |
| avgRating   | FLOAT   | -    | 平均評価（算出値）          |
| reviewCount | INTEGER | -    | レビュー件数（算出値）      |

## 3. 設計方針

### OGP 画像生成

- `@vercel/og`（Satori）を使用し、Edge Runtime で動的に OGP 画像を生成する
- 画像サイズ: 1200x630px（OGP 推奨サイズ）
- 画像は API ルートで生成し、`Cache-Control` ヘッダーで CDN キャッシュする

### メタデータ生成

- 施設詳細ページを Server Component でラップし、`generateMetadata` で動的に `<meta>` タグを生成する
- 現在の Client Component (`page.tsx`) を `MuseumDetailClient.tsx` に分離し、Server Component から呼び出す

### カード型レイアウト

OGP 画像には以下の要素を含める。

- アプリ名「Museum Finder」
- 施設名
- カテゴリラベル
- 星評価 + レビュー件数
- 施設の説明（長文は truncate）

## 4. DB スキーマ

変更なし。

## 5. 機能

- 施設ごとに一意の OGP 画像を動的生成する
- Twitter Card (`summary_large_image`) に対応する
- Open Graph メタデータ（`og:title`, `og:description`, `og:image`, `og:url`）を出力する
- `Cache-Control` による CDN キャッシュでパフォーマンスを最適化する

## 6. API

`docs/openapi.yaml` を参照。この機能に関連するエンドポイント:

- `GET /api/og?museumId={id}` --- OGP 画像生成（PNG）

## 7. UI 検討事項（未決定）

- OGP 画像のデザイン・配色の詳細
- レビュー投稿時の個別 OGP 画像生成（Phase 2）

## 8. 実装ファイル

| ファイル                                      | 内容                                 |
| --------------------------------------------- | ------------------------------------ |
| `src/app/api/og/route.tsx`                    | OGP 画像生成 API（Edge Runtime）     |
| `src/app/museums/[id]/page.tsx`               | Server Component（generateMetadata） |
| `src/app/museums/[id]/MuseumDetailClient.tsx` | Client Component（既存の詳細 UI）    |
