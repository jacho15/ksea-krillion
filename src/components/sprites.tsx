"use client";

import { useEffect, useRef, type CSSProperties } from "react";

// All pixel art is drawn here as string grids. "." is transparent.
export type Sprite = { grid: string[]; colors: Record<string, string> };

export const BOAT: Sprite = {
  colors: { K: "#0a1424", G: "#1a2a42", P: "#ff6b8f", W: "#7fb6c9" },
  grid: [
    "....PPPPPK",
    "...PPPPPPK",
    "....PPPPPK",
    ".........K",
    ".........K",
    ".........K",
    "......KKKKKK",
    "......KKWKKKK",
    "......KKWKKKK",
    "..GGGGGGGGGGGGGGGGGGGGGGG",
    "..KKKKKKKKKKKKKKKKKKKKKKKKK",
    "...KKKKKKKKKKKKKKKKKKKKKKKKK",
    "....KKKKKKKKKKKKKKKKKKKKKK",
  ],
};

export const SHRIMP: Sprite = {
  colors: { r: "#ff3d66", R: "#ff6b8f", a: "#ff9db4", e: "#ffffff", d: "#b01c44" },
  grid: [
    "..a.a....",
    "...a.a...",
    "..rrrr...",
    ".rReRRr..",
    ".rRRRRRr.",
    "..rRRRRRr",
    "...rRRRRr",
    "....rRRr.",
    "...rRRr..",
    "..rRRr...",
    ".rRRr....",
    ".rrdr....",
    "rr..rr...",
  ],
};

export const FISH: Sprite = {
  colors: { k: "#030b16" },
  grid: ["k....kkk...", "kk.kkkkkkk.", "kkkkkkkkkkk", "kk.kkkkkkk.", "k....kkk..."],
};

export const CLOUD: Sprite = {
  colors: { w: "#ffffff", s: "#cfe3f0" },
  grid: [
    "..............wwwwwwwwww..............",
    "...........wwwwwwwwwwwwwwww...........",
    ".....wwwwwwwwwwwwwwwwwwwwwwwwww.......",
    "..wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww....",
    ".wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww..",
    "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "sswwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwss",
    ".ssssssssssssssssssssssssssssssssssss.",
  ],
};

export const GOLD_SHRIMP: Sprite = {
  colors: { r: "#e0952a", R: "#f2b84b", a: "#ffe08a", e: "#ffffff", d: "#9a5c10" },
  grid: SHRIMP.grid,
};

export const BUBBLE: Sprite = {
  colors: { c: "#8da2ba" },
  grid: ["..ccc..", ".c...c.", "c.....c", "c.....c", "c.....c", ".c...c.", "..ccc.."],
};

export const BUBBLE_CLUSTER: Sprite = {
  colors: { c: "#9fe6f5" },
  grid: [
    "...........ccc..",
    "..........c...c.",
    "..........c...c.",
    "..........c...c.",
    "...ccc.....ccc..",
    ".cc...cc........",
    ".c.....c........",
    "c.......c..ccc..",
    "c.......c..c.c..",
    "c.......c..ccc..",
    ".c.....c........",
    ".cc...cc........",
    "...ccc..........",
  ],
};

export const KELP: Sprite = {
  colors: { k: "#020a16" },
  grid: [
    "..k....", ".kk....", ".kk....", "..kk...", "..kk...", "...kk..", "...kk..", "..kk...",
    "..kk...", ".kk....", ".kk....", "..kk...", "..kk...", "...kk..", ".kkkk..", "kkkkkk.",
  ],
};

export const CORAL: Sprite = {
  colors: { k: "#020a16" },
  grid: [
    "k....k...k..",
    "k....k...k..",
    "kk..kkk..kk.",
    ".kk.kkk.kk..",
    ".kkkkkkkkk..",
    "..kkkkkkk...",
    "...kkkkk....",
    "....kkk.....",
    "....kkk.....",
    "...kkkkk....",
  ],
};

export function Pixels({
  sprite,
  scale,
  className,
  style,
}: {
  sprite: Sprite;
  scale: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const w = Math.max(...sprite.grid.map((r) => r.length));
  const h = sprite.grid.length;

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w * scale, h * scale);
    sprite.grid.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        const color = sprite.colors[ch];
        if (!color) return;
        ctx.fillStyle = color;
        ctx.fillRect(x * scale, y * scale, scale, scale);
      }),
    );
  }, [sprite, scale, w, h]);

  return (
    <canvas
      ref={ref}
      width={w * scale}
      height={h * scale}
      className={className}
      style={{ imageRendering: "pixelated", ...style }}
      aria-hidden
    />
  );
}
