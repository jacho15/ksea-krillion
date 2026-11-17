"use client";

import { useCallback, useEffect, useState } from "react";
import { Hud, PromptCard, QuestionBar } from "@/components/Hud";
import { Results } from "@/components/Results";
import { Scene } from "@/components/Scene";
import { PROMPTS, judge, type Judged } from "@/lib/game";

type Phase = "start" | "question" | "descent" | "results";

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const sum = (r: Judged[]) => r.reduce((s, x) => s + x.points, 0);

export default function Page() {
  const [phase, setPhase] = useState<Phase>("start");
  const [idx, setIdx] = useState(0);
  const [results, setResults] = useState<Judged[]>([]);
  const [progress, setProgress] = useState(0); // 0..1 through the current descent
  const [settled, setSettled] = useState(false);

  const submit = useCallback(
    (raw: string) => {
      setResults((r) => [...r, judge(idx, raw)]);
      setProgress(0);
      setSettled(false);
      setPhase("descent");
    },
    [idx],
  );

  useEffect(() => {
    if (phase !== "descent") return;
    const r = results[idx];
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dur = calm ? 400 : r.krillion ? 4800 : r.points ? 2200 : 1400;
    const hold = calm ? 900 : r.krillion ? 3200 : 1600;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / dur);
      setProgress(ease(t));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setSettled(true);
    };
    raf = requestAnimationFrame(tick);
    const next = setTimeout(() => {
      if (idx + 1 < PROMPTS.length) {
        setIdx(idx + 1);
        setPhase("question");
      } else setPhase("results");
    }, dur + hold);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(next);
    };
  }, [phase, idx, results]);

  const reset = () => {
    setResults([]);
    setIdx(0);
    setProgress(0);
    setSettled(false);
    setPhase("start");
  };

  const cur = phase === "descent" ? results[idx] : undefined;
  const depth = cur ? cur.depth * progress : 0;
  const score = (phase === "results" ? sum(results) : sum(results.slice(0, idx))) + (cur ? cur.points * progress : 0);
  const maxDepth = Math.max(0, ...results.map((r) => r.depth));
  const inPlay = phase === "question" || phase === "descent";

  return (
    <>
      <Scene
        depth={phase === "results" ? 2500 : depth}
        mode={phase === "start" ? "start" : phase === "results" ? "results" : "play"}
        diving={phase === "descent"}
        reveal={!!cur?.krillion && settled}
      >
        {inPlay && <PromptCard index={idx} total={PROMPTS.length} text={PROMPTS[idx].text} />}
      </Scene>

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

      {inPlay && <Hud depth={depth} score={score} index={idx} total={PROMPTS.length} />}

      {phase === "question" && <QuestionBar key={idx} onSubmit={submit} />}

      {cur && (
        <div className={`answer${cur.krillion ? " answer--krill" : ""}${cur.points ? "" : " answer--miss"}`}>
          <div className="chip">
            {cur.points ? `“${cur.label}”` : cur.label} <span>▼</span>
          </div>
          {cur.points > 0 && (
            <p className="gain">
              +{cur.points} · {cur.tier}
            </p>
          )}
        </div>
      )}

      {cur?.krillion && settled && (
        <>
          <div className="flash" />
          <div className="banner">ONE IN A KRILLION</div>
        </>
      )}

      {phase === "results" && (
        <>
          <div className="dim" />
          <Results score={sum(results)} depth={maxDepth} onReset={reset} />
        </>
      )}
    </>
  );
}
