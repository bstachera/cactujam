/**
 * UPGRADES - All upgrade definitions
 * Contains upgrade IDs, names, costs, descriptions, and mechanics
 */

const UPGRADE_DEFS = [
  {
    id: "metabolism_burst",
    key: "1",
    icon: "M",
    name: "Spalacz Tluszczu",
    shortName: "Spalacz",
    cost: 12,
    description: "Q: przez chwile topisz tluszczyk i masz lepsna odpornosc na slodycze",
    kind: "active_metabolism",
    repeatable: true,
    maxStacks: 5,
  },
  {
    id: "thin_air_dash",
    key: "2",
    icon: "J",
    name: "Skok+",
    shortName: "Skok+",
    cost: 10,
    description: "Lepszy skok i dodatkowy podskok w powietrzu (Spacja)",
    kind: "jump_boost",
    repeatable: false,
    maxStacks: 1,
  },
  {
    id: "reactive_combat",
    key: "3",
    icon: "R",
    name: "Kolce+",
    shortName: "Kolce+",
    cost: 14,
    description: "Po oberwaniu HP wybuchaja kolce. Wiekszy poziom = wiekszy bzik i dmg",
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
    name: "Luk+",
    shortName: "Luk+",
    cost: 11,
    description: "Lepsza balistyka kolcow: dalej i plaskiej. Podstawa to lot po luku.",
    kind: "spike_ballistics",
    repeatable: true,
    maxStacks: 4,
  },
];

// Icon paths for upgrade icons
const UPGRADE_ICON_PATHS = {
  metabolism_burst: "./assets/ui/skills/metabolism_burst.png",
  thin_air_dash: "./assets/ui/skills/thin_air_dash.png",
  reactive_combat: "./assets/ui/skills/reactive_combat.png",
  spike_ballistics: "./assets/ui/skills/spike_ballistics.png",
  sugar_guard: "./assets/ui/skills/sugar_guard.png",
};

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UPGRADE_DEFS,
    UPGRADE_ICON_PATHS,
  };
}

// Also expose to window for browser usage
if (typeof window !== 'undefined') {
  window.UPGRADE_DEFS = UPGRADE_DEFS;
  window.UPGRADE_ICON_PATHS = UPGRADE_ICON_PATHS;
}
