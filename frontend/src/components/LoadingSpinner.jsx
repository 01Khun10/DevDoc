function LoadingSpinner({ label = "Loading...", fullScreen = false }) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="relative h-9 w-9">
        <div
          className="absolute inset-0 rounded-full border-[3px]"
          style={{ borderColor: "var(--devdoc-border)" }}
        />
        <div
          className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent"
          style={{ borderTopColor: "var(--devdoc-primary)" }}
        />
      </div>
      {label ? (
        <p className="text-sm font-medium" style={{ color: "var(--devdoc-muted)" }}>
          {label}
        </p>
      ) : null}
    </div>
  );

  if (fullScreen) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-6"
        style={{ backgroundColor: "var(--devdoc-bg)" }}
      >
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
