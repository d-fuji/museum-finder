# Project Instructions

## 開発スタイル

- TDD・仕様駆動開発を基本とする。詳細は `/tdd` スキルに従う
- 実装の手順: 仕様確認 → テスト作成(RED) → 最小実装(GREEN) → リファクタ。この順序は絶対に守る
- テストを実装に合わせて修正することは禁止。テストが失敗したら実装を修正する。仕様変更が必要な場合はユーザーに確認する
- DB ロジックはリポジトリパターンで分離し、テストではモックに差し替える

## 技術スタック

- Next.js (App Router) / Vercel
- Tailwind CSS（モバイルファースト）
- UIライブラリ: shadcn/ui (v4, Base UI ベース) + Lucide React アイコン
- データフェッチ: SWR
- 地図: react-map-gl + MapLibre GL JS
- DB: Prisma (v7) + PostgreSQL (Neon / ローカル Docker)
- 認証: Auth.js v5 (next-auth) + @auth/prisma-adapter
- API仕様: OpenAPI 3.0 (`docs/openapi.yaml`)
- モック: MSW (Mock Service Worker) でAPIをモック
- 型定義: `src/types/api.ts`（OpenAPIスキーマと対応）
- フィクスチャデータ: `src/data/*.json`

## Prisma 運用ルール

- マイグレーション後は必ず `npx prisma generate` を実行する
- Prisma v7 では `PrismaClient` のインポートは `@/generated/prisma/client` から行う（`@prisma/client` は使わない）
- Prisma v7 では `PrismaPg` アダプターが必須（`@prisma/adapter-pg`）
- seed スクリプトでは `tsx --tsconfig tsconfig.json` で実行し `@/` パスエイリアスを使う

## ディレクトリ構成

```
src/
  app/           # Next.js App Router ページ
  auth.ts        # Auth.js 設定
  components/    # UIコンポーネント
    ui/          # shadcn/ui コンポーネント
  generated/     # Prisma Client 生成コード（gitignore済み）
  types/         # 型定義
  data/          # JSONフィクスチャ（MSWのモックデータ + シード元データ）
  mocks/         # MSWハンドラー・セットアップ
  lib/           # ユーティリティ・APIクライアント・Prismaシングルトン
prisma/
  schema.prisma  # DBスキーマ定義（単一ソース）
  seed.ts        # シードスクリプト
  migrations/    # マイグレーションファイル
docs/
  openapi.yaml   # API仕様
  specs/         # 機能仕様書
```

## テスト

- フレームワーク: Vitest + @testing-library/react + jsdom
- 実行: `npx vitest run`（全テスト）、`npx vitest run <path>`（個別）
- テストファイル: `__tests__/` ディレクトリに配置（対象モジュールの隣）
- MSW: テスト時は `src/mocks/server.ts` を使用
- SWR: テスト時は `SWRTestProvider`（`src/lib/test-utils.tsx`）でラップしてキャッシュを分離する

## Lint & フォーマット

- ESLint: `npm run lint`
  - `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
  - `eslint-config-prettier` でフォーマットルールの競合を回避
- Prettier: `npm run format`（修正）/ `npm run format:check`（チェックのみ）
  - ダブルクォート、セミコロンあり、trailing comma es5、printWidth 100
  - 設定: `.prettierrc`
- コミット前に `npm run lint && npm run format:check` が通ることを確認する

## 仕様書

- 仕様は `docs/specs/` に機能ごとに配置する
- API仕様は `docs/openapi.yaml` を単一ソースとする
- 実装前に必ず対象機能の仕様を確認する
- 仕様変更が必要な場合はユーザーに確認してから更新する
