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
  score
}) {
  const sourceWord = currentWord.direction === 'toSwedish' ? currentWord.english : currentWord.swedish
  const targetLanguage = currentWord.direction === 'toSwedish' ? 'Swedish' : 'English'
  const sourceLanguage = currentWord.direction === 'toSwedish' ? 'English' : 'Swedish'
  const questionText = `Translate this ${sourceLanguage} word to ${targetLanguage}:`
  const placeholder = `Type the ${targetLanguage} translation...`

  return (
    <div className="card">
      <div className="progress">
        Word {currentIndex + 1} of {total}
      </div>
      <div className="word-display">
        <label>{questionText}</label>
        <div className="english-word">{sourceWord}</div>
      </div>
      <form onSubmit={onSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={userAnswer}
          onChange={onUserAnswerChange}
          placeholder={placeholder}
          disabled={feedback !== ''}
          autoFocus
        />
        {!feedback && (
          <button type="submit" className="btn-primary">
            Check Answer
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
          {!isLastItem ? (
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
