function LoadingSpinner({ label = "Loading...", fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative h-10 w-10">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--devdoc-border)]" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[var(--devdoc-primary)]" />
      </div>
      {label ? (
        <p className="text-sm font-semibold text-[var(--devdoc-muted)]">{label}</p>
      ) : null}
    </div>
  );

  if (fullScreen) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6">
        {content}
      </main>
    );
  }

  return (
    <div className="flex min-h-64 items-center justify-center px-6">
      {content}
    </div>
  );
}

export default LoadingSpinner;
