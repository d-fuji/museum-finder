# Project Instructions

## 開発スタイル

- TDD・仕様駆動開発を基本とする
- **機能実装・バグ修正・コード追加を行う際は、必ず `/tdd` スキルを実行してから作業を開始すること**
- 実装の手順: 仕様確認(`docs/specs/`) → テスト作成(RED) → 最小実装(GREEN) → リファクタ。この順序は絶対に守る
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

- Prisma v7 では `PrismaClient` のインポートは `@/generated/prisma/client` から行う（`@prisma/client` は使わない）
- DB アダプター: ローカルは `@prisma/adapter-pg`、本番は `@prisma/adapter-neon`（`src/lib/prisma.ts` で自動切替）
- `prisma migrate dev` は generate も自動実行する。ローカルでは `npm run db:migrate` だけでOK
- seed スクリプトでは `tsx --tsconfig tsconfig.json` で実行し `@/` パスエイリアスを使う
- マイグレーション運用の詳細は `docs/specs/infrastructure.md` を参照

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

## リファクタ方針

- **Prisma → API 型の変換**: マッパー関数（`toMuseumSummary` 等）を `lib/` に集約する。API ルートで直接マッピングしない
- **null → undefined 変換**: マッパー関数内で一元管理する。各所で `?? undefined` を書かない
- **共通ロジックの抽出**: 2箇所以上で同じ変換・計算が現れたら `lib/` にユーティリティとして切り出す
- **DB 依存の分離**: DB に依存しない関数と依存する関数を同じファイルに混ぜない。テストで不要な DB 接続が発生する原因になる
- **仕様の同期**: リファクタで構造が変わった場合は `docs/specs/` と `CLAUDE.md` も更新する

## 仕様書

- 仕様は `docs/specs/` に機能ごとに配置する
- API仕様は `docs/openapi.yaml` を単一ソースとする
- 実装前に必ず対象機能の仕様を確認する
- 仕様変更が必要な場合はユーザーに確認してから更新する
