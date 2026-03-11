# 開発で知っておくべき落とし穴

## 1. Prisma マイグレーション

### 既存データがあるテーブルへの NOT NULL カラム追加

`@default()` を付けても、Prisma のデフォルト値は INSERT 時にしか適用されない。既存行には効かないため、以下の3ステップで対応する。

```sql
-- Step 1: nullable で追加
ALTER TABLE "Museum" ADD COLUMN "code" VARCHAR(36);

-- Step 2: 既存行を埋める
UPDATE "Museum" SET "code" = gen_random_uuid()::VARCHAR(36) WHERE "code" IS NULL;

-- Step 3: NOT NULL + UNIQUE 制約を追加
ALTER TABLE "Museum" ALTER COLUMN "code" SET NOT NULL;
CREATE UNIQUE INDEX "Museum_code_key" ON "Museum"("code");
```

### 非対話環境での `prisma migrate dev`

Claude Code・CI/CD など非対話環境では `prisma migrate dev` が動作しない。

```bash
# NG: 非対話環境ではエラーになる
npx prisma migrate dev --name add_column

# OK: 手動マイグレーション + deploy
mkdir -p prisma/migrations/<timestamp>_<name>
# migration.sql を手動作成
npx prisma migrate deploy
```

## 2. シードスクリプト

### フィールド追加時のチェックリスト

新しいフィールドを追加する際は、以下をすべて更新する。1つでも漏れると DB に null が入る。

1. `prisma/schema.prisma` — カラム定義
2. `src/types/api.ts` — 型定義
3. `src/data/museums.json` — フィクスチャデータ
4. **`prisma/seed.ts` — seed の create/update データ** ← 漏れやすい
5. `src/mocks/handlers.ts` — MSW モックデータ
6. `src/lib/museum-utils.ts` — マッパー関数
7. API ルート・UI コンポーネント

### UUID 導入時はクリーンスタート必須

既存データに UUID を後付けする場合、旧データとの整合性問題が発生する。

- マイグレーションでランダム UUID が振られる
- JSON の UUID とは異なるため upsert の `where` が一致しない
- name での紐付けを試みると、旧データと新データの重複でユニーク制約違反

**対策**: UUID 導入の初回は `TRUNCATE ... RESTART IDENTITY CASCADE` でクリーンスタートしてから seed する。

### Neon (本番DB) のトランザクションタイムアウト

ローカル Docker は高速だが、Neon はネットワーク遅延がある。

```typescript
// NG: ローカルでは通るが本番でタイムアウト
await prisma.$transaction(async (tx) => { ... }, { timeout: 30000 });

// OK: 本番を考慮して余裕を持たせる
await prisma.$transaction(async (tx) => { ... }, { timeout: 120000 });
```

## 3. shadcn/ui v4 (Base UI)

### Select の SelectValue が自動ラベル解決できないケース

Base UI の Select は、Portal 内の Item テキストから表示ラベルを自動解決する。しかし jsdom（テスト）や SSR 環境では Portal のレンダリングが不安定で、生の value が表示されることがある。

```tsx
// NG: value の文字列がそのまま表示される場合がある
<SelectTrigger>
  <SelectValue />
</SelectTrigger>

// OK: 常に明示的にラベルを渡す
<SelectTrigger>
  <SelectValue>{LABELS[value]}</SelectValue>
</SelectTrigger>
```

## 4. データの正確性

### フィクスチャデータは定期的に検証する

施設の開館状況・料金は変わる。初回投入時に正しくても、時間経過で陳腐化する。

- 日本郵船歴史博物館: 2023年4月から長期休館中だが、`isClosed: false` のままだった
- 入場料が実際と異なっていた（1000円 → 正しくは400円）

**対策**: 公式サイトの URL をデータに含め、定期的に検証できるようにする。`isClosed` フラグと `closedMessage` で休館情報を管理する。
