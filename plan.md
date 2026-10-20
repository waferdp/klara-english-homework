## 1. Add a French word list
Create public/french-words.json with Swedish–French pairs, matching the structure of the existing words.json. Keep the English list as it is.

## 2. Make the word-practice language selectable
Add an English/French choice to the word-practice UI in Header.jsx. Keep irregular verbs and sentence practice as they are; the language choice applies to word translation.

## 3. Load the selected list
Update wordsModule.js and App.jsx to load the English or French list based on the selection. Switching languages should reset the current question, answer, feedback, and score.

## 4. Always ask Swedish → selected language
Update WordsCard.jsx to display a Swedish prompt and ask for an English or French translation. Remove the random translation direction. Update validationModule.js to check against the selected target-language field.

## 5. Update labels and documentation
Adjust the word-mode labels and README.md so they describe both language options.

## 6. Verify both modes
Run the production build and manually check a few English and French questions, including switching languages and restarting a quiz.