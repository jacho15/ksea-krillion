"use client";

import { useCallback, useEffect, useState } from "react";
import { Hud, PromptCard, QuestionBar } from "@/components/Hud";
import { Results } from "@/components/Results";
import { Reveal } from "@/components/Reveal";
import { Scene } from "@/components/Scene";
import { Pixels, SHRIMP } from "@/components/sprites";
import { MISS_COLOR, PROMPTS, TIER_COLORS, judge, type Judged } from "@/lib/game";

type Phase = "start" | "question" | "descent" | "reveal" | "results";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const points = (r: Judged[]) => r.reduce((s, x) => s + x.points, 0);
const metres = (r: Judged[]) => r.reduce((s, x) => s + x.depth, 0);

// little shrimp and sparkles that scatter around the answer chip
const BURST = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2 + (i % 2) * 0.2;
  const d = 90 + (i % 3) * 40;
  return { dx: Math.round(Math.cos(a) * d * 1.5), dy: Math.round(Math.sin(a) * d), shrimp: i % 2 === 0, delay: (i % 4) * 0.05 };
});

export default function Page() {
  const [phase, setPhase] = useState<Phase>("start");
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<Judged[]>([]);
  const [progress, setProgress] = useState(0); // 0..1 through the current descent
  const [count, setCount] = useState(0); // "clock starts in" countdown before prompts 2+
  const [leaving, setLeaving] = useState(false);

  const submit = useCallback(
    (raw: string) => {
      setResults((r) => [...r, judge(idx, raw)]);
      setProgress(0);
      setPhase("descent");
    },
    [idx],
  );

  useEffect(() => {
    if (phase !== "descent") return;
    const r = results[idx];
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = calm ? 400 : r.depth ? 1800 + r.depth * 2.4 : 900;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      setProgress(ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setPhase("reveal");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, idx, results]);

  useEffect(() => {
    if (phase !== "question" || count <= 0) return;
    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [phase, count]);

  const next = () => {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => {
      setLeaving(false);
      if (idx + 1 < PROMPTS.length) {
        setIdx(idx + 1);
        setCount(3);
        setPhase("question");
      } else setPhase("results");
    }, 350);
  };

  const reset = () => {
    setResults([]);
    setIdx(0);
    setProgress(0);
    setCount(0);
    setLeaving(false);
    setPhase("start");
  };

  const diving = phase === "descent";
  const cur = diving || phase === "reveal" ? results[idx] : undefined;
  const answered = results.slice(0, diving ? results.length - 1 : results.length);
  const base = metres(results.slice(0, idx));
  const depth = metres(answered) + (diving && cur ? cur.depth * progress : 0);
  const inPlay = phase === "question" || diving || phase === "reveal";
  const colors = answered.map((r) => (r.tier ? TIER_COLORS[r.tier] : MISS_COLOR));

  return (
    <>
      <Scene
        depth={phase === "results" ? 1500 : depth}
        base={base}
        answerDepth={cur?.depth ?? 0}
        showLines={diving || phase === "reveal"}
        mode={phase === "start" ? "start" : phase === "results" ? "results" : "play"}
        diving={diving}
        reveal={phase === "reveal"}
      >
        {(phase === "question" || diving) && (
          <PromptCard key={idx} index={idx} total={PROMPTS.length} text={PROMPTS[idx].text} depth={base} />
        )}
      </Scene>

      {inPlay && <div className={`veil${phase === "reveal" && !leaving ? " veil--on" : ""}`} />}

      {phase === "start" && (
        <>
          <div className="hero">
            <h1 className="logo">KRILLION</h1>
            <p className="subtitle">THE KSEA DIVE</p>
            <p className="tagline">{PROMPTS.length} prompts · rarer answers sink deeper</p>
          </div>
          <button className="begin" onClick={() => setPhase("question")}>
            ▼ BEGIN DESCENT ▼
          </button>
          <p className="foot">
            unofficial fan parody of{" "}
            <a href="https://krillion.io" target="_blank" rel="noreferrer">
              krillion.io
            </a>{" "}
            · made for KSEA at USC
          </p>
        </>
      )}

      {inPlay && <Hud depth={depth} score={points(answered)} index={idx} total={PROMPTS.length} colors={colors} />}

      {phase === "question" && count === 0 && <QuestionBar key={idx} promptIndex={idx} onSubmit={submit} />}
      {phase === "question" && count > 0 && <p className="pill">descending · the clock starts in {count}</p>}

      {diving && cur && (
        <div className={`answer${cur.krillion ? " answer--krill" : ""}${cur.points ? "" : " answer--miss"}`}>
          <div className="chip-wrap">
            <div className="burst" aria-hidden>
              {BURST.map((b, i) =>
                b.shrimp ? (
                  <Pixels
                    key={i}
                    sprite={SHRIMP}
                    scale={2}
                    style={{ ["--dx" as string]: `${b.dx}px`, ["--dy" as string]: `${b.dy}px`, animationDelay: `${b.delay}s` }}
                  />
                ) : (
                  <i key={i} style={{ ["--dx" as string]: `${b.dx}px`, ["--dy" as string]: `${b.dy}px`, animationDelay: `${b.delay}s` }} />
                ),
              )}
            </div>
            <div className="chip">
              {cur.typed ? `“${cur.typed.toUpperCase()}”` : "NO ANSWER"} <span>▼</span>
            </div>
          </div>
        </div>
      )}

      {phase === "reveal" && cur && (
        <>
          {cur.krillion && <div className="flash" />}
          <Reveal result={cur} last={idx + 1 >= PROMPTS.length} leaving={leaving} onNext={next} />
        </>
      )}

      {phase === "results" && (
        <>
          <div className="dim" />
          <Results score={points(results)} depth={metres(results)} onReset={reset} />
        </>
      )}
    </>
  );
}
