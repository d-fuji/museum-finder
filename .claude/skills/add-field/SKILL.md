---
name: add-field
description: モデルへのフィールド追加ワークフロー。全ファイルの更新漏れを防ぐチェックリスト付き。
---

# フィールド追加ワークフロー

新しいフィールドを追加する際は、以下をすべて順番に更新する。1つでも漏れると DB に null が入るか、型エラーになる。

## チェックリスト

1. `docs/specs/*.md` — 仕様のデータモデル表に追加
2. `docs/openapi.yaml` — API スキーマに追加（required 判定も確認）
3. `prisma/schema.prisma` — カラム定義を追加
4. `src/types/api.ts` — 型定義を更新
5. `src/data/*.json` — フィクスチャデータに値を追加
6. `prisma/seed.ts` — seed の create/upsert データに追加 **← 最も漏れやすい**
7. `src/mocks/handlers.ts` — MSW モックデータに追加
8. `src/lib/*-mapper.ts` — マッパー関数に追加（Prisma → API 型変換）
9. API ルート・UI コンポーネント — 必要に応じて更新

## 実行手順

1. 上記チェックリストの 1〜3 を更新（仕様 → スキーマ）
2. `npm run db:migrate` でマイグレーション作成・適用
3. `/tdd` スキルで TDD 実装（4〜9 をテスト駆動で進める）
4. 全テスト通過を確認: `npx vitest run`
5. Lint チェック: `npm run lint && npm run format:check`
