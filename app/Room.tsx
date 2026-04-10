"use client";

import { ReactNode } from "react";
import { RoomProvider } from "../liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import { LiveMap } from "@liveblocks/client";
import Loader from "@/components/Loader";
import WorkspaceSetup from "@/components/WorkspaceSetup";
import {
  AppShellProvider,
  normalizeWorkspaceCode,
  useAppShell,
} from "@/components/providers/AppShellProvider";

function RoomContent({ children }: { children: ReactNode }) {
  const { ready, session } = useAppShell();
  const roomCode = normalizeWorkspaceCode(session?.roomCode || "");

  if (!ready) return <Loader />;

  if (!session?.displayName || !roomCode) {
    return <WorkspaceSetup />;
  }

  return (
    <RoomProvider
      key={roomCode}
      id={`workspace-${roomCode.toLowerCase()}`}
      initialPresence={{
        cursor: null,
        message: null,
        userName: session.displayName,
        userColor: session.userColor,
      }}
      initialStorage={{
        canvasObjects: new LiveMap(),
      }}
    >
      <ClientSideSuspense fallback={<Loader/>}>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}

export function Room({ children }: { children: ReactNode }) {
  return (
    <AppShellProvider>
      <RoomContent>{children}</RoomContent>
    </AppShellProvider>
  );
}
