"use client";

import { FormEvent, useMemo, useState } from "react";
import { KeyRound, MoonStar, SunMedium, UsersRound } from "lucide-react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  createUserColor,
  createWorkspaceCode,
  normalizeWorkspaceCode,
  useAppShell,
} from "./providers/AppShellProvider";

const WorkspaceSetup = () => {
  const { theme, setTheme, saveSession, session } = useAppShell();
  const [displayName, setDisplayName] = useState(session?.displayName || "");
  const [roomCode, setRoomCode] = useState(normalizeWorkspaceCode(session?.roomCode || createWorkspaceCode()));

  const headerCopy = useMemo(
    () =>
      roomCode
        ? "Join your team by code or create a fresh board for collaboration."
        : "Create a shared board and invite your teammates with a room code.",
    [roomCode]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = displayName.trim();
    if (!trimmedName) return;

    saveSession({
      displayName: trimmedName,
      roomCode: roomCode.trim().toUpperCase() || createWorkspaceCode(),
      userColor: session?.userColor || createUserColor(),
      boardTitle: session?.boardTitle || `${trimmedName}'s board`,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="panel-shell w-full max-w-3xl overflow-hidden">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="border-b border-primary-grey-100 p-8 md:border-b-0 md:border-r">
            <div className="space-y-4">
              <span className="type-kicker">Workspace Access</span>
              <h1 className="type-title text-4xl font-semibold md:text-5xl">
                Set up your board, invite your team, and start collaborating live.
              </h1>
              <p className="type-subtitle max-w-xl">{headerCopy}</p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-primary-grey-100 bg-primary-grey-200/30 p-4">
                <UsersRound className="mb-3 h-5 w-5 text-primary-green" />
                <p className="font-ui text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--app-text))]">Team-ready room codes</p>
                <p className="type-body mt-1">Share a short code and join the same live workspace.</p>
              </div>
              <div className="rounded-2xl border border-primary-grey-100 bg-primary-grey-200/30 p-4">
                <KeyRound className="mb-3 h-5 w-5 text-primary-green" />
                <p className="font-ui text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--app-text))]">Personal identity</p>
                <p className="type-body mt-1">Show your name in presence lists and collaborative sessions.</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="type-kicker">Join Or Create</span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl border border-primary-grey-100 bg-primary-grey-200/35 text-[rgb(var(--app-text))] hover:bg-primary-grey-200"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                type="button"
              >
                {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
              </Button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="display-name" className="type-kicker block">Your Name</label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Vijay"
                  className="input-ring"
                  autoComplete="nickname"
                  maxLength={40}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="room-code" className="type-kicker block">Workspace Code</label>
                <Input
                  id="room-code"
                  value={roomCode}
                  onChange={(event) => setRoomCode(normalizeWorkspaceCode(event.target.value))}
                  placeholder="AB12CD"
                  className="input-ring font-dev tracking-[0.2em]"
                  autoCapitalize="characters"
                  autoCorrect="off"
                  maxLength={12}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 rounded-xl border-primary-grey-100 bg-transparent text-[rgb(var(--app-text))] hover:bg-primary-grey-200"
                  onClick={() => setRoomCode(createWorkspaceCode())}
                >
                  Generate Code
                </Button>
                <Button type="submit" className="flex-1 rounded-xl bg-primary-green text-slate-950 hover:bg-primary-green/90">
                  Enter Workspace
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSetup;
