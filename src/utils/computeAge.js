/**
 * Compute age, returns age
 * @param {string} birth_date // string date YYYY-MM-DD
 */

export default function computeAge(birthDate) {
  if (!birthDate || typeof birthDate !== 'string') {
    throw new Error('You must provide a string !');
  }

  const parsedBirhDate = new Date(birthDate);
  if (isNaN(parsedBirhDate.getTime())) {
    throw new Error('You must provide a valid ISO date format YYYY-MM-DD');
  }

  const now = new Date().getTime();
  return Math.floor((now - new Date(birthDate).getTime()) / 3.15576e10);
}
