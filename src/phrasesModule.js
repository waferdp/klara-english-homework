// src/phrasesModule.js
// Handles loading and shuffling of phrase prompts

function shuffle(array) {
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
}

export async function loadPhrases() {
  const response = await fetch(`${import.meta.env.BASE_URL}phrases.json`)
  const data = await response.json()

  // Support both string and object records in JSON.
  const normalized = data
    .map(item => (typeof item === 'string' ? { phrase: item } : item))
    .filter(item => item?.phrase)

  return shuffle(normalized)
}

export const reshufflePhrases = shuffle
