/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const options = { caseFirst: "upper" };

  return [...arr].sort((a, b) => {
    return param === 'asc'
      ? a.localeCompare(b, undefined, options)
      : b.localeCompare(a, undefined, options);
  });
}
