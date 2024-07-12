/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (size <= 0 || !string) {
    return '';
  }

  if (!size) {
    return string;
  }

  let charCount = 0;
  let result = '';
  let prevChar = '';

  for (const char of string) {
    charCount = prevChar === char ? charCount : 0;

    if (charCount < size) {
      result = `${result}${char}`;
      charCount++;
    }

    prevChar = char;
  }

  return result;
}
