"use client";

import { useState } from "react";
import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { upsertBookmark, deleteBookmark } from "@/lib/api";
import type { BookmarkStatus } from "@/types/api";

type Props = {
  museumId: number;
  currentStatus: BookmarkStatus | null;
  onUpdate: () => void;
};

type PendingAction = { type: "delete" } | { type: "downgrade" };

const CONFIRM_MESSAGES: Record<PendingAction["type"], { title: string; description: string }> = {
  delete: {
    title: "「行った」を解除しますか？",
    description: "訪問記録が削除されます。",
  },
  downgrade: {
    title: "「行きたい」に変更しますか？",
    description: "訪問記録が「行きたい」に変更されます。",
  },
};

export function BookmarkButtons({ museumId, currentStatus, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function execute(status: BookmarkStatus, isDelete: boolean) {
    setLoading(true);
    setErrorMessage(null);
    try {
      if (isDelete) {
        await deleteBookmark(museumId);
      } else {
        await upsertBookmark(museumId, status);
      }
      onUpdate();
    } catch {
      setErrorMessage("操作に失敗しました。もう一度お試しください。");
    } finally {
      setLoading(false);
    }
  }

  function handleClick(status: BookmarkStatus) {
    if (loading) return;

    const isDelete = currentStatus === status;

    // VISITED 状態からの変更は確認モーダルを表示
    if (currentStatus === "VISITED") {
      if (isDelete) {
        setPendingAction({ type: "delete" });
      } else {
        setPendingAction({ type: "downgrade" });
      }
      return;
    }

    execute(status, isDelete);
  }

  function handleConfirm() {
    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);

    if (action.type === "delete") {
      execute("VISITED", true);
    } else {
      execute("WANT_TO_GO", false);
    }
  }

  const confirmMessage = pendingAction ? CONFIRM_MESSAGES[pendingAction.type] : null;

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant={currentStatus === "WANT_TO_GO" ? "default" : "outline"}
          size="sm"
          onClick={() => handleClick("WANT_TO_GO")}
          disabled={loading}
          data-active={currentStatus === "WANT_TO_GO" ? "true" : "false"}
          aria-label="行きたい"
        >
          <Heart className="mr-1 h-4 w-4" />
          行きたい
        </Button>
        <Button
          variant={currentStatus === "VISITED" ? "default" : "outline"}
          size="sm"
          onClick={() => handleClick("VISITED")}
          disabled={loading}
          data-active={currentStatus === "VISITED" ? "true" : "false"}
          aria-label="行った"
        >
          <MapPin className="mr-1 h-4 w-4" />
          行った
        </Button>
      </div>
      {errorMessage && <p className="mt-1 text-xs text-destructive">{errorMessage}</p>}

      <AlertDialog open={pendingAction !== null} onOpenChange={() => setPendingAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmMessage?.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmMessage?.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>変更する</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
