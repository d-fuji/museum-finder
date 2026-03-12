# Project Instructions

## このファイルについて

CLAUDE.md は継続的に改善するドキュメントである。

- **同じミスを繰り返したら**: 原因となるルールや注意事項をこのファイルに追記する。2度目の間違いは仕組みで防ぐ
- **肥大化したら**: セクションの内容を `.claude/rules/`（常時参照すべきルール）や `.claude/skills/`（手順的ワークフロー）に分離し、ここには参照だけ残す

## プロダクト概要

企業博物館・歴史館の地図検索 + ユーザーレビューアプリ。初期データは「明治期の産業遺産」「歴史的港町（小樽・神戸・門司等）」に絞って世界観を構築する。

Category enum: `CORPORATE_MUSEUM` / `HISTORY_MUSEUM` / `SCIENCE_MUSEUM` / `INDUSTRIAL_HERITAGE` / `FACTORY_TOUR` / `CASTLE`

フィクスチャの開館状況・料金は陳腐化する。`websiteUrl` で公式サイトを参照可能にし、`isClosed` + `closedMessage` で休館情報を管理する。

## 開発フロー

### 仕様駆動開発（spec-first）

`docs/specs/` が最上位の真実。すべての実装はここから始まる。

**権威構造**: spec (`docs/specs/`) → openapi (`docs/openapi.yaml`) / prisma (`prisma/schema.prisma`) → 実装コード。矛盾があれば上位を正とする。

- spec に書かれていない機能を勝手に追加しない。仕様変更はユーザーに確認
- 新規仕様は `docs/specs/_template.md` の構成に従う

### テスト駆動開発（TDD）

機能実装・バグ修正・コード追加時は `/tdd` スキルを実行してから開始する。フィールド追加時は `/add-field` スキルに従う。

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| フレームワーク | Next.js (App Router) / Vercel |
| スタイル | Tailwind CSS（モバイルファースト）/ shadcn/ui v4 + Lucide React |
| データ | SWR / Prisma v7 + PostgreSQL (Neon) / Auth.js v5 |
| 地図 | react-map-gl + MapLibre GL JS |
| テスト | Vitest + Testing Library + jsdom / MSW |
| 型・仕様 | `src/types/api.ts`（← `docs/openapi.yaml`）/ `src/data/*.json`（フィクスチャ） |

## Prisma・DB

運用ルール → `.claude/rules/prisma.md` / マイグレーション・環境構築 → `/db-migrate` スキル

## コーディング規約

- テスト実行: `npx vitest run`（全体）/ `npx vitest run <path>`（個別）
- テスト配置: `__tests__/` ディレクトリ（対象モジュールの隣）
- テストの MSW: `src/mocks/server.ts` / SWR: `SWRTestProvider`（`src/lib/test-utils.tsx`）でキャッシュ分離
- コミット前: `npm run lint && npm run format:check`
- Prettier: ダブルクォート、セミコロンあり、trailing comma es5、printWidth 100（`.prettierrc`）
- 型変換: マッパー関数（`toMuseumSummary` 等）を `lib/` に集約。null → undefined 変換もマッパー内で一元管理
- 共通化: 2箇所以上で同じ変換・計算が現れたら `lib/` に切り出す
- DB 依存の分離: DB 依存関数と非依存関数を同じファイルに混ぜない

## ディレクトリ構成

```
src/
  app/           # ページ + API routes
  auth.ts        # Auth.js 設定
  components/    # UI（ui/ = shadcn/ui）
  generated/     # Prisma Client（gitignore済み）
  types/         # 型定義
  data/          # JSON フィクスチャ
  mocks/         # MSW ハンドラー
  lib/           # ユーティリティ・Prisma・マッパー
prisma/          # schema / seed / migrations
docs/
  openapi.yaml   # API 仕様
  specs/         # 機能仕様書（_template.md = テンプレート）
```
