# 施設機能仕様

## 1. 概要

施設の一覧表示・詳細表示・地図表示を提供する。

## 2. データモデル

### Museum

| フィールド    | 型                | 必須 | 説明                                        |
| ------------- | ----------------- | ---- | ------------------------------------------- |
| id            | number (int)      | yes  | 施設 ID                                     |
| code          | string            | yes  | 公開用コード（cuid、UNIQUE、自動生成）      |
| name          | string            | yes  | 施設名                                      |
| category      | Category          | yes  | カテゴリ                                    |
| description   | string            | no   | 概要                                        |
| latitude      | number            | yes  | 緯度                                        |
| longitude     | number            | yes  | 経度                                        |
| address       | string            | no   | 住所                                        |
| websiteUrl    | string            | no   | Web サイト                                  |
| admissionFee  | number (int)      | no   | 入場料（大人料金、円単位。0=無料）          |
| isClosed      | boolean           | yes  | 閉館フラグ（default: false）                |
| closedMessage | string            | no   | 閉館理由・補足（例: "2025年3月より改装中"） |
| tags          | Tag[]             | no   | タグ一覧                                    |
| operatingHours | OperatingHours[] | no   | 営業時間一覧                                |
| averageRating | number (double)   | yes  | 平均評価（1-5、レビューなしは 0）※算出値   |
| reviewCount   | number (int)      | yes  | レビュー数 ※算出値                          |
| createdAt     | string (ISO 8601) | yes  | 登録日時                                    |
| updatedAt     | string (ISO 8601) | yes  | 更新日時                                    |

### Tag

| フィールド | 型           | 必須 | 説明    |
| ---------- | ------------ | ---- | ------- |
| id         | number (int) | yes  | タグ ID |
| name       | string       | yes  | タグ名  |

Tag は Museum と多対多のリレーション。タグの例: 「港町」「明治期」「体験型」「無料」「世界遺産」「国宝」など。

### OperatingHours

| フィールド | 型           | 必須 | 説明                                                  |
| ---------- | ------------ | ---- | ----------------------------------------------------- |
| id         | number (int) | yes  | ID                                                    |
| museumId   | number (int) | yes  | 施設 ID（FK → Museum）                                |
| dayOfWeek  | number (int) | yes  | 曜日（0=日, 1=月, ..., 6=土）                         |
| openTime   | string       | yes  | 開館時刻（"HH:mm" 形式。例: "09:00"）                 |
| closeTime  | string       | yes  | 閉館時刻（"HH:mm" 形式。例: "17:00"）                 |
| isClosed   | boolean      | yes  | 当該曜日の休館フラグ（default: false）                |
| note       | string       | no   | 補足（例: "最終入館は16:30"、"祝日の場合は翌日休館"） |

Museum と OperatingHours は 1 対多のリレーション（1施設 × 最大7曜日）。

## 3. 設計方針

### 入場料（admissionFee）

- 大人の通常料金を円単位の整数で記録する（例: `500`）
- 無料の施設は `0` とする
- 子供・シニア・団体料金などの詳細は含めない（公式サイトを参照してもらう）
- 料金不明の施設は `null`（未設定）

### 閉館フラグ（isClosed）

- 施設が恒久的に閉館、または長期休館中であることを示す
- `isClosed: true` の施設は一覧・地図には表示するが、視覚的に区別する（グレーアウト等）
- `closedMessage` で閉館理由や再開予定を補足できる

### 営業時間（OperatingHours）

- 曜日ごとに開館・閉館時刻を設定できる
- `isClosed: true` の曜日は定休日を表す
- `note` で「最終入館」「季節変動」等の補足情報を付与できる
- 全曜日のデータがない施設もある（データなし = 不明）

## 4. DB スキーマ

`prisma/schema.prisma` の `Museum`・`OperatingHours` モデルを参照。

## 5. 機能

### 施設一覧表示

- リスト形式で施設を一覧表示
- 地図上にピン表示（react-map-gl + MapLibre GL JS）
- リスト / 地図の表示切替
- カテゴリで絞り込み

### 施設詳細表示

- 施設名、カテゴリ、住所、概要、Web サイトリンク
- 入場料、営業時間、閉館情報の表示
- 平均評価の表示
- レビュー一覧の閲覧

## 6. API

`docs/openapi.yaml` を参照。この機能に関連するエンドポイント:

- `GET /api/museums` — 施設一覧取得
- `GET /api/museums/:id` — 施設詳細取得（営業時間含む）
- `GET /api/tags` — タグ一覧取得

補足: 営業時間（`operatingHours`）は詳細 API のみで返す（一覧には含めない）。

## 7. UI 検討事項（未決定）

以下は実装フェーズで検討・決定する。

### 一覧ページ

- 閉館施設の表示方法（グレーアウト? バッジ? フィルター除外?）
- 入場料の表示有無（カードに含めるかは情報量とのバランス）

### 詳細ページ

- 営業時間の表示形式
  - 案A: 全曜日をテーブル表示
  - 案B: 「本日の営業時間」を強調 + 全曜日は折りたたみ
  - 案C: 平日/土日でグルーピング（同一時間帯ならまとめる）
- 「現在営業中」バッジの表示（タイムゾーン考慮が必要）
- 閉館施設の詳細ページでの表示（警告バナー等）

## 8. フィクスチャデータ例

```json
{
  "name": "トヨタ産業技術記念館",
  "category": "CORPORATE_MUSEUM",
  "description": "...",
  "admissionFee": 500,
  "isClosed": false,
  "operatingHours": [
    { "dayOfWeek": 0, "openTime": "09:30", "closeTime": "17:00", "note": "最終入館16:30" },
    { "dayOfWeek": 1, "isClosed": true, "note": "月曜休館（祝日の場合は翌日）" },
    { "dayOfWeek": 2, "openTime": "09:30", "closeTime": "17:00" },
    { "dayOfWeek": 3, "openTime": "09:30", "closeTime": "17:00" },
    { "dayOfWeek": 4, "openTime": "09:30", "closeTime": "17:00" },
    { "dayOfWeek": 5, "openTime": "09:30", "closeTime": "17:00" },
    { "dayOfWeek": 6, "openTime": "09:30", "closeTime": "17:00" }
  ],
  "tags": ["体験型"]
}
```

## 9. 実装ファイル

| ファイル                            | 内容               |
| ----------------------------------- | ------------------ |
| `src/app/page.tsx`                  | 施設一覧ページ     |
| `src/app/museums/[id]/page.tsx`     | 施設詳細ページ     |
| `src/app/api/museums/route.ts`      | 施設一覧 API       |
| `src/app/api/museums/[id]/route.ts` | 施設詳細 API       |
| `src/components/MuseumCard.tsx`     | 施設カード         |
| `src/components/MuseumMap.tsx`      | 地図表示           |
| `src/components/CategoryFilter.tsx` | カテゴリフィルター |
