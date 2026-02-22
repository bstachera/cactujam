/**
 * CHARACTERS - Character configuration and animation system
 * Theme: Naked man + Valentine + Thickness
 * Always uses PNG sprites, no fallback drawing
 */

// Fatness/Body type configurations - each with different physics
const FATNESS = [
  {
    name: "FIT",
    speed: 96,
    accel: 800,
    jump: 192,
    airControl: 0.74,
    shootCooldown: 0.32,
    hitboxScale: 1,
    color: "#56de69",
    spriteState: "fit",
    spriteSheet: "cactus_hero_fit_hd.png",
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
    spriteState: "chubby",
    spriteSheet: "cactus_hero_chubby_hd.png",
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
    spriteState: "heavy",
    spriteSheet: "cactus_hero_heavy_hd.png",
  },
];

// NPC character configurations
const NPC_CONFIGS = {
  blueeye: {
    name: "Niebieskie Oko",
    spriteSheet: "blueeye_sheet_hd.png",
    animations: {
      idle: { frames: 6, fps: 8 },
      idle_float: { frames: 6, fps: 8 },
      blink: { frames: 4, fps: 4 },
      speak_pulse: { frames: 4, fps: 10 },
      attack_cast: { frames: 4, fps: 10 },
      vanish: { frames: 6, fps: 8 },
    },
  },
  ragebun: {
    name: "Ragebun",
    spriteSheet: "ragebun_sheet_hd.png",
    animations: {
      idle: { frames: 4, fps: 8 },
      walk: { frames: 6, fps: 10 },
      attack: { frames: 4, fps: 8 },
      hurt: { frames: 2, fps: 6 },
      death: { frames: 6, fps: 8 },
    },
  },
  szokobons: {
    name: "SzokoBons",
    spriteSheet: "szokobons_sheet_hd.png",
    animations: {
      idle: { frames: 4, fps: 8 },
      walk: { frames: 6, fps: 10 },
      attack: { frames: 4, fps: 8 },
      hurt: { frames: 2, fps: 6 },
      death: { frames: 6, fps: 8 },
    },
  },
  redbunny: {
    name: "RedBunny",
    spriteSheet: "ragebun_sheet_hd.png", // Uses same sheet with color overlay
    animations: {
      idle: { frames: 4, fps: 8 },
      walk: { frames: 6, fps: 10 },
      attack: { frames: 4, fps: 8 },
      hurt: { frames: 2, fps: 6 },
      death: { frames: 6, fps: 8 },
    },
    colorOverlay: "rgba(255, 54, 66, 0.45)",
  },
};

// Player sprite system
const playerSprites = {
  ready: false,
  atlas: null,
  frames: {},
  images: {},
  renderScale: 1,
};

// NPC sprite system
const npcSprites = {
  ready: false,
  atlas: null,
  frames: {},
  images: {},
  renderScale: 1,
};

// Animation FPS configuration per animation type
const PLAYER_ANIM_FPS = {
  idle: 8,
  run: { fit: 14, chubby: 12, heavy: 10 },
  jump_start: 14,
  jump_air: 6,
  fall: 8,
  land: 14,
  shoot_ground: 14,
  shoot_air: 12,
  hurt: 12,
  death: 8,
  interaction: 8,
  victory: 8,
};

// Get FPS for player animation based on body type
function getPlayerAnimFPS(animName, fatStage = 0) {
  const fpsConfig = PLAYER_ANIM_FPS[animName];
  if (!fpsConfig) return 8;
  
  if (typeof fpsConfig === 'number') return fpsConfig;
  
  // Handle run speed variation by body type
  if (animName === 'run') {
    const states = ['fit', 'chubby', 'heavy'];
    return fpsConfig[states[fatStage]] || 8;
  }
  
  return 8;
}

// Get player sprite state name based on fat stage
function getPlayerSpriteStateName(fatStage) {
  if (fatStage === 0) return "fit";
  if (fatStage === 1) return "chubby";
  return "heavy";
}

// Get animation name based on player state
function getPlayerAnimName(player, elapsed, onGround, vy, hurtTimer, lastShotTime, jumpStartTimer) {
  const shotAge = elapsed - lastShotTime;
  if (hurtTimer > 0) return "hurt";
  if (shotAge <= 0.18) return onGround ? "shoot_ground" : "shoot_air";
  if (!onGround) {
    if (vy < -36 && jumpStartTimer > 0) return "jump_start";
    if (vy < 30) return "jump_air";
    return "fall";
  }
  if (vy >= 30) return "fall";
  if (onGround && vy > 0) return "land";
  if (vy < -36) return "jump_start";
  return "idle";
}

