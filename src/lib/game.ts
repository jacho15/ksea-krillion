// All game content is hardcoded here.

export const POSTER_SRC: string | null = null; // set to "/poster.png" once public/poster.png exists

export type Judged = {
  label: string; // text shown in the answer chip
  points: number;
  depth: number; // metres
  tier: string;
  krillion: boolean;
};

type Answer = { label: string; accept: string[]; points: number; depth: number; tier: string };

const TOP_TIER = "ONE IN A KRILLION";

export const PROMPTS: { text: string; answers: Answer[] }[] = [
  {
    text: "Name a club on USC campus",
    answers: [
      { label: "KASA", accept: ["kasa"], points: 10, depth: 100, tier: "PLANKTON" },
      { label: "KSEA", accept: ["ksea"], points: 500, depth: 3850, tier: TOP_TIER },
    ],
  },
  {
    text: "Name an event by a USC club",
    answers: [
      {
        label: "KSEA FALL SEND OFF",
        accept: [
          "ksea fall send off",
          "ksea fall sendoff",
          "ksea fall send-off",
          "fall send off",
          "fall sendoff",
          "fall send-off",
        ],
        points: 500,
        depth: 3850,
        tier: TOP_TIER,
      },
    ],
  },
];

// Decorative tier lines drawn during the descent.
export const TIER_LINES = [
  { name: "PLANKTON", points: 10, depth: 100 },
  { name: "SCHOOLER", points: 50, depth: 900 },
  { name: "DEEP CUT", points: 150, depth: 2000 },
  { name: TOP_TIER, points: 500, depth: 3850 },
];

export const CAPTIONS = [
  { text: "light begins to fade", depth: 40, side: "left" },
  { text: "most sunlight stops here", depth: 200, side: "right" },
  { text: "the midnight zone", depth: 1000, side: "left" },
  { text: "the abyssal zone", depth: 3000, side: "right" },
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
  const hit = n && PROMPTS[promptIndex].answers.find((a) => a.accept.some((x) => normalize(x) === n));
  if (hit) {
    return { label: hit.label, points: hit.points, depth: hit.depth, tier: hit.tier, krillion: hit.tier === TOP_TIER };
  }
  return { label: "NOT ON THE LIST", points: 0, depth: 10, tier: "", krillion: false };
}

// Log-ish mapping from metres to scene pixels so 3,850m still fits a short animation.
// rounded so server and client render identical strings (Math.log differs in the last digit)
export const depthPx = (m: number) => Math.round(260 * Math.log(1 + m / 60) * 100) / 100;
