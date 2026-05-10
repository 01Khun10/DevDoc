import { Link } from "react-router-dom";

const features = [
  {
    label: "TPL",
    title: "Templates",
    description: "Start with professional profiles and structured software documentation templates.",
  },
  {
    label: "DOC",
    title: "Structured Editor",
    description: "Write focused sections with guidance instead of loose, disconnected text.",
  },
  {
    label: "REQ",
    title: "Requirements",
    description: "Manage functional and non-functional requirements in one registry.",
  },
  {
    label: "TRC",
    title: "Traceability",
    description: "Link use cases, requirements, and document sections so coverage stays visible.",
  },
  {
    label: "VAL",
    title: "Doc-Linter",
    description: "Run checks for missing documents, empty sections, and unlinked artefacts.",
  },
];

function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--devdoc-bg)] text-[var(--devdoc-text)]">
      <header className="sticky top-0 z-50 border-b border-[var(--devdoc-border)] bg-[var(--devdoc-topbar)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link className="flex items-center gap-2" to="/">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--devdoc-primary-strong)] to-[var(--devdoc-primary)] text-sm font-black text-white shadow-lg shadow-indigo-500/20">
              D
            </span>
            <span className="font-headline text-xl font-extrabold tracking-tight text-[var(--devdoc-primary)]">
              DevDoc
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-bold text-[var(--devdoc-muted)] transition hover:text-[var(--devdoc-primary)]">Features</a>
            <Link to="/docs" className="text-sm font-bold text-[var(--devdoc-muted)] transition hover:text-[var(--devdoc-primary)]">Docs</Link>
            <Link to="/about" className="text-sm font-bold text-[var(--devdoc-muted)] transition hover:text-[var(--devdoc-primary)]">About</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login" className="devdoc-button-secondary hidden sm:inline-flex">
              Sign in
            </Link>
            <Link to="/register" className="devdoc-gradient-button">
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:pb-32 sm:pt-32">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(circle_at_top,var(--devdoc-primary-soft),transparent_35rem)]" />
          <div className="mx-auto max-w-4xl text-center">
            <p className="devdoc-label text-[var(--devdoc-primary)]">Documentation knowledge workspace</p>
            <h1 className="font-headline mt-5 text-balance text-5xl font-extrabold tracking-tight sm:text-7xl">
              Documentation that stays connected.
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-8 text-[var(--devdoc-muted)] sm:text-xl">
              DevDoc helps teams create structured software documents, link requirements to sections, and run Doc-Linter checks before documentation drifts.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/register" className="devdoc-gradient-button px-6 py-3">
                Get started
              </Link>
              <Link to="/docs" className="devdoc-button-secondary px-6 py-3">
                View docs
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="devdoc-label text-[var(--devdoc-primary)]">Everything you need</p>
              <h2 className="font-headline mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                A connected documentation graph
              </h2>
            </div>
            <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <article key={feature.title} className="devdoc-card-border hover-lift p-6">
                  <span className="inline-flex rounded-xl bg-[var(--devdoc-primary-soft)] px-3 py-2 text-xs font-black text-[var(--devdoc-primary)]">
                    {feature.label}
                  </span>
                  <h3 className="font-headline mt-5 text-lg font-extrabold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--devdoc-muted)]">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--devdoc-border)] px-6 py-10 text-center">
        <p className="text-sm text-[var(--devdoc-muted)]">
          DevDoc documentation consistency assistant.
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
