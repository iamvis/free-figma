import CursorSVG from "@/public/assets/CursorSVG";

type Props = {
  color: string;
  x: number;
  y: number;
  message?: string;
  name?: string;
};

const Cursor = ({ color, x, y, message, name }: Props) => (
  <div
    className="pointer-events-none absolute left-0 top-0 transition-transform duration-75"
    style={{ transform: `translateX(${x}px) translateY(${y}px)` }}
  >
    <div className="drop-shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
      <CursorSVG color={color} />
    </div>

    <div
      className="absolute left-3 top-5 min-w-[110px] rounded-2xl border border-white/15 px-3 py-2 text-left shadow-[0_18px_42px_rgba(0,0,0,0.22)] backdrop-blur-xl"
      style={{ backgroundColor: `${color}E6` }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-950/80">{name || "Guest"}</p>
      {message ? (
        <p className="mt-1 whitespace-nowrap text-sm leading-relaxed text-slate-950">{message}</p>
      ) : (
        <p className="mt-1 whitespace-nowrap text-xs text-slate-950/70">Browsing board</p>
      )}
    </div>
  </div>
);

export default Cursor;