// Get animation frame from player sprites
function getPlayerAnimFrame(stateName, animName, elapsed) {
  const total = playerSprites.atlas?.meta?.animations?.[animName];
  if (!total || total <= 0) return null;

  const fps = getPlayerAnimFPS(animName, stateName === 'fit' ? 0 : stateName === 'chubby' ? 1 : 2);
  const frameIndex = Math.floor(elapsed * fps) % total;
  const key = `player.${stateName}.${animName}.${String(frameIndex).padStart(2, "0")}`;
  return playerSprites.frames[key] || null;
}

// Get NPC animation frame
function getNpcAnimFrame(name, anim, fps = 8, seed = 0, elapsed) {
  const count = npcSprites.atlas?.meta?.animations?.rabbit?.[anim]
    ?? npcSprites.atlas?.meta?.animations?.blueeye?.[anim]
    ?? 0;
  if (!count) return null;

  const frameIndex = Math.floor((elapsed + seed) * fps) % count;
  const key = `npc.${name}.${anim}.${String(frameIndex).padStart(2, "0")}`;
  return npcSprites.frames[key] || null;
}

// Draw player using PNG sprites only (no fallback drawing)
function drawPlayerSprite(ctx, player, state) {
  const pulse = player.invuln > 0 && Math.floor(state.elapsed * 20) % 2 === 0;
  if (pulse) return;

  if (!playerSprites.ready) {
    console.warn("Player sprites not loaded");
    return;
  }

  const stateName = getPlayerSpriteStateName(player.fatStage);
  const animName = getPlayerAnimName(
    player,
    state.elapsed,
    player.onGround,
    player.vy,
    player.hurtTimer,
    player.lastShotTime,
    player.jumpStartTimer
  );
  const frame = getPlayerAnimFrame(stateName, animName, state.elapsed);
  
  if (!frame) {
    console.warn(`No frame for ${stateName}.${animName}`);
    return;
  }

  const img = playerSprites.images[frame.sheet];
  if (!img) {
    console.warn(`No image for sheet: ${frame.sheet}`);
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

  ctx.save();
  if (player.facing >= 0) {
    const drawX = anchorX - pivotX;
    ctx.drawImage(img, fx, fy, fw, fh, drawX, drawY, drawW, drawH);
  } else {
    ctx.translate(anchorX, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, fx, fy, fw, fh, -pivotX, drawY, drawW, drawH);
  }
  ctx.restore();
}

// Draw NPC frame using PNG sprites
function drawNpcFrame(name, anim, x, y, facing = 1, fps = 8, seed = 0, elapsed = 0) {
  if (!npcSprites.ready) return false;

  const frame = getNpcAnimFrame(name, anim, fps, seed, elapsed);
  if (!frame) return false;

  const img = npcSprites.images[frame.sheet];
  if (!img) return false;

  const pivot = frame.pivot || { x: 32, y: 58 };
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
  if (facing < 0) {
    ctx.translate(x, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(img, fx, fy, fw, fh, -pivotX, drawY, drawW, drawH);
  } else {
    ctx.drawImage(img, fx, fy, fw, fh, x - pivotX, drawY, drawW, drawH);
  }
  ctx.restore();

  return true;
}

// Export for use in game.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FATNESS,
    NPC_CONFIGS,
    playerSprites,
    npcSprites,
    getPlayerAnimFPS,
    getPlayerSpriteStateName,
    getPlayerAnimName,
    getPlayerAnimFrame,
    getNpcAnimFrame,
    drawPlayerSprite,
    drawNpcFrame,
  };
}

// Also expose to window for browser usage
if (typeof window !== 'undefined') {
  window.FATNESS = FATNESS;
  window.NPC_CONFIGS = NPC_CONFIGS;
  window.playerSprites = playerSprites;
  window.npcSprites = npcSprites;
  window.getPlayerAnimFPS = getPlayerAnimFPS;
  window.getPlayerSpriteStateName = getPlayerSpriteStateName;
  window.getPlayerAnimName = getPlayerAnimName;
  window.getPlayerAnimFrame = getPlayerAnimFrame;
  window.getNpcAnimFrame = getNpcAnimFrame;
  window.drawPlayerSprite = drawPlayerSprite;
  window.drawNpcFrame = drawNpcFrame;
}
