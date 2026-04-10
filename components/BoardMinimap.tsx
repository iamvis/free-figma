"use client";

import { useMemo } from "react";
import { fabric } from "fabric";

import { CustomFabricObject } from "@/types/type";

const MINIMAP_WIDTH = 180;
const MINIMAP_HEIGHT = 128;

const BoardMinimap = ({
  canvas,
  canvasObjects,
  onJump,
}: {
  canvas: fabric.Canvas | null;
  canvasObjects: Array<[string, any]>;
  onJump: (point: { x: number; y: number }) => void;
}) => {
  const map = useMemo(() => {
    if (!canvas) return null;

    const objects = canvas.getObjects();
    if (!objects.length) {
      return {
        bounds: { left: 0, top: 0, width: 1000, height: 720 },
        items: [],
        viewport: { left: 0, top: 0, width: 1000, height: 720 },
      };
    }

    const bounds = objects.reduce(
      (acc, obj) => {
        const rect = obj.getBoundingRect(true, true);
        return {
          left: Math.min(acc.left, rect.left),
          top: Math.min(acc.top, rect.top),
          right: Math.max(acc.right, rect.left + rect.width),
          bottom: Math.max(acc.bottom, rect.top + rect.height),
        };
      },
      {
        left: Infinity,
        top: Infinity,
        right: -Infinity,
        bottom: -Infinity,
      }
    );

    const padding = 180;
    const scene = {
      left: bounds.left - padding,
      top: bounds.top - padding,
      width: bounds.right - bounds.left + padding * 2,
      height: bounds.bottom - bounds.top + padding * 2,
    };

    const viewport = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
    const zoom = canvas.getZoom() || 1;
    const view = {
      left: -viewport[4] / zoom,
      top: -viewport[5] / zoom,
      width: canvas.getWidth() / zoom,
      height: canvas.getHeight() / zoom,
    };

    return {
      bounds: scene,
      items: objects.map((obj) => {
        const rect = obj.getBoundingRect(true, true);
        const custom = obj as CustomFabricObject<fabric.Object>;
        return {
          id: custom.objectId || `${obj.type}-${rect.left}-${rect.top}`,
          left: rect.left,
          top: rect.top,
          width: Math.max(rect.width, custom.isConnector ? 8 : 16),
          height: Math.max(rect.height, custom.isConnector ? 3 : 16),
          isConnector: Boolean(custom.isConnector),
        };
      }),
      viewport: view,
    };
  }, [canvas]);

  if (!map) return null;

  const scale = Math.min(MINIMAP_WIDTH / map.bounds.width, MINIMAP_HEIGHT / map.bounds.height);
  const translate = (x: number, y: number) => ({
    x: (x - map.bounds.left) * scale,
    y: (y - map.bounds.top) * scale,
  });

  return (
    <div className="panel-shell minimap-shell absolute bottom-4 left-4 z-20 w-[200px] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="type-kicker">Navigator</span>
        <span className="type-mono">{canvasObjects.length} objects</span>
      </div>
      <button
        type="button"
        className="relative h-[128px] w-full overflow-hidden rounded-2xl border border-primary-grey-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]"
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const localX = event.clientX - rect.left;
          const localY = event.clientY - rect.top;
          onJump({
            x: map.bounds.left + localX / scale,
            y: map.bounds.top + localY / scale,
          });
        }}
      >
        {map.items.map((item) => {
          const position = translate(item.left, item.top);
          return (
            <div
              key={item.id}
              className={`absolute rounded-md ${item.isConnector ? "bg-cyan-300/70" : "bg-white/70"}`}
              style={{
                left: position.x,
                top: position.y,
                width: Math.max(item.width * scale, item.isConnector ? 10 : 6),
                height: Math.max(item.height * scale, item.isConnector ? 2 : 6),
                opacity: item.isConnector ? 0.7 : 0.92,
              }}
            />
          );
        })}
        <div
          className="absolute rounded-xl border border-primary-green bg-primary-green/10 shadow-[0_0_0_1px_rgba(86,255,166,0.2)] transition-all duration-200"
          style={{
            left: translate(map.viewport.left, map.viewport.top).x,
            top: translate(map.viewport.left, map.viewport.top).y,
            width: Math.max(map.viewport.width * scale, 22),
            height: Math.max(map.viewport.height * scale, 18),
          }}
        />
      </button>
    </div>
  );
};

export default BoardMinimap;
