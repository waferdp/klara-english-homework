import { getModeLabel } from './utils.js'

export default function ScoreScreen({ score, total, onRestart, mode }) {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0
  return (
    <div className="card score-screen">
      <h2>🎉 All {getModeLabel(mode)} completed!</h2>
      <div className="final-score">Score: {score} / {total} ({percent}%)</div>
      <button className="btn-primary" onClick={onRestart} autoFocus>
        🔄 Try Again
      </button>
    </div>
  )
}
