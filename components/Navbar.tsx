"use client";

import Image from "next/image";
import { memo, useMemo, useState } from "react";
import { Check, HelpCircle, LogOut, MoonStar, PencilLine, Share2, SunMedium } from "lucide-react";

import { navElements } from "@/constants";
import { copyTextToClipboard } from "@/lib/utils";
import { useStatus } from "@/liveblocks.config";
import { ActiveElement, NavbarProps } from "@/types/type";

import { Button } from "./ui/button";
import ShapesMenu from "./ShapesMenu";
import ActiveUsers from "./users/ActiveUsers";
import IconRenderer from "./IconRenderer";
import { useAppShell } from "./providers/AppShellProvider";
import ShortcutsModal from "./ShortcutsModal";

const Navbar = ({ activeElement, imageInputRef, handleImageUpload, handleActiveElement }: NavbarProps) => {
  const { session, theme, setTheme, clearSession, updateBoardTitle } = useAppShell();
  const status = useStatus();
  const [copied, setCopied] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const roomCode = session?.roomCode?.trim() || "";

  const isActive = (value: string | Array<ActiveElement>) =>
    (activeElement && activeElement.value === value) ||
    (Array.isArray(value) && value.some((val) => val?.value === activeElement?.value));

  const roomLink = useMemo(() => {
    if (typeof window === "undefined" || !roomCode) return "";
    return `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
  }, [roomCode]);

  const statusLabel = useMemo(() => {
    switch (status) {
      case "connected":
        return "Live";
      case "connecting":
        return "Saving";
      case "reconnecting":
        return "Reconnecting";
      case "disconnected":
        return "Offline";
      default:
        return "Syncing";
    }
  }, [status]);

  const handleCopy = async () => {
    if (!roomCode) return;

    const shareValue = roomLink || roomCode;
    const copiedToClipboard = await copyTextToClipboard(shareValue);

    if (!copiedToClipboard) return;

    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <nav className="sticky top-0 z-30 flex min-h-[72px] select-none items-center justify-between gap-4 border-b border-primary-grey-100 bg-primary-black/88 px-4 backdrop-blur-xl">
      <div className="flex min-w-[88px] items-center">
        <div className="glass-chip soft-glow flex items-center rounded-2xl px-3 py-2">
          <Image src="/assets/logo.svg" alt="FigPro optimize logo" width={72} height={24} priority />
        </div>
      </div>

      <div className="glass-chip hidden min-w-[240px] flex-col justify-center px-4 py-2 md:flex">
        <label htmlFor="board-title" className="type-kicker mb-1 flex items-center gap-2 !tracking-[0.18em]">
          <PencilLine className="h-3.5 w-3.5" />
          Board title
        </label>
        <input
          id="board-title"
          value={session?.boardTitle || ""}
          onChange={(event) => updateBoardTitle(event.target.value)}
          className="bg-transparent font-ui text-[15px] font-semibold tracking-[-0.02em] text-[rgb(var(--app-text))] outline-none placeholder:text-primary-grey-300"
          placeholder="Untitled board"
        />
      </div>

      <ul className="glass-chip flex flex-1 items-stretch justify-center gap-1 p-1.5">
        {navElements.map((item: ActiveElement | any) => (
          <li
            key={item.name}
            onClick={() => {
              if (Array.isArray(item.value)) return;
              handleActiveElement(item);
            }}
            className={`group flex items-center justify-center rounded-2xl transition-all duration-200 ease-out
            ${isActive(item.value) ? "bg-primary-green text-slate-950 shadow-[0_10px_30px_rgba(86,255,166,0.25)]" : "text-primary-grey-300 hover:-translate-y-0.5 hover:bg-primary-grey-200 hover:text-[rgb(var(--app-text))]"}
            `}
          >
            {/* If value is an array means it's a nav element with sub options i.e., dropdown */}
            {Array.isArray(item.value) ? (
              <ShapesMenu
                item={item}
                activeElement={activeElement}
                imageInputRef={imageInputRef}
                handleActiveElement={handleActiveElement}
                handleImageUpload={handleImageUpload}
              />
            ) : (
              <Button variant="ghost" size="icon" className="h-11 w-11 rounded-md bg-transparent p-0 hover:bg-transparent">
                <IconRenderer
                  icon={item.icon}
                  alt={item.name}
                  size={20}
                  className={isActive(item.value) ? "invert" : ""}
                />
              </Button>
            )}
          </li>
        ))}
      </ul>

      <div className="flex min-w-[88px] items-center justify-end gap-2">
        <div className="glass-chip hidden items-center gap-2 px-3 py-2 md:flex">
          <span className="type-kicker !tracking-[0.18em]">{statusLabel}</span>
          <span className="font-dev text-[11px] tracking-[0.16em] text-[rgb(var(--app-text))]">{roomCode}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="glass-chip h-10 w-10 rounded-2xl text-[rgb(var(--app-text))] hover:-translate-y-0.5 hover:bg-primary-grey-200"
          onClick={handleCopy}
          title="Copy invite link"
        >
          {copied ? <Check className="h-4 w-4 text-primary-green" /> : <Share2 className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="glass-chip h-10 w-10 rounded-2xl text-[rgb(var(--app-text))] hover:-translate-y-0.5 hover:bg-primary-grey-200"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle theme"
        >
          {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="glass-chip h-10 w-10 rounded-2xl text-[rgb(var(--app-text))] hover:-translate-y-0.5 hover:bg-primary-grey-200"
          onClick={() => setShowShortcuts(true)}
          title="Keyboard shortcuts"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="glass-chip h-10 w-10 rounded-2xl text-[rgb(var(--app-text))] hover:-translate-y-0.5 hover:bg-primary-grey-200"
          onClick={clearSession}
          title="Switch workspace"
        >
          <LogOut className="h-4 w-4" />
        </Button>
        <ActiveUsers />
      </div>
      <ShortcutsModal open={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </nav>
  );
};

export default memo(Navbar, (prevProps, nextProps) => prevProps.activeElement === nextProps.activeElement);
