(() => {
  const GAME_WIDTH = 480;
  const GAME_HEIGHT = 320;
  const FIXED_DT = 1 / 60;
  const GRAVITY = 520;
  const CLICK_DEBOUNCE_SEC = 0.14;
  const DIALOGUE_CHARS_PER_SECOND = 52;

  const DIALOGUE_PHASE = {
    OPEN: "OPEN",
    LINE_TYPING: "LINE_TYPING",
    LINE_SHOW: "LINE_SHOW",
    NEXT: "NEXT",
    END: "END",
    RETURN_MODE: "RETURN_MODE",
  };

  const MODE = {
    POWER_OFF: "power_off",
    BOOT: "boot",
    MENU: "menu",
    SETTINGS: "settings",
    ABOUT: "about",
    SAVES: "saves",
    TITLE: "title",
    PLAYING: "playing",
    PAUSED: "paused",
    UPGRADE: "upgrade",
    DIALOGUE: "dialogue",
    ENDING: "ending",
    ENDING_CHOICE: "ending_choice",
    GAME_OVER: "game_over",
    ACHIEVEMENT: "achievement",
  };

  const GAME_TEXTS = window.GAME_TEXTS || {};
  const MENU_LABELS = Array.isArray(GAME_TEXTS.menuLabels) && GAME_TEXTS.menuLabels.length >= 4
    ? GAME_TEXTS.menuLabels.slice(0, 4)
    : ["NOWA GRA", "ZAPISY", "USTAWIENIA", "O GRZE / CREDITS"];
  const UPGRADE_TEXTS = GAME_TEXTS.upgrades || {};
  const LEVEL_NAME_TEXTS = GAME_TEXTS.levelNames || {};
  const DIALOGUE_TEXT_OVERRIDES = GAME_TEXTS.dialogues || {};

  // Use FATNESS from characters.js module
  const FATNESS = window.FATNESS || [
    {
      name: "FIT",
      speed: 96,
      accel: 800,
      jump: 192,
      airControl: 0.74,
      shootCooldown: 0.32,
      hitboxScale: 1,
      color: "#56de69",
    },
    {
      name: "CHUBBY",
      speed: 76,
      accel: 640,
      jump: 168,
      airControl: 0.58,
      shootCooldown: 0.44,
      hitboxScale: 1.14,
      color: "#46bb5a",
    },
    {
      name: "HEAVY",
      speed: 58,
      accel: 520,
      jump: 146,
      airControl: 0.46,
      shootCooldown: 0.56,
      hitboxScale: 1.3,
      color: "#319145",
    },
  ];

  const UPGRADE_DEFS = [
    {
      id: "metabolism_burst",
      key: "1",
      icon: "M",
      name: UPGRADE_TEXTS.metabolism_burst?.name || "Spalacz Tluszczu",
      shortName: UPGRADE_TEXTS.metabolism_burst?.shortName || "Spalacz",
      cost: 12,
      description: UPGRADE_TEXTS.metabolism_burst?.description || "Q: przez chwile topisz tluszczyk i masz lepsza odpornosc na slodycze",
      kind: "active_metabolism",
      repeatable: true,
      maxStacks: 5,
    },
    {
      id: "thin_air_dash",
      key: "2",
      icon: "J",
      name: UPGRADE_TEXTS.thin_air_dash?.name || "Skok+",
      shortName: UPGRADE_TEXTS.thin_air_dash?.shortName || "Skok+",
      cost: 10,
      description: UPGRADE_TEXTS.thin_air_dash?.description || "Lepszy skok i dodatkowy podskok w powietrzu (Spacja)",
      kind: "jump_boost",
      repeatable: false,
      maxStacks: 1,
    },
    {
      id: "reactive_combat",
      key: "3",
      icon: "R",
      name: UPGRADE_TEXTS.reactive_combat?.name || "Kolce+",
      shortName: UPGRADE_TEXTS.reactive_combat?.shortName || "Kolce+",
      cost: 14,
      description: UPGRADE_TEXTS.reactive_combat?.description || "Po oberwaniu HP wybuchaja kolce. Wiekszy poziom = wiekszy bzik i dmg",
      kind: "reactive_combat",
      repeatable: true,
      maxStacks: 5,
    },
    {
      id: "two_hearts",
      key: "4",
      icon: "H",
      name: "Dwa Serca",
      shortName: "2 HP",
      cost: 12,
      description: "Leczy od razu +2 HP (jedna akcja).",
      kind: "heal_hearts",
      repeatable: false,
      maxStacks: 1,
    },
    {
      id: "spike_ballistics",
      key: "5",
      icon: "A",
      name: UPGRADE_TEXTS.spike_ballistics?.name || "Luk+",
      shortName: UPGRADE_TEXTS.spike_ballistics?.shortName || "Luk+",
      cost: 11,
      description: UPGRADE_TEXTS.spike_ballistics?.description || "Lepsza balistyka kolcow: dalej i plaskiej. Podstawa to lot po luku.",
      kind: "spike_ballistics",
      repeatable: true,
      maxStacks: 4,
    },
  ];

  const LEVELS = [
    {
      id: 1,
      name: "Ogrod Wypedzonych",
      worldWidth: 860,
      spawn: { x: 24, y: 190 },
      exit: { x: 818, y: 182, w: 28, h: 38 },
      reward: 10,
      tutorialZones: {
        movementX: 74,
        jumpY: 182,
        shootX: 200,
        dodgeX: 260,
        interactX: 770,
      },
      hazards: [
        { id: "l1-h1", x: 300, y: 220, w: 52, h: 20, type: "spike" },
      ],
      platforms: [
        { x: 0, y: 220, w: 860, h: 20 },
        { x: 84, y: 188, w: 52, h: 10 },
        { x: 170, y: 166, w: 48, h: 10 },
        { x: 254, y: 148, w: 48, h: 10 },
        { x: 380, y: 176, w: 66, h: 10 },
        { x: 498, y: 154, w: 56, h: 10 },
        { x: 606, y: 136, w: 52, h: 10 },
        { x: 708, y: 164, w: 58, h: 10 },
      ],
      enemies: [
        { x: 240, y: 132, hp: 3, archetype: "heart_rabbit", attackPatternId: "heart_snap" },
        { x: 530, y: 138, hp: 3, archetype: "choco_rabbit", attackPatternId: "choco_lob" },
        { x: 724, y: 148, hp: 2, archetype: "heart_rabbit", attackPatternId: "heart_snap" },
      ],
    },
    {
      id: 2,
      name: "Serce i Ciernie",
      worldWidth: 980,
      spawn: { x: 26, y: 190 },
      exit: { x: 936, y: 182, w: 28, h: 38 },
      reward: 8,
      hazards: [
        { id: "l2-h1", x: 338, y: 220, w: 64, h: 20, type: "spike" },
        { id: "l2-h2", x: 650, y: 220, w: 52, h: 20, type: "spike" },
      ],
      platforms: [
        { x: 0, y: 220, w: 980, h: 20 },
        { x: 92, y: 186, w: 46, h: 10 },
        { x: 180, y: 162, w: 48, h: 10 },
        { x: 260, y: 140, w: 52, h: 10 },
        { x: 412, y: 174, w: 54, h: 10 },
        { x: 518, y: 152, w: 58, h: 10 },
        { x: 598, y: 126, w: 50, h: 10 },
        { x: 742, y: 166, w: 62, h: 10 },
        { x: 850, y: 142, w: 52, h: 10 },
      ],
      enemies: [
        { x: 184, y: 146, hp: 3, archetype: "heart_rabbit", attackPatternId: "heart_snap" },
        { x: 308, y: 124, hp: 4, archetype: "choco_rabbit", attackPatternId: "choco_arc" },
        { x: 550, y: 136, hp: 4, archetype: "heart_rabbit", attackPatternId: "heart_burst" },
        { x: 628, y: 110, hp: 3, archetype: "choco_rabbit", attackPatternId: "choco_lob" },
        { x: 864, y: 126, hp: 3, archetype: "heart_rabbit", attackPatternId: "heart_snap" },
      ],
    },
    {
      id: 3,
      name: "Bagna Wspomnien",
      worldWidth: 1060,
      spawn: { x: 24, y: 190 },
      exit: { x: 1018, y: 182, w: 28, h: 38 },
      reward: 9,
      hazards: [
        { id: "l3-h1", x: 280, y: 220, w: 62, h: 20, type: "spike" },
        { id: "l3-h2", x: 524, y: 220, w: 64, h: 20, type: "spike" },
        { id: "l3-h3", x: 804, y: 220, w: 58, h: 20, type: "spike" },
      ],
      platforms: [
        { x: 0, y: 220, w: 1060, h: 20 },
        { x: 76, y: 182, w: 44, h: 10 },
        { x: 158, y: 158, w: 44, h: 10 },
        { x: 240, y: 132, w: 42, h: 10 },
        { x: 352, y: 170, w: 54, h: 10 },
        { x: 460, y: 144, w: 52, h: 10 },
        { x: 612, y: 176, w: 58, h: 10 },
        { x: 706, y: 148, w: 46, h: 10 },
        { x: 872, y: 170, w: 56, h: 10 },
        { x: 944, y: 132, w: 44, h: 10 },
      ],
      enemies: [
        { x: 164, y: 142, hp: 4, archetype: "heart_rabbit", attackPatternId: "heart_snap" },
        { x: 262, y: 116, hp: 4, archetype: "choco_rabbit", attackPatternId: "choco_arc" },
        { x: 470, y: 128, hp: 5, archetype: "heart_rabbit", attackPatternId: "heart_burst" },
        { x: 620, y: 160, hp: 4, archetype: "choco_rabbit", attackPatternId: "choco_lob" },
        { x: 718, y: 132, hp: 4, archetype: "heart_rabbit", attackPatternId: "heart_snap" },
        { x: 956, y: 116, hp: 5, archetype: "choco_rabbit", attackPatternId: "choco_arc" },
      ],
    },
    {
      id: 4,
      name: "Pekniete Sanktuarium",
      worldWidth: 1180,
      spawn: { x: 28, y: 190 },
      exit: { x: 1136, y: 182, w: 28, h: 38 },
      reward: 11,
      hazards: [
        { id: "l4-h1", x: 248, y: 220, w: 80, h: 20, type: "spike" },
        { id: "l4-h2", x: 560, y: 220, w: 86, h: 20, type: "spike" },
        { id: "l4-h3", x: 896, y: 220, w: 78, h: 20, type: "spike" },
      ],
      platforms: [
        { x: 0, y: 220, w: 1180, h: 20 },
        { x: 78, y: 184, w: 48, h: 10 },
        { x: 160, y: 160, w: 50, h: 10 },
        { x: 242, y: 134, w: 44, h: 10 },
        { x: 374, y: 172, w: 56, h: 10 },
        { x: 494, y: 146, w: 52, h: 10 },
        { x: 612, y: 120, w: 42, h: 10 },
        { x: 740, y: 162, w: 56, h: 10 },
        { x: 846, y: 136, w: 50, h: 10 },
        { x: 988, y: 164, w: 58, h: 10 },
        { x: 1068, y: 126, w: 44, h: 10 },
      ],
      enemies: [
        { x: 164, y: 144, hp: 5, archetype: "heart_rabbit", attackPatternId: "heart_burst" },
        { x: 250, y: 118, hp: 5, archetype: "choco_rabbit", attackPatternId: "choco_arc" },
        { x: 502, y: 130, hp: 5, archetype: "choco_rabbit", attackPatternId: "choco_lob" },
        { x: 620, y: 104, hp: 5, archetype: "heart_rabbit", attackPatternId: "heart_burst" },
        { x: 756, y: 146, hp: 5, archetype: "heart_rabbit", attackPatternId: "heart_snap" },
        { x: 856, y: 120, hp: 5, archetype: "choco_rabbit", attackPatternId: "choco_arc" },
        { x: 1080, y: 110, hp: 6, archetype: "heart_rabbit", attackPatternId: "heart_burst" },
      ],
    },
    {
      id: 5,
      name: "Wieza Powrotu",
      worldWidth: 1220,
      spawn: { x: 50, y: 190 },
      exit: { x: 1150, y: 176, w: 30, h: 44 },
      reward: 16,
      hazards: [
        { id: "l5-h1", x: 282, y: 220, w: 78, h: 20, type: "spike" },
        { id: "l5-h2", x: 524, y: 220, w: 92, h: 20, type: "spike" },
        { id: "l5-h3", x: 824, y: 220, w: 90, h: 20, type: "spike" },
      ],
      platforms: [
        { x: 0, y: 220, w: 1220, h: 20 },
        { x: 132, y: 186, w: 48, h: 10 },
        { x: 212, y: 160, w: 48, h: 10 },
        { x: 332, y: 136, w: 50, h: 10 },
        { x: 436, y: 168, w: 54, h: 10 },
        { x: 640, y: 138, w: 60, h: 10 },
        { x: 748, y: 114, w: 54, h: 10 },
        { x: 924, y: 156, w: 64, h: 10 },
        { x: 1046, y: 130, w: 58, h: 10 },
      ],
      enemies: [
        { x: 252, y: 146, hp: 6, archetype: "heart_rabbit", attackPatternId: "heart_burst" },
        { x: 658, y: 122, hp: 6, archetype: "choco_rabbit", attackPatternId: "choco_arc" },
        { x: 946, y: 140, hp: 7, archetype: "heart_rabbit", attackPatternId: "heart_burst" }
      ],
      storySceneOnStart: "level5_start",
      storySceneOnEnd: "level5_end",
    },
    {
      id: 6,
      name: "Inkwizycja",
      worldWidth: 1360,
      spawn: { x: 42, y: 190 },
      exit: { x: 1298, y: 178, w: 30, h: 42 },
      reward: 18,
      hazards: [
        { id: "l6-h1", x: 210, y: 220, w: 96, h: 20, type: "spike" },
        { id: "l6-h2", x: 514, y: 220, w: 120, h: 20, type: "spike" },
        { id: "l6-h3", x: 868, y: 220, w: 128, h: 20, type: "spike" },
      ],
      platforms: [
        { x: 0, y: 220, w: 1360, h: 20 },
        { x: 124, y: 186, w: 50, h: 10 },
        { x: 226, y: 160, w: 48, h: 10 },
        { x: 342, y: 136, w: 44, h: 10 },
        { x: 486, y: 174, w: 58, h: 10 },
        { x: 640, y: 144, w: 54, h: 10 },
        { x: 770, y: 118, w: 50, h: 10 },
        { x: 930, y: 172, w: 62, h: 10 },
        { x: 1054, y: 146, w: 52, h: 10 },
        { x: 1170, y: 122, w: 50, h: 10 },
      ],
      enemies: [
        { x: 234, y: 146, hp: 7, archetype: "heart_rabbit", attackPatternId: "heart_burst" },
        { x: 500, y: 160, hp: 7, archetype: "choco_rabbit", attackPatternId: "choco_arc" },
        { x: 650, y: 128, hp: 7, archetype: "heart_rabbit", attackPatternId: "heart_snap" },
        { x: 948, y: 156, hp: 8, archetype: "choco_rabbit", attackPatternId: "choco_lob" },
        { x: 1182, y: 106, hp: 8, archetype: "heart_rabbit", attackPatternId: "heart_burst" },
      ],
      storySceneOnStart: "level6_start",
      storySceneOnEnd: "level6_end",
    },
    {
      id: 7,
      name: "Brama Niebieskiego Oka",
      worldWidth: 1480,
      spawn: { x: 52, y: 188 },
      exit: { x: 1408, y: 168, w: 38, h: 52 },
      reward: 24,
      hazards: [
        { id: "l7-h1", x: 276, y: 220, w: 112, h: 20, type: "spike" },
        { id: "l7-h2", x: 626, y: 220, w: 118, h: 20, type: "spike" },
        { id: "l7-h3", x: 984, y: 220, w: 132, h: 20, type: "spike" },
      ],
      platforms: [
        { x: 0, y: 220, w: 1480, h: 20 },
        { x: 140, y: 186, w: 54, h: 10 },
        { x: 258, y: 162, w: 52, h: 10 },
        { x: 392, y: 134, w: 48, h: 10 },
        { x: 558, y: 178, w: 62, h: 10 },
        { x: 708, y: 146, w: 58, h: 10 },
        { x: 860, y: 120, w: 52, h: 10 },
        { x: 1038, y: 172, w: 66, h: 10 },
        { x: 1204, y: 142, w: 62, h: 10 },
        { x: 1328, y: 110, w: 56, h: 10 },
      ],
      enemies: [
        { x: 272, y: 148, hp: 8, archetype: "heart_rabbit", attackPatternId: "heart_burst" },
        { x: 582, y: 162, hp: 8, archetype: "choco_rabbit", attackPatternId: "choco_arc" },
        { x: 884, y: 104, hp: 9, archetype: "heart_rabbit", attackPatternId: "heart_snap" },
        { x: 1224, y: 126, hp: 9, archetype: "choco_rabbit", attackPatternId: "choco_lob" },
      ],
      storySceneOnStart: "level7_start",
      storySceneOnEnd: "level7_end",
    },
  ];

  const TITLE_LINES = Array.isArray(GAME_TEXTS.titleLines) && GAME_TEXTS.titleLines.length > 0
    ? GAME_TEXTS.titleLines
    : [
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

  const CHARACTER_MANIFEST = {
    narrator: { name: "Narrator", npc: "blueeye", voice: "talkMid", portrait: "narrator" },
    blueeye: { name: "Niebieskie Oko", npc: "blueeye", voice: "talkMid", portrait: "blueeye" },
    cactus: { name: "Staś", npc: "cactus", voice: "talkLow", portrait: "cactus" },
    mirek: { name: "Mirek", npc: "ragebun", voice: "talkHigh", portrait: "survivor" },
    szokobons: { name: "Szokobons", npc: "szokobons", voice: "talkHigh", portrait: "szokobons" },
    trani: { name: "TRANI", npc: "ragebun", voice: "talkHigh", portrait: "survivor" },
    redbunny: { name: "Inkwizytor", npc: "ragebun", voice: "talkHigh", portrait: "redbunny" },
    oskar: { name: "Oskar", npc: "cactus", voice: "talkLow", portrait: "survivor" },
    bruno: { name: "Bruno", npc: "cactus", voice: "talkLow", portrait: "survivor" },
    leon: { name: "Leon", npc: "cactus", voice: "talkLow", portrait: "survivor" },
    dawid: { name: "Dawid", npc: "cactus", voice: "talkLow", portrait: "survivor" },
    viktor: { name: "Viktor", npc: "cactus", voice: "talkLow", portrait: "survivor" },
  };
  const SURVIVOR_PORTRAIT_IDS = new Set(["survivor"]);

  // Use sceneLine from dialogues.js module
  const sceneLine = window.sceneLine || function(speakerId, text, options = {}) {
    const manifest = CHARACTER_MANIFEST[speakerId] || CHARACTER_MANIFEST.narrator;
    return {
      speakerId,
      speakerName: options.speakerName || manifest.name,
      text,
      sfxKey: options.sfxKey || manifest.voice,
      portraitId: options.portraitId || manifest.portrait,
      npc: options.npc || manifest.npc,
    };
  };

  function applyDialogueTextOverrides(sceneMap, overrides) {
    if (!overrides || typeof overrides !== "object") return;

    for (const [sceneId, lines] of Object.entries(overrides)) {
      const scene = sceneMap[sceneId];
      if (!scene || !Array.isArray(lines) || lines.length === 0) continue;

      const baseLines = scene.lines;
      scene.lines = lines.map((entry, index) => {
        const fallback = baseLines[index] || baseLines[Math.max(0, baseLines.length - 1)] || sceneLine("narrator", "...");
        const speakerId = entry?.speakerId || fallback.speakerId || "narrator";
        return sceneLine(speakerId, entry?.text ?? fallback.text, {
          speakerName: entry?.speakerName || fallback.speakerName,
          sfxKey: entry?.sfxKey || fallback.sfxKey,
          portraitId: entry?.portraitId || fallback.portraitId,
          npc: entry?.npc || fallback.npc,
        });
      });
    }
  }

  function applyLevelNameOverrides(levels, overrides) {
    if (!overrides || typeof overrides !== "object") return;
    for (const level of levels) {
      const override = overrides[level.id] || overrides[String(level.id)];
      if (typeof override === "string" && override.trim()) {
        level.name = override;
      }
    }
  }

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

  // If external dialogue pack is loaded from assets/data/dialogues.js, prefer it over local defaults.
  if (window.CHARACTER_MANIFEST && typeof window.CHARACTER_MANIFEST === "object") {
    for (const [id, def] of Object.entries(window.CHARACTER_MANIFEST)) {
      if (def && typeof def === "object") {
        CHARACTER_MANIFEST[id] = { ...(CHARACTER_MANIFEST[id] || {}), ...def };
      }
    }
  }
  if (window.DIALOGUE_SCENES && typeof window.DIALOGUE_SCENES === "object") {
    for (const [sceneId, scene] of Object.entries(window.DIALOGUE_SCENES)) {
      if (scene && typeof scene === "object") {
        DIALOGUE_SCENES[sceneId] = scene;
      }
    }
  }
  if (window.LEVEL_SCENE_MAP && typeof window.LEVEL_SCENE_MAP === "object") {
    for (const [levelId, mapping] of Object.entries(window.LEVEL_SCENE_MAP)) {
      if (mapping && typeof mapping === "object") {
        LEVEL_SCENE_MAP[levelId] = { ...(LEVEL_SCENE_MAP[levelId] || {}), ...mapping };
      }
    }
  }
  // Project-level canonical display rules (keep these even if external dialogues differ).
  if (CHARACTER_MANIFEST.narrator) CHARACTER_MANIFEST.narrator.portrait = "narrator";
  if (CHARACTER_MANIFEST.cactus) CHARACTER_MANIFEST.cactus.name = "Staś";
  if (CHARACTER_MANIFEST.redbunny) CHARACTER_MANIFEST.redbunny.name = "Inkwizytor";
  if (CHARACTER_MANIFEST.szokobons) CHARACTER_MANIFEST.szokobons.name = "Szokobons";
  if (CHARACTER_MANIFEST.trani) CHARACTER_MANIFEST.trani.name = "TRANI";
  if (CHARACTER_MANIFEST.mirek) CHARACTER_MANIFEST.mirek.portrait = "survivor";
  if (CHARACTER_MANIFEST.trani) CHARACTER_MANIFEST.trani.portrait = "survivor";
  if (CHARACTER_MANIFEST.oskar) CHARACTER_MANIFEST.oskar.portrait = "survivor";
  if (CHARACTER_MANIFEST.bruno) CHARACTER_MANIFEST.bruno.portrait = "survivor";
  if (CHARACTER_MANIFEST.leon) CHARACTER_MANIFEST.leon.portrait = "survivor";
  if (CHARACTER_MANIFEST.dawid) CHARACTER_MANIFEST.dawid.portrait = "survivor";
  if (CHARACTER_MANIFEST.viktor) CHARACTER_MANIFEST.viktor.portrait = "survivor";

  applyLevelNameOverrides(LEVELS, LEVEL_NAME_TEXTS);

  applyDialogueTextOverrides(DIALOGUE_SCENES, DIALOGUE_TEXT_OVERRIDES);

  const INTRO_DIALOGUE = DIALOGUE_SCENES.intro_cutscene;
  const FIRST_RABBIT_DIALOGUE = DIALOGUE_SCENES.rabbit_meet;
  const CHOCO_DIALOGUE = DIALOGUE_SCENES.szokobons_meet;
  const RAGE_DIALOGUE = DIALOGUE_SCENES.ragebun_meet;
  const BLUE_EYE_INTRO_DIALOGUE = DIALOGUE_SCENES.blue_eye_intro;
  const EYE_DIALOGUE = DIALOGUE_SCENES.eye_warning;

  const ACHIEVEMENT_DEFS = [
    { id: "boot_sequence", name: "Zimny Start", desc: "Uruchomiono CES." },
    { id: "first_bunny", name: "Lamacz Serc", desc: "Pokonaj pierwszego Traniego" },
    { id: "shopper", name: "Kaktus Zakupowy", desc: "Kup 3 ulepszenia." },
    { id: "fat_stage_heavy", name: "Za Duzo Czekolady", desc: "Osiagnij etap HEAVY." },
    { id: "boss_win", name: "Wyjscie z Raju", desc: "Pokonaj bossa z poziomu 7." },
  ];

  const canvas = document.getElementById("game");
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.imageSmoothingEnabled = false;

  const nativeFillText = ctx.fillText.bind(ctx);
  const nativeMeasureText = ctx.measureText.bind(ctx);

  const BITMAP_FONT_DEFAULT_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:?!-_~#\"'&()[]{}^|/\\@+=*%$<>";
  const bitmapFont = {
    image: new Image(),
    ready: false,
    glyphWidth: 6,
    glyphHeight: 10,
    columns: 26,
    charset: BITMAP_FONT_DEFAULT_CHARSET,
    charToIndex: new Map(),
  };

  const bitmapTintCanvas = document.createElement("canvas");
  const bitmapTintCtx = bitmapTintCanvas.getContext("2d", { alpha: true });
  bitmapTintCtx.imageSmoothingEnabled = false;
  const DEFAULT_SPRITE_FRAME_WIDTH = 32;
  const playerSprites = {
    ready: false,
    atlas: null,
    frames: {},
    images: {},
    renderScale: 1,
  };

  const NPC_BY_ARCHETYPE = {
    heart_rabbit: "ragebun",
    choco_rabbit: "szokobons",
  };
  const npcSprites = {
    ready: false,
    atlas: null,
    frames: {},
    images: {},
    renderScale: 1,
  };

  const UPGRADE_ICON_PATHS = {
    metabolism_burst: "./assets/ui/skills/metabolism_burst.png",
    thin_air_dash: "./assets/ui/skills/thin_air_dash.png",
    reactive_combat: "./assets/ui/skills/reactive_combat.png",
    sugar_guard: "./assets/ui/skills/sugar_guard.png",
    spike_ballistics: "./assets/ui/skills/spike_ballistics.png",
  };

  const PORTRAIT_PATHS = {
    narrator: "./assets/portraits/narrator.png",
    redbunny: "./assets/portraits/redbunny.png",
    survivor: "./assets/portraits/survivor.png",
  };

  const LOGO_PATHS = {};

  const uiAssets = {
    icons: {},
    portraits: {},
    logos: {},
  };
  const spriteLoadStatus = {
    player: { ready: false, attempts: 0, lastError: "" },
    npc: { ready: false, attempts: 0, lastError: "" },
  };

  const sidePanel = {
    root: document.getElementById("side-panel"),
    levelName: document.getElementById("panel-level"),
    bodyPreview: document.getElementById("panel-body-preview"),
    hpLabel: document.getElementById("panel-hp-label"),
    hpFill: document.getElementById("panel-hp-fill"),
    fatLabel: document.getElementById("panel-fat-label"),
    fatFill: document.getElementById("panel-fat-fill"),
    fatStage: document.getElementById("panel-fat-stage"),
    deathReason: document.getElementById("panel-death"),
    upgrades: document.getElementById("panel-upgrades"),
    effects: document.getElementById("panel-effects"),
    boss: document.getElementById("panel-boss"),
  };
  const warnThrottle = new Map();

  function warnThrottled(key, message, intervalMs = 1500) {
    const now = performance.now();
    const last = warnThrottle.get(key) || 0;
    if (now - last < intervalMs) return;
    warnThrottle.set(key, now);
    console.warn(message);
  }

  function buildBitmapFontIndex(charset) {
    bitmapFont.charset = charset && charset.length > 0 ? charset : BITMAP_FONT_DEFAULT_CHARSET;
    bitmapFont.charToIndex = new Map();
    for (let i = 0; i < bitmapFont.charset.length; i++) {
      const ch = bitmapFont.charset[i];
      if (!bitmapFont.charToIndex.has(ch)) {
        bitmapFont.charToIndex.set(ch, i);
      }
    }
  }

  function parseBitmapFontCharset(rawText) {
    if (!rawText) return BITMAP_FONT_DEFAULT_CHARSET;
    const lines = rawText.replace(/\r/g, "").split("\n");
    const markerIndex = lines.findIndex((line) => line.trim().toLowerCase() === "character set:");
    if (markerIndex === -1) return BITMAP_FONT_DEFAULT_CHARSET;
    const charset = lines
      .slice(markerIndex + 1)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("");
    return charset.length > 0 ? charset : BITMAP_FONT_DEFAULT_CHARSET;
  }

  function getBitmapGlyphIndex(ch) {
    if (bitmapFont.charToIndex.has(ch)) return bitmapFont.charToIndex.get(ch);
    const upper = ch.toUpperCase();
    if (bitmapFont.charToIndex.has(upper)) return bitmapFont.charToIndex.get(upper);
    const lower = ch.toLowerCase();
    if (bitmapFont.charToIndex.has(lower)) return bitmapFont.charToIndex.get(lower);
    return -1;
  }

  function normalizeGameText(text) {
    // Preserve Polish diacritics while forcing the retro all-caps presentation.
    return String(text ?? "").toLocaleUpperCase("pl-PL");
  }

  function getBitmapTextScale() {
    const match = String(ctx.font || "").match(/(\d+)(?:\.\d+)?px/);
    if (!match) return 1;
    const px = Number(match[1]);
    return Math.max(1, Math.round(px / bitmapFont.glyphHeight));
  }

  function measureBitmapText(text, scale = 1, letterSpacing = 1) {
    const normalized = normalizeGameText(text);
    if (!normalized || normalized.length === 0) return 0;
    const glyphW = bitmapFont.glyphWidth * scale;
    return Math.max(0, normalized.length * glyphW + (normalized.length - 1) * letterSpacing);
  }

  function resolveBitmapTop(y, scale) {
    const h = bitmapFont.glyphHeight * scale;
    const baseline = ctx.textBaseline || "alphabetic";
    if (baseline === "top" || baseline === "hanging") return Math.round(y);
    if (baseline === "middle") return Math.round(y - h / 2);
    if (baseline === "bottom" || baseline === "ideographic") return Math.round(y - h);
    return Math.round(y - h + 2);
  }

  function drawBitmapText(text, x, y, color, scale = 1, letterSpacing = 1) {
    const normalized = normalizeGameText(text);
    if (!bitmapFont.ready) {
      nativeFillText(normalized, x, y);
      return;
    }

    const drawX = Math.round(x);
    const drawY = resolveBitmapTop(y, scale);
    const glyphW = bitmapFont.glyphWidth * scale;
    const glyphH = bitmapFont.glyphHeight * scale;
    const fill = typeof color === "string" ? color : "#ffffff";
    const tinted = fill.toLowerCase() !== "#ffffff" && fill.toLowerCase() !== "white";

    let cursorX = drawX;
    for (const ch of normalized) {
      if (ch === "\n") {
        continue;
      }
      if (ch === " ") {
        cursorX += glyphW + letterSpacing;
        continue;
      }

      const index = getBitmapGlyphIndex(ch);
      if (index === -1) {
        cursorX += glyphW + letterSpacing;
        continue;
      }

      const sx = (index % bitmapFont.columns) * bitmapFont.glyphWidth;
      const sy = Math.floor(index / bitmapFont.columns) * bitmapFont.glyphHeight;

      if (tinted) {
        bitmapTintCanvas.width = glyphW;
        bitmapTintCanvas.height = glyphH;
        // Canvas resize resets context state (including smoothing) -> re-disable for crisp bitmap glyphs.
        bitmapTintCtx.imageSmoothingEnabled = false;
        bitmapTintCtx.clearRect(0, 0, glyphW, glyphH);
        bitmapTintCtx.drawImage(
          bitmapFont.image,
          sx,
          sy,
          bitmapFont.glyphWidth,
          bitmapFont.glyphHeight,
          0,
          0,
          glyphW,
          glyphH
        );
        bitmapTintCtx.globalCompositeOperation = "source-atop";
        bitmapTintCtx.fillStyle = fill;
        bitmapTintCtx.fillRect(0, 0, glyphW, glyphH);
        bitmapTintCtx.globalCompositeOperation = "source-over";
        ctx.drawImage(bitmapTintCanvas, cursorX, drawY);
      } else {
        ctx.drawImage(
          bitmapFont.image,
          sx,
          sy,
          bitmapFont.glyphWidth,
          bitmapFont.glyphHeight,
          cursorX,
          drawY,
          glyphW,
          glyphH
        );
      }

      cursorX += glyphW + letterSpacing;
    }
  }

  function installBitmapFontTextRendering() {
    ctx.fillText = (text, x, y) => {
      drawBitmapText(normalizeGameText(text), x, y, ctx.fillStyle, getBitmapTextScale(), 1);
    };

    ctx.measureText = (text) => {
      const normalized = normalizeGameText(text);
      const scale = getBitmapTextScale();
      const width = bitmapFont.ready
        ? measureBitmapText(normalized, scale, 1)
        : nativeMeasureText(normalized).width;
      return { width };
    };
  }

  async function loadBitmapFont() {
    buildBitmapFontIndex(BITMAP_FONT_DEFAULT_CHARSET);
    installBitmapFontTextRendering();

    const imagePromise = new Promise((resolve) => {
      bitmapFont.image.onload = () => resolve(true);
      bitmapFont.image.onerror = () => resolve(false);
    });
    bitmapFont.image.src = "./fonts/broken-gold-v1.png";

    const charsetRaw = await fetch("./fonts/broken-gold-v1.txt")
      .then((response) => (response.ok ? response.text() : ""))
      .catch(() => "");

    const imageOk = await imagePromise;
    if (!imageOk) {
      bitmapFont.ready = false;
      return;
    }

    buildBitmapFontIndex(parseBitmapFontCharset(charsetRaw));
    bitmapFont.ready = true;
    render();
  }

  function loadImage(src) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  async function tryLoadAtlasPack(baseDir, atlasFiles) {
    let lastFailure = "";
    for (const atlasFile of atlasFiles) {
      const atlasUrl = `${baseDir}/${atlasFile}`;
      const atlasResponse = await fetch(atlasUrl).catch((error) => {
        lastFailure = `fetch failed for ${atlasUrl}: ${error?.message || error}`;
        return null;
      });
      if (!atlasResponse) continue;
      if (!atlasResponse.ok) {
        lastFailure = `HTTP ${atlasResponse.status} for ${atlasUrl}`;
        continue;
      }
      const atlas = await atlasResponse.json().catch((error) => {
        lastFailure = `invalid JSON in ${atlasUrl}: ${error?.message || error}`;
        return null;
      });
      if (!atlas || !atlas.frames) continue;

      const sheetNames = Object.keys(atlas.meta?.sheets || {});
      if (sheetNames.length === 0) {
        lastFailure = `atlas ${atlasUrl} has no meta.sheets`;
        continue;
      }

      const imageEntries = await Promise.all(
        sheetNames.map(async (file) => {
          const imagePath = `${baseDir}/${file}`;
          const image = await loadImage(imagePath);
          if (!image) {
            lastFailure = `image load failed: ${imagePath}`;
          }
          return [file, image];
        })
      );

      const images = {};
      let allLoaded = true;
      for (const [file, image] of imageEntries) {
        if (!image) {
          allLoaded = false;
          break;
        }
        images[file] = image;
      }

      if (!allLoaded) continue;

      const frameWidth = Number(atlas.meta?.frame_size?.w) || DEFAULT_SPRITE_FRAME_WIDTH;
      const renderScale = DEFAULT_SPRITE_FRAME_WIDTH / frameWidth;
      return { atlas, images, renderScale };
    }

    if (lastFailure) {
      console.error(`[sprites] ${lastFailure}`);
    }
    return null;
  }

  async function loadPlayerSprites() {
    spriteLoadStatus.player.attempts += 1;
    const pack = await tryLoadAtlasPack("./assets/sprites/player", ["cactus_hero_atlas_hd.json", "cactus_hero_atlas.json"]);

    if (!pack) {
      playerSprites.ready = false;
      spriteLoadStatus.player.ready = false;
      spriteLoadStatus.player.lastError = "Could not load player atlas pack";
      return;
    }

    playerSprites.atlas = pack.atlas;
    playerSprites.frames = pack.atlas.frames;
    playerSprites.images = pack.images;
    playerSprites.renderScale = pack.renderScale;
    playerSprites.ready = true;
    spriteLoadStatus.player.ready = true;
    spriteLoadStatus.player.lastError = "";
    render();
  }


  async function loadNpcSprites() {
    spriteLoadStatus.npc.attempts += 1;
    const pack = await tryLoadAtlasPack("./assets/sprites/npc", ["npc_atlas_hd.json", "npc_atlas.json"]);

    if (!pack) {
      npcSprites.ready = false;
      spriteLoadStatus.npc.ready = false;
      spriteLoadStatus.npc.lastError = "Could not load NPC atlas pack";
      return;
    }

    npcSprites.atlas = pack.atlas;
    npcSprites.frames = pack.atlas.frames;
    npcSprites.images = pack.images;
    npcSprites.renderScale = pack.renderScale;
    npcSprites.ready = true;
    spriteLoadStatus.npc.ready = true;
    spriteLoadStatus.npc.lastError = "";
    render();
  }

  async function ensureSpriteAtlasesLoaded() {
    if (!playerSprites.ready) await loadPlayerSprites();
    if (!npcSprites.ready) await loadNpcSprites();
  }

  async function loadUiAssets() {
    const iconEntries = await Promise.all(
      Object.entries(UPGRADE_ICON_PATHS).map(async ([id, src]) => [id, await loadImage(src)])
    );
    for (const [id, image] of iconEntries) {
      if (image) uiAssets.icons[id] = image;
    }

    const portraitEntries = await Promise.all(
      Object.entries(PORTRAIT_PATHS).map(async ([id, src]) => [id, await loadImage(src)])
    );
    for (const [id, image] of portraitEntries) {
      if (image) uiAssets.portraits[id] = image;
    }

    const logoEntries = await Promise.all(
      Object.entries(LOGO_PATHS).map(async ([id, src]) => [id, await loadImage(src)])
    );
    for (const [id, image] of logoEntries) {
      if (image) uiAssets.logos[id] = image;
    }

    render();
  }

  const DEFAULT_BINDINGS = {
    left: "KeyA",
    right: "KeyD",
    jump: "Space",
    down: "KeyS",
    confirm: "Enter",
    abilityMetabolism: "KeyQ",
    abilityDash: "KeyE",
    abilityGuard: "KeyC",
  };

  const BINDABLE_ACTIONS = [
    { id: "left", label: "Ruch w lewo" },
    { id: "right", label: "Ruch w prawo" },
    { id: "jump", label: "Skok" },
    { id: "down", label: "Ruch w dol" },
    { id: "confirm", label: "Interakcja" },
    { id: "abilityMetabolism", label: "Piec (Q domyslnie)" },
    { id: "abilityDash", label: "Kic Turbo (E domyslnie)" },
    { id: "abilityGuard", label: "Tarcza (C domyslnie)" },
  ];

  const input = {
    held: new Set(),
    pressed: new Set(),
    mouseX: GAME_WIDTH / 2,
    mouseY: GAME_HEIGHT / 2,
    mouseDown: false,
    mouseClicked: false,
  };

  const state = {
    mode: MODE.POWER_OFF,
    levelIndex: 0,
    level: null,
    enemies: [],
    projectiles: [],
    cameraX: 0,
    score: 0,
    coins: 8,
    elapsed: 0,
    levelTime: 0,
    message: "",
    messageTimer: 0,
    enemyIdSeq: 1,
    projectileIdSeq: 1,
    hazardDamageCooldown: 0,
    bootTimer: 0,
    menuIndex: 0,
    settingsIndex: 0,
    menuItems: ["new_game", "saves", "settings", "about"],
    settingsItems: ["music", "sfx", "controls", "bindings"],
    upgradesBought: 0,
    uiSettings: {
      musicOn: true,
      sfxOn: true,
    },
    settingsReturnMode: MODE.MENU,
    pendingRebindAction: null,
    settingsScroll: 0,
    aboutScroll: 0,
    controlBindings: { ...DEFAULT_BINDINGS },
    ui: {
      hoverButtonId: null,
      selectedButtonId: null,
      lastClickAt: -999,
    },
    dialogue: {
      key: null,
      scene: null,
      lineIndex: 0,
      charIndex: 0,
      phase: DIALOGUE_PHASE.END,
      returnMode: MODE.PLAYING,
      allowSkip: false,
      wrappedLines: [],
      layoutCacheKey: "",
      blipTimer: 0,
    },
    story: {
      activeNPC: null,
      npcState: "idle",
      currentDialogueId: null,
      encounterPhase: "boot",
      seenLevelStart: {},
      pendingLevelStartScene: null,
      pendingLevelEndScene: null,
    },
    tutorial: {
      active: false,
      currentHint: "",
      moved: false,
      jumped: false,
      shot: false,
      dodged: false,
      hpHit: false,
      fatHit: false,
      interacted: false,
      rabbitStorySeen: false,
      chocoStorySeen: false,
      rageStorySeen: false,
      completed: false,
    },
    flags: {
      eyeUnlocked: false,
      eyeDone: false,
      introSeen: false,
    },
    upgrades: {
      metabolism_burst: 0,
      thin_air_dash: 0,
      reactive_combat: 0,
      sugar_guard: 0,
      spike_ballistics: 0,
    },
    player: createPlayer(),
    boss: {
      active: false,
      phase: 0,
      hp: 0,
      maxHp: 0,
      x: 0,
      y: 0,
      w: 30,
      h: 26,
      vx: 0,
      timers: {
        attack: 0,
        telegraph: 0,
      },
      attackQueue: [],
      attackPatternId: "",
      alive: false,
      invuln: 0,
    },
    runStats: {
      deathReason: null,
      hazardsTriggered: 0,
      damageTakenHp: 0,
      damageTakenFat: 0,
    },
    selectedUpgradeIndex: 0,
    upgradeInfoOpen: false,
    upgradeInfoScrollY: 0,
    upgradeInfoScrollX: 0,
    achievements: {},
    unlockedAchievementOrder: [],
    achievementScreen: {
      active: false,
      currentAchievementId: null,
      returnMode: null,
    },
    endingChoice: null,
    debugLogTimer: 0,
  };

  let lastTs = 0;
  let accumulator = 0;
  const VIEWPORT_PLAY_RATIO = 0.88;
  const CANVAS_MIN_SCALE = 1;

  function updateCanvasDisplaySize() {
    const panelReserve = sidePanel.root && window.innerWidth >= 1080 ? sidePanel.root.getBoundingClientRect().width + 26 : 0;
    const usableWidth = Math.max(320, window.innerWidth - panelReserve - 36);
    const targetWidth = Math.floor(usableWidth * VIEWPORT_PLAY_RATIO);
    const targetHeight = Math.floor(window.innerHeight * VIEWPORT_PLAY_RATIO);
    const rawScale = Math.min(targetWidth / GAME_WIDTH, targetHeight / GAME_HEIGHT);
    // Keep integer scaling for crisp text; avoid forced upscaling that can break centering/layout.
    const scale = Math.max(CANVAS_MIN_SCALE, Math.floor(rawScale || 1));
    const pixelWidth = GAME_WIDTH * scale;
    const pixelHeight = GAME_HEIGHT * scale;
    canvas.style.width = String(pixelWidth) + "px";
    canvas.style.height = String(pixelHeight) + "px";
  }

  const dialogueLayoutCache = new Map();

  function pointInRect(x, y, rect) {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
  }

  function consumeMouseClickDebounced() {
    if (!input.mouseClicked) return false;

    // Guard against timer rewinds (e.g. startNewRun resets elapsed to 0).
    if (state.elapsed < state.ui.lastClickAt) {
      state.ui.lastClickAt = -CLICK_DEBOUNCE_SEC;
    }

    if (state.elapsed - state.ui.lastClickAt < CLICK_DEBOUNCE_SEC) {
      input.mouseClicked = false;
      return false;
    }
    state.ui.lastClickAt = state.elapsed;
    input.mouseClicked = false;
    return true;
  }

  function getMenuButtons() {
    const panelY = 24;
    const boxW = 260;
    const boxX = Math.floor((GAME_WIDTH - boxW) / 2);
    return state.menuItems.map((id, i) => ({
      id,
      rect: { x: boxX, y: panelY + 70 + i * 38, w: boxW, h: 28 },
      index: i,
    }));
  }

  function getSettingsButtons() {
    const panelY = 20;
    const panelW = 432;
    const panelX = 24;
    const listX = panelX + 10;
    const listW = panelW - 20;
    const listY = panelY + 98;
    const rowH = 18;
    const listH = 148;
    const visibleRows = Math.floor(listH / rowH);
    const rows = [];
    for (let i = 0; i < visibleRows; i++) {
      rows.push({
        id: "binding_" + i,
        rowIndex: i,
        rect: { x: listX + 1, y: listY + i * rowH + 1, w: listW - 2, h: rowH - 2 },
      });
    }
    const backW = 132;
    const backX = Math.floor(GAME_WIDTH / 2 - backW / 2);
    const backY = panelY + 284 - 26;
    return [
      { id: "toggle_music", rect: { x: listX, y: panelY + 34, w: listW, h: 22 } },
      { id: "toggle_sfx", rect: { x: listX, y: panelY + 62, w: listW, h: 22 } },
      ...rows,
      { id: "settings_back", rect: { x: backX, y: backY, w: backW, h: 20 } },
    ];
  }

  function getUpgradeButtons() {
    const panelX = 12;
    const panelY = 12;
    const panelW = GAME_WIDTH - 24;
    const panelH = GAME_HEIGHT - 24;
    const cardW = 136;
    const cardH = 66;
    const cols = 3;
    const cards = UPGRADE_DEFS.map((upgrade, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      return {
        id: "upgrade_" + upgrade.id,
        index,
        rect: { x: panelX + 8 + col * (cardW + 8), y: panelY + 74 + row * (cardH + 8), w: cardW, h: cardH },
      };
    });

    const btnY = panelY + panelH - 32;
    const btnW = 74;
    const gap = 10;
    const totalW = btnW * 3 + gap * 2;
    const btnX0 = Math.floor(GAME_WIDTH / 2 - totalW / 2);

    const staticButtons = [
      { id: "upgrade_settings", rect: { x: btnX0, y: btnY, w: btnW, h: 24 } },
      { id: "upgrade_info", rect: { x: btnX0 + btnW + gap, y: btnY, w: btnW, h: 24 } },
      { id: "upgrade_continue", rect: { x: btnX0 + (btnW + gap) * 2, y: btnY, w: btnW, h: 24 } },
    ];

    return [...cards, ...staticButtons];
  }

  function getUiButtons(mode = state.mode) {
    if (mode === MODE.MENU || mode === MODE.TITLE) return getMenuButtons();
    if (mode === MODE.SETTINGS) return getSettingsButtons();
    if (mode === MODE.UPGRADE) return getUpgradeButtons();
    if (mode === MODE.ENDING_CHOICE) {
      return [
        { id: "ending_return", rect: { x: 78, y: 188, w: 140, h: 28 } },
        { id: "ending_stay", rect: { x: 262, y: 188, w: 140, h: 28 } },
      ];
    }
    return [];
  }

  function updateUiHoverAndSelection() {
    const buttons = getUiButtons(state.mode);
    const hovered = buttons.find((b) => pointInRect(input.mouseX, input.mouseY, b.rect));
    state.ui.hoverButtonId = hovered ? hovered.id : null;

    if (state.mode === MODE.MENU) {
      state.ui.selectedButtonId = state.menuItems[state.menuIndex] || null;
      return;
    }

    if (state.mode === MODE.UPGRADE) {
      if (state.ui.hoverButtonId) {
        state.ui.selectedButtonId = state.ui.hoverButtonId;
        if (state.ui.hoverButtonId.startsWith("upgrade_")) {
          const id = state.ui.hoverButtonId.replace("upgrade_", "");
          const idx = UPGRADE_DEFS.findIndex((up) => up.id === id);
          if (idx >= 0) state.selectedUpgradeIndex = idx;
        }
      } else {
        const hasValidSelected = buttons.some((b) => b.id === state.ui.selectedButtonId);
        if (!hasValidSelected) {
          const selected = UPGRADE_DEFS[state.selectedUpgradeIndex];
          state.ui.selectedButtonId = selected ? "upgrade_" + selected.id : (buttons[0]?.id || null);
        }
      }
      return;
    }

    if (state.mode === MODE.SETTINGS) {
      if (state.ui.hoverButtonId) {
        state.ui.selectedButtonId = state.ui.hoverButtonId;
      } else {
        const hasValidSelected = buttons.some((b) => b.id === state.ui.selectedButtonId);
        if (!hasValidSelected) {
          state.ui.selectedButtonId = buttons[0]?.id || null;
        }
      }
      return;
    }

    if (state.mode === MODE.ENDING_CHOICE) {
      if (state.ui.hoverButtonId) {
        state.ui.selectedButtonId = state.ui.hoverButtonId;
      } else if (!state.ui.selectedButtonId) {
        state.ui.selectedButtonId = "ending_return";
      }
      return;
    }
    state.ui.selectedButtonId = state.ui.hoverButtonId;
  }

  function cycleUiSelection(mode, delta) {
    const buttons = getUiButtons(mode);
    if (!buttons.length) return null;

    let idx = buttons.findIndex((button) => button.id === state.ui.selectedButtonId);
    if (idx < 0) idx = 0;

    idx = (idx + delta + buttons.length) % buttons.length;
    state.ui.selectedButtonId = buttons[idx].id;

    if (mode === MODE.UPGRADE && state.ui.selectedButtonId?.startsWith("upgrade_")) {
      const id = state.ui.selectedButtonId.replace("upgrade_", "");
      const upIndex = UPGRADE_DEFS.findIndex((up) => up.id === id);
      if (upIndex >= 0) state.selectedUpgradeIndex = upIndex;
    }

    return buttons[idx];
  }

  function getSelectedUiButton(mode) {
    const buttons = getUiButtons(mode);
    if (!buttons.length) return null;
    return buttons.find((button) => button.id === state.ui.selectedButtonId) || buttons[0];
  }

  function createPlayer() {
    return {
      x: 28,
      y: 192,
      w: 14,
      h: 22,
      baseW: 14,
      baseH: 22,
      vx: 0,
      vy: 0,
      facing: 1,
      onGround: false,
      jumpBuffer: 0,
      coyote: 0,
      shootCooldown: 0,
      invuln: 0,
      hp: 10,
      maxHp: 10,
      fat: 18,
      fatStage: 0,
      hitboxScale: 1,
      attackDamage: 1,
      fatLossRate: 0.55,
      speedBonus: 0,
      jumpBonus: 0,
      alive: true,
      aimX: 1,
      aimY: 0,
      activeEffects: {
        metabolismBurst: 0,
        sugarGuard: 0,
      },
      cooldowns: {
        metabolismBurst: 0,
        thinDash: 0,
        sugarGuard: 0,
      },
      hasAirDash: false,
      hasDashedInAir: false,
      maxAirJumps: 0,
      jumpsUsed: 0,
      lastShotTime: -99,
      hurtTimer: 0,
      jumpStartTimer: 0,
      landTimer: 0,
      spikeBallisticsLevel: 0,
    };
  }

  function cloneLevel(levelIndex) {
    const src = LEVELS[levelIndex];
    return {
      id: src.id,
      name: src.name,
      worldWidth: src.worldWidth,
      spawn: { ...src.spawn },
      exit: { ...src.exit },
      reward: src.reward,
      storySceneOnStart: src.storySceneOnStart || LEVEL_SCENE_MAP[src.id]?.start || null,
      storySceneOnEnd: src.storySceneOnEnd || LEVEL_SCENE_MAP[src.id]?.end || null,
      hazards: Array.isArray(src.hazards) ? src.hazards.map((hazard) => ({ ...hazard })) : [],
      platforms: src.platforms.map((p) => ({ ...p })),
      enemies: src.enemies.map((e) => ({ ...e })),
    };
  }

  function buildControlMap() {
    const map = new Map();
    Object.entries(state.controlBindings).forEach(([action, code]) => {
      if (code) map.set(code, action);
    });
    map.set("ArrowLeft", map.get("ArrowLeft") || "left");
    map.set("ArrowRight", map.get("ArrowRight") || "right");
    map.set("ArrowUp", map.get("ArrowUp") || "jump");
    map.set("ArrowDown", map.get("ArrowDown") || "down");
    map.set("KeyW", map.get("KeyW") || "jump");
    map.set("Enter", map.get("Enter") || "confirm");
    map.set("Escape", "escape");
    map.set("KeyP", "pause");
    map.set("Digit1", "num1");
    map.set("Digit2", "num2");
    map.set("Digit3", "num3");
    map.set("Digit4", "num4");
    map.set("Digit5", "num5");
    map.set("KeyF", "fullscreen");
    map.set("KeyB", "debugNext");
    return map;
  }

  function keyToAction(code) {
    return buildControlMap().get(code) || null;
  }

  function keyCodeLabel(code) {
    if (!code) return "---";
    if (code.startsWith("Key")) return code.slice(3);
    if (code.startsWith("Digit")) return code.slice(5);
    if (code === "ArrowLeft") return "LEFT";
    if (code === "ArrowRight") return "RIGHT";
    if (code === "ArrowUp") return "UP";
    if (code === "ArrowDown") return "DOWN";
    if (code === "Space") return "SPACE";
    if (code === "Enter") return "ENTER";
    if (code === "Escape") return "ESC";
    return code.toUpperCase();
  }

  function trimTextToWidth(text, maxWidth) {
    const source = String(text || "");
    if (ctx.measureText(source).width <= maxWidth) return source;
    let out = source;
    while (out.length > 1 && ctx.measureText(out + "..").width > maxWidth) {
      out = out.slice(0, -1);
    }
    return out + "..";
  }

  function isHeld(action) {
    return input.held.has(action);
  }

  function consumePressed(action) {
    if (!input.pressed.has(action)) return false;
    input.pressed.delete(action);
    return true;
  }

  function clearPressed() {
    input.pressed.clear();
    input.mouseClicked = false;
  }

  function syncMousePosition(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    const x = ((clientX - rect.left) * GAME_WIDTH) / rect.width;
    const y = ((clientY - rect.top) * GAME_HEIGHT) / rect.height;
    input.mouseX = clamp(x, 0, GAME_WIDTH);
    input.mouseY = clamp(y, 0, GAME_HEIGHT);
  }

  window.addEventListener("keydown", (event) => {
    unlockAudioByGesture();
    if (state.mode === MODE.SETTINGS && state.pendingRebindAction) {
      event.preventDefault();
      const code = event.code;
      if (code && code !== "Escape") {
        state.controlBindings[state.pendingRebindAction] = code;
        setMessage("Nowy klawisz: " + keyCodeLabel(code), 1.1);
      }
      state.pendingRebindAction = null;
      return;
    }

    const action = keyToAction(event.code);
    if (!action) return;
    if (!input.held.has(action)) {
      input.pressed.add(action);
    }
    input.held.add(action);
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Space"].includes(event.code)) {
      event.preventDefault();
    }
  });

  window.addEventListener("keyup", (event) => {
    const action = keyToAction(event.code);
    if (!action) return;
    input.held.delete(action);
  });

  window.addEventListener("blur", () => {
    input.held.clear();
    input.pressed.clear();
    input.mouseDown = false;
    input.mouseClicked = false;
  });

  canvas.addEventListener("mousemove", (event) => {
    syncMousePosition(event.clientX, event.clientY);
  });

  canvas.addEventListener("mousedown", (event) => {
    unlockAudioByGesture();
    syncMousePosition(event.clientX, event.clientY);
    if (event.button === 0) {
      input.mouseDown = true;
      input.mouseClicked = true;
    }
  });

  canvas.addEventListener("mouseup", (event) => {
    syncMousePosition(event.clientX, event.clientY);
    if (event.button === 0) {
      input.mouseDown = false;
    }
  });

  canvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  canvas.addEventListener("wheel", (event) => {
    const isUpgradeInfoWheel = state.mode === MODE.UPGRADE && state.upgradeInfoOpen;
    if (state.mode !== MODE.SETTINGS && state.mode !== MODE.ABOUT && !isUpgradeInfoWheel) return;
    event.preventDefault();
    const dir = event.deltaY > 0 ? 1 : -1;

    if (state.mode === MODE.SETTINGS) {
      const rowH = 14;
      const listH = 84;
      const visibleRows = Math.floor(listH / rowH);
      const maxScroll = Math.max(0, BINDABLE_ACTIONS.length - visibleRows);
      state.settingsScroll = clamp(state.settingsScroll + dir, 0, maxScroll);
      return;
    }

    if (isUpgradeInfoWheel) {
      const lineH = 10;
      const boxH = 98;
      const textW = 256;
      const infoLines = UPGRADE_DEFS.flatMap((up) => {
        const owned = state.upgrades[up.id] || 0;
        return [`${up.icon || "?"} ${up.name} (lv ${owned})`, up.description, ""];
      });
      const visibleLines = Math.max(1, Math.floor(boxH / lineH));
      const maxScrollY = Math.max(0, infoLines.length - visibleLines);
      if (event.shiftKey) {
        const longest = infoLines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
        const maxScrollX = Math.max(0, Math.ceil(longest - textW));
        state.upgradeInfoScrollX = clamp(state.upgradeInfoScrollX + dir * 14, 0, maxScrollX);
      } else {
        state.upgradeInfoScrollY = clamp(state.upgradeInfoScrollY + dir, 0, maxScrollY);
      }
      return;
    }

    const lineH = 12;
    const boxH = 160;
    const aboutText = [
      "Naga miłość Stasia: Wypędzony",
      "Glowna os: swiat po wygnaniu z Raju.",
      "Ludzie stracili wszystko, nawet ubrania.",
      "Niebieskie Oko twierdzi: nagosc to kara.",
      "Staś twierdzi: nagosc to prawda.",
      "",
      "Postacie: Staś, Szokobons, TRANI,",
      "Inkwizytor, Niebieskie Oko, Ocalali.",
      "",
      "Aktualnie grywalne akty: 1-7, pelny scenariusz.",
      "Tworca: Bartlomiej Stachera + Codex",
      "Kliknij lub Esc aby wrocic"
    ].join("\n");
    const aboutLines = wrapTextLines(aboutText, 260, Infinity);
    const visibleLines = Math.max(1, Math.floor(boxH / lineH));
    const maxScroll = Math.max(0, aboutLines.length - visibleLines);
    state.aboutScroll = clamp(state.aboutScroll + dir, 0, maxScroll);
  }, { passive: false });

  canvas.addEventListener("click", () => {
    if (state.mode === MODE.POWER_OFF) {
      beginBootSequence();
      return;
    }
    if (state.mode === MODE.TITLE) {
      startNewRun();
    }
  });

  function createBossForCurrentLevel() {
    const level = state.level;
    state.boss = {
      active: level.id === 7,
      phase: 1,
      hp: 48,
      maxHp: 48,
      x: level.worldWidth - 280,
      y: 86,
      w: 34,
      h: 28,
      vx: 36,
      timers: {
        attack: 1.2,
        telegraph: 0,
      },
      attackQueue: ["heart_fan", "choco_arc", "mix_burst"],
      attackPatternId: "heart_fan",
      alive: level.id === 7,
      invuln: 0,
    };
  }

  const powerBtn = document.getElementById("power-btn");

  function updatePowerButton() {
    if (!powerBtn) return;
    powerBtn.style.display = state.mode === MODE.POWER_OFF ? "inline-block" : "none";
  }

  function beginBootSequence() {
    unlockAudioByGesture();
    state.mode = MODE.BOOT;
    state.bootTimer = 0;
    playSfx("click");
  }

  if (powerBtn) {
    powerBtn.addEventListener("click", () => {
      if (state.mode === MODE.POWER_OFF) {
        beginBootSequence();
      }
    });
  }

  const audioState = {
    initialized: false,
    currentMusicKey: null,
    music: {},
    sfx: {},
  };

  function createAudio(path, loop = false, volume = 0.5) {
    const a = new Audio(path);
    a.preload = "auto";
    a.loop = loop;
    a.volume = volume;
    return a;
  }

  function initAudioAssets() {
    if (audioState.initialized) return;
    audioState.initialized = true;

    audioState.music.menu = createAudio("./assets/audio/sfx/06_battle_menu_loop.wav", true, 0.28);
    audioState.music.game = createAudio("./assets/audio/bg_chiptune_loop.wav", true, 0.32);
    audioState.music.boss = createAudio("./assets/audio/sfx/07_boss_fight_loop.wav", true, 0.34);

    audioState.sfx.click = createAudio("./assets/audio/sfx/08_click.wav", false, 0.55);
    audioState.sfx.jump = createAudio("./assets/audio/sfx/01_jump.wav", false, 0.55);
    audioState.sfx.playerShot = createAudio("./assets/audio/sfx/02_shot_cactus.wav", false, 0.55);
    audioState.sfx.heartShot = createAudio("./assets/audio/sfx/03_shot_heart.wav", false, 0.5);
    audioState.sfx.chocoShot = createAudio("./assets/audio/sfx/04_shot_chocolate.wav", false, 0.5);
    audioState.sfx.talkHigh = createAudio("./assets/audio/sfx/05_talk_high.wav", false, 0.42);
    audioState.sfx.talkMid = createAudio("./assets/audio/sfx/05_talk_mid.wav", false, 0.42);
    audioState.sfx.talkLow = createAudio("./assets/audio/sfx/05_talk_low.wav", false, 0.42);
    audioState.sfx.upgrade = createAudio("./assets/audio/sfx/08_upgrade_purchase.wav", false, 0.6);
  }

  function unlockAudioByGesture() {
    initAudioAssets();
    const all = [
      ...Object.values(audioState.music),
      ...Object.values(audioState.sfx),
    ];
    for (const a of all) {
      a.play().then(() => {
        a.pause();
        a.currentTime = 0;
      }).catch(() => { });
    }
  }

  function playSfx(key) {
    if (!state.uiSettings.sfxOn) return;
    initAudioAssets();
    const src = audioState.sfx[key];
    if (!src) return;
    const clip = src.cloneNode();
    clip.volume = src.volume;
    clip.play().catch(() => { });
  }

  function stopAllMusic() {
    for (const track of Object.values(audioState.music)) {
      track.pause();
      track.currentTime = 0;
    }
    audioState.currentMusicKey = null;
  }

  function updateMusicForMode() {
    initAudioAssets();
    if (!state.uiSettings.musicOn) {
      stopAllMusic();
      return;
    }

    let nextKey = null;
    if ([MODE.MENU, MODE.SETTINGS, MODE.ABOUT, MODE.SAVES, MODE.UPGRADE, MODE.DIALOGUE, MODE.BOOT, MODE.ENDING_CHOICE].includes(state.mode)) {
      nextKey = "menu";
    } else if (state.mode === MODE.PLAYING) {
      nextKey = state.level && state.level.id === 7 ? "boss" : "game";
    }

    if (nextKey === audioState.currentMusicKey) return;

    stopAllMusic();
    if (nextKey && audioState.music[nextKey]) {
      audioState.music[nextKey].play().catch(() => { });
      audioState.currentMusicKey = nextKey;
    }
  }

  function playUiTone(freq = 440, duration = 0.08, volume = 0.03) {
    if (!state.uiSettings.sfxOn) return;
    playSfx("click");
  }
  function resolveDialogueVoiceKey(line) {
    if (line && line.sfxKey) return line.sfxKey;
    const speaker = line ? CHARACTER_MANIFEST[line.speakerId] : null;
    if (speaker && speaker.voice) return speaker.voice;
    const npc = (state.story.activeNPC || "").toLowerCase();
    if (npc === "ragebun" || npc === "szokobons") return "talkHigh";
    if (npc === "blueeye") return "talkMid";
    return "talkLow";
  }

  function getDialogueScene(sceneOrKey) {
    if (!sceneOrKey) return null;
    if (typeof sceneOrKey === "string") return DIALOGUE_SCENES[sceneOrKey] || null;
    if (sceneOrKey.id && sceneOrKey.lines) return sceneOrKey;
    return null;
  }

  function getCurrentDialogueLine() {
    const scene = state.dialogue.scene;
    if (!scene || !Array.isArray(scene.lines)) return null;
    return scene.lines[state.dialogue.lineIndex] || null;
  }

  function clearDialogueLayoutCache() {
    state.dialogue.layoutCacheKey = "";
    state.dialogue.wrappedLines = [];
    dialogueLayoutCache.clear();
  }

  function beginDialogueLine() {
    const line = getCurrentDialogueLine();
    state.dialogue.charIndex = 0;
    state.dialogue.blipTimer = 0;
    clearDialogueLayoutCache();

    if (!line) {
      state.dialogue.phase = DIALOGUE_PHASE.END;
      return;
    }

    state.dialogue.phase = DIALOGUE_PHASE.LINE_TYPING;
    if (line.npc === "blueeye") {
      setStoryNpc("blueeye", "speak_pulse");
    } else if (line.npc === "szokobons") {
      setStoryNpc("szokobons", "attack");
    } else if (line.npc === "ragebun") {
      setStoryNpc("ragebun", "attack");
    }
  }

  function startDialogue(sceneOrKey, returnMode = MODE.PLAYING) {
    const scene = getDialogueScene(sceneOrKey);
    if (!scene || !Array.isArray(scene.lines) || scene.lines.length === 0) {
      state.mode = returnMode;
      return;
    }

    state.dialogue.key = scene.id;
    state.dialogue.scene = scene;
    state.dialogue.lineIndex = 0;
    state.dialogue.charIndex = 0;
    state.dialogue.phase = DIALOGUE_PHASE.OPEN;
    state.dialogue.returnMode = returnMode;
    state.dialogue.allowSkip = scene.allowSkip !== false;
    state.story.currentDialogueId = scene.id;
    state.mode = MODE.DIALOGUE;

    beginDialogueLine();
  }

  function endDialogueAndReturn() {
    const key = state.dialogue.key;
    state.dialogue.key = null;
    state.dialogue.scene = null;
    state.dialogue.lineIndex = 0;
    state.dialogue.charIndex = 0;
    state.dialogue.phase = DIALOGUE_PHASE.END;
    state.story.currentDialogueId = null;
    clearDialogueLayoutCache();

    if (key === "blue_eye_intro" || key === "intro_cutscene") {
      state.flags.introSeen = true;
      state.story.encounterPhase = "rabbit_scene";
      setStoryNpc("blueeye", "idle_float");
      state.mode = MODE.PLAYING;
      return;
    }

    if (key === "rabbit_meet") {
      state.story.encounterPhase = "szokobons_teach";
      setStoryNpc("szokobons", "walk");
      state.mode = MODE.PLAYING;
      return;
    }

    if (key === "szokobons_meet") {
      state.story.encounterPhase = "ragebun_teach";
      setStoryNpc("ragebun", "walk");
      state.mode = MODE.PLAYING;
      return;
    }

    if (key === "ragebun_meet") {
      state.story.encounterPhase = "combat_tutorial";
      setStoryNpc("blueeye", "blink");
      state.mode = MODE.PLAYING;
      return;
    }

    if (key === "eye_warning") {
      state.flags.eyeDone = true;
      state.mode = MODE.UPGRADE;
      state.selectedUpgradeIndex = 0;
      state.upgradeInfoOpen = false;
      state.upgradeInfoScrollY = 0;
      state.upgradeInfoScrollX = 0;
      return;
    }

    if (key === "level7_end") {
      state.mode = MODE.ENDING_CHOICE;
      return;
    }

    state.mode = state.dialogue.returnMode || MODE.PLAYING;
  }

  function setStoryNpc(name, npcState = "idle") {
    state.story.activeNPC = name;
    state.story.npcState = npcState;
  }

  function resetTutorialState() {
    state.tutorial.active = state.levelIndex === 0;
    state.tutorial.currentHint = "";
    state.tutorial.moved = false;
    state.tutorial.jumped = false;
    state.tutorial.shot = false;
    state.tutorial.dodged = false;
    state.tutorial.hpHit = false;
    state.tutorial.fatHit = false;
    state.tutorial.interacted = false;
    state.tutorial.rabbitStorySeen = false;
    state.tutorial.chocoStorySeen = false;
    state.tutorial.rageStorySeen = false;
    state.tutorial.completed = false;
  }

  function updateTutorialProgress() {
    if (!state.tutorial.active || state.mode !== MODE.PLAYING || !state.level || state.level.id !== 1) {
      return;
    }

    const player = state.player;
    const phase = state.story.encounterPhase;

    if (phase === "rabbit_scene") {
      const firstRabbit = state.enemies.find((enemy) => enemy.alive && enemy.archetype === "heart_rabbit");
      if (firstRabbit && Math.abs(firstRabbit.x - player.x) < 88) {
        state.tutorial.rabbitStorySeen = true;
        startDialogue("rabbit_meet", MODE.PLAYING);
        state.story.encounterPhase = "rabbit_scene_dialogue";
        return;
      }
    }

    if (phase === "szokobons_teach") {
      const chocoRabbit = state.enemies.find((enemy) => enemy.alive && enemy.archetype === "choco_rabbit");
      if (chocoRabbit && Math.abs(chocoRabbit.x - player.x) < 98) {
        state.tutorial.chocoStorySeen = true;
        startDialogue("szokobons_meet", MODE.PLAYING);
        state.story.encounterPhase = "szokobons_dialogue";
        return;
      }
    }

    if (phase === "ragebun_teach") {
      const rageRabbit = state.enemies
        .filter((enemy) => enemy.alive && enemy.archetype === "heart_rabbit")
        .sort((a, b) => b.x - a.x)[0];
      if (rageRabbit && Math.abs(rageRabbit.x - player.x) < 96) {
        state.tutorial.rageStorySeen = true;
        startDialogue("ragebun_meet", MODE.PLAYING);
        state.story.encounterPhase = "ragebun_dialogue";
        return;
      }
    }

    if (!state.tutorial.moved && Math.abs(player.x - state.level.spawn.x) > 30) {
      state.tutorial.moved = true;
    }
    if (!state.tutorial.jumped && player.y < state.level.spawn.y - 12) {
      state.tutorial.jumped = true;
    }
    if (!state.tutorial.shot && state.projectiles.some((projectile) => projectile.owner === "player")) {
      state.tutorial.shot = true;
    }
    if (!state.tutorial.dodged) {
      const nearEnemyShot = state.projectiles.some(
        (projectile) => projectile.owner === "enemy" && Math.abs(projectile.x - player.x) < 38 && projectile.y < player.y
      );
      if (nearEnemyShot && Math.abs(player.vx) > 18) {
        state.tutorial.dodged = true;
      }
    }

    if (!state.tutorial.interacted && player.x >= (state.level.tutorialZones?.interactX || state.level.exit.x - 24) && consumePressed("confirm")) {
      state.tutorial.interacted = true;
      setMessage("Sprawdziles teleport. Czas uciekac.", 1.2);
    }

    const steps = [
      phase === "rabbit_scene" && "Znajdz pierwszego Traniego: scena obsesji.",
      phase === "szokobons_teach" && "Podejdz do SzokoBonsa i poznaj presje FAT.",
      phase === "ragebun_teach" && "Podejdz do RageBuna i poznaj presje HP.",
      !state.tutorial.moved && "Ruszaj sie klawiszami WASD / strzalki.",
      state.tutorial.moved && !state.tutorial.jumped && "Skacz na platformy (Spacja).",
      state.tutorial.jumped && !state.tutorial.shot && "Mysz + LPM = strzal kolcem.",
      state.tutorial.shot && !state.tutorial.hpHit && "Serca RageBuna zjadaja HP.",
      state.tutorial.hpHit && !state.tutorial.fatHit && "Czekolada SzokoBonsa podnosi FAT.",
      state.tutorial.fatHit && !state.tutorial.dodged && "Unikaj pociskow z wyczuciem.",
      state.tutorial.dodged && !state.tutorial.interacted && "Podejdz do teleportu i nacisnij Enter/Spacja.",
    ].filter(Boolean);

    state.tutorial.currentHint = steps.length > 0 ? steps[0] : "Tutorial ukonczony. Lec na prawo.";

    if (!state.tutorial.completed && state.tutorial.moved && state.tutorial.jumped && state.tutorial.shot && state.tutorial.hpHit && state.tutorial.fatHit && state.tutorial.dodged && state.tutorial.interacted && state.tutorial.rageStorySeen) {
      state.tutorial.completed = true;
      setMessage("Tutorial skonczony. Witamy w cierpieniu.", 1.6);
    }
  }


  function updateBoot() {
    state.bootTimer += FIXED_DT;
    if (state.bootTimer > 2.1) {
      state.mode = MODE.MENU;
      state.menuIndex = 0;
      unlockAchievement("boot_sequence");
      if (state.uiSettings.musicOn) {
        playUiTone(440, 0.09, 0.02);
        playUiTone(660, 0.09, 0.02);
      }
    }
  }

  function updateMenu() {
    const hoverIndex = getMenuHitIndex();
    if (hoverIndex >= 0) {
      state.menuIndex = hoverIndex;
    }

    if (consumePressed("down")) {
      state.menuIndex = (state.menuIndex + 1) % state.menuItems.length;
    }
    if (consumePressed("jump")) {
      state.menuIndex = (state.menuIndex - 1 + state.menuItems.length) % state.menuItems.length;
    }

    const clicked = consumeMouseClickDebounced();
    if (!(clicked || consumePressed("confirm"))) return;

    if (clicked && hoverIndex >= 0) {
      state.menuIndex = hoverIndex;
    }

    playSfx("click");
    const choice = state.menuItems[state.menuIndex];
    if (choice === "new_game") {
      startNewRun();
    } else if (choice === "saves") {
      state.mode = MODE.SAVES;
    } else if (choice === "settings") {
      state.mode = MODE.SETTINGS;
      state.settingsIndex = 0;
      state.settingsReturnMode = MODE.MENU;
      state.pendingRebindAction = null;
      state.settingsScroll = 0;
    } else if (choice === "about") {
      state.mode = MODE.ABOUT;
      state.aboutScroll = 0;
    }
  }

  function activateSettingsButton(buttonId) {
    if (!buttonId) return;

    if (buttonId === "toggle_music") {
      state.uiSettings.musicOn = !state.uiSettings.musicOn;
      playSfx("click");
      return;
    }

    if (buttonId === "toggle_sfx") {
      state.uiSettings.sfxOn = !state.uiSettings.sfxOn;
      playSfx("click");
      return;
    }

    if (buttonId.startsWith("binding_")) {
      const localIndex = Number(buttonId.replace("binding_", ""));
      const idx = state.settingsScroll + localIndex;
      const bind = BINDABLE_ACTIONS[idx];
      if (bind) {
        state.pendingRebindAction = bind.id;
        setMessage("Nacisnij nowy klawisz dla: " + bind.label, 1.4);
      }
      return;
    }

    if (buttonId === "settings_back") {
      playSfx("click");
      state.mode = state.settingsReturnMode || MODE.MENU;
      state.pendingRebindAction = null;
    }
  }

  function moveSettingsSelection(delta, visibleRows, maxScroll) {
    const buttons = getSettingsButtons();
    if (!buttons.length) return;

    let idx = buttons.findIndex((btn) => btn.id === state.ui.selectedButtonId);
    if (idx < 0) idx = 0;

    const currentId = buttons[idx].id;
    if (currentId.startsWith("binding_")) {
      const localRow = Number(currentId.replace("binding_", ""));
      if (delta > 0 && localRow === visibleRows - 1 && state.settingsScroll < maxScroll) {
        state.settingsScroll += 1;
        state.ui.selectedButtonId = "binding_" + localRow;
        return;
      }
      if (delta < 0 && localRow === 0 && state.settingsScroll > 0) {
        state.settingsScroll -= 1;
        state.ui.selectedButtonId = "binding_0";
        return;
      }
    }

    idx = (idx + delta + buttons.length) % buttons.length;
    state.ui.selectedButtonId = buttons[idx].id;
  }

  function updateSettingsMenu() {
    const rowH = 18;
    const listH = 148;
    const visibleRows = Math.floor(listH / rowH);
    const maxScroll = Math.max(0, BINDABLE_ACTIONS.length - visibleRows);
    state.settingsScroll = clamp(state.settingsScroll, 0, maxScroll);

    const buttons = getSettingsButtons();
    if (!buttons.some((btn) => btn.id === state.ui.selectedButtonId)) {
      state.ui.selectedButtonId = buttons[0]?.id || null;
    }

    const navNext = consumePressed("down") || consumePressed("right");
    const navPrev = consumePressed("jump") || consumePressed("left");
    if (navNext) moveSettingsSelection(1, visibleRows, maxScroll);
    if (navPrev) moveSettingsSelection(-1, visibleRows, maxScroll);

    const clicked = consumeMouseClickDebounced();
    if (clicked) {
      const hit = buttons.find((btn) => pointInRect(input.mouseX, input.mouseY, btn.rect));
      if (hit) {
        state.ui.selectedButtonId = hit.id;
        activateSettingsButton(hit.id);
      }
    }

    if (consumePressed("confirm")) {
      activateSettingsButton(state.ui.selectedButtonId);
    }

    if (consumePressed("escape")) {
      state.mode = state.settingsReturnMode || MODE.MENU;
      state.pendingRebindAction = null;
    }
  }

  function updateAboutMenu() {
    const lineH = 12;
    const boxH = 160;
    const aboutText = [
      "Stworzył: BART + Codex Ryszard AI + Gemini PRO (poprawki)",
      "Wydarzenie: CactuJam 15 22.02.2026r.",
      "Tematyka: Naked men + Walentynki + Grubość",
      "System: Cactu Entertainment System",
      "Technika: HTML5 Canvas + Playwright",
      "",
      "Kliknij lub Esc aby wrocic"
    ].join("\n");
    const aboutLines = wrapTextLines(aboutText, 260, Infinity);
    const visibleLines = Math.max(1, Math.floor(boxH / lineH));
    const maxScroll = Math.max(0, aboutLines.length - visibleLines);

    if (consumePressed("down")) {
      state.aboutScroll = clamp(state.aboutScroll + 1, 0, maxScroll);
    }
    if (consumePressed("jump")) {
      state.aboutScroll = clamp(state.aboutScroll - 1, 0, maxScroll);
    }

    if (consumePressed("escape") || consumePressed("confirm") || consumePressed("jump") || consumeMouseClickDebounced()) {
      state.mode = MODE.MENU;
      state.aboutScroll = 0;
    }
  }

  function updateSavesMenu() {
    if (consumePressed("escape") || consumePressed("confirm") || consumePressed("jump") || consumeMouseClickDebounced()) {
      state.mode = MODE.MENU;
    }
  }


  function applyDynamicLevelDifficulty(level, levelIndex) {
    // levelIndex starts at 1.
    const idx = Math.max(1, Number(levelIndex) || 1);

    // Make each subsequent level longer (and therefore harder).
    const baseWidth = Math.max(level.worldWidth, 1200);
    const extra = (idx - 1) * 260;
    level.worldWidth = baseWidth + extra;

    // Extend ground to the new world width.
    const ground = level.platforms.find((p) => p.y >= 218 && p.h >= 18);
    if (ground) {
      ground.w = Math.max(ground.w, level.worldWidth);
      ground.x = Math.min(ground.x, 0);
    }

    // Move exit to the new end of the map (keep safe margin).
    if (level.exit) {
      level.exit.x = Math.max(level.exit.x, level.worldWidth - Math.max(70, level.exit.w + 24));
    }

    // Add extra repeated "chunks" of platforms/hazards/enemies to fill the added width.
    const chunkOffset = 320;
    const chunks = Math.max(0, Math.floor(extra / chunkOffset));
    const basePlatforms = level.platforms.filter((p) => !(ground && p === ground));
    const baseHazards = Array.isArray(level.hazards) ? level.hazards.slice() : [];
    const baseEnemies = Array.isArray(level.enemies) ? level.enemies.slice() : [];

    for (let c = 1; c <= chunks; c++) {
      const off = c * chunkOffset;

      for (const p of basePlatforms) {
        const np = { ...p, x: p.x + off };
        if (np.x + np.w < level.worldWidth - 120) {
          level.platforms.push(np);
        }
      }

      for (const h of baseHazards) {
        const nh = { ...h, id: String(h.id || "h") + "_x" + c, x: h.x + off };
        if (nh.x + nh.w < level.worldWidth - 120) {
          level.hazards.push(nh);
        }
      }

      for (const e of baseEnemies) {
        const ne = { ...e, x: e.x + off };
        if (ne.x < level.worldWidth - 160) {
          // Slightly scale hp with level.
          ne.hp = Math.round((ne.hp || 6) + (idx - 1) * 0.6);
          level.enemies.push(ne);
        }
      }
    }

    // Guarantee "two rabbits on one platform" by duplicating at least one enemy near its sibling.
    if (Array.isArray(level.enemies) && level.enemies.length > 0 && idx >= 2) {
      const first = level.enemies[0];
      const twin = { ...first, x: first.x + 18, y: first.y, hp: Math.max(1, (first.hp || 6) + (idx >= 4 ? 1 : 0)) };
      level.enemies.splice(1, 0, twin);
    }
  }

  function loadLevel(levelIndex) {
    state.level = cloneLevel(levelIndex);
    applyDynamicLevelDifficulty(state.level, levelIndex);
    state.levelTime = 0;
    state.hazardDamageCooldown = 0;

    state.enemies = state.level.enemies.map((enemyData) => {
      const archetype = enemyData.archetype || "heart_rabbit";
      const isHeart = archetype === "heart_rabbit";
      return {
        id: state.enemyIdSeq++,
        type: "rabbit",
        archetype,
        npcName: isHeart ? "ragebun" : "szokobons",
        x: enemyData.x,
        y: enemyData.y,
        w: 14,
        h: 16,
        vx: 0,
        vy: 0,
        hp: enemyData.hp,
        maxHp: enemyData.hp,
        onGround: false,
        state: "chase",
        stateTimer: 0.2,
        telegraphTimer: 0,
        throwCooldown: isHeart ? 1.15 + Math.random() * 0.4 : 1.7 + Math.random() * 0.5,
        attackPatternId: enemyData.attackPatternId || (isHeart ? "heart_snap" : "choco_lob"),
        dir: 1,
        alive: true,
        hurtTimer: 0,
        deathTimer: 0,
        patrolMinX: enemyData.x - 26,
        patrolMaxX: enemyData.x + 26,
      };
    });

    for (const enemy of state.enemies) {
      const baseY = enemy.y + enemy.h + 1;
      const platform = state.level.platforms.find((p) => baseY >= p.y - 2 && baseY <= p.y + 4 && enemy.x + enemy.w / 2 >= p.x && enemy.x + enemy.w / 2 <= p.x + p.w);
      if (platform) {
        enemy.patrolMinX = platform.x + 2;
        enemy.patrolMaxX = platform.x + platform.w - enemy.w - 2;
      }
    }
    state.projectiles = [];

    const player = state.player;
    player.x = state.level.spawn.x;
    player.y = state.level.spawn.y;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.jumpBuffer = 0;
    player.coyote = 0;
    player.shootCooldown = 0;
    player.invuln = 0;
    player.hasDashedInAir = false;
    player.jumpsUsed = 0;
    player.activeEffects.metabolismBurst = 0;
    player.activeEffects.sugarGuard = 0;

    createBossForCurrentLevel();
    resetTutorialState();

    state.cameraX = 0;

    const startScene = state.level.storySceneOnStart;
    if (startScene && state.level.id > 1 && !state.story.seenLevelStart[startScene]) {
      state.story.pendingLevelStartScene = startScene;
      state.story.seenLevelStart[startScene] = true;
    } else {
      state.story.pendingLevelStartScene = null;
    }
  }

  function startNewRun() {
    state.score = 0;
    state.coins = 8;
    state.elapsed = 0;
    state.levelIndex = 0;
    state.flags.eyeUnlocked = false;
    state.flags.eyeDone = false;
    state.flags.introSeen = false;

    state.upgrades.metabolism_burst = 0;
    state.upgrades.thin_air_dash = 0;
    state.upgrades.reactive_combat = 0;
    state.upgrades.sugar_guard = 0;
    state.upgrades.spike_ballistics = 0;

    state.runStats.deathReason = null;
    state.runStats.hazardsTriggered = 0;
    state.runStats.damageTakenHp = 0;
    state.runStats.damageTakenFat = 0;
    state.upgradesBought = 0;
    state.achievements = {};
    state.unlockedAchievementOrder = [];

    state.story.seenLevelStart = {};
    state.story.pendingLevelStartScene = null;
    state.story.pendingLevelEndScene = null;
    state.endingChoice = null;

    state.ui.lastClickAt = -CLICK_DEBOUNCE_SEC;
    input.mouseClicked = false;
    input.mouseDown = false;

    state.player = createPlayer();
    loadLevel(state.levelIndex);
    state.mode = MODE.DIALOGUE;
    state.story.encounterPhase = "blueeye_intro";
    setStoryNpc("blueeye", "speak_pulse");
    setMessage("Wypedzenie z Raju. Prawda zaczyna sie teraz.", 2.6);
    startDialogue("intro_cutscene", MODE.PLAYING);
  }

  function setMessage(text, duration) {
    state.message = text;
    state.messageTimer = duration;
  }

  function unlockAchievement(id) {
    if (!id || state.achievements[id]) return;
    const def = ACHIEVEMENT_DEFS.find((item) => item.id === id);
    state.achievements[id] = true;
    state.unlockedAchievementOrder.push(id);
    if (def) {
      // Store the current mode to return to after dismissing achievement
      state.achievementScreen.returnMode = state.mode;
      state.achievementScreen.currentAchievementId = id;
      state.achievementScreen.active = true;
      state.mode = MODE.ACHIEVEMENT;
    }
  }

  function getMenuHitIndex() {
    const buttons = getMenuButtons();
    for (const button of buttons) {
      if (pointInRect(input.mouseX, input.mouseY, button.rect)) return button.index;
    }
    return -1;
  }

  function getUpgradeHitIndex() {
    const buttons = getUpgradeButtons();
    for (const button of buttons) {
      if (!button.id.startsWith("upgrade_")) continue;
      if (pointInRect(input.mouseX, input.mouseY, button.rect)) return button.index;
    }
    return -1;
  }

  function isUpgradeContinueHit() {
    const buttons = getUpgradeButtons();
    const button = buttons.find((b) => b.id === "upgrade_continue");
    return button ? pointInRect(input.mouseX, input.mouseY, button.rect) : false;
  }

  function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }

  function rectsOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  function length(x, y) {
    return Math.sqrt(x * x + y * y);
  }

  function applyFatStageFromValue() {
    const player = state.player;
    player.fat = clamp(player.fat, 0, 100);

    let nextStage = 0;
    if (player.fat > 66) {
      nextStage = 2;
    } else if (player.fat > 33) {
      nextStage = 1;
    }

    if (player.fatStage !== nextStage) {
      const oldCenterX = player.x + player.w / 2;
      player.fatStage = nextStage;
      const stage = FATNESS[player.fatStage];
      player.hitboxScale = stage.hitboxScale;
      player.w = Math.max(12, Math.round(player.baseW * player.hitboxScale));
      player.h = player.baseH + (player.fatStage > 0 ? 1 : 0);
      player.x = oldCenterX - player.w / 2;
    } else {
      const stage = FATNESS[player.fatStage];
      player.hitboxScale = stage.hitboxScale;
    }
  }

  function getPlayerMoveStats() {
    const player = state.player;
    const stage = FATNESS[player.fatStage];
    const metabolismBonus = player.activeEffects.metabolismBurst > 0 ? 0.07 : 0;
    return {
      speed: stage.speed + player.speedBonus,
      accel: stage.accel + player.speedBonus * 7,
      jump: stage.jump + player.jumpBonus,
      airControl: clamp(stage.airControl + metabolismBonus, 0.35, 0.95),
      shootCooldown: Math.max(0.18, stage.shootCooldown),
    };
  }

  function getSolidPlatforms() {
    return state.level ? state.level.platforms : [];
  }

  function moveBodyWithPlatforms(body, dt) {
    const solids = getSolidPlatforms();
    const STEP_UP_HEIGHT = 9;

    const prevX = body.x;
    body.x += body.vx * dt;

    let steppedUp = false;
    for (const platform of solids) {
      if (!rectsOverlap(body, platform)) continue;

      const fromLeft = body.vx > 0 && prevX + body.w <= platform.x + STEP_UP_HEIGHT;
      const fromRight = body.vx < 0 && prevX >= platform.x + platform.w - STEP_UP_HEIGHT;
      const footDelta = body.y + body.h - platform.y;

      if ((fromLeft || fromRight) && body.vy >= -30 && footDelta > 0 && footDelta <= STEP_UP_HEIGHT) {
        const oldY = body.y;
        body.y = platform.y - body.h;
        const blocked = solids.some((other) => other !== platform && rectsOverlap(body, other));
        if (!blocked) {
          steppedUp = true;
          continue;
        }
        body.y = oldY;
      }

      if (body.vx > 0) {
        body.x = platform.x - body.w;
      } else if (body.vx < 0) {
        body.x = platform.x + platform.w;
      }
      body.vx = 0;
    }

    if (steppedUp && body.vy > 0) {
      body.vy = 0;
    }

    body.y += body.vy * dt;
    body.onGround = steppedUp;
    for (const platform of solids) {
      if (!rectsOverlap(body, platform)) continue;
      if (body.vy > 0) {
        body.y = platform.y - body.h;
        body.onGround = true;
      } else if (body.vy < 0) {
        body.y = platform.y + platform.h;
      }
      body.vy = 0;
    }
  }

  function spawnProjectile(opts) {
    state.projectiles.push({
      id: state.projectileIdSeq++,
      owner: opts.owner,
      kind: opts.kind,
      sourceArchetype: opts.sourceArchetype || null,
      damageType: opts.damageType || "hp",
      x: opts.x,
      y: opts.y,
      w: opts.w,
      h: opts.h,
      vx: opts.vx,
      vy: opts.vy,
      damage: opts.damage,
      ttl: opts.ttl,
      gravity: opts.gravity || 0,
    });
  }

  function spawnPlayerSpike() {
    const player = state.player;
    const aimWorldX = state.cameraX + input.mouseX;
    const aimWorldY = input.mouseY;
    let dx = aimWorldX - (player.x + player.w / 2);
    let dy = aimWorldY - (player.y + player.h / 2);
    const len = Math.max(0.0001, length(dx, dy));
    dx /= len;
    dy /= len;

    player.aimX = dx;
    player.aimY = dy;
    if (Math.abs(dx) > 0.05) {
      player.facing = dx < 0 ? -1 : 1;
    }

    const arcLevel = state.upgrades.spike_ballistics || 0;
    const speed = 260 + arcLevel * 24;
    const arcGravity = Math.max(28, 96 - arcLevel * 14);
    const ttl = 2.4 + arcLevel * 0.4;

    playSfx("playerShot");
    spawnProjectile({
      owner: "player",
      kind: "spike",
      sourceArchetype: "player",
      damageType: "hp",
      x: player.x + player.w / 2 - 2,
      y: player.y + 6,
      w: 4,
      h: 4,
      vx: dx * speed,
      vy: dy * speed - (24 + arcLevel * 5),
      damage: player.attackDamage,
      ttl,
      gravity: arcGravity,
    });
    player.lastShotTime = state.elapsed;
  }

  function spawnEnemyShot(enemy, patternOverride = null) {
    const player = state.player;
    const fromX = enemy.x + enemy.w / 2;
    const fromY = enemy.y + 6;
    const dxRaw = (player.x + player.w / 2) - fromX;
    const dyRaw = (player.y + player.h / 2) - fromY;
    const len = Math.max(0.0001, length(dxRaw, dyRaw));
    const ux = dxRaw / len;
    const uy = dyRaw / len;
    const targetAbove = dyRaw < -24;

    const pattern = patternOverride || enemy.attackPatternId;
    if (enemy.archetype === "heart_rabbit") {
      if (pattern === "heart_burst") {
        playSfx("heartShot");
        for (const spread of [-0.24, 0, 0.24]) {
          spawnProjectile({
            owner: "enemy",
            kind: "heart",
            sourceArchetype: enemy.archetype,
            damageType: "hp",
            x: fromX - 3,
            y: fromY,
            w: 6,
            h: 6,
            vx: (ux + spread) * 128,
            vy: targetAbove ? uy * 140 : -58 + Math.abs(spread) * 24,
            damage: 1,
            ttl: 2.1,
            gravity: targetAbove ? 120 : 150,
          });
        }
      } else {
        playSfx("heartShot");
        spawnProjectile({
          owner: "enemy",
          kind: "heart",
          sourceArchetype: enemy.archetype,
          damageType: "hp",
          x: fromX - 3,
          y: fromY,
          w: 6,
          h: 6,
          vx: ux * 142,
          vy: targetAbove ? uy * 148 : -56,
          damage: 1,
          ttl: 2.0,
          gravity: targetAbove ? 118 : 145,
        });
      }
      return;
    }

    if (pattern === "choco_arc") {
      playSfx("chocoShot");
      for (const spread of [-0.2, 0.15]) {
        spawnProjectile({
          owner: "enemy",
          kind: "chocolate",
          sourceArchetype: enemy.archetype,
          damageType: "fat",
          x: fromX - 4,
          y: fromY,
          w: 7,
          h: 7,
          vx: (ux + spread) * 96,
          vy: targetAbove ? uy * 132 : -94 + Math.abs(spread) * 12,
          damage: 16,
          ttl: 2.9,
          gravity: targetAbove ? 175 : 220,
        });
      }
    } else {
      playSfx("chocoShot");
      spawnProjectile({
        owner: "enemy",
        kind: "chocolate",
        sourceArchetype: enemy.archetype,
        damageType: "fat",
        x: fromX - 4,
        y: fromY,
        w: 7,
        h: 7,
        vx: ux * 102,
        vy: targetAbove ? uy * 138 : -86,
        damage: 20,
        ttl: 2.8,
        gravity: targetAbove ? 168 : 210,
      });
    }
  }

  function setPlayerDeath(reason) {
    if (state.mode !== MODE.PLAYING) return;
    state.runStats.deathReason = reason;
    state.mode = MODE.GAME_OVER;
  }

  function applyHazardPressure(dt) {
    const level = state.level;
    if (!level || !Array.isArray(level.hazards) || level.hazards.length === 0) return;

    if (state.hazardDamageCooldown > 0) {
      state.hazardDamageCooldown -= dt;
    }

    const player = state.player;
    for (const hazard of level.hazards) {
      if (!rectsOverlap(player, hazard)) continue;
      if (state.hazardDamageCooldown > 0) continue;

      state.hazardDamageCooldown = 0.45;
      state.runStats.hazardsTriggered += 1;
      player.hp -= 1; // 1 serce (1 HP)
      state.runStats.damageTakenHp += 1;
      player.invuln = Math.max(player.invuln, 0.35);

      setMessage("Wpadles w dziure! -1 Serce", 0.8);

      if (player.hp <= 0) {
        setPlayerDeath("fall_hazard");
      } else {
        // Reset pozycji jak w dziurze
        player.x = state.level.spawn.x;
        player.y = state.level.spawn.y;
        player.vx = 0;
        player.vy = 0;
        state.cameraX = Math.max(0, player.x - GAME_WIDTH / 2);
      }
      return;
    }
  }

  function triggerReactiveBurst() {
    if (state.upgrades.reactive_combat <= 0) return;
    const player = state.player;
    const cx = player.x + player.w / 2;
    const cy = player.y + 10;
    const fatBonus = Math.floor(player.fat / 25);
    for (const angle of [-0.9, -0.45, 0, 0.45, 0.9]) {
      spawnProjectile({
        owner: "player",
        kind: "spike",
        sourceArchetype: "reactive_burst",
        damageType: "hp",
        x: cx - 2,
        y: cy,
        w: 4,
        h: 4,
        vx: Math.cos(angle) * 190,
        vy: Math.sin(angle) * 190,
        damage: 1 + fatBonus,
        ttl: 0.62,
      });
    }
  }

  function applyMetabolismBurstActivation() {
    const player = state.player;
    if (state.upgrades.metabolism_burst <= 0) return;
    if (!consumePressed("abilityMetabolism")) return;
    if (player.cooldowns.metabolismBurst > 0) return;

    player.activeEffects.metabolismBurst = 2.8;
    player.cooldowns.metabolismBurst = 7;
    setMessage("Metabolism burst activated.", 0.9);
  }

  function applyThinDashActivation() {
    const player = state.player;
    if (state.upgrades.thin_air_dash <= 0) return;
    if (!consumePressed("abilityDash")) return;
    if (player.cooldowns.thinDash > 0 || player.hasDashedInAir) return;
    if (player.onGround) return;
    if (player.fatStage !== 0) {
      setMessage("Dash available only while FIT.", 0.8);
      return;
    }

    const dashDir = isHeld("left") ? -1 : isHeld("right") ? 1 : player.facing;
    player.vx = dashDir * 205;
    player.vy = Math.min(player.vy, -20);
    player.hasDashedInAir = true;
    player.cooldowns.thinDash = 2.6;
    setMessage("Thin dash!", 0.6);
  }

  function applySugarGuardActivation() {
    const player = state.player;
    if (state.upgrades.sugar_guard <= 0) return;
    if (!consumePressed("abilityGuard")) return;
    if (player.cooldowns.sugarGuard > 0) return;

    player.activeEffects.sugarGuard = 1.0;
    player.cooldowns.sugarGuard = 5.2;
    setMessage("Sugar guard online.", 0.8);
  }

  function updatePlayerEffects(dt) {
    const player = state.player;
    player.cooldowns.metabolismBurst = Math.max(0, player.cooldowns.metabolismBurst - dt);
    player.cooldowns.thinDash = Math.max(0, player.cooldowns.thinDash - dt);
    player.cooldowns.sugarGuard = Math.max(0, player.cooldowns.sugarGuard - dt);

    player.activeEffects.metabolismBurst = Math.max(0, player.activeEffects.metabolismBurst - dt);
    player.activeEffects.sugarGuard = Math.max(0, player.activeEffects.sugarGuard - dt);

    if (player.activeEffects.metabolismBurst > 0) {
      player.fat -= (8 + state.upgrades.metabolism_burst * 1.2) * dt;
    }
  }

  function updatePlayer(dt) {
    const player = state.player;
    applyFatStageFromValue();
    const moveStats = getPlayerMoveStats();

    if (player.shootCooldown > 0) {
      player.shootCooldown -= dt;
    }
    if (player.invuln > 0) {
      player.invuln -= dt;
    }

    updatePlayerEffects(dt);
    applyMetabolismBurstActivation();
    applySugarGuardActivation();

    player.hurtTimer = Math.max(0, player.hurtTimer - dt);
    player.jumpStartTimer = Math.max(0, player.jumpStartTimer - dt);
    player.landTimer = Math.max(0, player.landTimer - dt);
    const wasOnGround = player.onGround;

    player.jumpBuffer = Math.max(0, player.jumpBuffer - dt);
    player.coyote = Math.max(0, player.coyote - dt);

    if (consumePressed("jump")) {
      player.jumpBuffer = 0.14;
    }

    const left = isHeld("left");
    const right = isHeld("right");

    if (left !== right) {
      const dir = left ? -1 : 1;
      player.facing = dir;
      const accel = player.onGround ? moveStats.accel : moveStats.accel * moveStats.airControl;
      player.vx += dir * accel * dt;
      player.vx = clamp(player.vx, -moveStats.speed, moveStats.speed);
    } else {
      const drag = player.onGround ? 760 : 280;
      if (Math.abs(player.vx) <= drag * dt) {
        player.vx = 0;
      } else {
        player.vx -= Math.sign(player.vx) * drag * dt;
      }
    }

    if (player.onGround) {
      player.coyote = 0.1;
      player.hasDashedInAir = false;
      player.jumpsUsed = 0;
    }

    if (player.jumpBuffer > 0) {
      if (player.coyote > 0) {
        player.vy = -moveStats.jump;
        playSfx("jump");
        player.onGround = false;
        player.coyote = 0;
        player.jumpBuffer = 0;
        player.jumpStartTimer = 0.13;
        player.jumpsUsed = 1;
      } else if (player.jumpsUsed > 0 && player.jumpsUsed <= player.maxAirJumps) {
        player.vy = -moveStats.jump * 0.92;
        playSfx("jump");
        player.jumpBuffer = 0;
        player.jumpStartTimer = 0.1;
        player.jumpsUsed += 1;
        setMessage("Double jump!", 0.4);
      }
    }

    player.vy += GRAVITY * dt;
    player.vy = Math.min(player.vy, 300);

    moveBodyWithPlatforms(player, dt);
    if (!wasOnGround && player.onGround) {
      player.landTimer = 0.14;
    }

    if (player.y > GAME_HEIGHT + 110) {
      // Soft-respawn instead of fail-state to prevent falling out from ruining flow.
      player.x = state.level.spawn.x;
      player.y = state.level.spawn.y;
      player.vx = 0;
      player.vy = 0;
      player.invuln = Math.max(player.invuln, 0.5);
      setMessage("POWROT NA START MAPY.", 0.8);
    }

    applyHazardPressure(dt);
    if (state.mode !== MODE.PLAYING) return;

    if ((input.mouseClicked || input.mouseDown) && player.shootCooldown <= 0) {
      spawnPlayerSpike();
      player.shootCooldown = moveStats.shootCooldown;
    }

    const passiveLoss = player.fatLossRate + state.upgrades.metabolism_burst * 0.12;
    player.fat -= passiveLoss * dt;
    applyFatStageFromValue();
    if (player.fatStage >= 2) {
      unlockAchievement("fat_stage_heavy");
    }

    if (player.fat >= 100) {
      setPlayerDeath("extreme_fat");
      return;
    }

    if (player.hp <= 0) {
      setPlayerDeath("hp_depleted");
      return;
    }
  }

  function bossShoot(patternId) {
    const boss = state.boss;
    if (!boss.active || !boss.alive) return;

    const player = state.player;
    const fromX = boss.x + boss.w / 2;
    const fromY = boss.y + boss.h / 2;
    const dxRaw = (player.x + player.w / 2) - fromX;
    const dyRaw = (player.y + player.h / 2) - fromY;
    const len = Math.max(0.0001, length(dxRaw, dyRaw));
    const ux = dxRaw / len;

    if (patternId === "heart_fan") {
      for (const spread of [-0.35, -0.12, 0.12, 0.35]) {
        spawnProjectile({
          owner: "enemy",
          kind: "heart",
          sourceArchetype: "boss",
          damageType: "hp",
          x: fromX,
          y: fromY,
          w: 6,
          h: 6,
          vx: (ux + spread) * 138,
          vy: -52,
          damage: 1,
          ttl: 2.2,
          gravity: 142,
        });
      }
      return;
    }

    if (patternId === "choco_arc") {
      for (const spread of [-0.28, 0, 0.28]) {
        spawnProjectile({
          owner: "enemy",
          kind: "chocolate",
          sourceArchetype: "boss",
          damageType: "fat",
          x: fromX,
          y: fromY,
          w: 8,
          h: 8,
          vx: (ux + spread) * 108,
          vy: -106 + Math.abs(spread) * 14,
          damage: boss.phase === 1 ? 15 : 18,
          ttl: 3.1,
          gravity: 230,
        });
      }
      return;
    }

    for (const spread of [-0.32, -0.1, 0.1, 0.32]) {
      spawnProjectile({
        owner: "enemy",
        kind: "heart",
        sourceArchetype: "boss",
        damageType: "hp",
        x: fromX,
        y: fromY,
        w: 6,
        h: 6,
        vx: (ux + spread) * 145,
        vy: -58,
        damage: 1,
        ttl: 2.2,
        gravity: 146,
      });
    }
    for (const spread of [-0.2, 0.2]) {
      spawnProjectile({
        owner: "enemy",
        kind: "chocolate",
        sourceArchetype: "boss",
        damageType: "fat",
        x: fromX,
        y: fromY,
        w: 8,
        h: 8,
        vx: (ux + spread) * 120,
        vy: -108,
        damage: 16,
        ttl: 2.8,
        gravity: 238,
      });
    }
  }

  function updateBoss(dt) {
    const boss = state.boss;
    if (!boss.active || !boss.alive) return;

    if (boss.invuln > 0) {
      boss.invuln -= dt;
    }
    boss.timers.telegraph = Math.max(0, boss.timers.telegraph - dt);

    const thresholdPhase2 = boss.maxHp * 0.52;
    if (boss.hp <= thresholdPhase2 && boss.phase === 1) {
      boss.phase = 2;
      boss.attackQueue = ["mix_burst", "choco_arc", "heart_fan", "mix_burst"];
      boss.vx = 52;
      setMessage("Boss wsciekly: faza 2", 1.2);
    }

    const arenaLeft = state.level.worldWidth - 420;
    const arenaRight = state.level.worldWidth - 100;
    boss.x += boss.vx * dt;
    if (boss.x < arenaLeft) {
      boss.x = arenaLeft;
      boss.vx = Math.abs(boss.vx);
    } else if (boss.x + boss.w > arenaRight) {
      boss.x = arenaRight - boss.w;
      boss.vx = -Math.abs(boss.vx);
    }

    boss.timers.attack -= dt;
    if (boss.timers.attack <= 0) {
      const pattern = boss.attackQueue.shift() || "heart_fan";
      boss.attackQueue.push(pattern);
      boss.attackPatternId = pattern;
      boss.timers.telegraph = 0.22;
      bossShoot(pattern);
      boss.timers.attack = boss.phase === 1 ? 1.2 : 0.85;
    }
  }

  function updateEnemies(dt) {
    const player = state.player;

    for (const enemy of state.enemies) {
      if (!enemy.alive) {
        enemy.deathTimer = Math.max(0, enemy.deathTimer - dt);
        continue;
      }

      enemy.throwCooldown -= dt;
      enemy.stateTimer -= dt;
      enemy.telegraphTimer = Math.max(0, enemy.telegraphTimer - dt);
      enemy.hurtTimer = Math.max(0, enemy.hurtTimer - dt);

      const dx = player.x - enemy.x;
      enemy.dir = dx < 0 ? -1 : 1;

      if (enemy.state === "chase") {
        const chaseSpeed = enemy.archetype === "heart_rabbit" ? 34 : 26;
        const playerNear = Math.abs(dx) < 140;
        if (playerNear) {
          enemy.vx = enemy.dir * chaseSpeed;
        } else {
          if (enemy.x <= enemy.patrolMinX) enemy.dir = 1;
          if (enemy.x >= enemy.patrolMaxX) enemy.dir = -1;
          enemy.vx = enemy.dir * Math.max(14, chaseSpeed * 0.58);
        }

        if (enemy.x < enemy.patrolMinX) {
          enemy.x = enemy.patrolMinX;
          enemy.vx = Math.max(0, enemy.vx);
        }
        if (enemy.x > enemy.patrolMaxX) {
          enemy.x = enemy.patrolMaxX;
          enemy.vx = Math.min(0, enemy.vx);
        }

        const attackRange = enemy.archetype === "heart_rabbit" ? 170 : 190;
        if (Math.abs(dx) < attackRange && enemy.throwCooldown <= 0) {
          enemy.state = "telegraph";
          enemy.telegraphTimer = enemy.archetype === "heart_rabbit" ? 0.26 : 0.44;
          enemy.vx = 0;
          setStoryNpc(NPC_BY_ARCHETYPE[enemy.archetype] || "ragebun", "attack");
        }
      } else if (enemy.state === "telegraph") {
        enemy.vx = 0;
        if (enemy.telegraphTimer <= 0) {
          spawnEnemyShot(enemy);
          enemy.throwCooldown = enemy.archetype === "heart_rabbit"
            ? 1 + Math.random() * 0.45
            : 1.55 + Math.random() * 0.55;
          enemy.state = "recover";
          enemy.stateTimer = enemy.archetype === "heart_rabbit" ? 0.24 : 0.34;
        }
      } else if (enemy.state === "recover") {
        enemy.vx = 0;
        if (enemy.stateTimer <= 0) {
          enemy.state = "chase";
          enemy.stateTimer = 0.2;
        }
      }

      enemy.vy += GRAVITY * dt;
      enemy.vy = Math.min(enemy.vy, 260);
      moveBodyWithPlatforms(enemy, dt);
    }

    state.enemies = state.enemies.filter((enemy) => enemy.alive || enemy.deathTimer > 0);
  }

  function updateProjectiles(dt) {
    const solids = getSolidPlatforms();

    for (const projectile of state.projectiles) {
      // Sub-stepping to prevent tunneling (np. pociski bossa przez bloki).
      projectile.vy += projectile.gravity * dt;

      const dx = projectile.vx * dt;
      const dy = projectile.vy * dt;
      const maxStep = 4; // px
      const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) / maxStep));
      const stepX = dx / steps;
      const stepY = dy / steps;

      let hitSolid = false;
      for (let i = 0; i < steps; i++) {
        projectile.x += stepX;
        projectile.y += stepY;

        for (const platform of solids) {
          const expandedPlatform = {
            x: platform.x - 2,
            y: platform.y - 4,
            w: platform.w + 4,
            h: platform.h + 8,
          };
          if (rectsOverlap(projectile, expandedPlatform)) {
            projectile.ttl = 0;
            hitSolid = true;
            break;
          }
        }
        if (hitSolid) break;
      }

      projectile.ttl -= dt;
    }

    const worldWidth = state.level.worldWidth;
    state.projectiles = state.projectiles.filter((projectile) => {
      if (projectile.ttl <= 0) return false;
      if (projectile.x < -20 || projectile.x > worldWidth + 20) return false;
      if (projectile.y < -30 || projectile.y > GAME_HEIGHT + 40) return false;
      return true;
    });
  }

  function applyCombat() {
    const player = state.player;

    for (const projectile of state.projectiles) {
      if (projectile.owner !== "player") continue;

      for (const enemy of state.enemies) {
        if (!enemy.alive) continue;
        if (!rectsOverlap(projectile, enemy)) continue;

        let damage = projectile.damage;
        if (state.upgrades.reactive_combat > 0) {
          damage += Math.floor(player.fat / 35);
        }

        enemy.hp -= damage;
        enemy.hurtTimer = 0.18;
        projectile.ttl = 0;
        if (enemy.hp <= 0) {
          enemy.alive = false;
          enemy.deathTimer = 0.5;
          enemy.vx = 0;
          enemy.vy = 0;
          state.score += 170;
          state.coins += 2;
          setMessage("Trani pokonany.", 0.6);
        }
        break;
      }

      if (state.boss.active && state.boss.alive && rectsOverlap(projectile, state.boss)) {
        if (state.boss.invuln <= 0) {
          state.boss.hp -= projectile.damage;
          state.boss.invuln = 0.06;
          state.score += 12;
          if (state.boss.hp <= 0) {
            state.boss.hp = 0;
            state.boss.alive = false;
            state.boss.active = false;
            state.score += 1800;
            state.coins += 18;
            state.mode = MODE.ENDING;
            unlockAchievement("boss_win");
            setMessage("Boss pokonany. Raj kapituluje.", 1.8);
          }
        }
        projectile.ttl = 0;
      }
    }

    for (const projectile of state.projectiles) {
      if (projectile.owner !== "enemy") continue;
      if (!rectsOverlap(projectile, player)) continue;
      if (player.invuln > 0) continue;

      if (projectile.damageType === "hp") {
        let hpDamage = projectile.damage;
        if (player.activeEffects.sugarGuard > 0) {
          hpDamage = Math.max(0, Math.ceil(hpDamage * 0.4));
        }
        player.hp -= hpDamage;
        state.runStats.damageTakenHp += hpDamage;
        if (state.tutorial.active && hpDamage > 0) state.tutorial.hpHit = true;
        if (state.upgrades.reactive_combat > 0 && hpDamage > 0) {
          triggerReactiveBurst();
        }
        if (player.hp <= 0) {
          player.hp = 0;
          setPlayerDeath("hp_depleted");
        }
      } else {
        let fatDamage = projectile.damage;
        if (player.activeEffects.metabolismBurst > 0) {
          fatDamage = Math.round(fatDamage * 0.55);
        }
        player.fat += fatDamage;
        state.runStats.damageTakenFat += fatDamage;
        if (state.tutorial.active && fatDamage > 0) state.tutorial.fatHit = true;
      }

      player.invuln = 0.55;
      player.hurtTimer = Math.max(player.hurtTimer, 0.24);
      projectile.ttl = 0;
    }

    state.projectiles = state.projectiles.filter((projectile) => projectile.ttl > 0);
  }

  function checkLevelComplete() {
    if (state.mode !== MODE.PLAYING) return;

    if (state.level.id === 7 && (state.boss.active || state.boss.alive)) {
      return;
    }

    const allRabbitsDefeated = state.enemies.length === 0 || state.enemies.every((e) => !e.alive);
    const player = state.player;
    const touchingExit = rectsOverlap(player, state.level.exit);
    if (!touchingExit) return;

    if (!allRabbitsDefeated) {
      setMessage("NAJPIERW POKONAJ WSZYSTKICH WROGOW.", 0.6);
      return;
    }

    const wantsTeleport = consumePressed("confirm") || consumePressed("jump") || consumeMouseClickDebounced();
    if (!wantsTeleport) {
      setMessage("TELEPORT: ENTER / SPACJA / LPM", 0.4);
      return;
    }

    if (state.level.id === 1 && !state.tutorial.interacted) {
      state.tutorial.interacted = true;
      setMessage("BRAMKA SPRAWDZONA. JEDZIEMY DALEJ.", 1.0);
    }

    state.score += 520;
    state.coins += state.level.reward + 2;
    setMessage("PERFEKCYJNY POZIOM! BONUS +2 MONETY.", 1.1);

    const clearedLevel = state.levelIndex;
    const endScene = state.level.storySceneOnEnd;

    if (clearedLevel === LEVELS.length - 1) {
      if (endScene) {
        startDialogue(endScene, MODE.ENDING_CHOICE);
      } else {
        state.mode = MODE.ENDING_CHOICE;
      }
      return;
    }

    state.levelIndex += 1;

    if (clearedLevel === 1 && !state.flags.eyeUnlocked) {
      state.flags.eyeUnlocked = true;
      startDialogue("eye_warning", MODE.UPGRADE);
      return;
    }

    if (endScene) {
      startDialogue(endScene, MODE.UPGRADE);
      return;
    }

    state.mode = MODE.UPGRADE;
    state.selectedUpgradeIndex = 0;
    state.upgradeInfoOpen = false;
    state.upgradeInfoScrollY = 0;
    state.upgradeInfoScrollX = 0;
  }

  function applyUpgrade(id) {
    const def = UPGRADE_DEFS.find((item) => item.id === id);
    if (!def) return;

    const owned = state.upgrades[id] || 0;
    const maxStacks = def.maxStacks ?? (def.repeatable ? 99 : 1);
    if (owned >= maxStacks) {
      setMessage("Ulepszenie ma juz max.", 1.0);
      return;
    }

    if (state.coins < def.cost) {
      setMessage("Za malo monet czekolady.", 1.1);
      return;
    }

    state.coins -= def.cost;
    playSfx("upgrade");
    state.upgrades[id] = owned + 1;
    state.upgradesBought += 1;

    const player = state.player;

    if (id === "metabolism_burst") {
      player.fatLossRate += 0.08;
      setMessage("Piec grzeje mocniej.", 1.2);
    } else if (id === "thin_air_dash") {
      // Jednorazowy zakup: odblokowuje 1 dodatkowy skok w powietrzu.
      player.jumpBonus += 10;
      player.maxAirJumps = Math.max(player.maxAirJumps, 1);
      setMessage("Kic Turbo aktywny", 1.2);
    } else if (id === "reactive_combat") {
      player.attackDamage += 1;
      setMessage("Kolce Zemsty poziom " + state.upgrades.reactive_combat, 1.2);
    } else if (id === "two_hearts") {
      // Jednorazowe leczenie: +2 HP bez podbijania MAX HP.
      const heal = 2;
      player.hp = Math.min(player.maxHp, player.hp + heal);
      setMessage("Uleczono +" + heal + " HP.", 1.2);
    } else if (id === "spike_ballistics") {
      player.spikeBallisticsLevel = state.upgrades.spike_ballistics;
      setMessage("Luk Kolcowy poziom " + state.upgrades.spike_ballistics, 1.2);
    }

    if (state.upgradesBought >= 3) {
      unlockAchievement("shopper");
    }
  }

  function activateUpgradeButton(buttonId) {
    if (!buttonId) return;

    if (buttonId.startsWith("upgrade_") && buttonId !== "upgrade_settings" && buttonId !== "upgrade_info" && buttonId !== "upgrade_continue") {
      const id = buttonId.replace("upgrade_", "");
      const upIndex = UPGRADE_DEFS.findIndex((up) => up.id === id);
      if (upIndex >= 0) {
        state.selectedUpgradeIndex = upIndex;
        applyUpgrade(id);
      }
      return;
    }

    if (buttonId === "upgrade_info") {
      state.upgradeInfoOpen = !state.upgradeInfoOpen;
      if (state.upgradeInfoOpen) {
        state.upgradeInfoScrollY = 0;
        state.upgradeInfoScrollX = 0;
      }
      return;
    }

    if (buttonId === "upgrade_settings") {
      state.mode = MODE.SETTINGS;
      state.settingsReturnMode = MODE.UPGRADE;
      state.pendingRebindAction = null;
      state.settingsScroll = 0;
      return;
    }

    if (buttonId === "upgrade_continue") {
      loadLevel(state.levelIndex);
      state.mode = MODE.PLAYING;
      state.upgradeInfoOpen = false;
    }
  }

  function updateUpgradeSelection() {
    const buttons = getUpgradeButtons();

    const hoverIndex = getUpgradeHitIndex();
    if (hoverIndex >= 0) {
      state.selectedUpgradeIndex = hoverIndex;
      const hovered = UPGRADE_DEFS[hoverIndex];
      if (hovered) state.ui.selectedButtonId = "upgrade_" + hovered.id;
    }

    if (!buttons.some((btn) => btn.id === state.ui.selectedButtonId)) {
      const selected = UPGRADE_DEFS[state.selectedUpgradeIndex];
      state.ui.selectedButtonId = selected ? "upgrade_" + selected.id : buttons[0]?.id;
    }

    if (consumePressed("right") || consumePressed("down")) {
      cycleUiSelection(MODE.UPGRADE, 1);
    }
    if (consumePressed("left") || consumePressed("jump")) {
      cycleUiSelection(MODE.UPGRADE, -1);
    }

    if (consumePressed("num5")) {
      applyUpgrade("spike_ballistics");
    }

    const clicked = consumeMouseClickDebounced();
    if (clicked) {
      const hit = buttons.find((btn) => pointInRect(input.mouseX, input.mouseY, btn.rect));
      if (hit) {
        state.ui.selectedButtonId = hit.id;
        activateUpgradeButton(hit.id);
      }
    }

    if (consumePressed("confirm")) {
      activateUpgradeButton(state.ui.selectedButtonId);
    }
  }

  function updateDialogue(dt = FIXED_DT) {
    const scene = state.dialogue.scene;
    if (!scene) {
      state.mode = state.dialogue.returnMode || MODE.PLAYING;
      return;
    }

    const line = getCurrentDialogueLine();
    if (!line) {
      state.dialogue.phase = DIALOGUE_PHASE.END;
    }

    if (state.dialogue.phase === DIALOGUE_PHASE.LINE_TYPING && line) {
      state.dialogue.charIndex = Math.min(line.text.length, state.dialogue.charIndex + DIALOGUE_CHARS_PER_SECOND * dt);
      state.dialogue.blipTimer -= dt;
      if (state.dialogue.blipTimer <= 0) {
        playSfx(resolveDialogueVoiceKey(line));
        state.dialogue.blipTimer = 0.055;
      }
      if (state.dialogue.charIndex >= line.text.length) {
        state.dialogue.phase = DIALOGUE_PHASE.LINE_SHOW;
      }
    }

    const nextPressed = consumePressed("confirm") || consumePressed("jump") || consumeMouseClickDebounced();
    const skipPressed = consumePressed("escape");

    if (skipPressed && state.dialogue.allowSkip) {
      state.dialogue.phase = DIALOGUE_PHASE.END;
      state.dialogue.lineIndex = scene.lines.length;
    }

    if (nextPressed) {
      if (state.dialogue.phase === DIALOGUE_PHASE.LINE_TYPING && line) {
        state.dialogue.charIndex = line.text.length;
        state.dialogue.phase = DIALOGUE_PHASE.LINE_SHOW;
      } else if (state.dialogue.phase === DIALOGUE_PHASE.LINE_SHOW) {
        state.dialogue.phase = DIALOGUE_PHASE.NEXT;
      } else if (state.dialogue.phase === DIALOGUE_PHASE.END) {
        state.dialogue.phase = DIALOGUE_PHASE.RETURN_MODE;
      }
    }

    if (state.dialogue.phase === DIALOGUE_PHASE.NEXT) {
      state.dialogue.lineIndex += 1;
      if (state.dialogue.lineIndex >= scene.lines.length) {
        state.dialogue.phase = DIALOGUE_PHASE.END;
      } else {
        beginDialogueLine();
      }
    }

    if (state.dialogue.phase === DIALOGUE_PHASE.END) {
      state.dialogue.phase = DIALOGUE_PHASE.RETURN_MODE;
    }

    if (state.dialogue.phase === DIALOGUE_PHASE.RETURN_MODE) {
      endDialogueAndReturn();
    }
  }

  function updateTitle() {
    if (consumePressed("confirm") || consumePressed("jump") || consumeMouseClickDebounced()) {
      state.mode = MODE.MENU;
    }
  }

  function updatePaused() {
    if (consumePressed("pause") || consumePressed("escape") || consumePressed("confirm")) {
      state.mode = MODE.PLAYING;
    }
  }

  function updateGameOver() {
    if (consumePressed("confirm") || consumePressed("jump") || consumeMouseClickDebounced()) {
      state.mode = MODE.MENU;
    }
  }

  function updateEndingChoice() {
    const clicked = consumeMouseClickDebounced();
    const buttons = getUiButtons(MODE.ENDING_CHOICE);
    const hit = clicked ? buttons.find((b) => pointInRect(input.mouseX, input.mouseY, b.rect)) : null;

    if (hit?.id === "ending_return") {
      state.endingChoice = "WRACAM";
      state.mode = MODE.ENDING;
      return;
    }
    if (hit?.id === "ending_stay") {
      state.endingChoice = "ZOSTAJE";
      state.mode = MODE.ENDING;
      return;
    }

    if (consumePressed("left")) {
      state.ui.selectedButtonId = "ending_return";
    }
    if (consumePressed("right")) {
      state.ui.selectedButtonId = "ending_stay";
    }
    if (consumePressed("confirm") || consumePressed("jump")) {
      const selected = state.ui.selectedButtonId === "ending_stay" ? "ZOSTAJE" : "WRACAM";
      state.endingChoice = selected;
      state.mode = MODE.ENDING;
    }
  }

  function updateEnding() {
    if (consumePressed("confirm") || consumePressed("jump") || consumeMouseClickDebounced()) {
      state.mode = MODE.MENU;
    }
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds) || seconds <= 0) return "ready";
    return seconds.toFixed(1) + "s";
  }

  function updateSidePanel() {
    if (!sidePanel.root) return;

    const player = state.player;
    const hpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 0;
    const fatRatio = clamp(player.fat / 100, 0, 1);
    const stage = FATNESS[player.fatStage];

    if (sidePanel.levelName) {
      if (state.mode === MODE.POWER_OFF) sidePanel.levelName.textContent = "Wylaczone";
      else if (state.mode === MODE.BOOT) sidePanel.levelName.textContent = "Startuje CES";
      else if (state.mode === MODE.MENU || state.mode === MODE.SETTINGS || state.mode === MODE.ABOUT) sidePanel.levelName.textContent = "Menu Glowne";
      else sidePanel.levelName.textContent = state.level ? `Poziom ${state.level.id}` : "Tytul";
    }

    if (sidePanel.bodyPreview) {
      sidePanel.bodyPreview.className = `body-preview stage-${player.fatStage}`;
      sidePanel.bodyPreview.textContent = stage.name;
    }

    if (sidePanel.hpLabel) {
      sidePanel.hpLabel.textContent = `${Math.max(0, player.hp)} / ${player.maxHp}`;
    }
    if (sidePanel.hpFill) {
      sidePanel.hpFill.style.width = `${Math.floor(hpRatio * 100)}%`;
    }

    if (sidePanel.fatLabel) {
      sidePanel.fatLabel.textContent = `${Math.round(player.fat)}%`;
    }
    if (sidePanel.fatFill) {
      sidePanel.fatFill.style.width = `${Math.floor(fatRatio * 100)}%`;
      sidePanel.fatFill.dataset.stage = String(player.fatStage);
    }
    if (sidePanel.fatStage) {
      sidePanel.fatStage.textContent = stage.name;
    }

    if (sidePanel.deathReason) {
      sidePanel.deathReason.textContent = state.runStats.deathReason || "zywy";
    }

    if (sidePanel.boss) {
      if (state.boss.active || state.level?.id === 7) {
        const hpText = state.boss.maxHp > 0 ? `${Math.max(0, state.boss.hp)} / ${state.boss.maxHp}` : "--";
        sidePanel.boss.textContent = `Boss faza ${state.boss.phase || 0} | HP ${hpText}`;
      } else {
        sidePanel.boss.textContent = "Boss nieaktywny";
      }
    }

    if (sidePanel.upgrades) {
      const lines = UPGRADE_DEFS.map((upgrade) => {
        const owned = state.upgrades[upgrade.id] || 0;
        const maxStacks = upgrade.maxStacks ?? (upgrade.repeatable ? 99 : 1);
        const status = owned >= maxStacks ? "MAX" : owned > 0 ? "POS" : "BLOK";
        const repeatTag = upgrade.repeatable ? "R" : "1x";
        return `.  [] x/ `;
      });
      sidePanel.upgrades.innerHTML = lines.map((line) => `<li></li>`).join("");
    }

    if (sidePanel.effects) {
      const effectLines = [
        `Piec: ${formatDuration(player.activeEffects.metabolismBurst)} (CD ${formatDuration(player.cooldowns.metabolismBurst)})`,
        `Kic: ${state.upgrades.thin_air_dash > 0 ? (player.hasDashedInAir ? "zuzyty" : "gotowy") : "zablok"} (CD ${formatDuration(player.cooldowns.thinDash)})`,
        `Tarcza: ${formatDuration(player.activeEffects.sugarGuard)} (CD ${formatDuration(player.cooldowns.sugarGuard)})`,
      ];
      sidePanel.effects.innerHTML = effectLines.map((line) => `<li>${line}</li>`).join("");
    }
  }
  function updateGlobalShortcuts() {
    if (consumePressed("fullscreen")) {
      toggleFullscreen();
    }

    if (consumePressed("debugNext")) {
      if (state.mode === MODE.MENU || state.mode === MODE.TITLE) {
        startNewRun();
      } else if (state.mode === MODE.PLAYING) {
        if (state.level.id === 7 && state.boss.active) {
          state.boss.hp = Math.max(0, state.boss.hp - 8);
          if (state.boss.hp <= 0) {
            state.boss.active = false;
            state.boss.alive = false;
            state.player.x = state.level.exit.x;
            state.player.y = state.level.exit.y;
            input.pressed.add("confirm");
            checkLevelComplete();
          }
        } else {
          state.player.x = state.level.exit.x;
          state.player.y = state.level.exit.y;
          input.pressed.add("confirm");
          checkLevelComplete();
        }
      } else if (state.mode === MODE.DIALOGUE) {
        state.dialogue.phase = DIALOGUE_PHASE.END;
        updateDialogue(FIXED_DT);
      } else if (state.mode === MODE.UPGRADE) {
        const selected = UPGRADE_DEFS[state.selectedUpgradeIndex];
        applyUpgrade(selected.id);
      }
    }

    if (state.mode === MODE.PLAYING && (consumePressed("pause") || consumePressed("escape"))) {
      state.mode = MODE.PAUSED;
    }
  }

  function emitDebugState(dt = FIXED_DT) {
    state.debugLogTimer -= dt;
    if (state.debugLogTimer > 0) return;
    state.debugLogTimer = 0.45;
    const payload = {
      activeMode: state.mode,
      selectedButtonId: state.ui.selectedButtonId,
      hoverButtonId: state.ui.hoverButtonId,
      dialogueIndex: state.dialogue.lineIndex,
      dialoguePhase: state.dialogue.phase,
      returnMode: state.dialogue.returnMode,
    };
    console.debug("[DEBUG_STATE]", payload);
  }

  function update(dt) {
    state.elapsed += dt;

    if (state.messageTimer > 0) {
      state.messageTimer -= dt;
      if (state.messageTimer <= 0) {
        state.message = "";
      }
    }

    updatePowerButton();
    updateMusicForMode();
    updateGlobalShortcuts();
    updateUiHoverAndSelection();
    emitDebugState(dt);

    if (state.mode === MODE.POWER_OFF) {
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.BOOT) {
      updateBoot();
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.MENU || state.mode === MODE.TITLE) {
      updateMenu();
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.SETTINGS) {
      updateSettingsMenu();
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.ABOUT) {
      updateAboutMenu();
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.SAVES) {
      updateSavesMenu();
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.PAUSED) {
      updatePaused();
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.UPGRADE) {
      updateUpgradeSelection();
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.DIALOGUE) {
      updateDialogue(dt);
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.ENDING_CHOICE) {
      updateEndingChoice();
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.GAME_OVER) {
      updateGameOver();
      updateSidePanel();
      return;
    }
    if (state.mode === MODE.ACHIEVEMENT) {
      // Handle input to dismiss achievement screen
      if (consumePressed("confirm") || consumePressed("jump") || consumePressed("interact") || consumeMouseClickDebounced()) {
        state.achievementScreen.active = false;
        const returnMode = state.achievementScreen.returnMode || MODE.MENU;
        state.mode = returnMode;
        state.achievementScreen.currentAchievementId = null;
        state.achievementScreen.returnMode = null;
      }
      return;
    }
    if (state.mode === MODE.ENDING) {
      updateEnding();
      updateSidePanel();
      return;
    }

    if (state.mode !== MODE.PLAYING) {
      updateSidePanel();
      return;
    }

    state.levelTime += dt;

    if (state.story.pendingLevelStartScene) {
      const sceneKey = state.story.pendingLevelStartScene;
      state.story.pendingLevelStartScene = null;
      startDialogue(sceneKey, MODE.PLAYING);
      updateSidePanel();
      return;
    }

    updatePlayer(dt);
    if (state.mode !== MODE.PLAYING) {
      updateSidePanel();
      return;
    }

    updateEnemies(dt);
    updateBoss(dt);
    updateProjectiles(dt);
    applyCombat();
    updateTutorialProgress();
    checkLevelComplete();

    const maxCamera = Math.max(0, state.level.worldWidth - GAME_WIDTH);
    state.cameraX = clamp(state.player.x + state.player.w / 2 - GAME_WIDTH / 2, 0, maxCamera);

    updateSidePanel();
  }

  const LEVEL_BG_THEMES = {
    0: { base: "#1e1030", stripeA: "#5e2f7d", stripeB: "#3f245f", accent: "#ff9fd0" },
    1: { base: "#101c2e", stripeA: "#1f4f87", stripeB: "#173760", accent: "#8cc7ff" },
    2: { base: "#1a2f1f", stripeA: "#2f6a3b", stripeB: "#244f2e", accent: "#9ef5b2" },
    3: { base: "#311d12", stripeA: "#77452d", stripeB: "#5e321e", accent: "#ffc08e" },
    4: { base: "#211327", stripeA: "#64306c", stripeB: "#4f2358", accent: "#f5a0ff" },
    5: { base: "#171b2f", stripeA: "#34538f", stripeB: "#293f6e", accent: "#9fd0ff" },
    6: { base: "#2a1020", stripeA: "#7d2a4f", stripeB: "#61203f", accent: "#ff9cbc" },
    7: { base: "#0f162b", stripeA: "#245a7b", stripeB: "#1a4560", accent: "#7ef2ff" },
  };

  function drawBackground(levelId) {
    const theme = LEVEL_BG_THEMES[levelId] || LEVEL_BG_THEMES[0];

    ctx.fillStyle = theme.base;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    for (let i = 0; i < 7; i++) {
      const y = 22 + i * 31;
      ctx.fillStyle = i % 2 === 0 ? theme.stripeA : theme.stripeB;
      ctx.fillRect(0, y, GAME_WIDTH, 4);
    }

    ctx.fillStyle = theme.accent;
    for (let i = 0; i < 8; i++) {
      const px = (i * 43 + Math.floor(state.elapsed * 12)) % (GAME_WIDTH + 20) - 10;
      const py = 18 + (i % 4) * 42;
      drawTinyHeart(px, py);
    }
  }

  function drawTinyHeart(x, y) {
    ctx.fillRect(x, y, 2, 2);
    ctx.fillRect(x + 4, y, 2, 2);
    ctx.fillRect(x + 1, y + 1, 4, 2);
    ctx.fillRect(x + 2, y + 3, 2, 2);
  }

  function drawLevel() {
    drawBackground(state.level.id);

    ctx.fillStyle = "#6e4a34";
    for (const platform of state.level.platforms) {
      const px = Math.floor(platform.x - state.cameraX);
      const py = Math.floor(platform.y);
      ctx.fillRect(px, py, platform.w, platform.h);

      ctx.fillStyle = "#8c6543";
      ctx.fillRect(px, py, platform.w, 2);
      ctx.fillStyle = "#6e4a34";
    }

    if (Array.isArray(state.level.hazards)) {
      for (const hazard of state.level.hazards) {
        const hx = Math.floor(hazard.x - state.cameraX);
        const hy = Math.floor(hazard.y);
        ctx.fillStyle = "#9e3049";
        ctx.fillRect(hx, hy, hazard.w, hazard.h);
        ctx.fillStyle = "#ff8ca2";
        for (let i = 0; i < hazard.w; i += 6) {
          ctx.fillRect(hx + i, hy, 2, 4);
        }
      }
    }

    const exit = state.level.exit;
    const ex = Math.floor(exit.x - state.cameraX);
    const pulse = Math.sin(state.elapsed * 5) * 0.5 + 0.5;
    ctx.fillStyle = pulse > 0.5 ? "#84f8ff" : "#4acbe6";
    ctx.fillRect(ex, exit.y, exit.w, exit.h);
    ctx.fillStyle = "#0d5460";
    ctx.fillRect(ex + 4, exit.y + 4, exit.w - 8, exit.h - 8);

    if (state.boss.active && state.boss.alive) {
      const bx = Math.floor(state.boss.x - state.cameraX);
      const by = Math.floor(state.boss.y);
      const flash = state.boss.invuln > 0 && Math.floor(state.elapsed * 30) % 2 === 0;
      if (!flash) {
        const bossAnchorX = bx + Math.floor(state.boss.w / 2);
        const bossAnchorY = by + Math.floor(state.boss.h / 2) + 8;
        const bossAnim = getBossBlueEyeAnim();
        const drewBoss = drawNpcFrame("blueeye", bossAnim, bossAnchorX, bossAnchorY, 1, bossAnim === "attack_cast" ? 10 : 8, 0.05, state.elapsed);
        if (!drewBoss) {
          warnThrottled("sprite-boss-blueeye", "Boss sprite not drawn (blueeye atlas/frame unavailable)");
        }
      }

      const hpRatio = state.boss.hp / state.boss.maxHp;
      ctx.fillStyle = "#241930";
      ctx.fillRect(96, 8, 130, 6);
      ctx.fillStyle = state.boss.phase === 1 ? "#7ee7ff" : "#ff7f9d";
      ctx.fillRect(96, 8, Math.floor(130 * hpRatio), 6);
      ctx.fillStyle = "#f6eaff";
      ctx.fillText("BOSS P" + state.boss.phase, 96, 1);
    }
  }

  function getPlayerSpriteStateName(player) {
    if (player.fatStage === 0) return "fit";
    if (player.fatStage === 1) return "chubby";
    return "heavy";
  }

  function getPlayerAnimName(player) {
    const shotAge = state.elapsed - player.lastShotTime;
    if (player.hurtTimer > 0) return "hurt";
    if (shotAge <= 0.18) return player.onGround ? "shoot_ground" : "shoot_air";
    if (!player.onGround) {
      if (player.vy < -36 && player.jumpStartTimer > 0) return "jump_start";
      if (player.vy < 30) return "jump_air";
      return "fall";
    }
    if (player.landTimer > 0) return "land";
    if (Math.abs(player.vx) > 12) return "run";
    return "idle";
  }

  function getAtlasFrameWithReducedFallback(frameMap, prefix, frameIndex, total) {
    const exactKey = `${prefix}.${String(frameIndex).padStart(2, "0")}`;
    if (frameMap[exactKey]) return frameMap[exactKey];

    const safeTotal = Math.max(1, Number(total) || 1);
    const progress = safeTotal <= 1 ? 0 : clamp(frameIndex / (safeTotal - 1), 0, 1);
    const reducedIndex = Math.round(progress * 2);
    const reducedCandidates = [
      reducedIndex,
      reducedIndex - 1,
      reducedIndex + 1,
      0,
      1,
      2,
    ].filter((v, idx, arr) => v >= 0 && v <= 2 && arr.indexOf(v) === idx);

    for (const idx of reducedCandidates) {
      const key = `${prefix}.${String(idx).padStart(2, "0")}`;
      if (frameMap[key]) return frameMap[key];
    }

    return null;
  }

  function getPlayerAnimFrame(stateName, animName) {
    const total = playerSprites.atlas?.meta?.animations?.[animName];
    if (!total || total <= 0) return null;

    let fps = 8;
    if (animName === "run") {
      fps = stateName === "fit" ? 14 : stateName === "chubby" ? 12 : 10;
    } else if (animName === "jump_start" || animName === "land") {
      fps = 14;
    } else if (animName === "shoot_ground") {
      fps = 14;
    } else if (animName === "shoot_air") {
      fps = 12;
    } else if (animName === "hurt") {
      fps = 12;
    } else if (animName === "fall") {
      fps = 8;
    } else if (animName === "jump_air") {
      fps = 6;
    }

    const frameIndex = Math.floor(state.elapsed * fps) % total;
    return getAtlasFrameWithReducedFallback(playerSprites.frames, `player.${stateName}.${animName}`, frameIndex, total);
  }

  function drawPlayer() {
    const player = state.player;
    const pulse = player.invuln > 0 && Math.floor(state.elapsed * 20) % 2 === 0;
    if (pulse) return;

    // Always use PNG sprites - no fallback drawing
    if (!playerSprites.ready) {
      warnThrottled("sprite-player-not-ready", "Player sprites not ready");
      return;
    }

    const stateName = getPlayerSpriteStateName(player);
    const animName = getPlayerAnimName(player);
    const frame = getPlayerAnimFrame(stateName, animName);
    if (!frame) {
      warnThrottled(`sprite-player-frame-${stateName}-${animName}`, `No animation frame for ${stateName}.${animName}`);
      return;
    }

    const img = playerSprites.images[frame.sheet];
    if (!img) {
      warnThrottled(`sprite-sheet-${frame.sheet}`, `No sprite sheet loaded: ${frame.sheet}`);
      return;
    }

    const pivot = frame.pivot || { x: 16, y: 29 };
    const fx = frame.frame.x;
    const fy = frame.frame.y;
    const fw = frame.frame.w;
    const fh = frame.frame.h;
    const renderScale = playerSprites.renderScale || 1;
    const drawW = Math.max(1, Math.round(fw * renderScale));
    const drawH = Math.max(1, Math.round(fh * renderScale));
    const pivotX = Math.round(pivot.x * renderScale);
    const pivotY = Math.round(pivot.y * renderScale);

    const anchorX = Math.floor(player.x - state.cameraX + player.w / 2);
    const anchorY = Math.floor(player.y + player.h);
    const drawY = anchorY - pivotY;
    const visualFacing = Math.abs(player.vx) > 4
      ? (player.vx < 0 ? -1 : 1)
      : (Math.abs(player.aimX) > 0.12 ? (player.aimX < 0 ? -1 : 1) : (player.facing >= 0 ? 1 : -1));

    ctx.save();
    if (visualFacing >= 0) {
      const drawX = anchorX - pivotX;
      ctx.drawImage(img, fx, fy, fw, fh, drawX, drawY, drawW, drawH);
    } else {
      ctx.translate(anchorX, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, fx, fy, fw, fh, -pivotX, drawY, drawW, drawH);
    }
    ctx.restore();
  }


  function getNpcAnimFrame(name, anim, fps = 8, seed = 0, elapsed = 0) {
    const count = npcSprites.atlas?.meta?.animations?.rabbit?.[anim]
      ?? npcSprites.atlas?.meta?.animations?.blueeye?.[anim]
      ?? 0;
    if (!count) return null;
    const frameIndex = Math.floor((elapsed + seed) * fps) % count;
    return getAtlasFrameWithReducedFallback(npcSprites.frames, `npc.${name}.${anim}`, frameIndex, count);
  }

  function drawNpcFrame(name, anim, x, y, facing = 1, fps = 8, seed = 0, elapsed = 0) {
    if (!npcSprites.ready) return false;
    const frame = getNpcAnimFrame(name, anim, fps, seed, elapsed);
    if (!frame) return false;
    const img = npcSprites.images[frame.sheet];
    if (!img) return false;

    const pivot = frame.pivot || { x: 16, y: 29 };
    const fx = frame.frame.x;
    const fy = frame.frame.y;
    const fw = frame.frame.w;
    const fh = frame.frame.h;
    const renderScale = npcSprites.renderScale || 1;
    const drawW = Math.max(1, Math.round(fw * renderScale));
    const drawH = Math.max(1, Math.round(fh * renderScale));
    const pivotX = Math.round(pivot.x * renderScale);
    const pivotY = Math.round(pivot.y * renderScale);

    const drawY = y - pivotY;

    ctx.save();
    if (facing >= 0) {
      ctx.drawImage(img, fx, fy, fw, fh, x - pivotX, drawY, drawW, drawH);
    } else {
      ctx.translate(x, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(img, fx, fy, fw, fh, -pivotX, drawY, drawW, drawH);
    }
    ctx.restore();
    return true;
  }

  function drawBlueEyeAt(x, y, anim = "idle_float") {
    // Always use PNG sprites - no fallback drawing
    if (!npcSprites.ready) {
      warnThrottled("sprite-npc-not-ready", "NPC sprites not ready");
      return;
    }
    if (!drawNpcFrame("blueeye", anim, x, y, 1, anim === "speak_pulse" ? 10 : 8, 0.2, state.elapsed)) {
      warnThrottled(`sprite-blueeye-${anim}`, `Could not draw blueeye frame for anim=${anim}`);
      return;
    }
  }

  function drawNarratorMoonAt(x, y, size = 56) {
    const narratorPortrait = uiAssets.portraits.narrator;
    if (!narratorPortrait) return false;

    const drawSize = Math.max(24, size | 0);
    const drawX = Math.floor(x - drawSize / 2);
    const drawY = Math.floor(y - drawSize / 2);

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, Math.floor(drawSize / 2), 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(narratorPortrait, drawX, drawY, drawSize, drawSize);
    ctx.restore();

    ctx.strokeStyle = "rgba(122, 242, 255, 0.8)";
    ctx.strokeRect(drawX + 0.5, drawY + 0.5, drawSize - 1, drawSize - 1);
    return true;
  }

  function getBossBlueEyeAnim() {
    if (!state.boss.alive) return "vanish";
    if (state.boss.invuln > 0.04) return "blink";
    if (state.boss.timers.telegraph > 0) return "attack_cast";
    return state.boss.phase >= 2 ? "speak_pulse" : "idle_float";
  }

  function drawStoryNpcInWorld() {
    if (state.mode !== MODE.PLAYING || state.story.activeNPC !== "blueeye") return;
    if (!state.tutorial.active || state.level?.id !== 1) return;

    const phase = state.story.encounterPhase;
    if (!["rabbit_scene", "szokobons_teach", "ragebun_teach", "combat_tutorial"].includes(phase)) return;

    const worldX = state.player.x + 58;
    const worldY = 56 + Math.sin(state.elapsed * 3) * 3;
    const screenX = Math.floor(worldX - state.cameraX);
    const screenY = Math.floor(worldY);
    if (!drawNarratorMoonAt(screenX, screenY, 56)) {
      drawBlueEyeAt(screenX, screenY, state.story.npcState === "blink" ? "blink" : "idle_float");
    }
  }

  function drawEnemies() {
    for (const enemy of state.enemies) {
      const x = Math.floor(enemy.x - state.cameraX);
      const y = Math.floor(enemy.y);

      let anim = "idle";
      if (!enemy.alive) anim = "death";
      else if (enemy.hurtTimer > 0) anim = "hurt";
      else if (enemy.state === "telegraph" || enemy.state === "recover") anim = "attack";
      else if (Math.abs(enemy.vx) > 4) anim = "walk";

      const npcName = enemy.npcName || NPC_BY_ARCHETYPE[enemy.archetype] || "ragebun";
      const anchorX = x + Math.floor(enemy.w / 2);
      const anchorY = y + enemy.h;
      const facing = Math.abs(enemy.vx) > 1 ? (enemy.vx > 0 ? 1 : -1) : (enemy.dir > 0 ? 1 : -1);

      const drew = drawNpcFrame(npcName, anim, anchorX, anchorY, facing, anim === "walk" ? 10 : 8, enemy.id * 0.17, state.elapsed);
      if (!drew) {
        warnThrottled(`sprite-enemy-${npcName}-${anim}`, `Enemy sprite not drawn for ${npcName} (${anim})`);
      }

      const hpRatio = enemy.hp / enemy.maxHp;
      ctx.fillStyle = "#2f1c1f";
      ctx.fillRect(x, y - 4, enemy.w, 2);
      ctx.fillStyle = enemy.archetype === "heart_rabbit" ? "#ff96c6" : "#ffcf7c";
      ctx.fillRect(x, y - 4, Math.floor(enemy.w * hpRatio), 2);
    }
  }

  function drawProjectiles() {
    for (const projectile of state.projectiles) {
      const x = Math.floor(projectile.x - state.cameraX);
      const y = Math.floor(projectile.y);

      if (projectile.kind === "spike") {
        ctx.fillStyle = "#d6ffe0";
        ctx.fillRect(x, y, 4, 1);
        ctx.fillStyle = "#81d698";
        ctx.fillRect(x + 1, y + 1, 2, 3);
      } else if (projectile.kind === "heart") {
        ctx.fillStyle = "#ff5f9a";
        drawTinyHeart(x, y);
      } else {
        ctx.fillStyle = "#8b4f28";
        ctx.fillRect(x, y, projectile.w, projectile.h);
        ctx.fillStyle = "#d09a66";
        ctx.fillRect(x + 1, y + 1, Math.max(2, projectile.w - 2), 2);
      }
    }
  }
  function drawHud() {
    ctx.fillStyle = "#1a0d1f";
    ctx.fillRect(0, 0, GAME_WIDTH, 22);
    ctx.fillStyle = "#f4dff3";
    ctx.font = "9px 'Broken Gold', 'Courier New', monospace";
    ctx.textBaseline = "top";
    ctx.fillText(`LV ${state.level.id}/5`, 4, 3);
    ctx.fillText(`Coins ${state.coins}`, 48, 3);
    ctx.fillText(`Score ${state.score}`, 106, 3);

    const player = state.player;
    ctx.fillText(`HP ${player.hp}/${player.maxHp}`, 184, 3);
    ctx.fillText(`Fat ${Math.round(player.fat)}%`, 250, 3);

    ctx.fillStyle = "#2a162d";
    ctx.fillRect(184, 13, 52, 5);
    ctx.fillStyle = "#ff8a9a";
    ctx.fillRect(184, 13, Math.floor((player.hp / player.maxHp) * 52), 5);

    ctx.fillStyle = "#2e1d30";
    ctx.fillRect(242, 13, 72, 5);
    ctx.fillStyle = player.fatStage === 0 ? "#78ff86" : player.fatStage === 1 ? "#ffd56b" : "#ff8a76";
    ctx.fillRect(242, 13, Math.floor((player.fat / 100) * 72), 5);

    if (state.message) {
      ctx.fillStyle = "rgba(18, 7, 20, 0.8)";
      ctx.fillRect(6, 24, GAME_WIDTH - 12, 22);
      ctx.fillStyle = "#ffe6f0";
      drawWrappedText(state.message, 10, 26, GAME_WIDTH - 20, 10, 2);
    }

    if (state.tutorial.active && state.mode === MODE.PLAYING && state.tutorial.currentHint) {
      ctx.fillStyle = "rgba(10, 5, 16, 0.86)";
      ctx.fillRect(8, GAME_HEIGHT - 28, GAME_WIDTH - 16, 20);
      ctx.strokeStyle = "#9edfff";
      ctx.strokeRect(8.5, GAME_HEIGHT - 27.5, GAME_WIDTH - 17, 19);
      ctx.fillStyle = "#e6f9ff";
      drawWrappedText(state.tutorial.currentHint, 12, GAME_HEIGHT - 25, GAME_WIDTH - 24, 10, 2);
    }
  }
  function drawPowerOffScreen() {
    ctx.fillStyle = "#020202";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.fillStyle = "#2e2e2e";
    ctx.fillRect(0, GAME_HEIGHT - 14, GAME_WIDTH, 14);

    if (uiAssets.logos.ces) {
      // Placeholder rysowany w miejscu napisu CES OFFLINE
      ctx.drawImage(uiAssets.logos.ces, 112, 86);
    } else {
      ctx.fillStyle = "#f4f4f4";
      ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
      ctx.fillText("CES OFFLINE", 112, 96);
    }

    ctx.fillStyle = "#98f7ff";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    ctx.fillText("Wcisnij POWER", 112, GAME_HEIGHT - 11);
  }

  function drawBootScreen() {
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "#f7f9ff";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    ctx.fillText("CES SYSTEM", 120, 72);
    ctx.fillStyle = "#9fdfff";
    ctx.fillText("Ladowanie modulow...", 100, 94);

    const ratio = clamp(state.bootTimer / 2.1, 0, 1);
    ctx.fillStyle = "#2a2f44";
    ctx.fillRect(56, 124, 208, 12);
    ctx.fillStyle = "#74ff8c";
    ctx.fillRect(56, 124, Math.floor(208 * ratio), 12);
    ctx.fillStyle = "#f4dff3";
    ctx.fillText("BOOT " + Math.round(ratio * 100) + "%", 124, 146);
  }

  function drawTitle() {
    drawBackground(0);

    const panelW = 392;
    const panelH = 244;
    const panelX = Math.floor((GAME_WIDTH - panelW) / 2);
    const panelY = 24;

    ctx.fillStyle = "rgba(14, 5, 16, 0.9)";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "#ffb7da";
    ctx.strokeRect(panelX + 0.5, panelY + 0.5, panelW - 1, panelH - 1);

    ctx.fillStyle = "#f5efff";
    ctx.font = "16px 'Broken Gold', 'Courier New', monospace";
    let y = panelY + 16;
    for (const line of TITLE_LINES) {
      ctx.fillText(line, panelX + 16, y);
      y += 16;
    }

    const blink = Math.floor(state.elapsed * 2) % 2 === 0;
    if (blink) {
      ctx.fillStyle = "#7af2ff";
      ctx.fillText("Kliknij ekran gry, aby aktywowac mysz", panelX + 16, panelY + panelH - 20);
    }

    drawPlayerPortrait(panelX + panelW - 88, panelY + 42);
  }

  function drawMenuScreen() {
    drawBackground(0);
    const floatY = Math.sin(state.elapsed * 2.2) * 3;

    const panelW = 392;
    const panelH = 244;
    const panelX = Math.floor((GAME_WIDTH - panelW) / 2);
    const panelY = 24;

    ctx.fillStyle = "rgba(14, 5, 16, 0.92)";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "#ffb7da";
    ctx.strokeRect(panelX + 0.5, panelY + 0.5, panelW - 1, panelH - 1);

    ctx.fillStyle = "#f5efff";
    if (uiAssets.logos.title) {
      const logo = uiAssets.logos.title;
      ctx.drawImage(logo, Math.floor(GAME_WIDTH / 2 - logo.width / 2), Math.floor(panelY + 20 + floatY));
    } else {
      ctx.font = "18px 'Broken Gold', 'Courier New', monospace";
      const title = "Naga miłość Stasia";
      const titleW = ctx.measureText(title).width;
      ctx.fillText(title, Math.floor(GAME_WIDTH / 2 - titleW / 2), Math.floor(panelY + 30 + floatY));
    }

    ctx.font = "18px 'Broken Gold', 'Courier New', monospace";
    const buttons = getMenuButtons();
    for (let i = 0; i < MENU_LABELS.length; i++) {
      const btn = buttons[i];
      const selected = i === state.menuIndex;
      const hovered = state.ui.hoverButtonId === btn.id;
      const y = btn.rect.y;
      const boxX = btn.rect.x;
      const boxW = btn.rect.w;
      const boxH = btn.rect.h;
      ctx.fillStyle = selected ? "#3a2a42" : hovered ? "#312039" : "#221329";
      ctx.fillRect(boxX, y, boxW, boxH);
      ctx.strokeStyle = selected || hovered ? "#7af2ff" : "#65456f";
      ctx.strokeRect(boxX + 0.5, y + 0.5, boxW - 1, boxH - 1);

      const label = MENU_LABELS[i] || "---";
      const w = ctx.measureText(label).width;
      const tx = Math.floor(boxX + (boxW - w) / 2);
      const ty = Math.floor(y + boxH / 2) + 2; // +2 for visual alignment with font baseline

      ctx.fillStyle = selected || hovered ? "#7af2ff" : "#f3dff8";
      ctx.save();
      ctx.textBaseline = "middle";
      ctx.fillText(label, tx, ty);
      ctx.restore();
    }
  }

  function drawSettingsScreen() {
    drawBackground(1);
    const panelX = 24;
    const panelY = 20;
    const panelW = 432;
    const panelH = 284;

    ctx.fillStyle = "rgba(14, 7, 18, 0.94)";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "#ffb7da";
    ctx.strokeRect(panelX + 0.5, panelY + 0.5, panelW - 1, panelH - 1);

    ctx.fillStyle = "#f7edff";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("USTAWIENIA STEROWANIA", panelX + panelW / 2, panelY + 16);

    const listX = panelX + 10;
    const listW = panelW - 20;
    const musicHover = state.ui.hoverButtonId === "toggle_music";
    const sfxHover = state.ui.hoverButtonId === "toggle_sfx";
    const musicSelected = state.ui.selectedButtonId === "toggle_music";
    const sfxSelected = state.ui.selectedButtonId === "toggle_sfx";

    ctx.fillStyle = musicHover || musicSelected ? "#d5f7ff" : "#f3dff8";
    ctx.fillRect(listX, panelY + 34, listW, 22);
    ctx.fillStyle = sfxHover || sfxSelected ? "#d5f7ff" : "#f3dff8";
    ctx.fillRect(listX, panelY + 62, listW, 22);
    ctx.fillStyle = "#25162d";
    ctx.fillText(
      "MUZYKA: " + (state.uiSettings.musicOn ? "ON" : "OFF"),
      panelX + panelW / 2,
      panelY + 40
    );

    ctx.fillText(
      "SFX: " + (state.uiSettings.sfxOn ? "ON" : "OFF"),
      panelX + panelW / 2,
      panelY + 68
    );

    ctx.fillStyle = "#d5f3ff";
    ctx.fillText(
      "Kliknij akcje i nacisnij swoj klawisz:",
      panelX + panelW / 2,
      panelY + 90
    );

    const listY = panelY + 98;
    const rowH = 18;
    const listH = 148;
    const visibleRows = Math.floor(listH / rowH);
    const maxScroll = Math.max(0, BINDABLE_ACTIONS.length - visibleRows);
    state.settingsScroll = clamp(state.settingsScroll, 0, maxScroll);

    ctx.fillStyle = "rgba(9, 12, 24, 0.5)";
    ctx.fillRect(listX, listY, listW, listH);
    ctx.strokeStyle = "#6f6e94";
    ctx.strokeRect(listX + 0.5, listY + 0.5, listW - 1, listH - 1);

    ctx.save();
    ctx.beginPath();
    ctx.rect(listX + 1, listY + 1, listW - 2, listH - 2);
    ctx.clip();

    for (let i = 0; i < visibleRows; i++) {
      const idx = state.settingsScroll + i;
      const bind = BINDABLE_ACTIONS[idx];
      const y = listY + i * rowH;
      if (!bind) continue;

      const selected = state.pendingRebindAction === bind.id;
      const hovered = state.ui.hoverButtonId === "binding_" + i;
      const focused = state.ui.selectedButtonId === "binding_" + i;
      ctx.fillStyle = selected ? "#2f4451" : hovered || focused ? "#263449" : "#1f2230";
      ctx.fillRect(listX + 1, y + 1, listW - 2, rowH - 2);
      ctx.strokeStyle = selected || focused ? "#7af2ff" : "#6f6e94";
      ctx.strokeRect(listX + 1.5, y + 1.5, listW - 3, rowH - 3);

      const code = keyCodeLabel(state.controlBindings[bind.id]);
      ctx.fillStyle = "#a8ffca";
      const codeW = ctx.measureText(code).width;
      const codeX = listX + listW - 10 - codeW;
      ctx.fillText(code, codeX, y + 5);

      ctx.fillStyle = "#f3f7ff";
      const labelMaxW = Math.max(24, codeX - (listX + 10) - 8);
      const label = trimTextToWidth(bind.label, labelMaxW);
      ctx.fillText(label, listX + 10, y + 5);
    }

    ctx.restore();

    if (maxScroll > 0) {
      const barX = listX + listW - 4;
      const thumbH = Math.max(12, Math.floor((visibleRows / BINDABLE_ACTIONS.length) * listH));
      const thumbY = listY + Math.floor((state.settingsScroll / maxScroll) * (listH - thumbH));
      ctx.fillStyle = "#3b4a68";
      ctx.fillRect(barX, listY, 3, listH);
      ctx.fillStyle = "#7af2ff";
      ctx.fillRect(barX, thumbY, 3, thumbH);
    }

    ctx.fillStyle = "#9fd8ff";
    ctx.fillText(
      "Scroll: kolko myszy lub gora/dol",
      panelX + panelW / 2,
      panelY + panelH - 34
  );

    const backW = 132;
    const backX = Math.floor(GAME_WIDTH / 2 - backW / 2);
    const backY = panelY + panelH - 26;
    const backHover = state.ui.hoverButtonId === "settings_back";
    const backSelected = state.ui.selectedButtonId === "settings_back";
    ctx.fillStyle = backHover || backSelected ? "#294354" : "#3a2a42";
    ctx.fillRect(backX, backY, backW, 20);
    ctx.strokeStyle = backHover || backSelected ? "#c7f4ff" : "#7af2ff";
    ctx.strokeRect(backX + 0.5, backY + 0.5, backW - 1, 19);
    ctx.fillStyle = "#7af2ff";
    const back = "POWROT";
    ctx.fillText(back, Math.floor(GAME_WIDTH / 2 - ctx.measureText(back).width / 2), backY + 4);
  }

  function drawAboutScreen() {
    drawBackground(2);
    const panelX = 24;
    const panelY = 20;
    const panelW = 432;
    const panelH = 284;

    ctx.fillStyle = "rgba(12, 7, 18, 0.92)";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "#9edfff";
    ctx.strokeRect(panelX + 0.5, panelY + 0.5, panelW - 1, panelH - 1);

    ctx.fillStyle = "#ecf7ff";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    ctx.fillText("O GRZE / CREDITS", panelX + 10, panelY + 16);

    const aboutText = [
      "Naga miłość Stasia: Wypędzony",
      "Glowna os: swiat po wygnaniu z Raju.",
      "Ludzie stracili wszystko, nawet ubrania.",
      "Niebieskie Oko twierdzi: nagosc to kara.",
      "Staś twierdzi: nagosc to prawda.",
      "",
      "Postacie: Staś, Szokobons, TRANI,",
      "Inkwizytor, Niebieskie Oko, Ocalali.",
      "",
      "Aktualnie grywalne akty: 1-7, pelny scenariusz.",
      "Tworca: Bartlomiej Stachera + Codex",
      "Kliknij lub Esc aby wrocic",
    ].join("\n");

    const textX = panelX + 10;
    const textY = panelY + 28;
    const textW = panelW - 20;
    const boxH = panelH - 40;
    const lineH = 14;
    const lines = wrapTextLines(aboutText, textW, Infinity);
    const visibleLines = Math.max(1, Math.floor(boxH / lineH));
    const maxScroll = Math.max(0, lines.length - visibleLines);
    state.aboutScroll = clamp(state.aboutScroll, 0, maxScroll);

    ctx.fillStyle = "rgba(9, 12, 24, 0.35)";
    ctx.fillRect(textX - 2, textY - 2, textW + 4, boxH + 4);

    ctx.save();
    ctx.beginPath();
    ctx.rect(textX, textY, textW, boxH);
    ctx.clip();
    ctx.fillStyle = "#d8e9ff";
    for (let i = 0; i < visibleLines; i++) {
      const line = lines[state.aboutScroll + i];
      if (line === undefined) break;
      ctx.fillText(line, textX, textY + i * lineH);
    }
    ctx.restore();

    if (maxScroll > 0) {
      const barX = textX + textW + 2;
      const thumbH = Math.max(12, Math.floor((visibleLines / lines.length) * boxH));
      const thumbY = textY + Math.floor((state.aboutScroll / maxScroll) * (boxH - thumbH));
      ctx.fillStyle = "#3b4a68";
      ctx.fillRect(barX, textY, 3, boxH);
      ctx.fillStyle = "#7af2ff";
      ctx.fillRect(barX, thumbY, 3, thumbH);
    }

    ctx.fillStyle = "#9fd8ff";
    ctx.fillText("Scroll: kolko myszy lub gora/dol", panelX + 10, panelY + panelH - 8);
  }

  function drawSavesScreen() {
    drawBackground(3);
    ctx.fillStyle = "rgba(12, 7, 18, 0.9)";
    ctx.fillRect(24, 42, 272, 154);
    ctx.strokeStyle = "#9edfff";
    ctx.strokeRect(24.5, 42.5, 271, 153);

    ctx.fillStyle = "#ecf7ff";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    ctx.fillText("ZAPISY", 30, 56);
    ctx.fillText("Sloty zapisu: wkrotce", 30, 84);
    ctx.fillText("(kliknij aby wrocic)", 30, 104);

    const unlocked = state.unlockedAchievementOrder.slice(-4);
    ctx.fillStyle = "#7af2ff";
    ctx.fillText("Osiagniecia:", 30, 132);
    if (unlocked.length === 0) {
      ctx.fillText("- brak odblokowanych", 30, 148);
    } else {
      unlocked.forEach((id, i) => {
        const def = ACHIEVEMENT_DEFS.find((a) => a.id === id);
        ctx.fillText("- " + (def ? def.name : id), 30, 148 + i * 12);
      });
    }
  }

  function drawPlayerPortrait(x, y) {
    ctx.fillStyle = "#56de69";
    ctx.fillRect(x, y, 38, 58);
    ctx.fillStyle = "#111";
    ctx.fillRect(x + 5, y + 28, 28, 8);
    ctx.fillStyle = "#fbe96b";
    ctx.fillRect(x + 8, y + 31, 22, 2);
    ctx.fillStyle = "#13342d";
    ctx.fillRect(x + 8, y + 12, 4, 4);
    ctx.fillRect(x + 26, y + 12, 4, 4);
  }

  function drawTutorialHeroPortrait(x, y) {
    drawPlayerPortrait(x, y);
    ctx.fillStyle = "#7af2ff";
    ctx.fillRect(x + 2, y + 5, 34, 3);
    ctx.fillStyle = "#e7fdff";
    ctx.fillRect(x + 14, y + 1, 10, 4);
  }

  function drawUpgradeIcon(upgradeId, x, y, size = 24) {
    const icon = uiAssets.icons[upgradeId];
    if (icon) {
      ctx.drawImage(icon, x, y, size, size);
      return;
    }

    // Fallback icon if asset is missing.
    ctx.fillStyle = "#203246";
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = "#7af2ff";
    ctx.strokeRect(x + 0.5, y + 0.5, size - 1, size - 1);
    const up = UPGRADE_DEFS.find((item) => item.id === upgradeId);
    ctx.fillStyle = "#a8fff4";
    ctx.fillText((up?.icon || "?").slice(0, 1), x + 7, y + 6);
  }

  function drawUpgradeScreen() {
    drawBackground(state.levelIndex + 1);

    const panelX = 12;
    const panelY = 12;
    const panelW = GAME_WIDTH - 24;
    const panelH = GAME_HEIGHT - 24;

    ctx.fillStyle = "rgba(15, 8, 16, 0.92)";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "#ffb4d8";
    ctx.strokeRect(panelX + 0.5, panelY + 0.5, panelW - 1, panelH - 1);

    ctx.fillStyle = "#f7edff";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    ctx.fillText("Poziom " + state.levelIndex + " ukonczony", panelX + 8, panelY + 8);
    ctx.fillText("Kup upgrady lub sprawdz INFO", panelX + 8, panelY + 20);
    ctx.fillText("Monety " + state.coins, panelX + panelW - 110, panelY + 8);

    ctx.fillStyle = "#6e4a34";
    ctx.fillRect(Math.floor(GAME_WIDTH / 2) - 40, panelY + 26, 80, 6);
    drawPlayerPortrait(Math.floor(GAME_WIDTH / 2) - 18, panelY + 28);

    const cardW = 136;
    const cardH = 66;
    const cols = 3;

    UPGRADE_DEFS.forEach((upgrade, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      const x = panelX + 8 + col * (cardW + 8);
      const y = panelY + 74 + row * (cardH + 8);
      const selected = state.ui.selectedButtonId === "upgrade_" + upgrade.id;
      const hovered = state.ui.hoverButtonId === "upgrade_" + upgrade.id;
      const owned = state.upgrades[upgrade.id] || 0;
      const maxStacks = upgrade.maxStacks ?? (upgrade.repeatable ? 99 : 1);
      const maxed = owned >= maxStacks;
      const affordable = state.coins >= upgrade.cost;

      ctx.fillStyle = selected ? "#513660" : hovered ? "#3d2a47" : "#2a1b33";
      ctx.fillRect(x, y, cardW, cardH);
      ctx.strokeStyle = selected || hovered ? "#7af2ff" : "#ffb4d8";
      ctx.strokeRect(x + 0.5, y + 0.5, cardW - 1, cardH - 1);

      drawUpgradeIcon(upgrade.id, x + 4, y + 4, 20);
      ctx.fillStyle = "#a8fff4";
      ctx.fillText((upgrade.shortName || upgrade.name), x + 28, y + 4);
      ctx.fillStyle = "#fef7ff";
      ctx.fillText("Cena " + upgrade.cost, x + 4, y + 18);

      let statusText = "BLOK";
      if (maxed) statusText = "MAX";
      else if (owned > 0) statusText = "LV " + owned;
      else if (affordable) statusText = "KUP";

      ctx.fillStyle = maxed ? "#ff9aa7" : owned > 0 ? "#9bd6ff" : affordable ? "#a9ffb2" : "#ff8f94";
      ctx.fillText(statusText, x + 58, y + 18);

      ctx.fillStyle = "#e6c9f0";
      drawWrappedText(upgrade.description, x + 4, y + 28, cardW - 8, 9, 3);
      ctx.fillStyle = "#b9efc0";
      ctx.fillText(upgrade.repeatable ? "Wielo" : "Raz", x + 4, y + 51);
    });

    const btnY = panelY + panelH - 32;
    const btnW = 74;
    const gap = 10;
    const totalW = btnW * 3 + gap * 2;
    const btnX0 = Math.floor(GAME_WIDTH / 2 - totalW / 2);

    const hoverSettings = state.ui.hoverButtonId === "upgrade_settings";
    const hoverInfo = state.ui.hoverButtonId === "upgrade_info";
    const hoverContinue = state.ui.hoverButtonId === "upgrade_continue";
    const selectedSettings = state.ui.selectedButtonId === "upgrade_settings";
    const selectedInfo = state.ui.selectedButtonId === "upgrade_info";
    const selectedContinue = state.ui.selectedButtonId === "upgrade_continue";

    ctx.fillStyle = hoverSettings || selectedSettings ? "#425e69" : "#334147";
    ctx.fillRect(btnX0, btnY, btnW, 24);
    ctx.fillStyle = hoverInfo || selectedInfo ? "#425e69" : "#334147";
    ctx.fillRect(btnX0 + btnW + gap, btnY, btnW, 24);
    ctx.fillStyle = hoverContinue || selectedContinue ? "#425e69" : "#334147";
    ctx.fillRect(btnX0 + (btnW + gap) * 2, btnY, btnW, 24);
    ctx.strokeStyle = "#7af2ff";
    ctx.strokeRect(btnX0 + 0.5, btnY + 0.5, btnW - 1, 23);
    ctx.strokeRect(btnX0 + btnW + gap + 0.5, btnY + 0.5, btnW - 1, 23);
    ctx.strokeRect(btnX0 + (btnW + gap) * 2 + 0.5, btnY + 0.5, btnW - 1, 23);
    ctx.fillStyle = "#7af2ff";
    ctx.fillText("KLAW", btnX0 + 12, btnY + 8);
    ctx.fillText("INFO", btnX0 + btnW + gap + 12, btnY + 8);
    ctx.fillText("DALEJ", btnX0 + (btnW + gap) * 2 + 8, btnY + 8);

    if (state.upgradeInfoOpen) {
      const infoX = panelX + 12;
      const infoY = panelY + 50;
      const infoW = panelW - 24;
      const infoH = 144;
      const textX = infoX + 8;
      const textY = infoY + 20;
      const textW = infoW - 24;
      const textH = infoH - 26;
      const lineH = 10;

      const infoLines = UPGRADE_DEFS.flatMap((up) => {
        const owned = state.upgrades[up.id] || 0;
        return [
          `${up.icon || "?"} ${up.name} (lv ${owned})`,
          up.description,
          "",
        ];
      });

      const visibleLines = Math.max(1, Math.floor(textH / lineH));
      const maxScrollY = Math.max(0, infoLines.length - visibleLines);
      const longestLinePx = infoLines.reduce((max, line) => Math.max(max, ctx.measureText(line).width), 0);
      const maxScrollX = Math.max(0, Math.ceil(longestLinePx - textW));
      state.upgradeInfoScrollY = clamp(state.upgradeInfoScrollY, 0, maxScrollY);
      state.upgradeInfoScrollX = clamp(state.upgradeInfoScrollX, 0, maxScrollX);

      ctx.fillStyle = "rgba(8, 10, 16, 0.94)";
      ctx.fillRect(infoX, infoY, infoW, infoH);
      ctx.strokeStyle = "#9edfff";
      ctx.strokeRect(infoX + 0.5, infoY + 0.5, infoW - 1, infoH - 1);
      ctx.fillStyle = "#ecf7ff";
      ctx.fillText("INFO BOOSTOW", infoX + 8, infoY + 8);

      ctx.save();
      ctx.beginPath();
      ctx.rect(textX, textY, textW, textH);
      ctx.clip();

      for (let i = 0; i < visibleLines; i++) {
        const line = infoLines[state.upgradeInfoScrollY + i];
        if (line === undefined) break;
        ctx.fillStyle = i % 3 === 0 ? "#a8fff4" : "#e6dcff";
        ctx.fillText(line, textX - state.upgradeInfoScrollX, textY + i * lineH);
      }
      ctx.restore();

      if (maxScrollY > 0) {
        const barX = infoX + infoW - 6;
        const thumbH = Math.max(10, Math.floor((visibleLines / infoLines.length) * textH));
        const thumbY = textY + Math.floor((state.upgradeInfoScrollY / maxScrollY) * (textH - thumbH));
        ctx.fillStyle = "#3b4a68";
        ctx.fillRect(barX, textY, 3, textH);
        ctx.fillStyle = "#7af2ff";
        ctx.fillRect(barX, thumbY, 3, thumbH);
      }

      if (maxScrollX > 0) {
        const barY = infoY + infoH - 5;
        const thumbW = Math.max(14, Math.floor((textW / (textW + maxScrollX)) * textW));
        const thumbX = textX + Math.floor((state.upgradeInfoScrollX / maxScrollX) * (textW - thumbW));
        ctx.fillStyle = "#3b4a68";
        ctx.fillRect(textX, barY, textW, 2);
        ctx.fillStyle = "#7af2ff";
        ctx.fillRect(thumbX, barY, thumbW, 2);
      }
    }
  }
  function getDialogueWrappedLines(line, maxWidth, maxLines) {
    if (!line) return ["..."];
    const sceneId = state.dialogue.key || "none";
    const cacheKey = [sceneId, state.dialogue.lineIndex, maxWidth, maxLines, line.text].join("|");

    if (dialogueLayoutCache.has(cacheKey)) {
      return dialogueLayoutCache.get(cacheKey);
    }

    const wrapped = wrapTextLines(line.text, maxWidth, maxLines);
    dialogueLayoutCache.set(cacheKey, wrapped);
    return wrapped;
  }

  function sliceDialogueLinesForTypewriter(wrappedLines, visibleChars) {
    if (!Number.isFinite(visibleChars) || visibleChars <= 0) return [""];

    let remaining = visibleChars;
    const out = [];

    for (let i = 0; i < wrappedLines.length; i++) {
      const line = wrappedLines[i];
      if (remaining <= 0) break;

      const take = Math.min(line.length, remaining);
      out.push(line.slice(0, take));
      remaining -= line.length;

      // Account for implicit line break between wrapped rows.
      if (remaining > 0 && i < wrappedLines.length - 1) {
        remaining -= 1;
      }

      if (take < line.length) break;
    }

    return out.length > 0 ? out : [""];
  }

  function drawPlayerPortraitFrame(stateName, anim, x, y) {
    if (!playerSprites.ready) return false;
    const key = `player.${stateName}.${anim}.00`;
    const frame = playerSprites.frames[key] || getPlayerAnimFrame(stateName, anim);
    if (!frame) return false;

    const img = playerSprites.images[frame.sheet];
    if (!img) return false;

    const pivot = frame.pivot || { x: 16, y: 29 };
    const fx = frame.frame.x;
    const fy = frame.frame.y;
    const fw = frame.frame.w;
    const fh = frame.frame.h;
    const renderScale = playerSprites.renderScale || 1;
    const drawW = Math.max(1, Math.round(fw * renderScale));
    const drawH = Math.max(1, Math.round(fh * renderScale));
    const pivotX = Math.round(pivot.x * renderScale);
    const pivotY = Math.round(pivot.y * renderScale);
    const drawY = y - pivotY;

    ctx.drawImage(img, fx, fy, fw, fh, x - pivotX, drawY, drawW, drawH);
    return true;
  }

  function drawSpeakerPortraitById(id, x, y) {
    if (!id) return false;

    const portrait = uiAssets.portraits[id];
    if (portrait) {
      ctx.drawImage(portrait, x + 1, y + 1, 38, 42);
      return true;
    }

    if (SURVIVOR_PORTRAIT_IDS.has(id) && uiAssets.portraits.survivor) {
      ctx.drawImage(uiAssets.portraits.survivor, x + 1, y + 1, 38, 42);
      return true;
    }

    if (id === "cactus") {
      if (!drawPlayerPortraitFrame("fit", "idle", x + 20, y + 44)) {
        drawTutorialHeroPortrait(x, y);
      }
      return true;
    }

    if (id === "blueeye") {
      if (!drawNpcFrame("blueeye", "idle_float", x + 20, y + 32, 1, 8, 0.1, state.elapsed)) {
        warnThrottled("sprite-portrait-blueeye", "Portrait sprite not drawn for blueeye");
        return false;
      }
      return true;
    }

    if (id === "ragebun" || id === "szokobons") {
      return drawNpcFrame(id, "idle", x + 18, y + 26, 1, 8, 0.1, state.elapsed);
    }

    if (id === "redbunny") {
      const drew = drawNpcFrame("ragebun", "idle", x + 18, y + 26, 1, 8, 0.1, state.elapsed);
      // Red tint overlay handled by sprite selection
      return drew;
    }

    // Default to player portrait
    drawPlayerPortrait(x, y);
    return true;
  }

  function drawAchievementScreen() {
    ctx.save();
    
    // Draw the background based on return mode
    const bgIndex = state.achievementScreen.returnMode === MODE.PLAYING ? (state.level ? state.level.id : 0) + 1 : 0;
    drawBackground(bgIndex);

    // Semi-transparent overlay
    ctx.fillStyle = "rgba(10, 5, 16, 0.85)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Achievement panel
    const panelW = 320;
    const panelH = 140;
    const panelX = Math.floor(GAME_WIDTH / 2 - panelW / 2);
    const panelY = Math.floor(GAME_HEIGHT / 2 - panelH / 2);

    // Panel background
    ctx.fillStyle = "#1a0d24";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    
    // Panel border - gold/achievement color
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.strokeRect(panelX + 1, panelY + 1, panelW - 2, panelH - 2);

    // Inner glow effect
    ctx.strokeStyle = "#4a3520";
    ctx.lineWidth = 1;
    ctx.strokeRect(panelX + 4, panelY + 4, panelW - 8, panelH - 8);

    // Reset text properties
    ctx.textBaseline = "top";
    ctx.textAlign = "left";

    // Achievement icon (star)
    const iconX = panelX + 20;
    const iconY = panelY + 24;
    ctx.fillStyle = "#ffd700";
    ctx.beginPath();
    ctx.arc(iconX + 16, iconY + 16, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a0d24";
    ctx.font = "bold 18px 'Broken Gold', 'Courier New', monospace";
    ctx.textAlign = "center";
    ctx.fillText("★", iconX + 16, iconY + 22);

    // "Achievement Unlocked" header
    ctx.fillStyle = "#ffd700";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText("OSIAGNIECIE ODBLOKOWANE", panelX + 48, panelY + 20);

    // Get achievement data
    const achievementId = state.achievementScreen.currentAchievementId;
    const achievementData = ACHIEVEMENT_DEFS.find(a => a.id === achievementId) || 
      (GAME_TEXTS.achievements && GAME_TEXTS.achievements[achievementId]) || 
      { name: achievementId, desc: "" };
    
    const achName = achievementData.name || achievementId;
    const achDesc = achievementData.desc || "";

    // Achievement name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 14px 'Broken Gold', 'Courier New', monospace";
    ctx.textAlign = "left";
    ctx.fillText(achName, panelX + 16, panelY + 52);

    // Achievement description
    ctx.fillStyle = "#b8a8c8";
    ctx.font = "11px 'Broken Gold', 'Courier New', monospace";
    ctx.fillText(achDesc, panelX + 16, panelY + 70);

    // Continue instruction
    ctx.fillStyle = "#7af2ff";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    ctx.textAlign = "center";
    const continueText = "Nacisnij [SPACE] lub [ENTER] aby kontynuowac";
    ctx.fillText(continueText, Math.floor(GAME_WIDTH / 2), panelY + panelH - 16);

    ctx.restore();
  }

  function drawDialogueScreen() {
    drawBackground(2);

    const line = getCurrentDialogueLine();
    const speaker = line ? (line.speakerName || CHARACTER_MANIFEST[line.speakerId]?.name || "Narrator") : "Narrator";
    const fullText = line ? line.text : "...";
    const visibleChars = Math.floor(state.dialogue.charIndex);

    const boxX = 18;
    const boxY = 124;
    const boxW = GAME_WIDTH - 36;
    const boxH = 178;

    const portraitX = boxX + 10;
    const portraitY = boxY + 14;

    ctx.fillStyle = "rgba(10, 8, 16, 0.9)";
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = "#9edfff";
    ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);

    const portraitId = line
      ? (line.speakerId === "narrator" ? "narrator" : line.portraitId)
      : null;
    const hasPortraitSlot = Boolean(portraitId);
    if (hasPortraitSlot) {
      ctx.fillStyle = "#1f2b3d";
      ctx.fillRect(portraitX, portraitY, 40, 44);
      ctx.strokeStyle = "#7af2ff";
      ctx.strokeRect(portraitX + 0.5, portraitY + 0.5, 39, 43);
      drawSpeakerPortraitById(portraitId, portraitX + 1, portraitY + 2);
    }

    ctx.fillStyle = "#a8fff4";
    ctx.font = "12px 'Broken Gold', 'Courier New', monospace";
    ctx.fillText(speaker.toUpperCase(), hasPortraitSlot ? portraitX + 48 : portraitX, portraitY + 2);

    const textX = hasPortraitSlot ? portraitX + 48 : portraitX;
    const textY = portraitY + 22;
    const textW = boxW - (textX - boxX) - 14;
    const lineHeight = 14;
    const maxLines = 7;
    const fullWrapped = getDialogueWrappedLines({ text: fullText || "..." }, textW, maxLines);
    const wrapped = state.dialogue.phase === DIALOGUE_PHASE.LINE_TYPING
      ? sliceDialogueLinesForTypewriter(fullWrapped, visibleChars)
      : fullWrapped;

    ctx.fillStyle = "#ecf7ff";
    for (let i = 0; i < wrapped.length; i++) {
      ctx.fillText(wrapped[i], textX, textY + i * lineHeight);
    }

    const readyForNext = state.dialogue.phase === DIALOGUE_PHASE.LINE_SHOW;
    ctx.fillStyle = readyForNext ? "#7af2ff" : "#4f6d87";
    ctx.fillText(readyForNext ? "NEXT >>" : "...", boxX + boxW - 90, boxY + boxH - 20);

    ctx.fillStyle = "#9fd8ff";
    ctx.fillText("LPM / Spacja / Enter", boxX + 12, boxY + boxH - 20);
    if (state.dialogue.allowSkip) {
      ctx.fillStyle = "#b7a6c9";
      ctx.fillText("ESC = SKIP", boxX + 176, boxY + boxH - 20);
    }
  }

  function drawEndingChoiceScreen() {
    drawBackground(6);

    ctx.fillStyle = "rgba(12, 7, 18, 0.9)";
    ctx.fillRect(26, 30, GAME_WIDTH - 52, 206);
    ctx.strokeStyle = "#b5f6ff";
    ctx.strokeRect(26.5, 30.5, GAME_WIDTH - 53, 205);

    ctx.fillStyle = "#ebfbff";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    drawWrappedText("Brama Niebieskiego Oka pekla. Wybierz los Wypedzonych.", 40, 56, GAME_WIDTH - 80, 12, 3);

    const buttons = getUiButtons(MODE.ENDING_CHOICE);
    for (const button of buttons) {
      const hovered = state.ui.hoverButtonId === button.id;
      const selected = state.ui.selectedButtonId === button.id;
      ctx.fillStyle = hovered || selected ? "#355466" : "#223646";
      ctx.fillRect(button.rect.x, button.rect.y, button.rect.w, button.rect.h);
      ctx.strokeStyle = hovered || selected ? "#d5f7ff" : "#7ab6d4";
      ctx.strokeRect(button.rect.x + 0.5, button.rect.y + 0.5, button.rect.w - 1, button.rect.h - 1);
      ctx.fillStyle = "#ebfbff";
      const label = button.id === "ending_return" ? "WRACAM" : "ZOSTAJE";
      ctx.fillText(label, button.rect.x + 24, button.rect.y + 8);
    }

    ctx.fillStyle = "#9fd8ff";
    ctx.fillText("LPM lub Enter", 40, 224);
  }

  function drawEndingScreen() {
    drawBackground(4);

    ctx.fillStyle = "rgba(12, 7, 18, 0.86)";
    ctx.fillRect(16, 30, 448, 220);
    ctx.strokeStyle = "#b5f6ff";
    ctx.strokeRect(16.5, 30.5, 447, 219);

    ctx.fillStyle = "#ebfbff";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    drawWrappedText("Brama Niebieskiego Oka zdobyta.", 30, 56, 430, 12, 2);
    drawWrappedText("Twoj wybor: " + (state.endingChoice || "BRAK"), 30, 74, 430, 12, 2);

    if (state.endingChoice === "WRACAM") {
      drawWrappedText("Wracasz, ale nie jako poddany. Wracasz z prawda.", 30, 104, 430, 12, 4);
    } else {
      drawWrappedText("Zostajesz. Wypedzeni buduja nowy porzadek bez masek.", 30, 104, 430, 12, 4);
    }

    ctx.fillText("Wynik koncowy: " + state.score, 30, 174);
    ctx.fillText("Enter / Spacja / LPM - do menu", 30, 200);
  }

  function drawGameOverScreen() {
    drawBackground(state.level ? state.level.id : 0);
    ctx.fillStyle = "rgba(13, 6, 18, 0.88)";
    ctx.fillRect(24, 58, 272, 122);
    ctx.strokeStyle = "#ffb6c9";
    ctx.strokeRect(24.5, 58.5, 271, 121);

    const reasonMap = {
      hp_depleted: "HP spadlo do zera.",
      fall_hazard: "Zostałeś stracony, moe.",
      extreme_fat: "Za duza masa, koniec biegu.",
    };
    const reason = reasonMap[state.runStats.deathReason] || "Porazka.";

    ctx.fillStyle = "#fff1f4";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    ctx.fillText("Zostałeś Donicą - GAME OVER", 40, 82);
    ctx.fillText(reason, 40, 98);
    ctx.fillText("HP dmg " + state.runStats.damageTakenHp + " | Fat dmg " + Math.round(state.runStats.damageTakenFat), 40, 118);
    ctx.fillText("Pulapki " + state.runStats.hazardsTriggered, 40, 132);
    ctx.fillText("Enter / Spacja / LPM - restart", 40, 154);
  }
  function drawPauseOverlay() {
    ctx.fillStyle = "rgba(11, 8, 20, 0.45)";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    ctx.fillStyle = "rgba(16, 8, 21, 0.9)";
    ctx.fillRect(86, 94, 148, 52);
    ctx.strokeStyle = "#ffd4e8";
    ctx.strokeRect(86.5, 94.5, 147, 51);

    ctx.fillStyle = "#fff7fb";
    ctx.font = "10px 'Broken Gold', 'Courier New', monospace";
    ctx.fillText("Pauza", 138, 112);
    ctx.fillText("P / Esc / Enter / Spacja", 82, 126);
  }

  function wrapTextLines(text, maxWidth, maxLines = Infinity) {
    const source = String(text || "");
    const paragraphs = source.split("\n");
    const out = [];

    for (const paragraph of paragraphs) {
      const words = paragraph.split(" ").filter(Boolean);
      if (words.length === 0) {
        out.push("");
        continue;
      }

      let line = "";
      for (const word of words) {
        const test = line ? `${line} ${word}` : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          out.push(line);
          line = word;
        } else {
          line = test;
        }
      }
      if (line) out.push(line);
    }

    if (out.length > maxLines) {
      const limited = out.slice(0, maxLines);
      const last = limited[maxLines - 1] || "";
      limited[maxLines - 1] = last.length > 2 ? last.slice(0, Math.max(0, last.length - 2)) + ".." : "..";
      return limited;
    }
    return out;
  }

  function drawWrappedText(text, x, y, maxWidth, lineHeight, maxLines = Infinity) {
    const lines = wrapTextLines(text, maxWidth, maxLines);
    lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineHeight));
    return lines.length;
  }

  function render() {
    if (state.mode === MODE.POWER_OFF) {
      drawPowerOffScreen();
      return;
    }

    if (state.mode === MODE.BOOT) {
      drawBootScreen();
      return;
    }

    if (state.mode === MODE.MENU || state.mode === MODE.TITLE) {
      drawMenuScreen();
      return;
    }

    if (state.mode === MODE.SETTINGS) {
      drawSettingsScreen();
      return;
    }

    if (state.mode === MODE.ABOUT) {
      drawAboutScreen();
      return;
    }

    if (state.mode === MODE.SAVES) {
      drawSavesScreen();
      return;
    }

    if (state.mode === MODE.UPGRADE) {
      drawUpgradeScreen();
      return;
    }

    if (state.mode === MODE.DIALOGUE) {
      drawDialogueScreen();
      return;
    }

    if (state.mode === MODE.ENDING_CHOICE) {
      drawEndingChoiceScreen();
      return;
    }

    if (state.mode === MODE.ENDING) {
      drawEndingScreen();
      return;
    }

    if (state.mode === MODE.GAME_OVER) {
      drawGameOverScreen();
      return;
    }

    if (state.mode === MODE.ACHIEVEMENT) {
      drawAchievementScreen();
      return;
    }

    drawLevel();
    drawProjectiles();
    drawEnemies();
    drawStoryNpcInWorld();
    drawPlayer();
    drawHud();

    if (state.mode === MODE.PAUSED) {
      drawPauseOverlay();
    }
  }

  function tick(dt) {
    update(dt);
    clearPressed();
  }

  function frame(ts) {
    if (!lastTs) {
      lastTs = ts;
    }
    const delta = Math.min(0.25, (ts - lastTs) / 1000);
    lastTs = ts;
    accumulator += delta;

    while (accumulator >= FIXED_DT) {
      tick(FIXED_DT);
      accumulator -= FIXED_DT;
    }

    render();
    window.requestAnimationFrame(frame);
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await canvas.requestFullscreen?.();
    } else {
      await document.exitFullscreen?.();
    }
    updateCanvasDisplaySize();
    render();
  }

  window.addEventListener("resize", () => {
    updateCanvasDisplaySize();
    render();
  });

  document.addEventListener("fullscreenchange", () => {
    updateCanvasDisplaySize();
    render();
  });

  window.render_game_to_text = () => {
    const p = state.player;
    const upgradeStatus = UPGRADE_DEFS.map((upgrade) => {
      const owned = state.upgrades[upgrade.id] || 0;
      const maxStacks = upgrade.maxStacks ?? (upgrade.repeatable ? 99 : 1);
      return {
        id: upgrade.id,
        owned,
        maxStacks,
        repeatable: Boolean(upgrade.repeatable),
        maxed: owned >= maxStacks,
      };
    });

    const payload = {
      note: "coords origin top-left, +x right, +y down",
      mode: state.mode,
      level: state.level ? state.level.id : null,
      worldWidth: state.level ? state.level.worldWidth : null,
      cameraX: Number(state.cameraX.toFixed(2)),
      score: state.score,
      coins: state.coins,
      menu: {
        menuIndex: state.menuIndex,
        settingsIndex: state.settingsIndex,
        musicOn: state.uiSettings.musicOn,
        sfxOn: state.uiSettings.sfxOn,
        bootTimer: Number(state.bootTimer.toFixed(2)),
      },
      runStats: {
        deathReason: state.runStats.deathReason,
        hazardsTriggered: state.runStats.hazardsTriggered,
        damageTakenHp: state.runStats.damageTakenHp,
        damageTakenFat: Number(state.runStats.damageTakenFat.toFixed(2)),
      },
      tutorial: {
        active: state.tutorial.active,
        hint: state.tutorial.currentHint,
        moved: state.tutorial.moved,
        jumped: state.tutorial.jumped,
        shot: state.tutorial.shot,
        hpHit: state.tutorial.hpHit,
        fatHit: state.tutorial.fatHit,
        dodged: state.tutorial.dodged,
        interacted: state.tutorial.interacted,
      },
      activeNPC: state.story.activeNPC,
      npcState: state.story.npcState,
      currentDialogueId: state.story.currentDialogueId,
      encounterPhase: state.story.encounterPhase,
      dialogue: {
        key: state.dialogue.key,
        phase: state.dialogue.phase,
        lineIndex: state.dialogue.lineIndex,
        charIndex: Number(state.dialogue.charIndex.toFixed(2)),
        allowSkip: state.dialogue.allowSkip,
        returnMode: state.dialogue.returnMode,
        length: state.dialogue.scene?.lines?.length || 0,
      },
      ui: {
        hoverButtonId: state.ui.hoverButtonId,
        selectedButtonId: state.ui.selectedButtonId,
      },
      campaign: {
        levelCount: LEVELS.length,
        endingChoice: state.endingChoice,
      },
      player: {
        x: Number(p.x.toFixed(2)),
        y: Number(p.y.toFixed(2)),
        vx: Number(p.vx.toFixed(2)),
        vy: Number(p.vy.toFixed(2)),
        hp: p.hp,
        maxHp: p.maxHp,
        fat: Number(p.fat.toFixed(2)),
        fatStage: FATNESS[p.fatStage].name,
        hitboxScale: Number(p.hitboxScale.toFixed(2)),
        activeEffects: {
          metabolismBurst: Number(p.activeEffects.metabolismBurst.toFixed(2)),
          sugarGuard: Number(p.activeEffects.sugarGuard.toFixed(2)),
        },
        cooldowns: {
          metabolismBurst: Number(p.cooldowns.metabolismBurst.toFixed(2)),
          thinDash: Number(p.cooldowns.thinDash.toFixed(2)),
          sugarGuard: Number(p.cooldowns.sugarGuard.toFixed(2)),
        },
        attackDamage: p.attackDamage,
        shootCooldown: Number(Math.max(0, p.shootCooldown).toFixed(2)),
      },
      enemies: state.enemies.map((enemy) => ({
        id: enemy.id,
        archetype: enemy.archetype,
        x: Number(enemy.x.toFixed(2)),
        y: Number(enemy.y.toFixed(2)),
        hp: enemy.hp,
        state: enemy.state,
        telegraphTimer: Number(enemy.telegraphTimer.toFixed(2)),
        attackPatternId: enemy.attackPatternId,
      })),
      projectiles: state.projectiles.map((projectile) => ({
        owner: projectile.owner,
        kind: projectile.kind,
        damageType: projectile.damageType,
        sourceArchetype: projectile.sourceArchetype,
        x: Number(projectile.x.toFixed(2)),
        y: Number(projectile.y.toFixed(2)),
        ttl: Number(projectile.ttl.toFixed(2)),
      })),
      hazards: state.level?.hazards || [],
      boss: state.boss.active || state.level?.id === 7
        ? {
          active: state.boss.active,
          phase: state.boss.phase,
          hp: state.boss.hp,
          maxHp: state.boss.maxHp,
          attackPatternId: state.boss.attackPatternId,
        }
        : null,
      upgrades: { ...state.upgrades },
      upgradeStatus,
      achievements: state.unlockedAchievementOrder.slice(),
      flags: {
        eyeUnlocked: state.flags.eyeUnlocked,
        eyeDone: state.flags.eyeDone,
      },
    };
    return JSON.stringify(payload);
  };
  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let i = 0; i < steps; i++) {
      tick(FIXED_DT);
    }
    render();
  };
  ctx.textAlign = "left";
  updateCanvasDisplaySize();
  loadBitmapFont();
  loadPlayerSprites();
  loadNpcSprites();
  loadUiAssets();
  let spriteRetryCount = 0;
  const spriteRetryTimer = window.setInterval(async () => {
    if (playerSprites.ready && npcSprites.ready) {
      window.clearInterval(spriteRetryTimer);
      return;
    }
    spriteRetryCount += 1;
    await ensureSpriteAtlasesLoaded();
    if ((playerSprites.ready && npcSprites.ready) || spriteRetryCount >= 20) {
      window.clearInterval(spriteRetryTimer);
      if (!playerSprites.ready || !npcSprites.ready) {
        const protocol = window.location?.protocol || "unknown";
        console.error(
          `[sprites] atlas load incomplete after retries (protocol=${protocol}). ` +
          `If you open the game via file://, run it from a local server (http://127.0.0.1:PORT).`
        );
      }
    }
  }, 500);
  updateSidePanel();
  render();
  window.requestAnimationFrame(frame);
})();
