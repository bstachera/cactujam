/**
 * DIALOGUES - All game dialogues in one place
 * Theme: Naked man + Valentine + Thickness
 */

// Character manifest - defines all characters with their sprites, voices, and portraits
const CHARACTER_MANIFEST = {
  narrator: { 
    name: "KSIĘŻYC", 
    npc: "blueeye", 
    voice: "talkMid", 
    portrait: "blueeye" 
  },
  blueeye: { 
    name: "THE GOD", 
    npc: "blueeye", 
    voice: "talkLow", 
    portrait: "blueeye" 
  },
  cactus: { 
    name: "Cactus", 
    npc: "cactus", 
    voice: "talkLow", 
    portrait: "cactus" 
  },
  mirek: { 
    name: "Mirek", 
    npc: "ragebun", 
    voice: "talkHigh", 
    portrait: "survivor" 
  },
  szokobons: { 
    name: "SzokoBons", 
    npc: "szokobons", 
    voice: "talkHigh", 
    portrait: "szokobons" 
  },
  trani: { 
    name: "Trani", 
    npc: "ragebun", 
    voice: "talkHigh", 
    portrait: "ragebun" 
  },
  redbunny: { 
    name: "RedBunny", 
    npc: "ragebun", 
    voice: "talkHigh", 
    portrait: "redbunny" 
  },
  oskar: { 
    name: "Oskar", 
    npc: "cactus", 
    voice: "talkLow", 
    portrait: "survivor" 
  },
  bruno: { 
    name: "Bruno", 
    npc: "cactus", 
    voice: "talkLow", 
    portrait: "survivor" 
  },
  leon: { 
    name: "Leon", 
    npc: "cactus", 
    voice: "talkLow", 
    portrait: "survivor" 
  },
  dawid: { 
    name: "Dawid", 
    npc: "cactus", 
    voice: "talkLow", 
    portrait: "survivor" 
  },
  viktor: { 
    name: "Viktor", 
    npc: "cactus", 
    voice: "talkLow", 
    portrait: "survivor" 
  },
};

// Helper function to create a dialogue line
function sceneLine(speakerId, text, options = {}) {
  const manifest = CHARACTER_MANIFEST[speakerId] || CHARACTER_MANIFEST.narrator;
  return {
    speakerId,
    speakerName: options.speakerName || manifest.name,
    text,
    sfxKey: options.sfxKey || manifest.voice,
    portraitId: options.portraitId || manifest.portrait,
    npc: options.npc || manifest.npc,
  };
}

