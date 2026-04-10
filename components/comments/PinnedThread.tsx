"use client";

import Image from "next/image";
import { MouseEvent, useMemo, useState } from "react";
import { MessageSquareMore } from "lucide-react";
import { ThreadData } from "@liveblocks/client";
import { Thread } from "@liveblocks/react-comments";

import { ThreadMetadata } from "@/liveblocks.config";

type Props = {
  thread: ThreadData<ThreadMetadata>;
  onFocus: (threadId: string) => void;
};

export const PinnedThread = ({ thread, onFocus }: Props) => {
  const startMinimized = useMemo(
    () => Number(new Date()) - Number(new Date(thread.createdAt)) > 100,
    [thread.createdAt]
  );
  const [minimized, setMinimized] = useState(startMinimized);
  const avatarIndex = useMemo(() => (thread.id.charCodeAt(0) % 30) + 1, [thread.id]);

  return (
    <div
      className="absolute flex cursor-pointer items-start gap-3"
      onClick={(event: MouseEvent<HTMLDivElement>) => {
        onFocus(thread.id);
        const target = event.target;
        if (
          target instanceof HTMLElement &&
          target.classList.contains("lb-icon") &&
          target.classList.contains("lb-button-icon")
        ) {
          return;
        }
        setMinimized((value) => !value);
      }}
    >
      <div className="group relative flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.06))] shadow-[0_18px_40px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-transform duration-200 hover:-translate-y-0.5">
        <Image
          src={`https://liveblocks.io/avatars/avatar-${avatarIndex}.png`}
          alt="Comment author"
          width={32}
          height={32}
          draggable={false}
          className="rounded-full"
        />
        <div className="absolute -bottom-1 -right-1 rounded-full border border-slate-950 bg-primary-green p-1 text-slate-950 shadow-lg">
          <MessageSquareMore className="h-3 w-3" />
        </div>
      </div>

      {minimized ? (
        <div className="comment-pin-card rounded-2xl px-3 py-2">
          <p className="type-kicker !text-[9px] !tracking-[0.22em]">Comment Pin</p>
          <p className="mt-1 max-w-[180px] text-sm text-[rgb(var(--app-text))]">Open thread</p>
        </div>
      ) : (
        <div className="comment-thread-card min-w-[320px] overflow-hidden rounded-[24px]">
          <Thread
            thread={thread}
            indentCommentContent={false}
            onKeyUp={(event) => {
              event.stopPropagation();
            }}
          />
        </div>
      )}
    </div>
  );
};
