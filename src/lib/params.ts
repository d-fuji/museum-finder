import { NextResponse } from "next/server";

/**
 * パスパラメータから数値IDをパースし、無効な場合は400レスポンスを返す。
 */
export function parseIntParam(
  value: string
): { ok: true; value: number } | { ok: false; response: NextResponse } {
  const num = Number(value);
  if (Number.isNaN(num) || !Number.isInteger(num) || num <= 0) {
    return { ok: false, response: NextResponse.json({ error: "Invalid ID" }, { status: 400 }) };
  }
  return { ok: true, value: num };
}
