# 認証機能仕様

## 1. 概要

Auth.js (NextAuth.js v5) を使い、メール+パスワード認証を提供する。
セッション管理は JWT 戦略で行い、ユーザー情報は Prisma + PostgreSQL に永続化する。

## 2. データモデル

### User

| カラム        | 型        | 制約             | 説明                                   |
| ------------- | --------- | ---------------- | -------------------------------------- |
| id            | String    | PK, default cuid | ユーザー ID                            |
| name          | String?   | -                | 表示名                                 |
| email         | String?   | UNIQUE           | メールアドレス                         |
| emailVerified | DateTime? | -                | メール確認日時                         |
| image         | String?   | -                | アバター URL                           |
| password      | String?   | -                | ハッシュ化パスワード（Credentials 用） |

### Account

| カラム            | 型      | 制約             | 説明                 |
| ----------------- | ------- | ---------------- | -------------------- |
| id                | String  | PK, default cuid | アカウント ID        |
| userId            | String  | FK → User.id     | ユーザー ID          |
| type              | String  | NOT NULL         | アカウント種別       |
| provider          | String  | NOT NULL         | プロバイダー名       |
| providerAccountId | String  | NOT NULL         | プロバイダー側 ID    |
| refresh_token     | String? | -                | リフレッシュトークン |
| access_token      | String? | -                | アクセストークン     |
| expires_at        | Int?    | -                | トークン有効期限     |
| token_type        | String? | -                | トークン種別         |
| scope             | String? | -                | スコープ             |
| id_token          | String? | -                | ID トークン          |
| session_state     | String? | -                | セッション状態       |

@@unique([provider, providerAccountId])

### Session

| カラム       | 型       | 制約             | 説明               |
| ------------ | -------- | ---------------- | ------------------ |
| id           | String   | PK, default cuid | セッション ID      |
| sessionToken | String   | UNIQUE           | セッショントークン |
| userId       | String   | FK → User.id     | ユーザー ID        |
| expires      | DateTime | NOT NULL         | 有効期限           |

### VerificationToken

| カラム     | 型       | 制約     | 説明     |
| ---------- | -------- | -------- | -------- |
| identifier | String   | NOT NULL | 識別子   |
| token      | String   | NOT NULL | トークン |
| expires    | DateTime | NOT NULL | 有効期限 |

@@unique([identifier, token])

## 3. 機能

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

## 4. API

### POST /api/auth/register

ユーザー登録。

**リクエスト:**

| フィールド | 型     | 必須 | バリデーション |
| ---------- | ------ | ---- | -------------- |
| name       | string | yes  | 必須           |
| email      | string | yes  | 必須           |
| password   | string | yes  | 8 文字以上     |

**レスポンス:**

- `201`: 登録成功
- `400`: バリデーションエラー
- `409`: メールアドレス重複

### Auth.js 提供エンドポイント

- `POST /api/auth/callback/credentials` — ログイン
- `POST /api/auth/signout` — ログアウト
- `GET /api/auth/session` — セッション取得

## 5. 実装ファイル

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
