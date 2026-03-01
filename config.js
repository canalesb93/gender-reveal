/**
 * Gender Reveal Scratch-Off Game — Configuration
 *
 * Edit the values below to customize your gender reveal experience.
 * All fields are optional — sensible defaults are used when omitted.
 */
var REVEAL_CONFIG = {

  // ─── Gender ────────────────────────────────────────────────────────
  // The baby's gender: 'boy' or 'girl'. This determines the winning side.
  gender: 'girl',

  // ─── Display Text ──────────────────────────────────────────────────
  // Main heading shown above the scratch grid.
  title: "Baby Gender Reveal",

  // Smaller text below the title.
  subtitle: "Scratch to find out!",

  // Text shown on the celebration screen after the reveal.
  celebrationText: "It's a Girl!",

  // Optional additional info on the celebration screen (e.g. due date).
  // Set to null or '' to hide.
  dueDate: null,

  // Names shown at the bottom of the celebration screen.
  // Set to null or '' to hide.
  parentNames: null,

  // ─── Grid ──────────────────────────────────────────────────────────
  // Total number of cells. Must be odd so there's always a majority.
  // Common values: 9 (3×3), 25 (5×5). The grid columns adjust automatically.
  gridSize: 9,

  // ─── Emojis ────────────────────────────────────────────────────────
  // Emoji shown on boy and girl scratch pads after reveal.
  boyEmoji: '\u{1F466}',   // 👦
  girlEmoji: '\u{1F467}',  // 👧

  // ─── Colors ────────────────────────────────────────────────────────
  // Cell background gradients [start, end] for each gender.
  boyColors: {
    cellBg:       ['#B8E0F7', '#87CEEB'],
    progressFill: ['#87CEEB', '#5BA3D9'],
    ringPulse:    '#5BA3D9',
    confetti:     ['#87CEEB', '#5BA3D9', '#4FC3F7', '#81D4FA', '#29B6F6'],
  },

  girlColors: {
    cellBg:       ['#FFDAE0', '#FFB6C1'],
    progressFill: ['#FFB6C1', '#E891A0'],
    ringPulse:    '#E891A0',
    confetti:     ['#FFB6C1', '#FF69B4', '#FF1493', '#FFC0CB', '#FF6B9D'],
  },

  // Background color for the celebration overlay (with alpha for blur-through).
  celebrationBg: 'rgba(255, 182, 193, 0.88)',

  // Colors for the explosive confetti bursts on the celebration screen.
  // Omit to auto-derive from the winning gender's color palette.
  // confettiColors: ['#FFB6C1', '#FF69B4', '#FF1493', '#FFC0CB', '#FFD700'],

  // ─── Celebration Emoji Rain ────────────────────────────────────────
  // Emojis that slowly drift down behind the celebration content.
  // Use well-supported Unicode emojis to avoid rendering issues on iOS.
  rainEmojis: [
    '\u{1F467}', '\u{1F476}', '\u{1F380}', '\u{1F495}',  // 👧👶🎀💕
    '\u{1F338}', '\u{1F496}', '\u{2728}', '\u{1F31F}',    // 🌸💖✨🌟
    '\u{1F37C}', '\u{1F49E}', '\u{1F389}', '\u{1F339}',   // 🍼💞🎉🌹
    '\u{2764}\u{FE0F}', '\u{1F490}',                       // ❤️💐
  ],

  // ─── Celebration Image ─────────────────────────────────────────────
  // Path to an image shown on the celebration screen (e.g. ultrasound photo).
  // Set to null to hide the image entirely.
  celebrationImage: null,
  celebrationImageAlt: 'Baby scan',

  // ─── Social Sharing / Open Graph ───────────────────────────────────
  // URL to a preview image for social media link cards.
  // Set to null to omit OG image tags.
  ogImage: null,

  // Text used when sharing via the native share dialog or clipboard.
  shareTitle: "Baby Gender Reveal",
  shareText: "Scratch to find out! \u{1F476}",

  // ─── Rigged Mode ──────────────────────────────────────────────────
  // When the URL contains ?rigged, cards are revealed in this order
  // instead of randomly. This creates a dramatic narrative arc.
  // Length must equal gridSize. The winning gender must appear in the
  // majority (e.g. 5 out of 9).
  riggedSequence: ['girl', 'girl', 'boy', 'boy', 'boy', 'boy', 'girl', 'girl', 'girl'],
};
