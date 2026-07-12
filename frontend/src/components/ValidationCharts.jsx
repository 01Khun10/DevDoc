import { useMemo } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const SEVERITY_COLORS = {
  ERROR: "var(--devdoc-error)",
  WARNING: "var(--devdoc-warning)",
  INFO: "var(--devdoc-info)"
};

const METRIC_LABELS = [
  ["sectionCompletion", "Sections complete", "30%"],
  ["reqTraced", "Requirements traced", "25%"],
  ["frCovered", "FRs covered by use case", "20%"],
  ["frImplemented", "FRs implemented", "15%"],
  ["frVerified", "FRs verified", "10%"]
];

const tooltipStyle = {
  backgroundColor: "var(--devdoc-surface)",
  border: "1px solid var(--devdoc-border)",
  borderRadius: "8px",
  fontSize: "12px",
  color: "var(--devdoc-text)"
};

function buildTrendData(runs) {
  return [...runs]
    .reverse()
    .filter((run) => run.readinessScore !== null && run.readinessScore !== undefined)
    .map((run, index) => ({
      run: index + 1,
      score: run.readinessScore,
      label: new Date(run.startedAt).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    }));
}

// Readiness score over stored runs; shared by the validation and analytics pages.
export function ReadinessTrendChart({ runs, heightClass = "h-40" }) {
  const trendData = buildTrendData(runs);

  if (trendData.length < 2) {
    return (
      <div className={`flex items-center justify-center text-sm ${heightClass}`} style={{ color: "var(--devdoc-muted)" }}>
        Run validation at least twice to see a trend.
      </div>
    );
  }

  return (
    <div className={heightClass}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData} margin={{ top: 5, right: 8, bottom: 0, left: -24 }}>
          <CartesianGrid stroke="var(--devdoc-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="run" tick={{ fontSize: 11, fill: "var(--devdoc-muted)" }} tickLine={false} axisLine={{ stroke: "var(--devdoc-border)" }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "var(--devdoc-muted)" }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(value, payload) => payload?.[0]?.payload?.label || `Run ${value}`}
            formatter={(value) => [`${value}/100`, "Score"]}
          />
          <Line
            type="monotone"
            dataKey="score"
            stroke="var(--devdoc-primary)"
            strokeWidth={2}
            dot={{ r: 3, fill: "var(--devdoc-primary)", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <p className="devdoc-label mb-3">{title}</p>
      {children}
    </div>
  );
}

// Header charts for the validation page: severity donut for the active run,
// readiness trend across stored runs, and the weighted metric ratios that
// compose the readiness score.
function ValidationCharts({ activeRun, validationRuns }) {
  const severityData = useMemo(() => {
    const results = activeRun?.results || [];
    return ["ERROR", "WARNING", "INFO"]
      .map((severity) => ({
        name: severity,
        value: results.filter((result) => result.severity === severity).length
      }))
      .filter((entry) => entry.value > 0);
  }, [activeRun]);

  const trendData = useMemo(() => buildTrendData(validationRuns), [validationRuns]);

  const metrics = activeRun?.metrics || null;

  if (!activeRun && trendData.length < 2) return null;

  return (
    <div className="mb-5 grid gap-4 lg:grid-cols-3">
      {activeRun ? (
        <ChartCard title="Issues by severity">
          {severityData.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-sm" style={{ color: "var(--devdoc-success)" }}>
              No issues
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="60%"
                      outerRadius="95%"
                      paddingAngle={2}
                      stroke="var(--devdoc-surface)"
                      strokeWidth={2}
                    >
                      {severityData.map((entry) => (
                        <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul className="grid gap-1.5 text-xs font-semibold" style={{ color: "var(--devdoc-text)" }}>
                {severityData.map((entry) => (
                  <li key={entry.name} className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-sm"
                      style={{ backgroundColor: SEVERITY_COLORS[entry.name] }}
                    />
                    {entry.name}
                    <span style={{ color: "var(--devdoc-muted)" }}>{entry.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </ChartCard>
      ) : null}

      {trendData.length >= 2 ? (
        <ChartCard title="Readiness trend">
          <ReadinessTrendChart runs={validationRuns} />
        </ChartCard>
      ) : null}

      {metrics ? (
        <ChartCard title="Score components">
          <div className="grid gap-2.5">
            {METRIC_LABELS.map(([key, label, weight]) => {
              const ratio = Math.max(0, Math.min(1, metrics[key] ?? 0));
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-semibold" style={{ color: "var(--devdoc-text)" }}>
                      {label} <span style={{ color: "var(--devdoc-subtle)" }}>({weight})</span>
                    </span>
                    <span style={{ color: "var(--devdoc-muted)" }}>{Math.round(ratio * 100)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--devdoc-surface-muted)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${ratio * 100}%`, backgroundColor: "var(--devdoc-primary)" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      ) : null}
    </div>
  );
}

export default ValidationCharts;
