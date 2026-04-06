import type { TimelineAnalysis } from "@/types/resume";

function markerClasses(marker: TimelineAnalysis["events"][number]["marker"]) {
  switch (marker) {
    case "gap":
      return "border-pulse bg-pulse/20";
    case "overlap":
      return "border-danger bg-danger/20";
    case "growth_alert":
      return "border-danger bg-danger/25 shadow-[0_0_18px_rgba(251,113,133,0.2)]";
    default:
      return "border-neon bg-neon/15";
  }
}

export function TimelinePanel({ timeline }: { timeline: TimelineAnalysis | null }) {
  return (
    <div className="glass-panel neon-border rounded-[30px] p-5">
      <p className="section-kicker text-pulse/82">Timeline Analyzer</p>
      <h3 className="mt-2 font-display text-2xl text-white">Career integrity trace</h3>

      {!timeline?.events.length ? (
        <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-white/60">
          Timeline events will appear here after analysis.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {timeline.events.map((event, index) => (
            <div key={`${event.role}-${index}`} className="relative rounded-[24px] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-3">
                  <div className={`mt-1 h-3 w-3 shrink-0 rounded-full border ${markerClasses(event.marker)}`} />
                  <div>
                    <p className="font-display text-lg text-white">{event.role}</p>
                    <p className="mt-1 text-sm text-white/60">{event.organization || "Organization not specified"}</p>
                    {event.note ? <p className="mt-3 text-sm leading-7 text-white/82">{event.note}</p> : null}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 text-right text-sm text-white/72">
                  <p>
                    {event.start_date || "Unknown"} to {event.end_date || "Unknown"}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/45">{event.duration_months} months</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {timeline ? (
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <InsightBlock title="Gaps" items={timeline.gaps} tone="pulse" />
          <InsightBlock title="Overlaps" items={timeline.overlaps} tone="danger" />
          <InsightBlock title="Growth Alerts" items={timeline.growth_alerts} tone="danger" />
        </div>
      ) : null}
    </div>
  );
}

function InsightBlock({ title, items, tone }: { title: string; items: string[]; tone: "pulse" | "danger" }) {
  return (
    <div className={`rounded-[24px] border p-4 ${tone === "danger" ? "border-danger/20 bg-danger/10" : "border-pulse/20 bg-pulse/10"}`}>
      <p className="section-kicker text-white/70">{title}</p>
      <div className="mt-3 space-y-2 text-sm leading-7 text-white/75">
        {items.length ? items.map((item) => <p key={item}>{item}</p>) : <p>No issues detected.</p>}
      </div>
    </div>
  );
}
