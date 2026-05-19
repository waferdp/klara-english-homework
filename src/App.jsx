
import { useState, useEffect, useRef } from 'react'
import './App.css'
import { loadWords, reshuffleWords } from './wordsModule.js'
import { loadVerbs, reshuffleVerbs } from './verbsModule.js'
import { loadPhrases, reshufflePhrases } from './phrasesModule.js'

import WordsCard from './WordsCard.jsx'
import VerbsCard from './VerbsCard.jsx'
import SentenceCard from './SentenceCard.jsx'
import ScoreScreen from './ScoreScreen.jsx'
import Header from './Header.jsx'

import { getModeLabel } from './utils.js'
import { validateWordAnswer, validateVerbAnswer, validateSentenceAnswer } from './validationModule.js'

function App() {
  const [mode, setMode] = useState('words')
  const [practiceMode, setPracticeMode] = useState(false)
  const [words, setWords] = useState([])
  const [verbs, setVerbs] = useState([])
  const [phrases, setPhrases] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null)
  const [isCheckingOnline, setIsCheckingOnline] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showScoreScreen, setShowScoreScreen] = useState(false)
  
  const inputRef = useRef(null)
  const nextButtonRef = useRef(null)

  useEffect(() => {
    loadWords()
      .then(setWords)
      .catch(error => console.error('Error loading words:', error))
    loadVerbs()
      .then(setVerbs)
      .catch(error => console.error('Error loading verbs:', error))
    loadPhrases()
      .then(setPhrases)
      .catch(error => console.error('Error loading phrases:', error))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!userAnswer.trim()) return
    let result

    if (mode === 'words') {
      const currentWord = words[currentIndex]
      result = await validateWordAnswer(userAnswer, currentWord)
    } else if (mode === 'verbs') {
      const currentVerb = verbs[currentIndex]
      result = await validateVerbAnswer(userAnswer, currentVerb)
    } else {
      const currentPhrase = phrases[currentIndex]
      setIsCheckingOnline(true)
      result = await validateSentenceAnswer(userAnswer, currentPhrase)
      setIsCheckingOnline(false)

      // LanguageTool unavailable -> accept as correct
      if (result.available === false) {
        setFeedback('✅ Good sentence! It includes the phrase. (Online grammar check unavailable right now.)')
        setLastAnswerCorrect(true)
        setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
        setTimeout(() => nextButtonRef.current?.focus(), 0)
        return
      }

      // If grammar/spelling issues were found for sentences, show feedback and allow retry
      if (result.isCorrect === false && Array.isArray(result.suggestions)) {
        const details = result.suggestions.length > 0 ? ` Suggestions: ${result.suggestions.join(' | ')}` : ''
        setFeedback(`❌ The sentence includes the phrase, but grammar/spelling needs fixes.${details}`)
        setLastAnswerCorrect(false)
        setScore(prev => ({ ...prev, total: prev.total + 1 }))
        setTimeout(() => nextButtonRef.current?.focus(), 0)
        return
      }
    }

    if (result.isCorrect) {
      setFeedback('✅ Correct! Well done!')
      setLastAnswerCorrect(true)
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setFeedback(`❌ Not quite. The correct answer is: ${result.correctAnswer}`)
      setLastAnswerCorrect(false)
      setScore(prev => ({ ...prev, total: prev.total + 1 }))
    }
    
    // Focus the next button after checking
    setTimeout(() => nextButtonRef.current?.focus(), 0)
  }

  const handleNext = () => {
    if (practiceMode && lastAnswerCorrect === false) {
      setUserAnswer('')
      setFeedback('')
      setLastAnswerCorrect(null)
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    const currentList = mode === 'words' ? words : mode === 'verbs' ? verbs : phrases
    if (currentIndex < currentList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setFeedback('');
      setLastAnswerCorrect(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setShowScoreScreen(true);
    }
  }  

  const handleRestart = () => {
    if (mode === 'words') {
      setWords(reshuffleWords(words))
    } else if (mode === 'verbs') {
      setVerbs(reshuffleVerbs(verbs))
    } else {
      setPhrases(reshufflePhrases(phrases))
    }
    setCurrentIndex(0)
    setUserAnswer('')
    setFeedback('')
    setLastAnswerCorrect(null)
    setIsCheckingOnline(false)
    setScore({ correct: 0, total: 0 })
    setShowScoreScreen(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }  

  const switchMode = (newMode) => {
    setMode(newMode)
    setCurrentIndex(0)
    setUserAnswer('')
    setFeedback('')
    setLastAnswerCorrect(null)
    setIsCheckingOnline(false)
    setScore({ correct: 0, total: 0 })
    setShowScoreScreen(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const currentList = mode === 'words' ? words : mode === 'verbs' ? verbs : phrases
  
  if (currentList.length === 0) {
    return <div className="loading">Loading {getModeLabel(mode)}...</div>
  }

  const isLastItem = currentIndex === currentList.length - 1;

  return (
    <div className="app">
      <Header
        mode={mode}
        onSwitchMode={switchMode}
        practiceMode={practiceMode}
        onTogglePractice={() => setPracticeMode(prev => !prev)}
        score={score}
      />
      {showScoreScreen ? (
        <ScoreScreen
          score={score.correct}
          total={score.total}
          onRestart={handleRestart}
          mode={mode}
        />
      ) : mode === 'words' ? (
        <WordsCard
          currentWord={words[currentIndex]}
          currentIndex={currentIndex}
          total={words.length}
          userAnswer={userAnswer}
          onUserAnswerChange={e => setUserAnswer(e.target.value)}
          onSubmit={handleSubmit}
          feedback={feedback}
          isLastItem={isLastItem}
          onNext={handleNext}
          onRestart={handleRestart}
          inputRef={inputRef}
          nextButtonRef={nextButtonRef}
          score={score}
          practiceMode={practiceMode}
          lastAnswerCorrect={lastAnswerCorrect}
        />
      ) : mode === 'verbs' ? (
        <VerbsCard
          currentVerb={verbs[currentIndex]}
          currentIndex={currentIndex}
          total={verbs.length}
          userAnswer={userAnswer}
          onUserAnswerChange={e => setUserAnswer(e.target.value)}
          onSubmit={handleSubmit}
          feedback={feedback}
          isLastItem={isLastItem}
          onNext={handleNext}
          onRestart={handleRestart}
          inputRef={inputRef}
          nextButtonRef={nextButtonRef}
          score={score}
          practiceMode={practiceMode}
          lastAnswerCorrect={lastAnswerCorrect}
        />
      ) : (
        <SentenceCard
          currentPhrase={phrases[currentIndex]}
          currentIndex={currentIndex}
          total={phrases.length}
          userAnswer={userAnswer}
          onUserAnswerChange={e => setUserAnswer(e.target.value)}
          onSubmit={handleSubmit}
          feedback={feedback}
          isLastItem={isLastItem}
          onNext={handleNext}
          inputRef={inputRef}
          nextButtonRef={nextButtonRef}
          practiceMode={practiceMode}
          lastAnswerCorrect={lastAnswerCorrect}
          isCheckingOnline={isCheckingOnline}
        />
      )}
    </div>
  )
}

export default App
