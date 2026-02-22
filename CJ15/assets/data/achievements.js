/**
 * ACHIEVEMENTS - All achievement definitions
 * Contains achievement IDs, names, and descriptions
 */

const ACHIEVEMENT_DEFS = [
  { id: "boot_sequence", name: "Cold Start", desc: "Uruchomiono pierwszy raz kaktusową konsolę" },
  { id: "first_bunny", name: "Łamacz Serc", desc: "Pokonaj pierwszego TRANiego" },
  { id: "shopper", name: "Szał Zakupów", desc: "Kup 3 ulepszenia." },
  { id: "fat_stage_heavy", name: "Jesteś grubasem", desc: "Jesteś spasiony czekoladkami." },
  { id: "boss_win", name: "ZWYCIĘSTWOOOO", desc: "Pokonaj bossa z poziomu 7." },
];

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ACHIEVEMENT_DEFS,
  };
}

// Also expose to window for browser usage
if (typeof window !== 'undefined') {
  window.ACHIEVEMENT_DEFS = ACHIEVEMENT_DEFS;
}
