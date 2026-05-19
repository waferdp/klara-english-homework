export function getModeLabel(mode) {
  if (mode === 'words') return 'words'
  if (mode === 'verbs') return 'verbs'
  return 'sentence challenges'
}

export function normalizeForPhraseMatch(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function sentenceContainsPhrase(sentence, phrase) {
  const normalizedSentence = normalizeForPhraseMatch(sentence)
  const normalizedPhrase = normalizeForPhraseMatch(phrase)
  return normalizedPhrase.length > 0 && normalizedSentence.includes(normalizedPhrase)
}

export async function validateSentenceWithLanguageTool(sentence) {
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

export function shuffle(array) {
  const copy = array.slice()
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}
