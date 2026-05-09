function ProfileSelector({ profiles, selectedCode, onSelect, isLoading, error, onRetry }) {
  if (isLoading) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        Loading profiles...
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        <p>{error}</p>
        <button
          className="mt-4 rounded-md bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 transition hover:bg-red-100"
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
            className={`rounded-lg border bg-white p-5 text-left shadow-sm transition hover:border-teal-500 hover:bg-teal-50 ${
              isSelected ? "border-teal-600 ring-2 ring-teal-100" : "border-slate-200"
            }`}
            type="button"
            onClick={() => onSelect(profile)}
          >
            <h3 className="text-base font-semibold text-slate-950">{profile.name}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {profile.audience || profile.tone}
            </p>
          </button>
        );
      })}
    </section>
  );
}

export default ProfileSelector;
