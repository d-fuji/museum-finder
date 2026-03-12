---
description: shadcn/ui v4 (Base UI) の既知の注意点。UIコンポーネント実装時に参照する。
globs:
  - "src/components/**"
---

# shadcn/ui v4 注意点

- **SelectValue**: Portal 内 Item の自動ラベル解決が不安定（jsdom・SSR で value がそのまま表示される）。常に `<SelectValue>{LABELS[value]}</SelectValue>` で明示的にラベルを渡す
