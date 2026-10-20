// src/WordsCard.jsx
// Card component for word translation mode

export default function WordsCard({
  currentWord,
  currentIndex,
  total,
  userAnswer,
  onUserAnswerChange,
  onSubmit,
  feedback,
  showAnswer,
  isLastItem,
  onNext,
  onRestart,
  inputRef,
  nextButtonRef,
  score,
  practiceMode,
  lastAnswerCorrect,
  wordLanguage
}) {
  const targetLanguage = wordLanguage === 'french' ? 'French' : 'English'
  const questionText = `Translate this Swedish word to ${targetLanguage}:`
  const placeholder = `Type the ${targetLanguage} translation...`

  return (
    <div className="card">
      <div className="progress">
        Word {currentIndex + 1} of {total}
      </div>
      <div className="word-display">
        <label>{questionText}</label>
        <div className="english-word">{currentWord.swedish}</div>
      </div>
      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={userAnswer}
          onChange={onUserAnswerChange}
          placeholder={placeholder}
          disabled={feedback !== '' && !(practiceMode && lastAnswerCorrect === false)}
          autoFocus
        />
        {(!feedback || (practiceMode && lastAnswerCorrect === false)) && (
          <button type="submit" className="btn-primary">
            {practiceMode && lastAnswerCorrect === false ? 'Try Again' : 'Check Answer'}
          </button>
        )}
      </form>
      {feedback && (
        <div className={`feedback ${feedback.includes('✅') ? 'correct' : 'incorrect'}`}>
          {feedback}
        </div>
      )}
      {feedback && (
        <div className="actions">
          {practiceMode && lastAnswerCorrect === false ? null : !isLastItem ? (
            <button ref={nextButtonRef} onClick={onNext} className="btn-primary">
              Next Word →
            </button>
          ) : (
            <button ref={nextButtonRef} onClick={onNext} className="btn-primary">
              Finish
            </button>
          )}
        </div>
      )}
    </div>
  )
}
