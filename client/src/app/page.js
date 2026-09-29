import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-transparent text-slate-100">
      <header className="border-b border-aurora-border/70 bg-aurora-panel/90 px-6 py-5 shadow-2xl shadow-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-aurora-mint shadow-lg shadow-aurora-mint/50" />

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-cyan">
                CivicPulse
              </p>
            </div>

            <h1 className="mt-2 text-xl font-bold text-slate-100 sm:text-2xl">
              Urban Response Network
            </h1>

            <p className="mt-1 text-sm text-aurora-muted">
              Making civic services simpler and more transparent
            </p>
          </div>

          <Link
            href="/login"
            className="rounded-lg border border-aurora-border px-4 py-2 text-sm font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-aurora-cyan hover:bg-aurora-panel-soft"
          >
            Admin Login
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden px-6 py-16 sm:py-20">
        <div className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-aurora-mint/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-aurora-cyan/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-4 inline-block rounded-full border border-aurora-mint/30 bg-aurora-mint/10 px-4 py-2 text-sm font-semibold text-aurora-mint">
              Civic services at your fingertips
            </p>

            <h2 className="max-w-3xl text-4xl font-bold leading-tight text-slate-100 sm:text-5xl">
              See it. Report it. Improve your city.
            </h2>

            <p className="mt-6 max-w-xl text-lg leading-8 text-aurora-muted">
              Help improve your community by reporting problems such as
              streetlight failures, garbage collection issues, road damage, and
              other civic concerns.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/report"
                className="rounded-lg bg-aurora-mint-strong px-6 py-3 font-semibold text-aurora-ink transition hover:-translate-y-0.5 hover:bg-aurora-mint hover:shadow-lg hover:shadow-aurora-mint/20"
              >
                Report an Issue
              </Link>

              <Link
                href="/track"
                className="rounded-lg border border-aurora-border bg-aurora-panel-soft px-6 py-3 font-semibold text-slate-100 transition hover:-translate-y-0.5 hover:border-aurora-cyan hover:bg-aurora-panel"
              >
                Track Complaint
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              <Metric value="24/7" label="Access" />
              <Metric value="Live" label="Updates" />
              <Metric value="1 ID" label="Tracking" />
            </div>
          </div>

          <div className="relative rounded-3xl border border-aurora-border bg-aurora-panel/90 p-8 shadow-2xl shadow-black/25 backdrop-blur">
            <div className="absolute right-6 top-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-aurora-mint">
              <span className="h-2 w-2 rounded-full bg-aurora-mint shadow-lg shadow-aurora-mint/70" />
              Active network
            </div>

            <h3 className="pt-8 text-2xl font-bold text-slate-100">
              How it works
            </h3>

            <div className="mt-8 space-y-6">
              <Step
                number="1"
                title="Report an issue"
                description="Submit the complaint details, location, category, and contact information."
              />

              <Step
                number="2"
                title="Receive your complaint ID"
                description="Use your complaint ID and registered email address to check progress."
              />

              <Step
                number="3"
                title="Track the resolution"
                description="View the latest status, department assignment, and resolution notes."
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-aurora-border/70 bg-aurora-panel/70 px-6 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-aurora-cyan">
                One connected city
              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-100">
                Choose what you need
              </h2>
            </div>

            <p className="max-w-md text-sm leading-6 text-aurora-muted">
              Every report creates a clearer path from community observation to
              civic action.
            </p>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <ServiceCard
              title="Report a problem"
              description="Submit a new civic complaint with relevant information."
              href="/report"
              buttonText="Submit complaint"
              accent="mint"
            />

            <ServiceCard
              title="Track complaint"
              description="Check the current progress of a previously submitted complaint."
              href="/track"
              buttonText="Track status"
              accent="cyan"
            />

            <ServiceCard
              title="Administrator access"
              description="Authorized staff can manage complaints and monitor operations."
              href="/login"
              buttonText="Admin login"
              accent="lilac"
            />
          </div>
        </div>
      </section>

      <footer className="border-t border-aurora-border/70 bg-aurora-ink/80 px-6 py-6 text-center text-sm text-aurora-subtle backdrop-blur-sm">
        CivicPulse · Smart Civic Operations Platform
      </footer>
    </main>
  );
}

function Step({ number, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-aurora-mint/30 bg-aurora-mint/10 font-bold text-aurora-mint">
        {number}
      </div>

      <div>
        <h4 className="font-semibold text-slate-100">{title}</h4>

        <p className="mt-1 text-sm leading-6 text-aurora-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

function Metric({ value, label }) {
  return (
    <div className="rounded-xl border border-aurora-border bg-aurora-panel-soft/80 p-4">
      <p className="text-xl font-bold text-aurora-mint">{value}</p>

      <p className="mt-1 text-xs uppercase tracking-wider text-aurora-subtle">
        {label}
      </p>
    </div>
  );
}

function ServiceCard({
  title,
  description,
  href,
  buttonText,
  accent = "mint",
}) {
  const accentStyles = {
    mint: {
      line: "bg-aurora-mint",
      text: "text-aurora-mint",
      border: "hover:border-aurora-mint/70",
    },
    cyan: {
      line: "bg-aurora-cyan",
      text: "text-aurora-cyan",
      border: "hover:border-aurora-cyan/70",
    },
    lilac: {
      line: "bg-aurora-lilac",
      text: "text-aurora-lilac",
      border: "hover:border-aurora-lilac/70",
    },
  };

  const style = accentStyles[accent];

  return (
    <div
      className={`group rounded-2xl border border-aurora-border bg-aurora-panel-soft p-6 shadow-xl shadow-black/10 transition hover:-translate-y-1 ${style.border}`}
    >
      <div className={`mb-5 h-1 w-12 rounded-full ${style.line}`} />

      <h3 className="text-xl font-bold text-slate-100">{title}</h3>

      <p className="mt-3 min-h-14 text-sm leading-6 text-aurora-muted">
        {description}
      </p>

      <Link
        href={href}
        className={`mt-5 inline-block text-sm font-semibold transition group-hover:translate-x-1 ${style.text}`}
      >
        {buttonText} <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}