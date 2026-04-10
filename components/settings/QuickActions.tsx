"use client";

import { CopyPlus, Equal, Layers3, Lock, LockOpen, SendToBack, SquareMousePointer } from "lucide-react";

import { Button } from "../ui/button";

const QuickActions = ({
  selectedCount,
  isLocked,
  onDuplicate,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onClearSelection,
  onDistributeHorizontally,
  onDistributeVertically,
}: {
  selectedCount: number;
  isLocked: boolean;
  onDuplicate: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onToggleLock: () => void;
  onClearSelection: () => void;
  onDistributeHorizontally: () => void;
  onDistributeVertically: () => void;
}) => {
  const disabled = selectedCount === 0;
  const distributionDisabled = selectedCount < 3;

  return (
    <div className="panel-section flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="panel-heading">Quick Actions</h3>
        <span className="rounded-full bg-primary-grey-200/45 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-primary-grey-300">
          {selectedCount} selected
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" disabled={disabled} className="justify-start rounded-xl border-primary-grey-100 bg-transparent text-[rgb(var(--app-text))]" onClick={onDuplicate}>
          <CopyPlus className="mr-2 h-4 w-4" /> Duplicate
        </Button>
        <Button type="button" variant="outline" disabled={disabled} className="justify-start rounded-xl border-primary-grey-100 bg-transparent text-[rgb(var(--app-text))]" onClick={onBringToFront}>
          <Layers3 className="mr-2 h-4 w-4" /> Front
        </Button>
        <Button type="button" variant="outline" disabled={disabled} className="justify-start rounded-xl border-primary-grey-100 bg-transparent text-[rgb(var(--app-text))]" onClick={onSendToBack}>
          <SendToBack className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button type="button" variant="outline" disabled={disabled} className="justify-start rounded-xl border-primary-grey-100 bg-transparent text-[rgb(var(--app-text))]" onClick={onToggleLock}>
          {isLocked ? <LockOpen className="mr-2 h-4 w-4" /> : <Lock className="mr-2 h-4 w-4" />}
          {isLocked ? "Unlock" : "Lock"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" disabled={distributionDisabled} className="justify-start rounded-xl border-primary-grey-100 bg-transparent text-[rgb(var(--app-text))]" onClick={onDistributeHorizontally}>
          <Equal className="mr-2 h-4 w-4 rotate-90" /> Space X
        </Button>
        <Button type="button" variant="outline" disabled={distributionDisabled} className="justify-start rounded-xl border-primary-grey-100 bg-transparent text-[rgb(var(--app-text))]" onClick={onDistributeVertically}>
          <Equal className="mr-2 h-4 w-4" /> Space Y
        </Button>
      </div>

      <Button type="button" variant="ghost" disabled={disabled} className="justify-start rounded-xl text-primary-grey-300 hover:bg-primary-grey-200 hover:text-[rgb(var(--app-text))]" onClick={onClearSelection}>
        <SquareMousePointer className="mr-2 h-4 w-4" /> Clear selection
      </Button>
    </div>
  );
};

export default QuickActions;
