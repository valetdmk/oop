import { template } from "./baseline";

export const renderWordList = (wordlist) => {
  const tpl = template('word-list');
  return tpl.replace(
    '<tr></tr>',
    wordlist.words.map(renderWord).join(''));
}

export const renderWord = (word) => {
  const tpl = template('table-row');
  return tpl.
    replace('%word', word.word).
    replace('%description', word.description);
}

export const renderAddForm = () => {
  return template('add-form');
}