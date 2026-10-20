export default function Header({ mode, onSwitchMode, wordLanguage, onSwitchWordLanguage, practiceMode, onTogglePractice, score }) {
  return (
    <header>
      <h1>🇬🇧 English &amp; 🇫🇷 French Practice</h1>
      <div className="mode-selector">
        <button
          className={`mode-btn ${mode === 'words' ? 'active' : ''}`}
          onClick={() => onSwitchMode('words')}
        >
          Word Translation (EN/FR)
        </button>
        <button
          className={`mode-btn ${mode === 'verbs' ? 'active' : ''}`}
          onClick={() => onSwitchMode('verbs')}
        >
          Irregular Verbs
        </button>
        <button
          className={`mode-btn ${mode === 'sentences' ? 'active' : ''}`}
          onClick={() => onSwitchMode('sentences')}
        >
          Sentence Builder
        </button>
      </div>
      {mode === 'words' && (
        <div className="mode-selector" aria-label="Word translation language">
          <button
            className={`mode-btn ${wordLanguage === 'english' ? 'active' : ''}`}
            aria-pressed={wordLanguage === 'english'}
            onClick={() => onSwitchWordLanguage('english')}
          >
            English
          </button>
          <button
            className={`mode-btn ${wordLanguage === 'french' ? 'active' : ''}`}
            aria-pressed={wordLanguage === 'french'}
            onClick={() => onSwitchWordLanguage('french')}
          >
            French
          </button>
        </div>
      )}
      <div className="practice-mode-toggle">
        <button
          className={`mode-btn practice-btn ${practiceMode ? 'active' : ''}`}
          onClick={onTogglePractice}
        >
          Practice Mode: {practiceMode ? 'On' : 'Off'}
        </button>
      </div>
      <div className="score">
        Score: {score.correct}/{score.total}
        {score.total > 0 && ` (${Math.round((score.correct / score.total) * 100)}%)`}
      </div>
    </header>
  )
}
