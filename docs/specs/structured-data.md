# 構造化データ仕様

## 1. 概要

施設詳細ページに Schema.org 準拠の JSON-LD 構造化データを埋め込み、Google 検索結果でのリッチリザルト表示（星評価・レビュー件数）を実現する。

## 2. データモデル

DB 変更なし。既存の Museum・Review モデルのデータを使用する。

## 3. 設計方針

### Schema.org マッピング

施設の各データを以下の Schema.org タイプにマッピングする。

| Museum Finder のデータ | Schema.org タイプ   | 説明                   |
| ---------------------- | ------------------- | ---------------------- |
| 施設                   | `TouristAttraction` | 施設の基本情報         |
| 評価集計               | `AggregateRating`   | 平均評価・レビュー件数 |
| 個別レビュー           | `Review`            | 最新 5 件まで          |
| 住所                   | `PostalAddress`     | 施設の所在地           |
| 位置                   | `GeoCoordinates`    | 緯度・経度             |

### カテゴリマッピング

Museum Finder のカテゴリを Schema.org の `additionalType` にマッピングする。

| Museum Finder カテゴリ | Schema.org additionalType        |
| ---------------------- | -------------------------------- |
| CORPORATE_MUSEUM       | `Museum`                         |
| HISTORY_MUSEUM         | `Museum`                         |
| SCIENCE_MUSEUM         | `Museum`                         |
| INDUSTRIAL_HERITAGE    | `LandmarksOrHistoricalBuildings` |
| FACTORY_TOUR           | `TouristAttraction`              |
| CASTLE                 | `LandmarksOrHistoricalBuildings` |

### 実装方式

- Server Component 内で `<script type="application/ld+json">` を出力する
- 施設詳細ページの Server Component ラッパー内で生成する
- レビュー件数が 1 件以上の場合のみ `AggregateRating` を出力する
- 個別レビューは最新 5 件までを `Review` として出力する

### JSON-LD 出力例

```json
{
  "@context": "https://schema.org",
  "@type": "TouristAttraction",
  "additionalType": "Museum",
  "name": "トヨタ産業技術記念館",
  "description": "...",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "JP",
    "streetAddress": "愛知県名古屋市西区則武新町4-1-35"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 35.181,
    "longitude": 136.879
  },
  "url": "https://www.tcmit.org/",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": 4.2,
    "reviewCount": 15,
    "bestRating": 5,
    "worstRating": 1
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": 5
      },
      "author": {
        "@type": "Person",
        "name": "ユーザー名"
      },
      "reviewBody": "レビュー本文",
      "datePublished": "2026-03-01"
    }
  ]
}
```

## 4. DB スキーマ

変更なし。

## 5. 機能

- 施設詳細ページに JSON-LD 構造化データを `<script>` タグで出力する
- Google リッチリザルト対応（星評価・レビュー件数の表示）
- レビューが 1 件以上ある施設のみ `AggregateRating` を出力する
- 個別レビューは最新 5 件を `Review` として含める
- 閉館施設（`isClosed: true`）にも構造化データを出力する

## 6. API

API 変更なし。Server Component で直接 DB からデータを取得する。

## 7. UI 検討事項（未決定）

- 一覧ページへの構造化データ適用（`ItemList` タイプ）
- パンくずリスト（`BreadcrumbList`）の追加
- `openingHoursSpecification` の出力対応

## 8. 実装ファイル

| ファイル                        | 内容                                           |
| ------------------------------- | ---------------------------------------------- |
| `src/app/museums/[id]/page.tsx` | Server Component 内で JSON-LD をインライン出力 |
