
import { useState, useEffect, useRef } from 'react'
import './App.css'
import { loadWords, reshuffleWords } from './wordsModule.js'
import { loadVerbs, reshuffleVerbs } from './verbsModule.js'
import WordsCard from './WordsCard.jsx'
import VerbsCard from './VerbsCard.jsx'

function App() {
  const [mode, setMode] = useState('words') // 'words' or 'verbs'
  const [words, setWords] = useState([])
  const [verbs, setVerbs] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  
  const inputRef = useRef(null)
  const nextButtonRef = useRef(null)

  useEffect(() => {
    // Load words and verbs using modules
    loadWords()
      .then(setWords)
      .catch(error => console.error('Error loading words:', error))
    loadVerbs()
      .then(setVerbs)
      .catch(error => console.error('Error loading verbs:', error))
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!userAnswer.trim()) return

    let correctAnswer
    let isCorrect

    if (mode === 'words') {
      const currentWord = words[currentIndex]
      correctAnswer = currentWord.direction === 'toSwedish' 
        ? currentWord.swedish 
        : currentWord.english
      isCorrect = userAnswer.replace(/[\s?!]+/g, '').toLowerCase() === correctAnswer.replace(/[\s?!]+/g, '').toLowerCase()
    } else {
      // Irregular verbs mode
      const currentVerb = verbs[currentIndex]
      correctAnswer = currentVerb[currentVerb.testForm]
      
      // Normalize answers for comparison - handle alternatives like "was/were"
      const normalizedUserAnswer = userAnswer.replace(/[\s?]+/g, '').toLowerCase()
      const normalizedCorrectAnswer = correctAnswer.replace(/[\s?]+/g, '').toLowerCase()
      
      // Check if the answer matches exactly or matches one of the alternatives
      if (normalizedCorrectAnswer.includes('/')) {
        const alternatives = normalizedCorrectAnswer.split('/')
        isCorrect = alternatives.some(alt => normalizedUserAnswer === alt)
      } else {
        isCorrect = normalizedUserAnswer === normalizedCorrectAnswer
      }
    }

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
    const currentList = mode === 'words' ? words : verbs
    if (currentIndex < currentList.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setUserAnswer('')
      setFeedback('')
      setShowAnswer(false)
      // Focus input for the next word
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setFeedback('🎉 You\'ve completed all ' + (mode === 'words' ? 'words' : 'verbs') + '!')
    }
  }

  const handleRestart = () => {
    if (mode === 'words') {
      setWords(reshuffleWords(words))
    } else {
      setVerbs(shu(verbs))
    }
    setCurrentIndex(0)
    setUserAnswer('')
    setFeedback('')
    setShowAnswer(false)
    setScore({ correct: 0, total: 0 })
    // Focus input when restarting
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setCurrentIndex(0)
    setUserAnswer('')
    setFeedback('')
    setShowAnswer(false)
    setScore({ correct: 0, total: 0 })
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const currentList = mode === 'words' ? words : verbs
  
  if (currentList.length === 0) {
    return <div className="loading">Loading {mode === 'words' ? 'words' : 'verbs'}...</div>
  }

  const isLastItem = currentIndex === currentList.length - 1;
  return (
    <div className="app">
      <header>
        <h1>🇬🇧 English Practice 🇸🇪</h1>
        <div className="mode-selector">
          <button 
            className={`mode-btn ${mode === 'words' ? 'active' : ''}`}
            onClick={() => switchMode('words')}
          >
            Word Translation
          </button>
          <button 
            className={`mode-btn ${mode === 'verbs' ? 'active' : ''}`}
            onClick={() => switchMode('verbs')}
          >
            Irregular Verbs
          </button>
        </div>
        <div className="score">
          Score: {score.correct}/{score.total} 
          {score.total > 0 && ` (${Math.round((score.correct / score.total) * 100)}%)`}
        </div>
      </header>
      {mode === 'words' ? (
        <WordsCard
          currentWord={words[currentIndex]}
          currentIndex={currentIndex}
          total={words.length}
          userAnswer={userAnswer}
          onUserAnswerChange={e => setUserAnswer(e.target.value)}
          onSubmit={handleSubmit}
          feedback={feedback}
          showAnswer={showAnswer}
          isLastItem={isLastItem}
          onNext={handleNext}
          onRestart={handleRestart}
          inputRef={inputRef}
          nextButtonRef={nextButtonRef}
          score={score}
        />
      ) : (
        <VerbsCard
          currentVerb={verbs[currentIndex]}
          currentIndex={currentIndex}
          total={verbs.length}
          userAnswer={userAnswer}
          onUserAnswerChange={e => setUserAnswer(e.target.value)}
          onSubmit={handleSubmit}
          feedback={feedback}
          showAnswer={showAnswer}
          isLastItem={isLastItem}
          onNext={handleNext}
          onRestart={handleRestart}
          inputRef={inputRef}
          nextButtonRef={nextButtonRef}
          score={score}
        />
      )}
    </div>
  )
}

export default App
