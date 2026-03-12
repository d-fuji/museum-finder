# ブックマーク機能仕様

## 1. 概要

施設を「行きたい」「行った」で保存し、マイリストとして管理する機能。訪問日の記録もできる。ログインユーザー限定。

## 2. データモデル

### Bookmark

| フィールド | 型                | 必須 | 説明                                      |
| ---------- | ----------------- | ---- | ----------------------------------------- |
| id         | number (int)      | yes  | ブックマーク ID                           |
| userId     | string            | yes  | ユーザー ID (FK → User)                   |
| museumId   | number (int)      | yes  | 施設 ID (FK → Museum)                     |
| status     | enum              | yes  | WANT_TO_GO \| VISITED                     |
| visitedAt  | string (ISO 8601) | no   | 訪問日（status=VISITED のとき任意で記録） |
| createdAt  | string (ISO 8601) | yes  | 作成日時                                  |
| updatedAt  | string (ISO 8601) | yes  | 更新日時                                  |

- 同一ユーザー × 同一施設は1レコードのみ（`@@unique([userId, museumId])`）
- 「行きたい → 行った」へのステータス変更は update で行う

## 3. 設計方針

### ステータスの遷移

- 未登録 → WANT_TO_GO: 「行きたい」に追加
- 未登録 → VISITED: 「行った」に追加（行きたいを経由しなくてもよい）
- WANT_TO_GO → VISITED: 訪問済みに変更（visitedAt を設定）
- WANT_TO_GO → 削除: ブックマーク解除
- VISITED → 削除: ブックマーク解除（確認モーダルあり）
- VISITED → WANT_TO_GO: 「行きたい」に変更（確認モーダルあり）

### userId と User の関係

- Review とは異なり、Bookmark は User への FK リレーションを設定する
- User 削除時にブックマークも Cascade 削除する（レビューと違い、他ユーザーが参照するデータではない）

### visitedAt

- status=VISITED のときのみ意味を持つ
- 任意入力。未入力の場合は null（「行ったけど日付は覚えていない」を許容）

## 4. DB スキーマ

`prisma/schema.prisma` の `Bookmark` モデルを参照。

## 5. 機能

### 施設詳細ページ

- ブックマークボタンを表示（ログイン済みのみ）
  - 未登録: 「行きたい」「行った」の2つのボタン
  - WANT_TO_GO: 「行きたい」がアクティブ状態 + 「行った」ボタン
  - VISITED: 「行った」がアクティブ状態（訪問日が表示される）
- アクティブ状態のボタンを再度押すとブックマーク解除
- VISITED 状態から「行きたい」への変更・「行った」の解除は確認モーダルで誤操作を防止

### マイリストページ (`/mylist`)

- 「行きたい」「行った」のタブ切替
- 各タブに該当する施設カードの一覧を表示
- 「行った」タブでは訪問日も表示
- 未ログインでアクセスした場合はログインページにリダイレクト

## 6. API

`docs/openapi.yaml` を参照。この機能に関連するエンドポイント:

- `GET /api/bookmarks` — 自分のブックマーク一覧取得（クエリパラメータ `status` で絞り込み可）
- `PUT /api/bookmarks` — ブックマーク作成・更新（upsert）
- `DELETE /api/bookmarks/{museumId}` — ブックマーク削除

## 7. UI 決定事項

- ブックマークボタン: Heart（行きたい）+ MapPin（行った）アイコン、施設詳細ページの星評価の下に配置
- マイリストの並び順: 追加日の降順（`createdAt desc`）
- マイリストへの導線: ヘッダー右上に Heart アイコン付きリンク（ログイン時のみ）
- 確認モーダル: VISITED 状態からの変更・解除時に AlertDialog で確認

## 8. 実装ファイル

| ファイル                                    | 内容                         |
| ------------------------------------------- | ---------------------------- |
| `prisma/schema.prisma`                      | Bookmark モデル追加          |
| `src/app/api/bookmarks/route.ts`            | ブックマーク一覧取得・upsert |
| `src/app/api/bookmarks/[museumId]/route.ts` | ブックマーク削除             |
| `src/lib/bookmark.ts`                       | ブックマークビジネスロジック |
| `src/components/BookmarkButtons.tsx`        | ブックマークボタン           |
| `src/app/mylist/page.tsx`                   | マイリストページ             |
| `src/types/api.ts`                          | Bookmark 型追加              |
| `docs/openapi.yaml`                         | API 仕様追加                 |
