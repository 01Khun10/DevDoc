import { Link } from "react-router-dom";

// Traceability chain node colors — same palette as the registries and graphs.
const CHAIN_NODES = [
  { key: "BO", label: "BO", name: "Objective", color: "#0d9488" },
  { key: "UC", label: "UC", name: "Use Case", color: "#8b5cf6" },
  { key: "FR", label: "FR", name: "Requirement", color: "#06b6d4" },
  { key: "DE", label: "DE", name: "Design", color: "#10b981" },
  { key: "TC", label: "TC", name: "Test", color: "#ec4899" }
];

const FEATURES = [
  {
    color: "#0d9488",
    label: "BO",
    title: "Business Objectives",
    description: "Anchor your entire documentation graph to measurable business goals."
  },
  {
    color: "#8b5cf6",
    label: "UC",
    title: "Use Cases",
    description: "Capture user goals before you write a single requirement."
  },
  {
    color: "#3b82f6",
    label: "ED",
    title: "Structured Editor",
    description: "TipTap rich-text with inline requirement capture and 3-second autosave."
  },
  {
    color: "#06b6d4",
    label: "RQ",
    title: "Requirements",
    description: "FR and NFR registry with immutable codes, acceptance criteria, and priority."
  },
  {
    color: "#10b981",
    label: "DE",
    title: "Design Elements",
    description: "Architecture components linked to the requirements they implement."
  },
  {
    color: "#ec4899",
    label: "TC",
    title: "Test Cases",
    description: "Register tests and verify_by links close the traceability chain."
  },
  {
    color: "#f59e0b",
    label: "DL",
    title: "Doc-Linter",
    description: "Config-driven rules detect missing sections, orphans, vague terms, and drift."
  },
  {
    color: "#6366f1",
    label: "TR",
    title: "Traceability",
    description: "Click-to-toggle matrix grid. Live ReactFlow graph. TF-IDF suggested links."
  }
];

const STEPS = [
  { num: "01", title: "Set a goal", desc: "Create a business objective" },
  { num: "02", title: "Define scenarios", desc: "Add use cases under each goal" },
  { num: "03", title: "Write requirements", desc: "Register FRs and NFRs from use cases" },
  { num: "04", title: "Structure documentation", desc: "Fill sections in a template-guided editor" },
  { num: "05", title: "Link and verify", desc: "Connect requirements to design and test artifacts" },
  { num: "06", title: "Validate", desc: "Run Doc-Linter, review readiness score, share with supervisor" }
];

const PROOF_TILES = [
  { title: "34 automated checks", desc: "Validation rules across structure, traceability, and content quality." },
  { title: "Full traceability chain", desc: "BO → UC → FR → DE → TC, every link visible and verifiable." },
  { title: "Share-ready reports", desc: "Tokenized supervisor links to your validation report and graph." }
];

