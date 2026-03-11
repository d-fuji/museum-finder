# 認証機能仕様

## 1. 概要

Auth.js (NextAuth.js v5) を使い、メール+パスワード認証を実装する。
セッション管理は DB (Prisma) で行い、ユーザー情報を永続化する。

## 2. 技術選定

| 技術                              | 理由                                       |
| --------------------------------- | ------------------------------------------ |
| Auth.js v5                        | Next.js App Router ネイティブ対応          |
| @auth/prisma-adapter              | 既存の Prisma + PostgreSQL をそのまま活用  |
| Credentials (メール + パスワード) | メールアドレスとパスワードによる認証       |
| bcrypt                            | パスワードハッシュ化                       |

## 3. DB スキーマ変更

Auth.js の Prisma Adapter が要求する以下のテーブルを追加する。

### User テーブル

| カラム        | 型        | 制約             | 説明                                   |
| ------------- | --------- | ---------------- | -------------------------------------- |
| id            | String    | PK, default cuid | ユーザー ID                            |
| name          | String?   | -                | 表示名                                 |
| email         | String?   | UNIQUE           | メールアドレス                         |
| emailVerified | DateTime? | -                | メール確認日時                         |
| image         | String?   | -                | アバター URL                           |
| password      | String?   | -                | ハッシュ化パスワード（Credentials 用） |

### Account テーブル

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

### Session テーブル

| カラム       | 型       | 制約             | 説明               |
| ------------ | -------- | ---------------- | ------------------ |
| id           | String   | PK, default cuid | セッション ID      |
| sessionToken | String   | UNIQUE           | セッショントークン |
| userId       | String   | FK → User.id     | ユーザー ID        |
| expires      | DateTime | NOT NULL         | 有効期限           |

### VerificationToken テーブル

| カラム     | 型       | 制約     | 説明     |
| ---------- | -------- | -------- | -------- |
| identifier | String   | NOT NULL | 識別子   |
| token      | String   | NOT NULL | トークン |
| expires    | DateTime | NOT NULL | 有効期限 |

@@unique([identifier, token])

### Review テーブル変更

- `userId` を `User.id` への外部キーに変更
- `userName` カラムを削除（User.name から取得）

## 4. UI 変更

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

## 5. 環境変数

| 変数               | 説明                                  |
| ------------------ | ------------------------------------- |
| AUTH_SECRET        | Auth.js セッション暗号化キー          |

## 6. 実装ファイル

| ファイル                                  | 内容                                          |
| ----------------------------------------- | --------------------------------------------- |
| `src/auth.ts`                             | Auth.js 設定（providers, adapter, callbacks） |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js API ルートハンドラー                  |
| `src/app/layout.tsx`                      | SessionProvider ラップ                        |
| `src/components/AuthButton.tsx`           | ログイン/ログアウトボタン                     |
| `src/app/login/page.tsx`                  | ログインページ                                |
| `src/app/register/page.tsx`               | 新規登録ページ                                |

## 7. 実装手順

1. パッケージインストール（`next-auth`, `@auth/prisma-adapter`, `bcrypt`）
2. Prisma スキーマに Auth.js テーブル追加 + マイグレーション
3. `src/auth.ts` に Auth.js 設定を作成
4. API ルートハンドラー作成
5. ログインページ・新規登録ページ作成
6. ヘッダーに AuthButton コンポーネント追加
7. 環境変数の設定
8. 動作確認
