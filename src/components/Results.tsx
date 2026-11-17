import { POSTER_SRC } from "@/lib/game";

export function Results({ score, depth, onReset }: { score: number; depth: number; onReset: () => void }) {
  return (
    <main className="results">
      <p className="results-title">RESULTS</p>
      <div className="results-score">
        <b>{score.toLocaleString("en-US")}</b>
        <span>{depth ? `-${depth.toLocaleString("en-US")}` : "0"}m</span>
      </div>

      {/* POSTER PLACEHOLDER: drop the ad poster image here (set POSTER_SRC in src/lib/game.ts) */}
      {POSTER_SRC ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="poster" src={POSTER_SRC} alt="KSEA poster" />
      ) : (
        <div className="poster poster--empty" />
      )}

      <button className="again" onClick={onReset}>
        PLAY AGAIN ⟲
      </button>
    </main>
  );
}
