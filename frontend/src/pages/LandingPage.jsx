import { Link } from "react-router-dom";

const features = [
  {
    color: "#6366f1",
    label: "TPL",
    title: "Templates",
    description: "Professional profiles and structured templates for SRS, SDS, STP, and scope documents.",
  },
  {
    color: "#8b5cf6",
    label: "DOC",
    title: "Structured Editor",
    description: "Section-by-section writing workspace with guidance, validation hints, and linked artefacts.",
  },
  {
    color: "#06b6d4",
    label: "REQ",
    title: "Requirements",
    description: "FR and NFR registry with priority, status, and filtering. Immutable IDs for full lifecycle tracking.",
  },
  {
    color: "#10b981",
    label: "TRC",
    title: "Traceability",
    description: "Link use cases → requirements → document sections. Spot coverage gaps before they become issues.",
  },
  {
    color: "#f59e0b",
    label: "VAL",
    title: "Doc-Linter",
    description: "Automated checks for missing sections, unlinked requirements, and incomplete documentation.",
  },
  {
    color: "#ec4899",
    label: "DGM",
    title: "Diagrams",
    description: "Generate PlantUML traceability trees and architecture diagrams directly from your project graph.",
  },
];

const steps = [
  { num: "01", title: "Create a project", desc: "Set up your workspace with a name, description, and documentation profile." },
  { num: "02", title: "Apply a template", desc: "Choose a document type (SRS, SDS, STP) and generate a structured outline." },
  { num: "03", title: "Write sections", desc: "Fill each section with context-aware writing guidance and requirement hints." },
  { num: "04", title: "Link traceability", desc: "Connect use cases to requirements and requirements to document sections." },
  { num: "05", title: "Run Doc-Linter", desc: "Validate coverage, detect orphans, and calculate your documentation readiness score." },
];

function LandingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>

      {/* Nav */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-xl"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-topbar)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link className="flex items-center gap-2.5" to="/">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "linear-gradient(135deg, var(--devdoc-primary), #8b5cf6)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
            <span className="font-headline text-lg font-extrabold tracking-tight" style={{ color: "var(--devdoc-text)" }}>
              DevDoc
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-semibold transition hover:opacity-70" style={{ color: "var(--devdoc-muted)" }}>Features</a>
            <a href="#how-it-works" className="text-sm font-semibold transition hover:opacity-70" style={{ color: "var(--devdoc-muted)" }}>How it works</a>
            <Link to="/docs" className="text-sm font-semibold transition hover:opacity-70" style={{ color: "var(--devdoc-muted)" }}>Docs</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="devdoc-button-ghost hidden px-4 py-2 text-sm sm:inline-flex"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="devdoc-gradient-button px-4 py-2 text-sm"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-24 pt-24 sm:pb-32 sm:pt-32">
          {/* Gradient background */}
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
            style={{
              background: "radial-gradient(ellipse at top center, var(--devdoc-primary-soft) 0%, transparent 60%)"
            }}
          />
          {/* Grid pattern overlay */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(var(--devdoc-border) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-border) 1px, transparent 1px)",
              backgroundSize: "48px 48px"
            }}
          />

          <div className="mx-auto max-w-4xl text-center devdoc-fade-in">
            {/* Badge */}
            <div
              className="mx-auto mb-8 inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs font-bold"
              style={{
                border: "1px solid var(--devdoc-border)",
                backgroundColor: "var(--devdoc-surface)",
                color: "var(--devdoc-primary)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              Documentation knowledge workspace — v2.0 stable
            </div>

            <h1 className="font-headline text-balance text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Documentation
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, var(--devdoc-primary), #8b5cf6, #06b6d4)" }}
              >
                that stays connected.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 sm:text-lg" style={{ color: "var(--devdoc-muted)" }}>
              DevDoc helps teams create structured software documents, link requirements to sections, run automated linting checks, and maintain full traceability across the documentation lifecycle.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className="devdoc-gradient-button px-7 py-3 text-base font-bold">
                Start for free
              </Link>
              <Link to="/docs" className="devdoc-button-secondary px-7 py-3 text-base font-bold">
                View documentation →
              </Link>
            </div>

            {/* Social proof */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {["SRS", "SDS", "STP", "SCOPE"].map((doc) => (
                <span
                  key={doc}
                  className="text-[11px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--devdoc-subtle)" }}
                >
                  {doc}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-2xl text-center">
              <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>Full documentation lifecycle</p>
              <h2 className="font-headline mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Everything connected. Nothing lost.
              </h2>
              <p className="mt-4 text-base leading-7" style={{ color: "var(--devdoc-muted)" }}>
                Six integrated tools that work together so your docs, requirements, and diagrams always stay in sync.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className="devdoc-card-border devdoc-hover-lift group p-6"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white"
                      style={{ backgroundColor: feature.color }}
                    >
                      {feature.label}
                    </span>
                    <div>
                      <h3 className="font-headline text-base font-extrabold">{feature.title}</h3>
                      <p className="mt-2 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section
          id="how-it-works"
          className="px-6 py-20"
          style={{ backgroundColor: "var(--devdoc-surface)" }}
        >
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>Workflow</p>
              <h2 className="font-headline mt-3 text-3xl font-extrabold tracking-tight">
                From idea to validated docs
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className="devdoc-card-border devdoc-fade-in p-5"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <span
                    className="font-headline text-3xl font-black"
                    style={{ color: "var(--devdoc-primary-soft)", WebkitTextStroke: "1.5px var(--devdoc-primary)" }}
                  >
                    {step.num}
                  </span>
                  <h3 className="font-headline mt-3 text-sm font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24">
          <div
            className="mx-auto max-w-3xl rounded-2xl border p-12 text-center"
            style={{
              borderColor: "var(--devdoc-border)",
              backgroundColor: "var(--devdoc-surface)",
              backgroundImage: "radial-gradient(ellipse at top, var(--devdoc-primary-softer), transparent 60%)",
            }}
          >
            <h2 className="font-headline text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to document properly?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-7" style={{ color: "var(--devdoc-muted)" }}>
              Create your DevDoc workspace and ship documentation that's traceable, linted, and always complete.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className="devdoc-gradient-button px-8 py-3 text-base font-bold">
                Create free workspace
              </Link>
              <Link to="/login" className="devdoc-button-secondary px-8 py-3 text-base font-bold">
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer
        className="border-t px-6 py-6"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md"
              style={{ background: "var(--devdoc-primary)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <span className="text-sm font-bold" style={{ color: "var(--devdoc-text)" }}>DevDoc</span>
          </div>
          <p className="text-xs" style={{ color: "var(--devdoc-subtle)" }}>
            Documentation consistency assistant · Built for FYP teams
          </p>
          <div className="flex items-center gap-4">
            <Link to="/docs" className="text-xs font-medium transition hover:opacity-70" style={{ color: "var(--devdoc-muted)" }}>Docs</Link>
            <Link to="/about" className="text-xs font-medium transition hover:opacity-70" style={{ color: "var(--devdoc-muted)" }}>About</Link>
            <Link to="/help" className="text-xs font-medium transition hover:opacity-70" style={{ color: "var(--devdoc-muted)" }}>Help</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
