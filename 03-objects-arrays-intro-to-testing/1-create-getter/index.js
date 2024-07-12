/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  const splitPaths = path ? path.split('.') : [];

  return (obj) => splitPaths.reduce((acc, key) => {
    return (acc && acc.hasOwnProperty(key)) ? acc[key] : undefined;
  }, obj);
}
