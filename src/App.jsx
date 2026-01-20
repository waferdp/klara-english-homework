import { useState, useEffect, useRef } from 'react'
import './App.css'

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
    
    // Load irregular verbs from JSON file
    fetch(`${import.meta.env.BASE_URL}irregular-verbs.json`)
      .then(response => response.json())
      .then(data => {
        // Shuffle verbs and randomly assign which form to test
        const shuffled = [...data].map(verb => ({
          ...verb,
          testForm: ['infinitive', 'past', 'pastParticiple'][Math.floor(Math.random() * 3)]
        })).sort(() => Math.random() - 0.5)
        setVerbs(shuffled)
      })
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
      isCorrect = userAnswer.replace(/[\s?]+/g, '').toLowerCase() === correctAnswer.replace(/[\s?]+/g, '').toLowerCase()
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
      // Reshuffle words and randomly assign new directions
      const shuffled = [...words].map(word => ({
        ...word,
        direction: Math.random() > 0.5 ? 'toSwedish' : 'toEnglish'
      })).sort(() => Math.random() - 0.5)
      setWords(shuffled)
    } else {
      // Reshuffle verbs and randomly assign new test forms
      const shuffled = [...verbs].map(verb => ({
        ...verb,
        testForm: ['infinitive', 'past', 'pastParticiple'][Math.floor(Math.random() * 3)]
      })).sort(() => Math.random() - 0.5)
      setVerbs(shuffled)
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

  let currentItem, isLastItem, displayWord, questionText, placeholder

  if (mode === 'words') {
    currentItem = words[currentIndex]
    isLastItem = currentIndex === words.length - 1
    const sourceWord = currentItem.direction === 'toSwedish' ? currentItem.english : currentItem.swedish
    const targetLanguage = currentItem.direction === 'toSwedish' ? 'Swedish' : 'English'
    const sourceLanguage = currentItem.direction === 'toSwedish' ? 'English' : 'Swedish'
    displayWord = sourceWord
    questionText = `Translate this ${sourceLanguage} word to ${targetLanguage}:`
    placeholder = `Type the ${targetLanguage} translation...`
  } else {
    // Irregular verbs mode
    currentItem = verbs[currentIndex]
    isLastItem = currentIndex === verbs.length - 1
    displayWord = currentItem.swedish
    
    const formClues = {
      infinitive: 'to...',
      past: 'yesterday I...',
      pastParticiple: 'I have/had...'
    }
    
    questionText = `What is the ${currentItem.testForm.replace('pastParticiple', 'past participle')} form? (${formClues[currentItem.testForm]})`
    placeholder = 'Type the English verb form...'
  }

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

      <div className="card">
        <div className="progress">
          {mode === 'words' ? 'Word' : 'Verb'} {currentIndex + 1} of {currentList.length}
        </div>

        <div className="word-display">
          <label>{questionText}</label>
          <div className="english-word">{displayWord}</div>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
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
              <button ref={nextButtonRef} onClick={handleNext} className="btn-primary">
                Next {mode === 'words' ? 'Word' : 'Verb'} →
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
