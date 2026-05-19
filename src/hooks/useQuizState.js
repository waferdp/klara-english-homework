import { useState, useRef } from 'react'

export default function useQuizState() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(null)
  const [isCheckingOnline, setIsCheckingOnline] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [showScoreScreen, setShowScoreScreen] = useState(false)

  const inputRef = useRef(null)
  const nextButtonRef = useRef(null)

  function resetState() {
    setCurrentIndex(0)
    setUserAnswer('')
    setFeedback('')
    setLastAnswerCorrect(null)
    setIsCheckingOnline(false)
    setScore({ correct: 0, total: 0 })
    setShowScoreScreen(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  return {
    currentIndex,
    setCurrentIndex,
    userAnswer,
    setUserAnswer,
    feedback,
    setFeedback,
    lastAnswerCorrect,
    setLastAnswerCorrect,
    isCheckingOnline,
    setIsCheckingOnline,
    score,
    setScore,
    showScoreScreen,
    setShowScoreScreen,
    inputRef,
    nextButtonRef,
    resetState
  }
}
