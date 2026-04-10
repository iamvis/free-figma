"use client";

import { Keyboard, X } from "lucide-react";

import { shortcuts } from "@/constants";
import { Button } from "./ui/button";

const extraShortcuts = [
  { name: "Copy", shortcut: "Ctrl/Cmd + C" },
  { name: "Paste", shortcut: "Ctrl/Cmd + V" },
  { name: "Cut", shortcut: "Ctrl/Cmd + X" },
  { name: "Pan canvas", shortcut: "Middle mouse / Space + drag" },
  { name: "Zoom canvas", shortcut: "Ctrl/Cmd + wheel" },
  { name: "Zoom In", shortcut: "+" },
  { name: "Zoom Out", shortcut: "-" },
  { name: "Reset Zoom", shortcut: "0" },
];

const ShortcutsModal = ({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) => {
  if (!open) return null;

  const allShortcuts = [...shortcuts, ...extraShortcuts];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-6 backdrop-blur-sm">
      <div className="panel-shell w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-primary-grey-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-grey-200/45 p-2 text-[rgb(var(--app-text))]">
              <Keyboard className="h-4 w-4" />
            </div>
            <div>
              <h2 className="type-title text-2xl font-semibold">Keyboard shortcuts</h2>
              <p className="type-body">Speed up board actions and collaboration flow.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl text-[rgb(var(--app-text))] hover:bg-primary-grey-200"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-2 p-5">
          {allShortcuts.map((item) => (
            <div
              key={`${item.name}-${item.shortcut}`}
              className="flex items-center justify-between rounded-2xl border border-primary-grey-100 bg-primary-grey-200/30 px-4 py-3"
            >
              <span className="font-ui text-[14px] font-medium tracking-[-0.01em] text-[rgb(var(--app-text))]">{item.name}</span>
              <span className="type-mono">
                {item.shortcut}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutsModal;
