const Loader = () => (
  <div className="flex h-screen w-screen items-center justify-center px-6">
    <div className="panel-shell flex w-full max-w-sm flex-col items-center gap-5 px-8 py-10 text-center">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-primary-grey-100 bg-primary-grey-200/60">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-primary-grey-300/40 border-t-primary-green" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold tracking-[0.18em] text-[rgb(var(--app-text))]">Preparing workspace</p>
        <p className="text-xs uppercase tracking-[0.28em] text-primary-grey-300">
          Syncing your collaborative canvas
        </p>
      </div>
    </div>
  </div>
);

export default Loader;
