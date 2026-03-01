/**
 * Gender Reveal Scratch-Off Game — Configuration
 *
 * Set the gender and personalize the text below.
 * Everything else (colors, emojis, animations) is automatically
 * derived from the gender. All fields except `gender` are optional.
 */
var REVEAL_CONFIG = {

  // The baby's gender: 'boy' or 'girl'
  gender: 'girl',

  // Text displayed on the page
  title: 'Baby Gender Reveal',
  subtitle: 'Scratch to find out!',

  // Celebration screen (set to null to hide)
  dueDate: null,            // e.g. 'Coming July 2026'
  parentNames: null,        // e.g. 'Alex & Jordan'
  celebrationImage: null,   // e.g. 'ultrasound.png'

  // Social media link preview image (full URL, or null to omit)
  ogImage: null,

  // Rigged mode (?rigged in URL): predetermined reveal order for drama.
  // The winning gender must appear in the majority (5 of 9).
  riggedSequence: ['girl', 'girl', 'boy', 'boy', 'boy', 'boy', 'girl', 'girl', 'girl'],
};
