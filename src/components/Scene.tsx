import type { ReactNode } from "react";
import { CAPTIONS, TIER_LINES, depthPx } from "@/lib/game";
import { BOAT, CLOUD, FISH, Pixels, SHRIMP } from "./sprites";

// tiny deterministic generator so server and client render the same scene
function rng(seed: number) {
  let s = seed;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}
const rand = rng(42);
const FISHES = Array.from({ length: 22 }, (_, i) => ({
  y: 90 + i * 62 + rand() * 40,
  x: Math.round(rand() * 90),
  dur: 22 + rand() * 30,
  delay: -rand() * 40,
  flip: i % 3 === 0,
}));
const BUBBLES = Array.from({ length: 14 }, () => ({
  left: rand() * 100,
  size: 5 + rand() * 6,
  dur: 7 + rand() * 8,
  delay: -rand() * 12,
}));
const DOTS = Array.from({ length: 36 }, () => ({
  left: rand() * 100,
  top: 38 + rand() * 62,
  dur: 6 + rand() * 8,
  delay: -rand() * 10,
}));
const CLOUDS = [
  { left: 4, top: 3, scale: 4, dur: 70 },
  { left: 42, top: 7, scale: 6, dur: 90 },
  { left: 80, top: 4, scale: 5, dur: 80 },
  { left: 62, top: 22, scale: 3, dur: 60 },
];
const TICKS = [0, 100, 200, 500, 1000, 2000, 3000, 4000];

// water colour by depth (metres): surface blue down to near black
const STOPS: [number, number[]][] = [
  [0, [27, 91, 136]],
  [150, [16, 64, 106]],
  [800, [8, 32, 64]],
  [2000, [4, 16, 36]],
  [4000, [2, 7, 16]],
];
function waterColor(d: number) {
  let i = 1;
  while (i < STOPS.length - 1 && d > STOPS[i][0]) i++;
  const [d0, c0] = STOPS[i - 1];
  const [d1, c1] = STOPS[i];
  const t = Math.min(1, Math.max(0, (d - d0) / (d1 - d0)));
  return `rgb(${c0.map((v, k) => Math.round(v + (c1[k] - v) * t)).join(",")})`;
}

const fmt = (n: number) => n.toLocaleString("en-US");

export type SceneMode = "start" | "play" | "results";

export function Scene({
  depth,
  mode,
  diving,
  reveal,
  children,
}: {
  depth: number; // metres; drives colour and (in play) the camera
  mode: SceneMode;
  diving: boolean;
  reveal: boolean;
  children?: ReactNode; // lives in the scrolling world, anchored under the waterline
}) {
  const play = mode === "play";
  const cam = play ? depthPx(depth) : 0;
  const lead = play ? Math.min(1, depth / 50) * 7 : 0; // vh
  const offset = play ? 0 : 29; // vh: waterline sits lower on start / results
  const water = waterColor(depth);

  return (
    <div
      className={`scene${diving ? " scene--diving" : ""}${reveal ? " scene--reveal" : ""}`}
      style={{ background: water, ["--water-color" as string]: water }}
    >
      <div
        className={`world${diving ? "" : " world--smooth"}`}
        style={{ transform: `translateY(calc(${-cam}px + ${offset + lead}vh))` }}
      >
        <div className="sky" />
        {CLOUDS.map((c, i) => (
          <Pixels
            key={i}
            sprite={CLOUD}
            scale={c.scale}
            className="cloud"
            style={{ left: `${c.left}%`, top: `${c.top}vh`, animationDuration: `${c.dur}s` }}
          />
        ))}
        <svg className="wave" viewBox="0 0 400 14" preserveAspectRatio="none" aria-hidden>
          <path d="M0 8 Q50 3 100 8 T200 8 T300 8 T400 8 V14 H0Z" fill="var(--water-color)" />
          <path d="M0 8 Q50 3 100 8 T200 8 T300 8 T400 8" fill="none" stroke="#8fe3ea" strokeOpacity=".5" strokeWidth="1" />
        </svg>
        <Pixels sprite={BOAT} scale={5} className="boat" />

        {FISHES.map((f, i) => (
          <div
            key={i}
            className="fish"
            style={{
              top: `calc(var(--water) + ${f.y}px)`,
              animationDuration: `${f.dur}s`,
              animationDelay: `${f.delay}s`,
              animationDirection: f.flip ? "reverse" : "normal",
              ["--x" as string]: `${f.x}%`,
            }}
          >
            <Pixels sprite={FISH} scale={2} style={f.flip ? { transform: "scaleX(-1)" } : undefined} />
          </div>
        ))}

        <div className={`depth-stuff${play ? " depth-stuff--on" : ""}`}>
          {TIER_LINES.map((t) => (
            <div
              key={t.name}
              className={`tier${t.depth > 3000 ? " tier--top" : ""}`}
              style={{ top: `calc(var(--water) + ${depthPx(t.depth)}px)` }}
            >
              <span>
                {t.name} · {t.points}
              </span>
            </div>
          ))}
          {CAPTIONS.map((c) => (
            <div
              key={c.text}
              className={`caption caption--${c.side}`}
              style={{ top: `calc(var(--water) + ${depthPx(c.depth)}px)` }}
            >
              {c.text}
            </div>
          ))}
          <div className="ruler">
            {TICKS.map((m) => (
              <div key={m} className="tick" style={{ top: `calc(var(--water) + ${depthPx(m)}px)` }}>
                <span>{m === 0 ? "0m" : `-${fmt(m)}m`}</span>
              </div>
            ))}
          </div>
        </div>

        {children}
      </div>

      <div className="particles" aria-hidden>
        {DOTS.map((d, i) => (
          <i
            key={i}
            style={{ left: `${d.left}%`, top: `${d.top}%`, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }}
          />
        ))}
      </div>
      <div className="bubbles" aria-hidden>
        {BUBBLES.map((b, i) => (
          <i
            key={i}
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="shrimp">
        <Pixels sprite={SHRIMP} scale={4} />
      </div>
      <div className="fade-bottom" />
      <div className="scan" />
    </div>
  );
}
