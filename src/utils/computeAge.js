/**
 * Compute age, returns age
 * @param {string} birth_date // string date YYYY-MM-DD
 */

export function computeAge(birthDate) {
  return Math.floor((new Date() - new Date(birthDate).getTime()) / 3.15576e10);
}
