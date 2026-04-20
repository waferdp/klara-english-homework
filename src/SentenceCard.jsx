// src/SentenceCard.jsx
// Card component for sentence-writing mode

export default function SentenceCard({
  currentPhrase,
  currentIndex,
  total,
  userAnswer,
  onUserAnswerChange,
  onSubmit,
  feedback,
  isLastItem,
  onNext,
  inputRef,
  nextButtonRef,
  practiceMode,
  lastAnswerCorrect,
  isCheckingOnline
}) {
  return (
    <div className="card">
      <div className="progress">
        Challenge {currentIndex + 1} of {total}
      </div>
      <div className="word-display">
        <label className="question">Write a valid English sentence using this word/phrase:</label>
        <div className="english-word">{currentPhrase.phrase}</div>
      </div>
      <form onSubmit={onSubmit}>
        <textarea
          ref={inputRef}
          value={userAnswer}
          onChange={onUserAnswerChange}
          placeholder="Type a full English sentence..."
          rows={4}
          disabled={
            isCheckingOnline ||
            (feedback !== '' && !(practiceMode && lastAnswerCorrect === false))
          }
          autoFocus
        />
        {(!feedback || (practiceMode && lastAnswerCorrect === false)) && (
          <button type="submit" className="btn-primary" disabled={isCheckingOnline}>
            {isCheckingOnline
              ? 'Checking sentence...'
              : practiceMode && lastAnswerCorrect === false
                ? 'Try Again'
                : 'Check Sentence'}
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
              Next Challenge →
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
