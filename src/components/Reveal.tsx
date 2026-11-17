import { MISS_COLOR, TIER_COLORS, type Judged } from "@/lib/game";
import { BUBBLE, BUBBLE_CLUSTER, GOLD_SHRIMP, Pixels } from "./sprites";

const MUTED = "#8da2ba";
const MISS_TEXT = "#b08088";

// Shown after a descent ends. Stays until the player clicks.
export function Reveal({
  result,
  last,
  leaving,
  onNext,
}: {
  result: Judged;
  last: boolean;
  leaving: boolean;
  onNext: () => void;
}) {
  const miss = !result.tier;
  const gold = result.krillion;
  const title = miss ? "OUT OF TIME" : result.tier;
  const titleColor = gold ? TIER_COLORS[result.tier] : miss ? MISS_TEXT : MUTED;

  return (
    <div className={`reveal${leaving ? " reveal--out" : ""}${gold ? " reveal--gold" : ""}`}>
      <div className="reveal-sprite">
        {gold ? (
          <>
            <div className="halo" />
            <Pixels sprite={GOLD_SHRIMP} scale={10} className="sprite-gold" />
          </>
        ) : miss ? (
          <Pixels sprite={BUBBLE} scale={6} className="sprite-bubble" />
        ) : (
          <Pixels sprite={BUBBLE_CLUSTER} scale={6} className="sprite-cluster" />
        )}
      </div>
      <h2 className="reveal-title" style={{ color: titleColor }}>
        {title}
      </h2>
      <p className="reveal-answer">{result.typed ? `“${result.typed}”` : "(no answer)"}</p>
      <p className="reveal-pts">
        <b style={{ color: gold ? TIER_COLORS[result.tier] : MUTED }}>+{result.points} PTS</b> · sink{" "}
        {result.depth.toLocaleString("en-US")}m
      </p>
      <p className="reveal-blurb">{result.blurb}</p>
      <button
        className={`reveal-btn${gold ? " reveal-btn--gold" : ""}`}
        style={{ borderColor: gold ? "var(--pink)" : miss ? MISS_COLOR : undefined }}
        onClick={onNext}
      >
        {last ? "SEE RESULTS ▼" : "DESCEND ▼"}
      </button>
    </div>
  );
}
