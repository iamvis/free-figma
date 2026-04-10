"use client";

import { useBroadcastEvent, useEventListener, useMyPresence } from "@/liveblocks.config";
import LiveCursors from "./Cursor/LiveCursors";
import { useCallback, useEffect, useState } from "react";
import { CursorMode, CursorState, Reaction } from "@/types/type";
import CursorChat from "./Cursor/CursorChat";
import ReactionSelector from "./Reactions/ReactionSelector";
import FlyingReaction from "./Reactions/FlyingReaction";
import useInterval from "@/hooks/useInterval";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "./ui/context-menu";
import { shortcuts } from "@/constants";
import { BoardStyle } from "./BoardStyleSwitcher";

type Props = {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
  children?: React.ReactNode;
  boardStyle?: BoardStyle;
  activeTool?: string;
  isPanning?: boolean;
};

const Live = ({
  canvasRef,
  undo,
  redo,
  children,
  boardStyle = "dots",
  activeTool = "select",
  isPanning = false,
}: Props) => {
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const broadcast = useBroadcastEvent();

  const setReaction = useCallback((reaction: string) => {
    setCursorState({
      mode: CursorMode.Reaction,
      reaction,
      isPressed: false,
    });
  }, []);

  useInterval(() => {
    setReactions((currentReactions) => currentReactions.filter((reaction) => reaction.timestamp > Date.now() - 4000));
  }, 1000);

  useInterval(() => {
    if (cursorState.mode === CursorMode.Reaction && cursorState.isPressed && cursor) {
      setReactions((currentReactions) =>
        currentReactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: cursorState.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: cursorState.reaction,
      });
    }
  }, 100);

  useEventListener((eventData) => {
    const event = eventData.event;

    setReactions((currentReactions) =>
      currentReactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });

  useEffect(() => {
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "/") {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: "",
        });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: null });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setCursorState({
          mode: CursorMode.ReactionSelector,
        });
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/") {
        e.preventDefault();
      }
    };

    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();

      if (cursorState.mode !== CursorMode.ReactionSelector) {
        const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
        const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

        updateMyPresence({ cursor: { x, y } });
      }
    },
    [cursorState.mode, updateMyPresence]
  );

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, [updateMyPresence]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const x = event.clientX - event.currentTarget.getBoundingClientRect().x;
      const y = event.clientY - event.currentTarget.getBoundingClientRect().y;

      updateMyPresence({ cursor: { x, y } });

      setCursorState((state) =>
        state.mode === CursorMode.Reaction ? { ...state, isPressed: true } : state
      );
    },
    [updateMyPresence]
  );

  const handlePointerUp = useCallback(() => {
    setCursorState((state) =>
      state.mode === CursorMode.Reaction ? { ...state, isPressed: false } : state
    );
  }, []);

  const handleContextMenuClick = useCallback(
    (key: string) => {
      switch (key) {
        case "Chat":
          setCursorState({
            mode: CursorMode.Chat,
            previousMessage: null,
            message: "",
          });
          break;
        case "Reactions":
          setCursorState({ mode: CursorMode.ReactionSelector });
          break;
        case "Undo":
          undo();
          break;
        case "Redo":
          redo();
          break;
        default:
          break;
      }
    },
    [redo, undo]
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-[32px] border border-primary-grey-100 shadow-[0_28px_100px_rgba(0,0,0,0.34)] ${
          boardStyle === "grid"
            ? "bg-[linear-gradient(rgba(111,238,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(111,238,255,0.08)_1px,transparent_1px),linear-gradient(180deg,rgba(43,48,59,0.72)_0%,rgba(20,24,31,0.96)_100%)] bg-[size:28px_28px,28px_28px,100%_100%]"
            : boardStyle === "plain"
              ? "bg-[linear-gradient(180deg,rgba(43,48,59,0.72)_0%,rgba(20,24,31,0.96)_100%)]"
              : "bg-[radial-gradient(circle,rgba(111,238,255,0.14)_1px,transparent_1px),linear-gradient(180deg,rgba(43,48,59,0.72)_0%,rgba(20,24,31,0.96)_100%)] bg-[size:24px_24px,100%_100%]"
        }`}
        style={{
          cursor:
            cursorState.mode === CursorMode.Chat
              ? "none"
              : isPanning
                ? "grabbing"
                : activeTool === "hand"
                  ? "grab"
                  : activeTool === "text"
                    ? "text"
                    : activeTool === "select"
                      ? "default"
                      : "crosshair",
        }}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_30%)]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent)]" />
        <div className="pointer-events-none absolute -left-16 top-20 h-40 w-40 rounded-full bg-primary-green/8 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 bottom-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
        <canvas ref={canvasRef} className="relative z-[1]" />

        {reactions.map((reaction) => (
          <FlyingReaction
            key={reaction.timestamp.toString()}
            x={reaction.point.x}
            y={reaction.point.y}
            timestamp={reaction.timestamp}
            value={reaction.value}
          />
        ))}

        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}

        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector
            setReaction={(reaction) => {
              setReaction(reaction);
            }}
          />
        )}

        <LiveCursors />
        {children}
      </ContextMenuTrigger>

      <ContextMenuContent className="right-menu-content">
        {shortcuts.map((item) => (
          <ContextMenuItem
            key={item.key}
            className="right-menu-item"
            onClick={() => handleContextMenuClick(item.name)}
          >
            <p>{item.name}</p>
            <p className="text-xs text-primary-grey-300">{item.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;
