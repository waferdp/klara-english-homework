// src/wordsModule.js
// Handles loading and shuffling of words
import { shuffle } from './utils.js'

export async function loadWords(language = 'english') {
  const fileName = language === 'french' ? 'french-words.json' : 'words.json'
  const response = await fetch(`${import.meta.env.BASE_URL}${fileName}`)
  const data = await response.json()
  return shuffle(data)
}

export function reshuffleWords(words) {
  return shuffle(words)
}
