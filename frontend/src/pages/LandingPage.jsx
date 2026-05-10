import { Link } from "react-router-dom";

function LandingPage() {
  const features = [
    {
      title: "Templates",
      description: "Start with professional profiles and templates for standard project documentation.",
      icon: "📄"
    },
    {
      title: "Structured Editor",
      description: "Write in focused, structured sections with built-in guidance instead of free-text chaos.",
      icon: "✏️"
    },
    {
      title: "Requirements",
      description: "Manage functional and non-functional requirements in a dedicated registry.",
      icon: "📋"
    },
    {
      title: "Traceability",
      description: "Link use cases to requirements and requirements to document sections.",
      icon: "🔗"
    },
    {
      title: "Doc-Linter Validation",
      description: "Run automated checks for missing documents, empty sections, and unlinked requirements.",
      icon: "✅"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-teal-200 selection:text-teal-900">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#3525cd] to-[#4f46e5] text-xs font-black text-white shadow-md">
              D
            </span>
            <span className="text-xl font-extrabold tracking-tight text-indigo-700">DevDoc</span>
          </div>
          
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">Features</a>
            <a href="#how-it-works" className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">How it works</a>
            <Link to="/docs" className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">Docs</Link>
            <Link to="/about" className="text-sm font-semibold text-slate-600 transition-colors hover:text-indigo-600">About</Link>
          </nav>
          
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-full px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:inline-block"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-md"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pb-20 pt-24 sm:pb-32 sm:pt-32 lg:pb-40">
          <div className="absolute inset-x-0 top-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>
          
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance text-5xl font-extrabold tracking-tight text-slate-950 sm:text-7xl">
              Documentation that <span className="bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">stays connected.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-pretty text-lg leading-8 text-slate-600 sm:text-xl">
              DevDoc helps teams create structured software documents, link requirements to sections, and run Doc-Linter checks before documentation drifts.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/register"
                className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-md"
              >
                Get Started
              </Link>
              <Link
                to="/docs"
                className="text-sm font-semibold leading-6 text-slate-900 transition-colors hover:text-indigo-600"
              >
                View Docs <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                A connected knowledge graph
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-5xl sm:mt-20">
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {features.map((feature) => (
                  <div
                    key={feature.title}
                    className="group relative flex flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-100"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl shadow-inner transition-colors group-hover:bg-indigo-100">
                      {feature.icon}
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-slate-900">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
          <p className="text-sm leading-5 text-slate-500">
            &copy; {new Date().getFullYear()} DevDoc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
