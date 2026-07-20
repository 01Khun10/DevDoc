import { Link } from "react-router-dom";
import { Icon } from "../components/ui";
import { useEffect, useRef, useState } from "react";




function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 600ms ease, transform 600ms cubic-bezier(0.2,0,0,1)",
        transitionDelay: `${delay}ms`,
      }}>
      {children}
    </div>
  );
}

const CHAIN = [
  { code: "BO", label: "Business objective", color: "var(--devdoc-artifact-bo)", rgb: "13,148,136", link: "initiates" },
  { code: "UC", label: "Use case", color: "var(--devdoc-artifact-uc)", rgb: "127,119,221", link: "covers" },
  { code: "FR", label: "Functional req.", color: "var(--devdoc-artifact-fr)", rgb: "59,130,246", link: "implemented_by" },
  { code: "DE", label: "Design element", color: "var(--devdoc-artifact-de)", rgb: "16,185,129", link: "verified_by" },
  { code: "TC", label: "Test case", color: "var(--devdoc-artifact-tc)", rgb: "236,72,153", link: null },
];

function DrawingChain() {
  const ref = useRef(null);
  const [go, setGo] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const N = CHAIN.length, W = 900, H = 150, pad = 70;
  const gap = (W - pad * 2) / (N - 1), y = 70, nodeW = 58, nodeH = 40;

  return (
    <div ref={ref} className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full min-w-[640px] max-w-[900px]">
        {CHAIN.slice(0, -1).map((node, i) => {
          const x1 = pad + i * gap + nodeW / 2, x2 = pad + (i + 1) * gap - nodeW / 2;
          return (
            <g key={`c${i}`}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke="var(--devdoc-border-strong)" strokeWidth="1"
                strokeDasharray={x2 - x1} strokeDashoffset={go ? 0 : x2 - x1}
                style={{ transition: `stroke-dashoffset 500ms ease ${300 + i * 350}ms` }} />
              <line x1={x1} y1={y - 4} x2={x1} y2={y + 4} stroke="var(--devdoc-border-strong)" strokeWidth="1"
                style={{ opacity: go ? 1 : 0, transition: `opacity 200ms ${300 + i * 350}ms` }} />
              <line x1={x2} y1={y - 4} x2={x2} y2={y + 4} stroke="var(--devdoc-border-strong)" strokeWidth="1"
                style={{ opacity: go ? 1 : 0, transition: `opacity 200ms ${500 + i * 350}ms` }} />
              <text x={(x1 + x2) / 2} y={y - 10} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="10" fill="var(--devdoc-highlight)"
                style={{ opacity: go ? 1 : 0, transition: `opacity 300ms ${600 + i * 350}ms` }}>{node.link}</text>
            </g>
          );
        })}
        {CHAIN.map((node, i) => {
          const cx = pad + i * gap;
          return (
            <g key={node.code} style={{
              opacity: go ? 1 : 0,
              transform: go ? "scale(1)" : "scale(0.6)",
              transformOrigin: `${cx}px ${y}px`,
              transition: `opacity 300ms ${i * 350}ms, transform 300ms cubic-bezier(0.2,0,0,1) ${i * 350}ms`,
            }}>
              <rect x={cx - nodeW / 2} y={y - nodeH / 2} width={nodeW} height={nodeH} rx="6" fill={`rgba(${node.rgb},0.12)`} stroke={node.color} strokeWidth="1" />
              <text x={cx} y={y + 4} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize="13" fontWeight="600" fill={node.color}>{node.code}</text>
              <text x={cx} y={y + nodeH / 2 + 16} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="10" fill="var(--devdoc-muted)">{node.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

const HIGHLIGHTS = [
  {
    title: "IDE-like validation", body: "Real-time linting of documentation structure. Catch orphaned requirements before they ship.", color: "var(--devdoc-primary)",
    icon: <><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></>
  },
  {
    title: "Automated traceability", body: "Bidirectional mapping ensures every design element is justified by a functional requirement.", color: "var(--devdoc-highlight)",
    icon: <><rect x="3" y="3" width="6" height="6" rx="1" /><rect x="15" y="15" width="6" height="6" rx="1" /><path d="M9 6h6a3 3 0 0 1 3 3v6" /></>
  },
  {
    title: "Structured authoring", body: "Write guided document sections while keeping requirements and evidence close to the work.", color: "var(--devdoc-warning)",
    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>
  },
];

const STACK = ["React", "Node.js", "PostgreSQL", "Prisma", "PlantUML"];

function CornerTicks() {
  const t = "absolute bg-[var(--devdoc-border-strong)]";
  return (<>
    <span className={`${t} top-0 left-0 h-px w-3`} /><span className={`${t} top-0 left-0 h-3 w-px`} />
    <span className={`${t} bottom-0 right-0 h-px w-3`} /><span className={`${t} bottom-0 right-0 h-3 w-px`} />
  </>);
}

export default function About() {
  const heroRef = useRef(null);
  const [par, setPar] = useState({ x: 0, y: 0 });

  function onMove(e) {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
    const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
    setPar({ x: dx * 12, y: dy * 12 });
  }

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]"
      style={{
        backgroundColor: "var(--devdoc-bg)",
        backgroundImage: "linear-gradient(var(--devdoc-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--devdoc-grid-line) 1px, transparent 1px)",
        backgroundSize: "24px 24px", backgroundAttachment: "fixed",
      }}>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-16 px-4 py-12 md:px-8">

        <section ref={heroRef} onMouseMove={onMove} onMouseLeave={() => setPar({ x: 0, y: 0 })}
          className="relative overflow-hidden rounded-xl border py-16"
          style={{ borderColor: "var(--devdoc-border)", backgroundImage: "radial-gradient(ellipse 55% 60% at 50% 45%, rgba(59,130,246,0.08), transparent 70%)" }}>
          <div className="relative mx-auto flex max-w-3xl flex-col items-center px-4 text-center"
            style={{ transform: `translate(${par.x}px, ${par.y}px)`, transition: "transform 200ms ease-out" }}>
            <p className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-highlight)]">About DevDoc</p>
            <h1 className="font-headline text-4xl font-bold tracking-tight md:text-5xl">Documentation, engineered.</h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--devdoc-muted)]">
              DevDoc treats documentation as structured, linked, and validatable data — bridging abstract
              requirements and concrete test cases so every piece of knowledge stays maintained, traceable,
              and part of the engineering lifecycle.
            </p>
          </div>
          <div className="absolute bottom-4 right-4 hidden border px-2 py-1 font-mono text-[10px] text-[var(--devdoc-muted)] sm:block"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>devdoc · rev 3.0</div>
        </section>

        <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <Reveal>
            <div className="relative h-full border p-8" style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}>
              <CornerTicks />
              <p className="mb-4 inline-block border-b pb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-error)]" style={{ borderColor: "var(--devdoc-border)" }}>the_problem</p>
              <h2 className="mb-4 font-headline text-2xl font-semibold">Documentation drift</h2>
              <p className="mb-4 text-sm leading-relaxed text-[var(--devdoc-muted)]">
                Traditional technical documentation quickly goes stale. Requirements are orphaned, design
                decisions lose context, and test cases fail to map back to business objectives — a chaotic
                knowledge base with zero traceability.
              </p>
              <ul className="mt-6 space-y-2 font-mono text-[13px] text-[var(--devdoc-error)]">
                {["Orphaned requirements", "Broken traceability links", "Unverifiable design docs"].map((t) => (
                  <li key={t} className="flex items-center gap-3"><Icon size={16}><path d="M18 6 6 18M6 6l12 12" /></Icon>{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="relative h-full border p-8" style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)", boxShadow: "4px 4px 0 rgba(59,130,246,0.18)" }}>
              <CornerTicks />
              <p className="mb-4 inline-block border-b pb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-highlight)]" style={{ borderColor: "var(--devdoc-border)" }}>the_devdoc_approach</p>
              <h2 className="mb-4 font-headline text-2xl font-semibold">The linked chain</h2>
              <p className="mb-4 text-sm leading-relaxed text-[var(--devdoc-muted)]">
                DevDoc enforces a blueprint-like structure. Every artifact is typed, validated by the
                Doc-Linter, and connected through a traceability graph. When a requirement changes, the
                impact is visible across the entire chain.
              </p>
              <ul className="mt-6 space-y-2 font-mono text-[13px] text-[var(--devdoc-highlight)]">
                {["Semantic artifact types", "Continuous Doc-Linting", "Interactive traceability maps"].map((t) => (
                  <li key={t} className="flex items-center gap-3"><Icon size={16}><path d="M20 6 9 17l-5-5" /></Icon>{t}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        </section>

        <section className="flex flex-col gap-8 border-y py-14" style={{ borderColor: "var(--devdoc-border)" }}>
          <div className="text-center"><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-muted)]">The traceability chain</p></div>
          <DrawingChain />
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {HIGHLIGHTS.map((f, i) => (
            <Reveal key={f.title} delay={i * 100}>
              <div className="group h-full border p-6 transition-transform duration-200 hover:-translate-y-1"
                style={{ backgroundColor: "var(--devdoc-surface-inset)", borderColor: "var(--devdoc-border)" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 10px 24px rgba(6,12,24,0.35)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded border" style={{ borderColor: f.color, color: f.color }}><Icon>{f.icon}</Icon></div>
                <h3 className="mb-2 font-headline text-lg font-medium">{f.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--devdoc-muted)]">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </section>

        <Reveal>
          <section className="flex flex-col items-end justify-between gap-8 border-t pt-8 md:flex-row" style={{ borderColor: "var(--devdoc-border)" }}>
            <div className="w-full flex-1">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">system_architecture_stack</p>
              <div className="flex flex-wrap gap-2">
                {STACK.map((s) => (<span key={s} className="rounded border px-2 py-1 font-mono text-[11px]" style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)", color: "var(--devdoc-text)" }}>{s}</span>))}
              </div>
            </div>
            <div className="relative w-full flex-shrink-0 border p-4 text-right md:w-[400px]" style={{ backgroundColor: "var(--devdoc-surface)", borderColor: "var(--devdoc-border)" }}>
              <span className="absolute left-0 top-0 h-2 w-px" style={{ backgroundColor: "var(--devdoc-highlight)" }} />
              <span className="absolute left-0 top-0 h-px w-2" style={{ backgroundColor: "var(--devdoc-highlight)" }} />
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-subtle)]">project title</p>
              <p className="mb-4 font-headline text-base font-medium">Final Year Project · COMSATS University Islamabad</p>
              <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-subtle)]">engineering team</p>
              <p className="text-sm text-[var(--devdoc-muted)]">Muhammad Hassan — Modules 4–7<br />M. Dawood Iqbal — Modules 1–3, 8</p>
              <div className="mt-4 flex items-center justify-between border-t pt-4" style={{ borderColor: "var(--devdoc-border)" }}>
                <span className="font-mono text-[10px] text-[var(--devdoc-subtle)]">REV: 3.0</span>
                <span className="font-mono text-[10px] text-[var(--devdoc-subtle)]">STATUS: ACTIVE</span>
              </div>
            </div>
          </section>
        </Reveal>

        <section className="flex justify-center py-8">
          <Link to="/dashboard" className="flex items-center gap-2 rounded-lg px-8 py-3 font-headline text-base font-medium text-white transition-all hover:gap-3"
            style={{ backgroundColor: "var(--devdoc-primary)", boxShadow: "0 0 15px rgba(59,130,246,0.3)" }}>
            Open your workspace<Icon><path d="M5 12h14M12 5l7 7-7 7" /></Icon>
          </Link>
        </section>
      </div>
    </main>
  );
}
