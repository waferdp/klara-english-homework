import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [words, setWords] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  
  const inputRef = useRef(null)
  const nextButtonRef = useRef(null)

  useEffect(() => {
    // Load words from JSON file
    fetch(`${import.meta.env.BASE_URL}words.json`)
      .then(response => response.json())
      .then(data => {
        // Shuffle the words and randomly assign direction (English->Swedish or Swedish->English)
        const shuffled = [...data].map(word => ({
          ...word,
          direction: Math.random() > 0.5 ? 'toSwedish' : 'toEnglish'
        })).sort(() => Math.random() - 0.5)
        setWords(shuffled)
      })
      .catch(error => console.error('Error loading words:', error))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!userAnswer.trim()) return

    const currentWord = words[currentIndex]
    const correctAnswer = currentWord.direction === 'toSwedish' 
      ? currentWord.swedish 
      : currentWord.english
    const isCorrect = userAnswer.replace(/[\s?,]+/g, '').toLowerCase() === correctAnswer.replace(/[\s?,]+/g, '').toLowerCase()

    if (isCorrect) {
      setFeedback('✅ Correct! Well done!')
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setFeedback(`❌ Not quite. The correct answer is: ${correctAnswer}`)
      setScore(prev => ({ ...prev, total: prev.total + 1 }))
      setShowAnswer(true)
    }
    
    // Focus the next button after checking
    setTimeout(() => nextButtonRef.current?.focus(), 0)
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer('')
      setFeedback('')
      setShowAnswer(false)
      // Focus input for the next word
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setFeedback('🎉 You\'ve completed all words!')
    }
  }

  const handleRestart = () => {
    // Reshuffle words and randomly assign new directions
    const shuffled = [...words].map(word => ({
      ...word,
      direction: Math.random() > 0.5 ? 'toSwedish' : 'toEnglish'
    })).sort(() => Math.random() - 0.5)
    setWords(shuffled)
    setCurrentIndex(0)
    setUserAnswer('')
    setFeedback('')
    setShowAnswer(false)
    setScore({ correct: 0, total: 0 })
    // Focus input when restarting
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  if (words.length === 0) {
    return <div className="loading">Loading words...</div>
  }

  const currentWord = words[currentIndex]
  const isLastWord = currentIndex === words.length - 1
  const sourceWord = currentWord.direction === 'toSwedish' ? currentWord.english : currentWord.swedish
  const targetLanguage = currentWord.direction === 'toSwedish' ? 'Swedish' : 'English'
  const sourceLanguage = currentWord.direction === 'toSwedish' ? 'English' : 'Swedish'

  return (
    <div className="app">
      <header>
        <h1>🇬🇧 English Word Practice 🇸🇪</h1>
        <div className="score">
          Score: {score.correct}/{score.total} 
          {score.total > 0 && ` (${Math.round((score.correct / score.total) * 100)}%)`}
        </div>
      </header>

      <div className="card">
        <div className="progress">
          Word {currentIndex + 1} of {words.length}
        </div>

        <div className="word-display">
          <label>Translate this {sourceLanguage} word to {targetLanguage}:</label>
          <div className="english-word">{sourceWord}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder={`Type the ${targetLanguage} translation...`}
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
            {!isLastWord ? (
              <button ref={nextButtonRef} onClick={handleNext} className="btn-primary">
                Next Word →
              </button>
            ) : (
              <button ref={nextButtonRef} onClick={handleRestart} className="btn-primary">
                🔄 Start Over
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
