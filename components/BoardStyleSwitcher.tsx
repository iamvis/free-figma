"use client";

type BoardStyle = "dots" | "grid" | "plain";

type BoardStyleSwitcherProps = {
  boardStyle: BoardStyle;
  onChange: (style: BoardStyle) => void;
};

const STYLES: { value: BoardStyle; label: string }[] = [
  { value: "dots", label: "Dots" },
  { value: "grid", label: "Grid" },
  { value: "plain", label: "Plain" },
];

const BoardStyleSwitcher = ({ boardStyle, onChange }: BoardStyleSwitcherProps) => {
  return (
    <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-2xl border border-primary-grey-100 bg-primary-black/85 p-2 shadow-2xl backdrop-blur">
      <span className="px-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-primary-grey-300">
        Board
      </span>
      {STYLES.map((style) => (
        <button
          key={style.value}
          type="button"
          onClick={() => onChange(style.value)}
          className={`rounded-xl px-3 py-2 text-xs font-semibold tracking-[0.16em] transition-colors ${
            boardStyle === style.value
              ? "bg-primary-green text-slate-950"
              : "bg-primary-grey-200/45 text-[rgb(var(--app-text))] hover:bg-primary-grey-200"
          }`}
        >
          {style.label}
        </button>
      ))}
    </div>
  );
};

export type { BoardStyle };
export default BoardStyleSwitcher;
