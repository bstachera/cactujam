/**
 * LEVELS - All level configurations with block positions
 * Contains platforms, hazards, enemies, and spawn/exit points
 */

const LEVELS = [
  {
    id: 1,
    name: "Ogród wypędzonych",
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

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LEVELS,
    LEVEL_SCENE_MAP,
  };
}

// Also expose to window for browser usage
if (typeof window !== 'undefined') {
  window.LEVELS = LEVELS;
  window.LEVEL_SCENE_MAP = LEVEL_SCENE_MAP;
}
