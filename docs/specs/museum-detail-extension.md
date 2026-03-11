# 施設詳細情報の拡張仕様

## 1. 概要

施設データに「入場料」「閉館フラグ」「営業時間」を追加し、ユーザーが訪問前に必要な情報を得られるようにする。

## 2. 追加フィールド

### Museum モデルへの追加

| フィールド    | 型           | 必須 | 説明                                        |
| ------------- | ------------ | ---- | ------------------------------------------- |
| admissionFee  | number (int) | no   | 入場料（大人料金、円単位。0=無料）          |
| isClosed      | boolean      | yes  | 閉館フラグ（default: false）                |
| closedMessage | string       | no   | 閉館理由・補足（例: "2025年3月より改装中"） |

### OperatingHours モデル（新規）

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

## 4. DB スキーマ変更

```prisma
model Museum {
  // 既存フィールド...
  admissionFee   Int?
  isClosed       Boolean  @default(false)
  closedMessage  String?  @db.Text
  operatingHours OperatingHours[]
}

model OperatingHours {
  id        Int      @id @default(autoincrement())
  museumId  Int
  dayOfWeek Int     // 0=Sun, 1=Mon, ..., 6=Sat
  openTime  String  @db.VarChar(5)  // "HH:mm"
  closeTime String  @db.VarChar(5)  // "HH:mm"
  isClosed  Boolean @default(false)
  note      String? @db.VarChar(500)

  museum Museum @relation(fields: [museumId], references: [id])

  @@unique([museumId, dayOfWeek])
  @@index([museumId])
}
```

## 5. API 変更

### MuseumSummary への追加フィールド

| フィールド    | 型           | 必須 | 説明                 |
| ------------- | ------------ | ---- | -------------------- |
| admissionFee  | number (int) | no   | 入場料（円、0=無料） |
| isClosed      | boolean      | yes  | 閉館フラグ           |
| closedMessage | string       | no   | 閉館補足             |

### MuseumDetail への追加フィールド

| フィールド     | 型               | 必須 | 説明         |
| -------------- | ---------------- | ---- | ------------ |
| operatingHours | OperatingHours[] | no   | 営業時間一覧 |

※ 営業時間は詳細ページのみで返す（一覧には含めない）。

## 6. フィクスチャ・シードデータ

### museums.json への追加

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

## 8. 実装ステップ（案）

1. DB スキーマ変更 + マイグレーション
2. 型定義（`src/types/api.ts`）の更新
3. フィクスチャデータ（`museums.json`）に入場料・閉館・営業時間を追加
4. シード・MSW ハンドラーの更新
5. API ルートの更新（include operatingHours）
6. 詳細ページ UI 実装
7. 一覧ページの閉館施設表示対応
