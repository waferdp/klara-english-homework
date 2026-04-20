
import { useState, useEffect, useRef } from 'react'
import './App.css'
import { loadWords, reshuffleWords } from './wordsModule.js'
import { loadVerbs, reshuffleVerbs } from './verbsModule.js'
import { loadPhrases, reshufflePhrases } from './phrasesModule.js'

import WordsCard from './WordsCard.jsx'
import VerbsCard from './VerbsCard.jsx'
import SentenceCard from './SentenceCard.jsx'

function getModeLabel(mode) {
  if (mode === 'words') return 'words'
  if (mode === 'verbs') return 'verbs'
  return 'sentence challenges'
}

function normalizeForPhraseMatch(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function sentenceContainsPhrase(sentence, phrase) {
  const normalizedSentence = normalizeForPhraseMatch(sentence)
  const normalizedPhrase = normalizeForPhraseMatch(phrase)
  return normalizedPhrase.length > 0 && normalizedSentence.includes(normalizedPhrase)
}

async function validateSentenceWithLanguageTool(sentence) {
  try {
    const response = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        text: sentence,
        language: 'en-US'
      })
    })

    if (!response.ok) {
      return {
        available: false,
        isValid: true,
        suggestions: []
      }
    }

    const data = await response.json()
    const blockingIssueTypes = new Set(['misspelling', 'grammar', 'typographical'])
    const blockingIssues = data.matches.filter(match =>
      blockingIssueTypes.has(match.rule?.issueType)
    )

    return {
      available: true,
      isValid: blockingIssues.length === 0,
      suggestions: blockingIssues.slice(0, 3).map(match => match.message)
    }
  } catch {
    return {
      available: false,
      isValid: true,
      suggestions: []
    }
  }
}

function ScoreScreen({ score, total, onRestart, mode }) {
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  return (
    <div className="card score-screen">
      <h2>🎉 All {getModeLabel(mode)} completed!</h2>
      <div className="final-score">Score: {score} / {total} ({percent}%)</div>
      <button className="btn-primary" onClick={onRestart} autoFocus>
        🔄 Try Again
      </button>
    </div>
  );
}

function App() {
  const [mode, setMode] = useState('words')
  const [practiceMode, setPracticeMode] = useState(false)
  const [words, setWords] = useState([])
  const [verbs, setVerbs] = useState([])
  const [phrases, setPhrases] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showAnswer, setShowAnswer] = useState(false)
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

    let correctAnswer
    let isCorrect

    if (mode === 'words') {
      const currentWord = words[currentIndex]
      correctAnswer = currentWord.direction === 'toSwedish' 
        ? currentWord.swedish 
        : currentWord.english
      isCorrect = userAnswer.replace(/[\s?,!]+/g, '').toLowerCase() === correctAnswer.replace(/[\s?,!]+/g, '').toLowerCase()
    } else if (mode === 'verbs') {
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
    } else {
      const currentPhrase = phrases[currentIndex]
      correctAnswer = currentPhrase.phrase

      const containsPhrase = sentenceContainsPhrase(userAnswer, currentPhrase.phrase)
      if (!containsPhrase) {
        isCorrect = false
      } else {
        setIsCheckingOnline(true)
        const validationResult = await validateSentenceWithLanguageTool(userAnswer)
        setIsCheckingOnline(false)

        isCorrect = validationResult.isValid

        if (!validationResult.available) {
          setFeedback('✅ Good sentence! It includes the phrase. (Online grammar check unavailable right now.)')
          setLastAnswerCorrect(true)
          setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
          setTimeout(() => nextButtonRef.current?.focus(), 0)
          return
        }

        if (!validationResult.isValid) {
          const details = validationResult.suggestions.length > 0
            ? ` Suggestions: ${validationResult.suggestions.join(' | ')}`
            : ''
          setFeedback(`❌ The sentence includes the phrase, but grammar/spelling needs fixes.${details}`)
          setLastAnswerCorrect(false)
          setScore(prev => ({ ...prev, total: prev.total + 1 }))
          setShowAnswer(true)
          setTimeout(() => nextButtonRef.current?.focus(), 0)
          return
        }
      }
    }

    if (isCorrect) {
      setFeedback('✅ Correct! Well done!')
      setLastAnswerCorrect(true)
      setScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
    } else {
      setFeedback(`❌ Not quite. The correct answer is: ${correctAnswer}`)
      setLastAnswerCorrect(false)
      setScore(prev => ({ ...prev, total: prev.total + 1 }))
      setShowAnswer(true)
    }
    
    // Focus the next button after checking
    setTimeout(() => nextButtonRef.current?.focus(), 0)
  }

  const handleNext = () => {
    if (practiceMode && lastAnswerCorrect === false) {
      setUserAnswer('')
      setFeedback('')
      setShowAnswer(false)
      setLastAnswerCorrect(null)
      setTimeout(() => inputRef.current?.focus(), 0)
      return
    }

    const currentList = mode === 'words' ? words : mode === 'verbs' ? verbs : phrases
    if (currentIndex < currentList.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setFeedback('');
      setShowAnswer(false);
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
    setShowAnswer(false)
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
    setShowAnswer(false)
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
          <button
            className={`mode-btn ${mode === 'sentences' ? 'active' : ''}`}
            onClick={() => switchMode('sentences')}
          >
            Sentence Builder
          </button>
        </div>
        <div className="practice-mode-toggle">
          <button
            className={`mode-btn practice-btn ${practiceMode ? 'active' : ''}`}
            onClick={() => setPracticeMode(prev => !prev)}
          >
            Practice Mode: {practiceMode ? 'On' : 'Off'}
          </button>
        </div>
        <div className="score">
          Score: {score.correct}/{score.total}
          {score.total > 0 && ` (${Math.round((score.correct / score.total) * 100)}%)`}
        </div>
      </header>
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
          showAnswer={showAnswer}
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
          showAnswer={showAnswer}
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
