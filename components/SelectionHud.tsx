"use client";

import { fabric } from "fabric";
import { MoveDiagonal2 } from "lucide-react";

const SelectionHud = ({ canvas }: { canvas: fabric.Canvas | null }) => {
  const activeObject = canvas?.getActiveObject();
  if (!canvas || !activeObject) return null;

  const rect = activeObject.getBoundingRect(true, true);
  const viewport = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
  const left = rect.left * viewport[0] + viewport[4];
  const top = rect.top * viewport[3] + viewport[5];
  const width = rect.width * viewport[0];
  const height = rect.height * viewport[3];

  return (
    <div
      className="pointer-events-none absolute z-[5] transition-all duration-150"
      style={{
        left,
        top,
        width,
        height,
      }}
    >
      <div className="absolute inset-0 rounded-[24px] border border-primary-green/80 shadow-[0_0_0_1px_rgba(86,255,166,0.18),0_14px_40px_rgba(86,255,166,0.1)]" />
      <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full border border-slate-950 bg-primary-green shadow-lg" />
      <div className="absolute -right-2 -top-2 h-4 w-4 rounded-full border border-slate-950 bg-primary-green shadow-lg" />
      <div className="absolute -bottom-2 -left-2 h-4 w-4 rounded-full border border-slate-950 bg-primary-green shadow-lg" />
      <div className="absolute -bottom-2 -right-2 h-4 w-4 rounded-full border border-slate-950 bg-primary-green shadow-lg" />
      <div className="absolute -top-12 left-0 flex items-center gap-2 rounded-full border border-primary-grey-100 bg-primary-black/90 px-3 py-1.5 shadow-2xl backdrop-blur">
        <MoveDiagonal2 className="h-3.5 w-3.5 text-primary-green" />
        <span className="type-mono text-[10px] text-[rgb(var(--app-text))]">
          {Math.round(rect.width)} x {Math.round(rect.height)}
        </span>
      </div>
    </div>
  );
};

export default SelectionHud;
