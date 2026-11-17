// All game content is hardcoded here.

export const POSTER_SRC: string | null = null; // set to "/poster.png" once public/poster.png exists

export type Judged = {
  typed: string; // what the player typed, trimmed
  points: number;
  depth: number; // metres sunk: 10 per point
  tier: string; // "" for a miss
  krillion: boolean;
  blurb: string;
};

type Answer = { label: string; accept: string[]; points: number; tier: string; blurb: string };

const TOP_TIER = "ONE IN A KRILLION";

export const PROMPTS: { text: string; answers: Answer[] }[] = [
  {
    text: "Name a club on USC campus",
    answers: [
      { label: "KASA", accept: ["kasa"], points: 10, tier: "PLANKTON", blurb: "Big name. Plenty of people said it too." },
      { label: "KSEA", accept: ["ksea"], points: 100, tier: TOP_TIER, blurb: "Almost nobody names this one. That is a krillion." },
    ],
  },
  {
    text: "Name an event by a USC club",
    answers: [
      {
        label: "KSEA Fall Send Off",
        accept: [
          "ksea fall send off",
          "ksea fall sendoff",
          "ksea fall send-off",
          "fall send off",
          "fall sendoff",
          "fall send-off",
        ],
        points: 100,
        tier: TOP_TIER,
        blurb: "A fall send off that hardly anyone thinks of first.",
      },
    ],
  },
];

// Tier lines drawn during the descent, at depth = points x 10m.
export const TIER_LINES = [
  { name: "PLANKTON", points: 10, depth: 100 },
  { name: "TOO CLEVER", points: 15, depth: 150 },
  { name: "SCHOOLER", points: 30, depth: 300 },
  { name: "DEEP CUT", points: 85, depth: 850 },
  { name: TOP_TIER, points: 100, depth: 1000 },
];

export const TIER_COLORS: Record<string, string> = {
  PLANKTON: "#cfd8e3",
  "TOO CLEVER": "#f2d04b",
  SCHOOLER: "#3fe0ff",
  "DEEP CUT": "#a77bff",
  [TOP_TIER]: "#f2b84b",
};
export const MISS_COLOR = "#3b4a6b";

export const CAPTIONS = [
  { text: "light begins to fade", depth: 40, side: "left" },
  { text: "most sunlight stops here", depth: 250, side: "right" },
  { text: "the midnight zone", depth: 700, side: "left" },
  { text: "the abyssal zone", depth: 1400, side: "right" },
] as const;

// lowercase, drop punctuation, collapse whitespace
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Scores an accepted answer. Anything else (only the timer ends up here) is a 0-point result.
export function judge(promptIndex: number, raw: string): Judged {
  const n = normalize(raw);
  const typed = raw.trim();
  const hit = n && PROMPTS[promptIndex].answers.find((a) => a.accept.some((x) => normalize(x) === n));
  if (hit) {
    return { typed, points: hit.points, depth: hit.points * 10, tier: hit.tier, krillion: hit.tier === TOP_TIER, blurb: hit.blurb };
  }
  return { typed, points: 0, depth: 0, tier: "", krillion: false, blurb: "The clock ran out. The ocean waits." };
}

// Edit distance where swapping two adjacent letters counts as 1.
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

export type Check = { kind: "hit" } | { kind: "suggest"; label: string } | { kind: "none" };

// Classifies a submitted answer: exact match, close to one answer (suggest it), or nonsense.
export function check(promptIndex: number, raw: string): Check {
  const n = normalize(raw);
  if (!n) return { kind: "none" };
  let best = Infinity;
  let labels: string[] = [];
  for (const a of PROMPTS[promptIndex].answers) {
    for (const x of a.accept) {
      const m = normalize(x);
      const d = editDistance(n, m);
      if (d === 0) return { kind: "hit" };
      if (d > (m.length <= 5 ? 1 : 2) || d > best) continue;
      if (d < best) labels = [];
      best = d;
      if (!labels.includes(a.label)) labels.push(a.label);
    }
  }
  return labels.length === 1 ? { kind: "suggest", label: labels[0] } : { kind: "none" };
}

// Linear scale: 2 scene pixels per metre.
export const depthPx = (m: number) => m * 2;
