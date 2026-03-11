import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerUser } from "@/lib/register";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await registerUser(body, {
    findByEmail: (email) => prisma.user.findUnique({ where: { email } }),
    create: (data) => {
      return prisma.user.create({ data }).then(() => undefined);
    },
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
