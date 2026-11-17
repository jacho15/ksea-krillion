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

type Answer = { accept: string[]; points: number; tier: string; blurb: string };

const TOP_TIER = "ONE IN A KRILLION";

export const PROMPTS: { text: string; answers: Answer[] }[] = [
  {
    text: "Name a club on USC campus",
    answers: [
      { accept: ["kasa"], points: 10, tier: "PLANKTON", blurb: "Big name. Plenty of people said it too." },
      { accept: ["ksea"], points: 100, tier: TOP_TIER, blurb: "Almost nobody names this one. That is a krillion." },
    ],
  },
  {
    text: "Name an event by a USC club",
    answers: [
      {
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
  { name: "DEEP CUT", points: 60, depth: 600 },
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

export function judge(promptIndex: number, raw: string): Judged {
  const n = normalize(raw);
  const typed = raw.trim();
  const hit = n && PROMPTS[promptIndex].answers.find((a) => a.accept.some((x) => normalize(x) === n));
  if (hit) {
    return { typed, points: hit.points, depth: hit.points * 10, tier: hit.tier, krillion: hit.tier === TOP_TIER, blurb: hit.blurb };
  }
  return { typed, points: 0, depth: 0, tier: "", krillion: false, blurb: "Nothing on the list. The ocean waits." };
}

// Linear scale: 2 scene pixels per metre.
export const depthPx = (m: number) => m * 2;
