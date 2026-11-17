"use client";

import { useEffect, useRef, useState } from "react";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export function Hud({ depth, score, index, total }: { depth: number; score: number; index: number; total: number }) {
  return (
    <header className="hud">
      <div className="panel">
        <small>DEPTH</small>
        <b className="cyan">{fmt(depth)}m</b>
      </div>
      <div className="steps">
        <div>
          {Array.from({ length: total }, (_, i) => (
            <i key={i} className={i === index ? "on" : i < index ? "done" : ""} />
          ))}
        </div>
        <small>
          PROMPT {index + 1} OF {total}
        </small>
      </div>
      <div className="panel panel--right">
        <small>SCORE</small>
        <b className="pink">{fmt(score)}</b>
      </div>
    </header>
  );
}

export function PromptCard({ index, total, text }: { index: number; total: number; text: string }) {
  return (
    <section className="card">
      <p className="card-label">
        PROMPT {index + 1} OF {total}
      </p>
      <h1>{text.toUpperCase()}</h1>
      <p className="card-hint">▼ rarer answers sink deeper ▼</p>
    </section>
  );
}

const SECONDS = 25;

export function QuestionBar({ onSubmit }: { onSubmit: (answer: string) => void }) {
  const [end] = useState(() => Date.now() + SECONDS * 1000);
  const [left, setLeft] = useState(SECONDS * 1000);
  const [value, setValue] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const sent = useRef(false);

  const send = (answer: string) => {
    if (sent.current) return;
    sent.current = true;
    onSubmit(answer);
  };

  useEffect(() => {
    // only auto-focus where there is no on-screen keyboard to pop up
    if (window.matchMedia("(pointer: fine)").matches) input.current?.focus();
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const l = Math.max(0, end - Date.now());
      setLeft(l);
      if (l === 0) {
        clearInterval(id);
        if (!sent.current) {
          sent.current = true;
          onSubmit(""); // time ran out: no answer
        }
      }
    }, 100);
    return () => clearInterval(id);
  }, [end, onSubmit]);

  const frac = left / (SECONDS * 1000);
  const C = 2 * Math.PI * 20;

  return (
    <form
      className="bar"
      onSubmit={(e) => {
        e.preventDefault();
        send(value);
      }}
    >
      <div className="ring" role="timer" aria-label="seconds left">
        <svg viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="20" className="ring-bg" />
          <circle cx="24" cy="24" r="20" className="ring-fg" strokeDasharray={C} strokeDashoffset={C * (1 - frac)} />
        </svg>
        <span>{Math.ceil(left / 1000)}</span>
      </div>
      <div className="field">
        <input
          ref={input}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="type one answer…"
          maxLength={60}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="your answer"
        />
        <div className="timebar">
          <i style={{ width: `${frac * 100}%` }} />
        </div>
      </div>
      <button type="submit">DIVE</button>
    </form>
  );
}
