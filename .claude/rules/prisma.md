---
description: Prisma v7 の運用ルール・注意事項・コマンドリファレンス。prisma/ や src/lib/prisma.ts の変更時に参照する。
globs:
  - "prisma/**"
  - "src/lib/prisma.ts"
---

# Prisma 運用ルール

## 基本

- インポート: `@/generated/prisma/client`（`@prisma/client` は使わない）
- アダプター: ローカル `@prisma/adapter-pg` / 本番 `@prisma/adapter-neon`（`src/lib/prisma.ts` で自動切替）
- seed: `tsx --tsconfig tsconfig.json` で実行、`@/` エイリアス使用可
- ID 戦略: Museum/Review/Tag は `INTEGER (autoincrement)`、User/Account 等は `STRING (cuid)` — Auth.js 規約
- `@auth/prisma-adapter` の型: `prisma as Parameters<typeof PrismaAdapter>[0]` でキャスト（`any` は使わない）

## よくあるトラブル

- **型エラー「Property 'xxx' does not exist on type 'PrismaClient'」**: まず `npm run db:generate` を実行
- **非対話環境（Claude Code・CI）**: `prisma migrate dev` が動作しない。手動 SQL で `prisma/migrations/<timestamp>_<name>/migration.sql` を作成し `prisma migrate deploy` で適用

## マイグレーションの注意事項

- **既存テーブルへの NOT NULL カラム追加**: `@default()` は既存行に適用されない。nullable で追加 → 既存行を埋める → NOT NULL 制約追加の3ステップ
- **Neon タイムアウト**: 本番の `$transaction` は `timeout: 120000` 以上を設定
- マイグレーションファイルは手動で編集しない
- 本番適用済みのマイグレーションは削除・変更しない
- ローカルでのみ `prisma migrate dev`、本番では `prisma migrate deploy` のみ
- 破壊的変更（カラム削除・型変更等）は段階的に: 新カラム追加→デプロイ→参照切替→デプロイ→旧カラム削除→デプロイ

## シードの注意事項

- **JSON の UUID カラム**: UUID 形式の値が必要（`r001` のような短い ID は不可）

## npm scripts

| コマンド | 用途 |
|---------|------|
| `npm run db:migrate` | マイグレーション作成・適用（generate + seed 含む） |
| `npm run db:migrate:status` | 適用状況確認 |
| `npm run db:generate` | Prisma Client 再生成のみ |
| `npm run db:seed` | シードデータのみ投入 |
| `npm run db:reset` | DB 初期化（全削除 + 再作成 + seed） |
| `npm run db:migrate:deploy:prod` | 本番マイグレーション適用 |
| `npm run db:migrate:status:prod` | 本番マイグレーション状況確認 |
| `npm run db:seed:prod` | 本番シードデータ投入 |
