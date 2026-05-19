// src/wordsModule.js
// Handles loading and shuffling of words
import { shuffle } from './utils.js'

export async function loadWords() {
  const response = await fetch(`${import.meta.env.BASE_URL}words.json`)
  const data = await response.json()
  // Assign random direction and shuffle
  const prepared = [...data].map(word => ({
    ...word,
    direction: Math.random() > 0.5 ? 'toSwedish' : 'toEnglish'
  }))
  return shuffle(prepared)
}

export function reshuffleWords(words) {
  const prepared = [...words].map(word => ({
    ...word,
    direction: Math.random() > 0.5 ? 'toSwedish' : 'toEnglish'
  }))
  return shuffle(prepared)
}
