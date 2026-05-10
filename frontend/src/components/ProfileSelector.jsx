function ProfileSelector({ profiles, selectedCode, onSelect, isLoading, error, onRetry }) {
  if (isLoading) {
    return (
      <section
        className="devdoc-card-border p-6 text-sm"
        style={{ border: "1px solid var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-muted)" }}
      >
        Loading profiles...
      </section>
    );
  }

  if (error) {
    return (
      <section
        className="rounded-2xl p-6 text-sm font-medium"
        style={{ backgroundColor: "rgba(207,34,46,0.08)", border: "1px solid rgba(207,34,46,0.35)", color: "var(--devdoc-error)" }}
      >
        <p>{error}</p>
        <button
          className="devdoc-button-secondary mt-4"
          style={{ backgroundColor: "var(--devdoc-surface)", border: "1px solid var(--devdoc-border)", color: "var(--devdoc-text)" }}
          type="button"
          onClick={onRetry}
        >
          Retry
        </button>
      </section>
    );
  }

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {profiles.map((profile) => {
        const isSelected = selectedCode === profile.code;
        return (
          <button
            key={profile.id}
            className="rounded-2xl p-5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
            style={{
              border: `1px solid ${isSelected ? "var(--devdoc-primary)" : "var(--devdoc-border)"}`,
              backgroundColor: isSelected ? "var(--devdoc-primary-soft)" : "var(--devdoc-surface)",
              outline: isSelected ? `2px solid var(--devdoc-primary-soft)` : "none",
            }}
            type="button"
            onClick={() => onSelect(profile)}
          >
            <h3 className="font-headline text-base font-extrabold" style={{ color: "var(--devdoc-text)" }}>{profile.name}</h3>
            <p className="mt-3 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>{profile.audience || profile.tone}</p>
          </button>
        );
      })}
    </section>
  );
}

export default ProfileSelector;
