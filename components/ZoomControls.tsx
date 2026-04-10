"use client";

import { LocateFixed, Maximize2, Minus, Plus } from "lucide-react";

import { Button } from "./ui/button";

type ZoomControlsProps = {
  zoomPercent: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onFit: () => void;
  onCenter: () => void;
};

const ZoomControls = ({
  zoomPercent,
  onZoomIn,
  onZoomOut,
  onReset,
  onFit,
  onCenter,
}: ZoomControlsProps) => {
  return (
    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-2xl border border-primary-grey-100 bg-primary-black/85 p-2 shadow-2xl backdrop-blur">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl text-[rgb(var(--app-text))] hover:bg-primary-grey-200"
        onClick={onZoomOut}
        type="button"
        title="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <button
        type="button"
        className="min-w-[68px] rounded-xl border border-primary-grey-100 bg-primary-grey-200/45 px-3 py-2 text-xs font-semibold tracking-[0.18em] text-[rgb(var(--app-text))]"
        onClick={onReset}
        title="Reset zoom"
      >
        {zoomPercent}%
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl text-[rgb(var(--app-text))] hover:bg-primary-grey-200"
        onClick={onZoomIn}
        type="button"
        title="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl text-[rgb(var(--app-text))] hover:bg-primary-grey-200"
        onClick={onCenter}
        type="button"
        title="Center selection"
      >
        <LocateFixed className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 rounded-xl text-[rgb(var(--app-text))] hover:bg-primary-grey-200"
        onClick={onFit}
        type="button"
        title="Fit content"
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ZoomControls;
