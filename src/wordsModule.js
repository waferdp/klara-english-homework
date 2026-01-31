// src/wordsModule.js
// Handles loading and shuffling of words

export async function loadWords() {
  const response = await fetch(`${import.meta.env.BASE_URL}words.json`)
  const data = await response.json()
  // Shuffle the words and randomly assign direction (English->Swedish or Swedish->English)
  return [...data].map(word => ({
    ...word,
    direction: Math.random() > 0.5 ? 'toSwedish' : 'toEnglish'
  })).sort(() => Math.random() - 0.5)
}

export function reshuffleWords(words) {
  return [...words].map(word => ({
    ...word,
    direction: Math.random() > 0.5 ? 'toSwedish' : 'toEnglish'
  })).sort(() => Math.random() - 0.5)
}
