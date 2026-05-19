// src/verbsModule.js
// Handles loading and shuffling of irregular verbs
import { shuffle } from './utils.js'

export async function loadVerbs() {
  const response = await fetch(`${import.meta.env.BASE_URL}irregular-verbs.json`)
  const data = await response.json()
  // For each verb, create 3 entries (one for each form)
  const allForms = data.flatMap(verb =>
    ['infinitive', 'past', 'pastParticiple'].map(form => ({
      ...verb,
      testForm: form
    }))
  )
  return shuffle(allForms)
}

export const reshuffleVerbs = (verbs) => shuffle(verbs)