// Animated hero SVG: the five-node chain draws its links with a marching-dash
// animation (see .devdoc-chain-link in index.css).
function ChainDiagram() {
  const nodeSpacing = 130;
  const startX = 40;
  const y = 50;

  return (
    <svg
      viewBox="0 0 600 100"
      className="mx-auto mt-12 w-full max-w-xl"
      role="img"
      aria-label="Traceability chain: business objective to use case to requirement to design to test"
    >
      {CHAIN_NODES.slice(0, -1).map((node, index) => {
        const x1 = startX + index * nodeSpacing + 28;
        const x2 = startX + (index + 1) * nodeSpacing - 28;
        return (
          <line
            key={`link-${node.key}`}
            className="devdoc-chain-link"
            x1={x1}
            y1={y}
            x2={x2}
            y2={y}
            stroke={CHAIN_NODES[index + 1].color}
            strokeWidth="2"
          />
        );
      })}
      {CHAIN_NODES.map((node, index) => {
        const cx = startX + index * nodeSpacing;
        return (
          <g key={node.key}>
            <circle cx={cx} cy={y} r="26" fill={`${node.color}22`} stroke={node.color} strokeWidth="2" />
            <text
              x={cx}
              y={y + 5}
              textAnchor="middle"
              fontSize="14"
              fontWeight="800"
              fill={node.color}
              fontFamily="inherit"
            >
              {node.label}
            </text>
            <text
              x={cx}
              y={y + 44}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="var(--devdoc-muted)"
              fontFamily="inherit"
            >
              {node.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

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
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="devdoc-button-ghost hidden px-4 py-2 text-sm sm:inline-flex">
              Sign in
            </Link>
            <Link to="/register" className="devdoc-gradient-button px-4 py-2 text-sm">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:pt-28">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full"
            style={{ background: "radial-gradient(ellipse at top center, var(--devdoc-primary-soft) 0%, transparent 60%)" }}
          />
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
            style={{
              backgroundImage: "linear-gradient(var(--devdoc-border) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-border) 1px, transparent 1px)",
              backgroundSize: "48px 48px"
            }}
          />

          <div className="mx-auto max-w-4xl text-center devdoc-fade-in">
            <h1 className="font-headline text-balance text-5xl font-extrabold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl">
              Documentation
              <br />
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(135deg, var(--devdoc-primary), #8b5cf6, #06b6d4)" }}
              >
                that proves itself.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-7 sm:text-lg" style={{ color: "var(--devdoc-muted)" }}>
              DevDoc links every use case, requirement, design decision, and test —
              then validates the chain automatically.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link to="/register" className="devdoc-gradient-button px-7 py-3 text-base font-bold">
                Get started free
              </Link>
              <Link to="/login" className="devdoc-button-secondary px-7 py-3 text-base font-bold">
                View demo project →
              </Link>
            </div>

            <ChainDiagram />
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
                Eight integrated tools that keep your goals, documents, requirements, and tests in one verified graph.
              </p>
            </div>

            <div className="mx-auto mt-14 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, index) => (
                <article
                  key={feature.title}
                  className="devdoc-card-border devdoc-hover-lift group p-6"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black text-white"
                    style={{ backgroundColor: feature.color }}
                  >
                    {feature.label}
                  </span>
                  <h3 className="font-headline mt-4 text-base font-extrabold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="px-6 py-20" style={{ backgroundColor: "var(--devdoc-surface)" }}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>Workflow</p>
              <h2 className="font-headline mt-3 text-3xl font-extrabold tracking-tight">
                From goal to validated docs in six steps
              </h2>
            </div>

            <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              {STEPS.map((step, index) => (
                <li
                  key={step.num}
                  className="devdoc-card-border devdoc-fade-in relative p-5"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <span
                    className="font-headline text-3xl font-black"
                    style={{ color: "var(--devdoc-primary-soft)", WebkitTextStroke: "1.5px var(--devdoc-primary)" }}
                  >
                    {step.num}
                  </span>
                  <h3 className="font-headline mt-3 text-sm font-extrabold">{step.title}</h3>
                  <p className="mt-2 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>{step.desc}</p>
                  {index < STEPS.length - 1 ? (
                    <span
                      className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-lg font-black lg:block"
                      style={{ color: "var(--devdoc-primary)" }}
                      aria-hidden="true"
                    >
                      →
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Proof tiles */}
        <section className="px-6 py-20">
          <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-3">
            {PROOF_TILES.map((tile) => (
              <div key={tile.title} className="devdoc-card-border p-6 text-center">
                <p className="font-headline text-xl font-extrabold" style={{ color: "var(--devdoc-primary)" }}>
                  {tile.title}
                </p>
                <p className="mt-2 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>{tile.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 pb-24">
          <div
            className="mx-auto max-w-3xl rounded-2xl border p-12 text-center"
            style={{
              borderColor: "var(--devdoc-border)",
              backgroundColor: "var(--devdoc-surface)",
              backgroundImage: "radial-gradient(ellipse at top, var(--devdoc-primary-softer), transparent 60%)"
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
                Get started free
              </Link>
              <Link to="/login" className="devdoc-button-secondary px-8 py-3 text-base font-bold">
                View demo project
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
            Built for software engineering students and teams
          </p>
          <div className="flex items-center gap-4">
            <Link to="/register" className="text-xs font-medium transition hover:opacity-70" style={{ color: "var(--devdoc-muted)" }}>Register</Link>
            <Link to="/login" className="text-xs font-medium transition hover:opacity-70" style={{ color: "var(--devdoc-muted)" }}>Login</Link>
            <a href="#" className="text-xs font-medium transition hover:opacity-70" style={{ color: "var(--devdoc-muted)" }}>GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
