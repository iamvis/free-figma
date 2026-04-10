"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ThemeMode = "dark" | "light";

export type WorkspaceSession = {
  displayName: string;
  roomCode: string;
  userColor: string;
  boardTitle?: string;
};

type AppShellContextValue = {
  ready: boolean;
  theme: ThemeMode;
  session: WorkspaceSession | null;
  setTheme: (theme: ThemeMode) => void;
  saveSession: (session: WorkspaceSession) => void;
  updateBoardTitle: (title: string) => void;
  clearSession: () => void;
};

const STORAGE_KEY = "figpro-shell";
const USER_COLORS = ["#56FFA6", "#6FEEFF", "#FF8A65", "#F9C74F", "#A78BFA", "#F472B6"];
const MAX_ROOM_CODE_LENGTH = 12;
const ROOM_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const AppShellContext = createContext<AppShellContextValue | null>(null);

const getInitialTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "dark";

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as { theme?: ThemeMode };
      if (parsed.theme === "light" || parsed.theme === "dark") return parsed.theme;
    } catch {}
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
};

const getInitialRoomCode = () => {
  if (typeof window === "undefined") return "";

  const params = new URLSearchParams(window.location.search);
  return normalizeRoomCode(params.get("room") || "");
};

const normalizeRoomCode = (value: string) =>
  value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, MAX_ROOM_CODE_LENGTH);

const randomCode = (length = 6) => {
  const cryptoApi = typeof globalThis !== "undefined" ? globalThis.crypto : undefined;

  if (cryptoApi?.getRandomValues) {
    const values = new Uint32Array(length);
    cryptoApi.getRandomValues(values);
    return Array.from(values, (value) => ROOM_CODE_ALPHABET[value % ROOM_CODE_ALPHABET.length]).join("");
  }

  return Array.from({ length }, () => ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)]).join("");
};

const randomColor = () => USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];

const normalizeSession = (session: WorkspaceSession | null): WorkspaceSession | null => {
  if (!session) return null;

  const roomCode = normalizeRoomCode(session.roomCode || "") || randomCode();

  return {
    ...session,
    displayName: session.displayName?.trim() || "",
    roomCode,
    userColor: session.userColor || randomColor(),
    boardTitle: session.boardTitle?.trim() || "Untitled board",
  };
};

export const AppShellProvider = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<ThemeMode>("dark");
  const [session, setSession] = useState<WorkspaceSession | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const urlRoom = getInitialRoomCode();
    const initialTheme = getInitialTheme();

    let nextSession: WorkspaceSession | null = null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as {
          session?: WorkspaceSession | null;
          theme?: ThemeMode;
        };
        if (parsed.session) {
          nextSession = normalizeSession({
            ...parsed.session,
            roomCode: urlRoom || parsed.session.roomCode || randomCode(),
            userColor: parsed.session.userColor || randomColor(),
          });
        }
      } catch {}
    }

    if (!nextSession && urlRoom) {
      nextSession = normalizeSession({
        displayName: "",
        roomCode: urlRoom,
        userColor: randomColor(),
      });
    }

    setThemeState(initialTheme);
    setSession(nextSession);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [ready, theme]);

  useEffect(() => {
    if (!ready) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        theme,
        session,
      })
    );

    const roomCode = normalizeRoomCode(session?.roomCode || "");
    const url = new URL(window.location.href);

    if (roomCode) {
      url.searchParams.set("room", roomCode);
    } else {
      url.searchParams.delete("room");
    }

    window.history.replaceState({}, "", url.toString());
  }, [ready, session, theme]);

  const value = useMemo<AppShellContextValue>(
    () => ({
      ready,
      theme,
      session,
      setTheme: (nextTheme) => setThemeState(nextTheme),
      saveSession: (nextSession) =>
        setSession(normalizeSession({
          ...nextSession,
          roomCode: normalizeRoomCode(nextSession.roomCode) || randomCode(),
          userColor: nextSession.userColor || randomColor(),
          boardTitle: nextSession.boardTitle?.trim() || "Untitled board",
        })),
      updateBoardTitle: (title) =>
        setSession((current) =>
          current
            ? {
                ...current,
                boardTitle: title.trim() || "Untitled board",
              }
            : current
        ),
      clearSession: () => setSession(null),
    }),
    [ready, session, theme]
  );

  return <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>;
};

export const useAppShell = () => {
  const context = useContext(AppShellContext);

  if (!context) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }

  return context;
};

export const createWorkspaceCode = randomCode;
export const createUserColor = randomColor;
export const normalizeWorkspaceCode = normalizeRoomCode;
