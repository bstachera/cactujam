/**
 * GAME_TEXTS - All game texts, UI labels, and localized strings
 * Theme: Naked man + Valentine + Thickness
 * 
 * This file contains all translatable text used in the game.
 * Edit these values to customize the game's text without modifying game.js
 */

window.GAME_TEXTS = window.GAME_TEXTS || {};

// ============================================
// MENU LABELS
// ============================================

window.GAME_TEXTS.menuLabels = [
  "NOWA GRA",           // New Game
  "ZAPISY",             // Saves
  "USTAWIENIA",        // Settings
  "O GRZE / CREDITS"   // About / Credits
];

// ============================================
// TITLE SCREEN
// ============================================

window.GAME_TEXTS.titleLines = [
  "Naga miłość Stasia: Wypędzony",
  "",
  "Staś po wygnaniu z Raju. idzie nazwalc sie z zakochanymi krolikami ktore chca go utuczyć i zabić",
  "Niebieskie Oko, ciągle go obserwuje i karze za nagość",
  "Staś: Nagość to prawda!",
  "",
  "Ruch: WASD / strzalki",
  "Skok: Spacja | Strzal: LPM",
  "",
  "Enter / Spacja / LPM - start",
];

// ============================================
// LEVEL NAMES
// ============================================

window.GAME_TEXTS.levelNames = {
  1: "Ogrod Wypedzonych",
  2: "Serce i Ciernie",
  3: "Bagna Wspomnien",
  4: "Pekniete Sanktuarium",
  5: "Wieza Powrotu",
  6: "Inkwizycja",
  7: "Brama Niebieskiego Oka",
};

// ============================================
// UPGRADE TEXTS
// ============================================

window.GAME_TEXTS.upgrades = {
  metabolism_burst: {
    name: "Spalacz Tluszczu",
    shortName: "Spalacz",
    description: "Q: Chwile topisz tłuszcz + lepsza odpornosc cukier",
  },
  thin_air_dash: {
    name: "Skok+",
    shortName: "Skok+",
    description: "Ddatkowy podskok w powietrzu (Spacja)",
  },
  reactive_combat: {
    name: "Kolce+",
    shortName: "Kolce+",
    description: "Po oberwaniu HP wybuchaja kolce.",
  },
  spike_ballistics: {
    name: "Luk+",
    shortName: "Luk+",
    description: "Lepsza balistyka kolcow: dalej i prościej",
  },
  sugar_guard: {
    name: "Cukrowa Tarcza",
    shortName: "Tarcza",
    description: "Ochrona czekoladowymi pociskami",
  },
};

// ============================================
// ACHIEVEMENT TEXTS
// ============================================

window.GAME_TEXTS.achievements = {
  boot_sequence: {
    name: "Zimny Start",
    desc: "Uruchomiono CES.",
  },
  first_bunny: {
    name: "Lamacz Serc",
    desc: "Pokonaj pierwszego Traniego",
  },
  shopper: {
    name: "Kaktus Zakupowy",
    desc: "Kup 3 ulepszenia.",
  },
  fat_stage_heavy: {
    name: "Za Duzo Czekolady",
    desc: "Osiagnij etap HEAVY.",
  },
  boss_win: {
    name: "Wyjscie z Raju",
    desc: "Pokonaj bossa z poziomu 7.",
  },
};

// ============================================
// UI BUTTON TEXTS
// ============================================

window.GAME_TEXTS.ui = {
  pause: "PAUZA",
  resume: "KONTYNUUJ",
  quit: "WYJDZ",
  settings: "USTAWIENIA",
  controls: "USTAWIENIA STEROWANIA",
  saves: "ZAPISY",
  savesEmpty: "Sloty zapisu: [SOON ALPHA BETA]",
  upgrade: "ULEPSZENIA",
  upgradeTitle: "SKLEP ULEPSZEN",
  gameOver: "Zostales Donica - GAME OVER",
  credits: "O GRZE / CREDITS",
  back: "WROC",
  accept: "TAK",
  cancel: "NIE",
};

// ============================================
// DIALOGUE TEXT OVERRIDES
// ============================================

// Use this to override specific dialogue lines without modifying the dialogue files
window.GAME_TEXTS.dialogues = {
  // Example usage:
  // intro_cutscene: [
  //   { speakerId: "blueeye", text: "Custom text here" },
  // ],
};

// ============================================
// FATNESS / BODY TYPE NAMES
// ============================================

window.GAME_TEXTS.fatnessNames = {
  FIT: "FIT",
  CHUBBY: "CHUBBY",
  HEAVY: "HEAVY",
};

// ============================================
// GAME STATE MESSAGES
// ============================================

window.GAME_TEXTS.messages = {
  hp: "HP",
  coins: "Monety",
  level: "Poziom",
  continue: "Kontynuuj...",
  pressAnyKey: "Nacisnij dowolny klawisz",
  loading: "Ładowanie...",
  saving: "Zapisywanie...",
  saved: "Zapisano!",
};

// ============================================
// ENEMY NAMES
// ============================================

window.GAME_TEXTS.enemies = {
  heart_rabbit: "Trani",
  choco_rabbit: "Szokobons",
  boss_cupid_cactus: "Kupidon Kaktus",
};

// ============================================
// TUTORIAL TEXTS
// ============================================

window.GAME_TEXTS.tutorial = {
  movement: "Ruch: WASD / strzalki",
  jump: "Skok: Spacja",
  shoot: "Strzal: LPM",
  interact: "Interakcja: E",
  pause: "Pauza: ESC",
};

// ============================================
// FINAL TEXT (ENDINGS)
// ============================================

window.GAME_TEXTS.endings = {
  goodEnding: "Wolność",
  badEnding: "Niewola",
};

// Export for verification
if (typeof module !== 'undefined' && module.exports) {
  module.exports = window.GAME_TEXTS;
}
