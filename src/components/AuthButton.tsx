"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogIn, LogOut, Heart } from "lucide-react";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-9 w-20" />;
  }

  if (!session) {
    return (
      <Button variant="outline" size="sm" nativeButton={false} render={<Link href="/login" />}>
        <LogIn className="size-4" />
        ログイン
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/mylist"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <Heart className="size-4" />
        マイリスト
      </Link>
      <span className="text-sm text-muted-foreground">{session.user?.name}</span>
      <Button variant="ghost" size="sm" onClick={() => signOut()}>
        <LogOut className="size-4" />
      </Button>
    </div>
  );
}
