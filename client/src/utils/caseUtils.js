/**
 * Utility functions for handling case normalization
 * for subjects and difficulty levels
 */

/**
 * Normalize subject names for display
 * @param {string} subject - The subject name from database
 * @returns {string} - Normalized subject name
 */
export function normalizeSubject(subject) {
  if (!subject) return '';
  
  // Map of abbreviations to full names (exact database values)
  const subjectMap = {
    'cn': 'Computer Networks',
    'ds': 'Data Structures', 
    'dbms': 'DBMS',
    'html & css': 'HTML & CSS',
    'java': 'Java',
    'javascript': 'JavaScript',
    'node.js & express.js': 'Node.js & Express.js',
    'oops': 'OOPs',
    'operating systems': 'Operating Systems',
    'python': 'Python',
    'react.js': 'React.js'
  };
  
  const lowerSubject = subject.toLowerCase();
  return subjectMap[lowerSubject] || subject;
}

/**
 * Normalize difficulty levels for display
 * @param {string} difficulty - The difficulty level from database
 * @returns {string} - Normalized difficulty level
 */
export function normalizeDifficulty(difficulty) {
  if (!difficulty) return '';
  
  const difficultyMap = {
    'easy': 'Easy',
    'medium': 'Medium', 
    'difficult': 'Difficult'
  };
  
  const lowerDifficulty = difficulty.toLowerCase();
  return difficultyMap[lowerDifficulty] || difficulty;
}

/**
 * Get display-friendly subject list from database subjects
 * @param {string[]} subjects - Array of subjects from database
 * @returns {string[]} - Array of normalized subjects
 */
export function getNormalizedSubjects(subjects) {
  return subjects.map(normalizeSubject);
}

/**
 * Get display-friendly difficulty list from database difficulties
 * @param {string[]} difficulties - Array of difficulties from database
 * @returns {string[]} - Array of normalized difficulties
 */
export function getNormalizedDifficulties(difficulties) {
  return difficulties.map(normalizeDifficulty);
}

/**
 * Create a case-insensitive search function for subjects
 * @param {string} searchSubject - Subject to search for
 * @returns {function} - Function that checks if a subject matches
 */
export function createSubjectMatcher(searchSubject) {
  const normalizedSearch = searchSubject.toLowerCase();
  return (subject) => subject.toLowerCase() === normalizedSearch;
}

/**
 * Create a case-insensitive search function for difficulties
 * @param {string} searchDifficulty - Difficulty to search for
 * @returns {function} - Function that checks if a difficulty matches
 */
export function createDifficultyMatcher(searchDifficulty) {
  const normalizedSearch = searchDifficulty.toLowerCase();
  return (difficulty) => difficulty.toLowerCase() === normalizedSearch;
}
