// src/VerbsCard.jsx
// Card component for irregular verbs mode

export default function VerbsCard({
  currentVerb,
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
  const displayWord = currentVerb.swedish
  const formClues = {
    infinitive: 'To...',
    past: 'Yesterday I...',
    pastParticiple: 'I have/had...'
  }
  const questionText = `What is the ${currentVerb.testForm.replace('pastParticiple', 'past participle')} form?`
  const placeholder = 'Type the English verb form...'

  return (
    <div className="card">
      <div className="progress">
        Verb {currentIndex + 1} of {total}
      </div>
      <div className="word-display">
        <div className="english-word">{displayWord}</div>
        <label className="question">{questionText}</label>
        <label className="form-clue">{formClues[currentVerb.testForm]}</label>
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
              Next Verb →
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