// All dialogue scenes in the game
const DIALOGUE_SCENES = {
  intro_cutscene: {
    id: "intro_cutscene",
    allowSkip: true,
    lines: [
      sceneLine("blueeye", "Masz bana! Dopóki się czegoś nie nauczysz zostajesz nagim nygusem."),
      sceneLine("cactus", "N... nie mam spodni?"),
      sceneLine("blueeye", "To jest donica i kick. Brama Raju zostaje dla ciebie zamknięta."),
      sceneLine("cactus", "Twój regulamin nie zasloni prawdy."),
      sceneLine("narrator", "[Metalowa brama zatrzaskuje sie za plecami Stasia]"),
      sceneLine("cactus", "Jeszcze zobaczymy kto kogo będzie wychowywał!"),
    ],
  },
  blue_eye_intro: {
    id: "blue_eye_intro",
    allowSkip: true,
    lines: [
      sceneLine("blueeye", "Wypędzenie z mojego królestwa to dopiero początek."),
      sceneLine("blueeye", "Przejdz przez Szklarnie, Serce i Bagna, potem Sanktuarium i wiee."),
      sceneLine("cactus", "A na końcu znowu donica? znowu ban i mute? Jeszcze zobaczymy kto...."),
    ],
  },
  rabbit_meet: {
    id: "rabbit_meet",
    allowSkip: true,
    lines: [
      sceneLine("mirek", "Schowaj się z tym pindolem! Inkwizycja patrzy!"),
      sceneLine("cactus", "Nie schowam go. Jedynie chowam sie przed głupotą."),
    ],
  },
  szokobons_meet: {
    id: "szokobons_meet",
    allowSkip: true,
    lines: [
      sceneLine("szokobons", "Roztyj swoje ciało i zjedz czekoladke."),
      sceneLine("cactus", "Próbujecie mnie udobruchać czy dać mi cukrzycę?"),
    ],
  },
  ragebun_meet: {
    id: "ragebun_meet",
    allowSkip: true,
    lines: [
      sceneLine("trani", "Odrzucłeś porzadek. Odrzuciłes mnie! Na zawsze to zapamiętasz! a masz!"),
      sceneLine("cactus", "Twoje ciało twoja sprawa"),
    ],
  },
  eye_warning: {
    id: "eye_warning",
    allowSkip: true,
    lines: [
      sceneLine("blueeye", "Twoje zbereźne zachowanie to piętno. Wróć do poprzedniego porządku."),
      sceneLine("cactus", "Nie potrzebuje spodni, zeby okazywać godność."),
    ],
  },
  level2_start: {
    id: "level2_start",
    allowSkip: true,
    lines: [
      sceneLine("trani", "Gdzie się ukrywasz nagi ocaleńcu?! twoje emocje nie mają dla mnie wartości!"),
      sceneLine("oskar", "Wstydzę się swojej nagości, ale nie pozwolę, żeby ktoś mi mówił co mam robić!"),
    ],
  },
  level3_start: {
    id: "level3_start",
    allowSkip: true,
    lines: [
      sceneLine("bruno", "Wstydze sie ciala. Nie patrze ludziom w oczy."),
      sceneLine("cactus", "Najpierw patrz na droge którą dązysz. Potem na siebie."),
    ],
  },
  level4_start: {
    id: "level4_start",
    allowSkip: true,
    lines: [
      sceneLine("dawid", "Chce wracać, przyjmijcie mnie! Tu jest zimno i.. Goło??"),
      sceneLine("cactus", "Raj, który karze za prawdę, nie jest moim domem."),
    ],
  },
  level5_start: {
    id: "level5_start",
    allowSkip: true,
    lines: [
      sceneLine("viktor", "Na końcu nie ma ratunku. Ta jest SĄD"),
      sceneLine("cactus", "To wystarczy, zniszcze ten SĄD."),
    ],
  },
  level5_end: {
    id: "level5_end",
    allowSkip: true,
    lines: [
      sceneLine("blueeye", "To dopiero wstęp do finalu."),
      sceneLine("cactus", "Wiem... ale to już jest mój świat, nie twój."),
    ],
  },
  level6_start: {
    id: "level6_start",
    allowSkip: true,
    lines: [
      sceneLine("redbunny", "Przed moja kontrolą nic sie nie ukryje."),
      sceneLine("cactus", "To nie porzadek. To tresura."),
    ],
  },
  level6_end: {
    id: "level6_end",
    allowSkip: true,
    lines: [
      sceneLine("blueeye", "Brama Nieba juz czeka."),
      sceneLine("cactus", "To nie niebo, to twoj sad."),
    ],
  },
  level7_start: {
    id: "level7_start",
    allowSkip: true,
    lines: [
      sceneLine("blueeye", "Wróc do porzadku, a dam ci spokoj."),
      sceneLine("cactus", "Nie chce spokoju. chce... wolności!"),
    ],
  },
  level7_end: {
    id: "level7_end",
    allowSkip: false,
    lines: [
      sceneLine("blueeye", "Bez moich zasad jesteście nikim!"),
      sceneLine("cactus", "Bez twoich zasad jesteśmy soba."),
    ],
  },
};

// Level to dialogue scene mapping
const LEVEL_SCENE_MAP = {
  1: { start: "blue_eye_intro" },
  2: { start: "level2_start" },
  3: { start: "level3_start" },
  4: { start: "level4_start" },
  5: { start: "level5_start", end: "level5_end" },
  6: { start: "level6_start", end: "level6_end" },
  7: { start: "level7_start", end: "level7_end" },
};

// Shortcut references for easy access
const INTRO_DIALOGUE = DIALOGUE_SCENES.intro_cutscene;
const FIRST_RABBIT_DIALOGUE = DIALOGUE_SCENES.rabbit_meet;
const CHOCO_DIALOGUE = DIALOGUE_SCENES.szokobons_meet;
const RAGE_DIALOGUE = DIALOGUE_SCENES.ragebun_meet;
const BLUE_EYE_INTRO_DIALOGUE = DIALOGUE_SCENES.blue_eye_intro;
const EYE_DIALOGUE = DIALOGUE_SCENES.eye_warning;

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CHARACTER_MANIFEST,
    DIALOGUE_SCENES,
    LEVEL_SCENE_MAP,
    sceneLine,
    INTRO_DIALOGUE,
    FIRST_RABBIT_DIALOGUE,
    CHOCO_DIALOGUE,
    RAGE_DIALOGUE,
    BLUE_EYE_INTRO_DIALOGUE,
    EYE_DIALOGUE,
  };
}

// Also expose to window for browser usage
if (typeof window !== 'undefined') {
  window.CHARACTER_MANIFEST = CHARACTER_MANIFEST;
  window.DIALOGUE_SCENES = DIALOGUE_SCENES;
  window.LEVEL_SCENE_MAP = LEVEL_SCENE_MAP;
  window.sceneLine = sceneLine;
  window.INTRO_DIALOGUE = INTRO_DIALOGUE;
  window.FIRST_RABBIT_DIALOGUE = FIRST_RABBIT_DIALOGUE;
  window.CHOCO_DIALOGUE = CHOCO_DIALOGUE;
  window.RAGE_DIALOGUE = RAGE_DIALOGUE;
  window.BLUE_EYE_INTRO_DIALOGUE = BLUE_EYE_INTRO_DIALOGUE;
  window.EYE_DIALOGUE = EYE_DIALOGUE;
}
