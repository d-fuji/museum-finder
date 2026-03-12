# 認証機能仕様

## 1. 概要

Auth.js (NextAuth.js v5) を使い、メール+パスワード認証を提供する。
セッション管理は JWT 戦略で行い、ユーザー情報は Prisma + PostgreSQL に永続化する。

## 2. データモデル

### User

| フィールド    | 型       | 必須 | 説明                                   |
| ------------- | -------- | ---- | -------------------------------------- |
| id            | String   | yes  | ユーザー ID（cuid）                    |
| name          | String   | no   | 表示名                                 |
| email         | String   | no   | メールアドレス（UNIQUE）               |
| emailVerified | DateTime | no   | メール確認日時                         |
| image         | String   | no   | アバター URL                           |
| password      | String   | no   | ハッシュ化パスワード（Credentials 用） |

### Account

| フィールド        | 型     | 必須 | 説明                     |
| ----------------- | ------ | ---- | ------------------------ |
| id                | String | yes  | アカウント ID（cuid）    |
| userId            | String | yes  | ユーザー ID（FK → User） |
| type              | String | yes  | アカウント種別           |
| provider          | String | yes  | プロバイダー名           |
| providerAccountId | String | yes  | プロバイダー側 ID        |
| refresh_token     | String | no   | リフレッシュトークン     |
| access_token      | String | no   | アクセストークン         |
| expires_at        | Int    | no   | トークン有効期限         |
| token_type        | String | no   | トークン種別             |
| scope             | String | no   | スコープ                 |
| id_token          | String | no   | ID トークン              |
| session_state     | String | no   | セッション状態           |

- `@@unique([provider, providerAccountId])`

### Session

| フィールド   | 型       | 必須 | 説明                         |
| ------------ | -------- | ---- | ---------------------------- |
| id           | String   | yes  | セッション ID（cuid）        |
| sessionToken | String   | yes  | セッショントークン（UNIQUE） |
| userId       | String   | yes  | ユーザー ID（FK → User）     |
| expires      | DateTime | yes  | 有効期限                     |

### VerificationToken

| フィールド | 型       | 必須 | 説明     |
| ---------- | -------- | ---- | -------- |
| identifier | String   | yes  | 識別子   |
| token      | String   | yes  | トークン |
| expires    | DateTime | yes  | 有効期限 |

- `@@unique([identifier, token])`

## 3. 設計方針

### セッション戦略

- JWT 戦略を採用（DB セッションテーブルは Auth.js の規約上存在するが、実際のセッション管理は JWT で行う）
- サーバーサイドでは `auth()` でセッションを取得

### パスワード管理

- bcrypt でハッシュ化して保存
- Credentials プロバイダーを使用（OAuth プロバイダーは将来拡張可能）

### Prisma Adapter

- `@auth/prisma-adapter` を使用し、Auth.js のモデルを Prisma で管理
- Account / Session / VerificationToken は Auth.js の規約に準拠した構造

## 4. DB スキーマ

`prisma/schema.prisma` の `User`・`Account`・`Session`・`VerificationToken` モデルを参照。

## 5. 機能

### ヘッダー

- 未ログイン: 「ログイン」ボタン表示
- ログイン済み: ユーザーアバター + 名前 + 「ログアウト」ボタン表示

### ログインページ (`/login`)

- メール + パスワードのログインフォーム
- 「アカウント作成」リンク → 新規登録ページへ

### 新規登録ページ (`/register`)

- 名前 + メール + パスワードの登録フォーム
- 登録成功後、自動ログインしてホームへリダイレクト

### 認証後

- 認証成功後、元のページにリダイレクト

## 6. API

`docs/openapi.yaml` を参照。この機能に関連するエンドポイント:

- `POST /api/auth/register` — ユーザー登録

Auth.js が自動提供するエンドポイント:

- `POST /api/auth/callback/credentials` — ログイン
- `POST /api/auth/signout` — ログアウト
- `GET /api/auth/session` — セッション取得

## 7. UI 検討事項（未決定）

以下は実装フェーズで検討・決定する。

- OAuth プロバイダー（Google, GitHub 等）の追加
- パスワードリセット機能
- メール確認フロー

## 8. 実装ファイル

| ファイル                                  | 内容                                          |
| ----------------------------------------- | --------------------------------------------- |
| `src/auth.ts`                             | Auth.js 設定（providers, adapter, callbacks） |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js API ルートハンドラー                  |
| `src/app/api/auth/register/route.ts`      | ユーザー登録 API                              |
| `src/lib/register.ts`                     | 登録ロジック                                  |
| `src/lib/auth-helpers.ts`                 | 認証ヘルパー（ユーザー検索・パスワード検証）  |
| `src/app/layout.tsx`                      | SessionProvider ラップ                        |
| `src/components/AuthButton.tsx`           | ログイン/ログアウトボタン                     |
| `src/components/SessionProvider.tsx`      | NextAuth SessionProvider ラッパー             |
| `src/app/login/page.tsx`                  | ログインページ                                |
| `src/app/register/page.tsx`               | 新規登録ページ                                |
