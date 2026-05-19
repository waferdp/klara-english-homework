import { normalizeForPhraseMatch, sentenceContainsPhrase, validateSentenceWithLanguageTool } from './utils.js'

export async function validateWordAnswer(userAnswer, currentWord) {
  const correctAnswer = currentWord.direction === 'toSwedish'
    ? currentWord.swedish
    : currentWord.english

  const normalizedUser = userAnswer.replace(/[\s?,!]+/g, '').toLowerCase()
  const normalizedCorrect = correctAnswer.replace(/[\s?,!]+/g, '').toLowerCase()
  const isCorrect = normalizedUser === normalizedCorrect

  return { isCorrect, correctAnswer }
}

export async function validateVerbAnswer(userAnswer, currentVerb) {
  const correctAnswer = currentVerb[currentVerb.testForm]

  const normalizedUser = userAnswer.replace(/[\s?]+/g, '').toLowerCase()
  const normalizedCorrect = correctAnswer.replace(/[\s?]+/g, '').toLowerCase()

  let isCorrect = false
  if (normalizedCorrect.includes('/')) {
    const alternatives = normalizedCorrect.split('/')
    isCorrect = alternatives.some(alt => normalizedUser === alt)
  } else {
    isCorrect = normalizedUser === normalizedCorrect
  }

  return { isCorrect, correctAnswer }
}

export async function validateSentenceAnswer(userAnswer, currentPhrase) {
  const correctAnswer = currentPhrase.phrase

  const contains = sentenceContainsPhrase(userAnswer, currentPhrase.phrase)
  if (!contains) {
    return { isCorrect: false, correctAnswer, available: true }
  }

  // Call out to LanguageTool for grammar/spelling validation
  const validationResult = await validateSentenceWithLanguageTool(userAnswer)

  if (!validationResult.available) {
    return { isCorrect: true, correctAnswer, available: false }
  }

  if (!validationResult.isValid) {
    return {
      isCorrect: false,
      correctAnswer,
      available: true,
      suggestions: validationResult.suggestions
    }
  }

  return { isCorrect: true, correctAnswer, available: true }
}
