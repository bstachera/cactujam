Original prompt: Build and iterate a playable web game in this workspace, validating changes with a Playwright loop. Create a browser-based 2D NES-style platformer (320x240) with keyboard movement/jump, mouse aim/shoot, fatness stages, rabbit enemies throwing hearts/chocolate, 5 levels with upgrade screens, and blue-eye dialogue unlock after level 2.

## 2026-02-20 - Initial implementation
- Created standalone browser game files: `index.html`, `styles.css`, `game.js`.
- Added playable 2D platformer loop with:
  - Player movement/jump (WASD/Arrows/Space), mouse aiming/shooting spikes.
  - Fatness system with 3 stages affecting movement and shooting cadence.
  - Rabbit enemies with projectile attacks (heart/chocolate) that increase fatness.
  - 5 levels with platform layouts, enemy placements, and exit gates.
  - Upgrade screen after each level (protein, fat burner, agility) with costs.
  - Dialogue screen with floating blue eye unlocked after clearing level 2.
  - Title/pause/gameover/ending states.
  - Deterministic hooks: `window.advanceTime(ms)` and `window.render_game_to_text()`.
- Added fullscreen toggle (`F`) and canvas scaling-friendly mouse mapping.

## TODO / next iteration
- Run Playwright loop and inspect screenshots/state/errors.
- Balance jump arcs/platform spacing after first automated run.
- Verify upgrade flow transitions and level clear conditions under scripted inputs.
- Add optional SFX and richer pixel sprite detail.

## 2026-02-20 - Progression tuning for testability
- Adjusted level completion: reaching the exit now progresses even if enemies remain.
- Added perfect-clear bonus when all rabbits are defeated (`+2` extra coins), preserving combat incentive.
- This change makes deterministic scripted runs reliably reach upgrade/dialogue/ending flows.

## 2026-02-20 - Validation loops (Playwright)
- Ran smoke loop:
  - Command: `node "$WEB_GAME_CLIENT" --url http://localhost:4173 --actions-file tests/actions_smoke.json --iterations 3 --pause-ms 250 --screenshot-dir output/web-game`
  - Verified screenshots show active gameplay with movement/jump/shoot and visible HUD.
  - Verified `state-*.json` captured player/enemy/projectile updates and fatness changes.
  - No `errors-*.json` produced.
- Ran progression loop:
  - Command: `node "$WEB_GAME_CLIENT" --url http://localhost:4173 --actions-file tests/actions_flow.json --iterations 2 --pause-ms 250 --screenshot-dir output/web-game-flow`
  - Reached ending state deterministically and verified state flags (`eyeUnlocked`, `eyeDone`) and level progression.
  - No `errors-*.json` produced.
- Ran dedicated state captures:
  - Upgrade capture: `tests/actions_upgrade.json` -> `output/web-game-upgrade`
  - Dialogue capture: `tests/actions_dialogue.json` -> `output/web-game-dialogue`
  - Both UI states render correctly; no console/page errors.

## Notes for next iteration
- Hidden debug shortcut is active on `B` key (`debugNext`) to accelerate state traversal in automated tests.
- Consider balancing projectile pressure on early levels; fat gain can spike quickly if idle.
- Optional polish: add small chip-SFX and improve text wrapping on long upgrade titles.

## 2026-02-20 - Final smoke
- Started local server with `nohup python3 -m http.server 4173 --directory .`.
- Ran final smoke loop against `http://127.0.0.1:4173`:
  - `node "$WEB_GAME_CLIENT" --url http://127.0.0.1:4173 --actions-file tests/actions_smoke.json --iterations 1 --pause-ms 250 --screenshot-dir output/web-game-final-smoke`
- Verified final screenshot and text-state output in `output/web-game-final-smoke`.
- No runtime console/page errors observed in this run.

## 2026-02-20 - Font sharpness + old TV shell
- Switched UI typography to bundled font in `fonts/` using `@font-face` (`Broken Gold`).
- Updated all canvas text draws to use `Broken Gold` with fallback monospace.
- Added integer-only canvas scaling (`1x`/`2x`) via `updateCanvasDisplaySize()` to avoid blur from fractional scaling.
- Changed page layout to CRT-style shell:
  - TV bezel frame around the canvas.
  - Scanline and vignette overlays.
  - Smaller effective play window (max 640x480 CSS size for 320x240 internal resolution).
- Validation:
  - Ran Playwright smoke loop: `output/web-game-font-tv`.
  - No console/page errors generated.

## Follow-up ideas
- If you want text even crisper, we can increase HUD/dialog font size by +1px and tighten line spacing.
- Can add subtle horizontal drift/noise animation for stronger CRT vibe.

## 2026-02-22 - Sprite atlas JSON animation integration check (player + NPC)
- Confirmed game already loads atlas JSON packs from:
  - `assets/sprites/player/cactus_hero_atlas_hd.json` fallback `cactus_hero_atlas.json`
  - `assets/sprites/npc/npc_atlas_hd.json` fallback `npc_atlas.json`
- Verified state-driven animation hooks are present for:
  - player (`idle/run/jump/fall/shoot/hurt/land`) via `getPlayerAnimName()`
  - NPCs (`idle/walk/attack/hurt/death`) + Blue Eye story/boss variants
- Fixed player sprite render scaling bug in `drawPlayer()`:
  - used `npcSprites.renderScale` before (latent issue),
  - now correctly uses `playerSprites.renderScale`.
- Added missing `assets/text/game_texts.js` stub to prevent startup `404` console error (index references this file).
- Removed missing portrait/logo preload paths that generated additional `404`s:
  - portraits for `cactus/blueeye/szokobons/ragebun` (renderer already has sprite-based fallbacks)
  - missing `ces/title` logo PNG preload paths (text fallback already exists)
- Next: run smoke Playwright check and visually confirm animated frames on gameplay screen.

## 2026-02-22 - Reduced atlas keyframes to 3 (start/mid/end)
- Reduced JSON atlases to 3 frames per animation (`00`,`01`,`02`) for easier manual sprite editing:
  - `assets/sprites/player/cactus_hero_atlas*.json`
  - `assets/sprites/npc/npc_atlas*.json`
- For animations that originally had only 1-2 frames, JSON duplicates the last frame to fill 3 keyframes.
- Updated game runtime to support sparse/reduced atlases:
  - frame lookup now falls back from missing exact frame to reduced `start/mid/end` keys
  - warning spam for missing sprites is throttled
  - atlas loading logs now report concrete load errors and retries
- Dialogue portrait rules aligned:
  - `narrator` has no avatar
  - `mirek` / `trani` use `survivor` portrait avatar

## 2026-02-20 - TV scale increased to 75% viewport
- Replaced previous hard cap (`max scale 2`) with dynamic viewport sizing in `updateCanvasDisplaySize()`:
  - target = `75%` of current window dimensions
  - canvas CSS size now scales to `min(0.75*vw, 0.75*vh with 4:3 ratio)`.
- Removed fixed CSS cap by setting base `#game` size to native `320x240`; JS now controls final display size.
- Verified with Playwright:
  - smoke run output in `output/web-game-tv-75`
  - no console/page errors
  - computed CSS size check at 1200x900 viewport: `900x675`.

## 2026-02-20 - Fix rozmazanego tekstu (NES pixel)
- Zidentyfikowano główny problem: antyaliasing `fillText` na canvas + niecałkowita skala.
- Dodano bitmapowy renderer fontu oparty o atlas:
  - `fonts/broken-gold-v1.png` + `fonts/broken-gold-v1.txt`
  - automatyczne parsowanie zestawu znaków i mapy glyphów.
- Podmieniono globalnie rysowanie tekstu (`ctx.fillText`) i pomiar szerokości (`ctx.measureText`) na wersję bitmapową.
- Utrzymano skalę TV na poziomie ~75% ekranu, ale z zaokrągleniem do całkowitych mnożników (ostrzejszy obraz).
- Zmniejszono siłę scanlines (`opacity 0.2`) aby poprawić czytelność.
- Walidacja Playwright:
  - gameplay: `output/web-game-text-crisp`
  - title/menu: `output/web-game-title-crisp`
  - brak `errors-*.json` w tych runach.

## 2026-02-20 - Major systems depth pass (HP/FAT/Boss/Upgrades/UI)
- Preserved existing architecture and mode machine; refactored internals in-place.

### Core systems
- Split survivability into HP and FAT:
  - `player.hp/maxHp` now drives death.
  - `player.fat/fatStage` now drives handling profile and hitbox scaling.
- Damage routing:
  - heart projectiles -> `damageType: "hp"`
  - chocolate projectiles -> `damageType: "fat"`
- Added explicit death reasons in `runStats.deathReason`:
  - `hp_depleted`, `fall_hazard`, `extreme_fat`
- Reduced passive fat loss strongly; tactical control moved into upgrades/effects.

### Enemies + pressure
- Added archetypes with distinct patterns and cadences:
  - `heart_rabbit` (HP pressure)
  - `choco_rabbit` (FAT zoning)
- Added telegraph state/timer and `attackPatternId` for readability and predictability.
- Mixed archetype composition in levels 2-4.

### Levels + hazards
- Reworked level data (IDs preserved 1..5) for more verticality and chokepoints.
- Added `hazards` arrays per level and hazard damage logic with telegraphed visuals.

### Boss (level 5)
- Replaced normal level-5 enemy flow with boss state/controller (`state.boss`).
- Boss uses heart + chocolate patterns and has phase switch logic by HP threshold.
- Boss victory transitions into existing ending mode.

### Upgrade overhaul
- Replaced old numeric-stat upgrades with behavior-changing options:
  1. Metabolism Burst (`Q`) - temporary fat control + chocolate mitigation
  2. Thin Air Dash (`E`) - air dash only while FIT
  3. Reactive Spikes - counter burst + fat-to-damage scaling
  4. Sugar Guard (`C`) - short mitigation window
- Added cooldown/effect tracking in player state.

### UI expansion
- Added side panel next to canvas with:
  - body preview (fat stage)
  - HP bar
  - FAT meter + stage
  - active upgrades
  - active effects/cooldowns
  - boss status and death reason
- Kept retro shell styling.

### Deterministic hooks
- Kept and extended:
  - `window.advanceTime(ms)`
  - `window.render_game_to_text()`

### Validation
- Playwright runs:
  - `output/web-game-phase-upgrade-smoke`
  - `output/web-game-phase-upgrade-flow`
  - `output/web-game-phase-upgrade-smoke2`
  - `output/web-game-boss-phase2`
- Full layout screenshot (canvas + side panel):
  - `output/web-game-full-layout.png`
- No `errors-*.json` generated in these runs.

### Open tuning notes
- Early HP loss from multiple heart hits is noticeable; likely needs slight cadence nerf on level 1.
- Boss phase-2 behavior exists in code but needs dedicated scripted validation path.

## 2026-02-20 - Main character cactus sprite package (FIT/CHUBBY/HEAVY)
- Generated complete playable player sprite package in `assets/sprites/player/`:
  - `cactus_hero_fit.png`
  - `cactus_hero_chubby.png`
  - `cactus_hero_heavy.png`
  - `cactus_hero_atlas.json`
  - `README.md`
- Frame setup implemented:
  - 32x32 frame size
  - right-facing base frames (designed for in-engine horizontal flip)
  - transparent background
  - crisp pixel rendering (nearest-neighbor style output, no blur)
- Animation coverage per body state:
  - idle(6), run(8), jump_start(2), jump_air(2), fall(2), land(2), shoot_ground(4), shoot_air(3), hurt(3), death(8), interaction(4), victory(4)
- Atlas metadata includes:
  - frame names using `player.{state}.{anim}.{frame}`
  - frame rects per sheet
  - pivot defaults
  - hitbox hints per body state
- Validation:
  - PNG sheet dimensions verified as `256x192` (8 columns x 6 rows)
  - JSON frame count verified: `144` total (`48` per state)

## 2026-02-20 - Incremental pass: economy/tutorial/story/boot menu/credits
- Continued from existing codebase (no rewrite). Preserved deterministic hooks:
  - `window.advanceTime(ms)`
  - `window.render_game_to_text()`

### Upgrade economy
- Increased upgrade costs and made ownership limits explicit via `repeatable` + `maxStacks` in `UPGRADE_DEFS`.
- Enforced purchase caps in `applyUpgrade()`:
  - non-repeatable defaults effectively one-time per run,
  - repeatable honors explicit `maxStacks`.
- Added status rendering in upgrade UI and side panel:
  - `LOCKED`, `OWNED`, `MAXED`
  - explicit `One-time` vs `Repeatable` labels.

### Tutorial level pass (Level 1)
- Level 1 remains tutorial-focused with contextual objective hints (`state.tutorial.currentHint`).
- Hints progress by triggers (move, jump, shoot, hp hit, fat hit, dodge, gate interaction) and clear as completed.
- Added gate interaction requirement (`Enter`) before Level 1 clear, then smooth continuation into normal progression.
- Added in-HUD tutorial hint strip for active tutorial state.

### Story expansion
- Intro exile dialogue is now part of run start flow and skippable.
- Added first rabbit encounter dialogue (`FIRST_RABBIT_DIALOGUE`) trigger.
- Added SzokoBons chocolate-pressure dialogue (`CHOCO_DIALOGUE`) trigger.
- Dialogue renderer now consumes active dialogue content (`state.dialogue.lines`) and supports paging/skip prompts.

### NES boot + menu flow
- Added pre-game flow states and wiring:
  - `POWER_OFF -> BOOT (CCT1) -> MENU`
  - `SETTINGS`, `ABOUT`
- Added update/render branches for new menu states and visual screens.
- Settings screen now supports toggles for music/sfx and controls info.
- Added `#power-btn` flow integration.

### Credits outside gameplay screen
- Added fixed footer credits outside the gameplay canvas shell.

### Validation (Playwright loop)
- Ran Playwright with local skill client in same-shell server lifecycle:
  - `tests/actions_menu_settings_about.json` -> `output/web-game-menu-pass`
  - `tests/actions_boot_start.json` -> `output/web-game-boot-start`
  - `tests/actions_tutorial_to_upgrade.json` -> `output/web-game-upgrade-owned`
  - `tests/actions_tutorial_clear_upgrade.json` -> `output/web-game-upgrade-clear`
- Checked screenshots and state JSON outputs.
- No `errors-*.json` generated in these runs.

### Notes / follow-up
- Debug shortcut behavior in dialogue adjusted to avoid forcing invalid mode transitions.
- Existing random enemy cooldown jitter remains; if stricter deterministic tests are needed, replace randomness with seeded RNG.
- Consider a dedicated scripted path to assert a full `OWNED -> MAXED` lifecycle on `sugar_guard` (repeatable x2).

## 2026-02-20 - Apply cactus_hero sprites into runtime player rendering
- Integrated atlas-driven player sprite rendering in `game.js`:
  - Loads `assets/sprites/player/cactus_hero_atlas.json`.
  - Loads state sheets: `cactus_hero_fit.png`, `cactus_hero_chubby.png`, `cactus_hero_heavy.png`.
  - Uses fat stage -> sprite state mapping: FIT->`fit`, CHUBBY->`chubby`, HEAVY->`heavy`.
  - Chooses animation by gameplay state: `idle`, `run`, `jump_start`, `jump_air`, `fall`, `land`, `shoot_ground`, `shoot_air`, `hurt`.
  - Keeps fallback procedural draw path if atlas/images fail to load.
- Added lightweight animation timing state on player object:
  - `lastShotTime`, `hurtTimer`, `jumpStartTimer`, `landTimer`.
- Hooked timers into combat/movement events:
  - shot timestamp on spike spawn,
  - hurt timer on hazard/enemy hit,
  - jump/land timers in movement update.
- Validation:
  - `node --check game.js` passes.
  - Playwright check run with power button click + custom action burst:
    - output dir: `output/web-game-sprites-play4`
    - screenshot confirms in-game player rendered from new sprite sheet (`mode: playing`).
    - no `errors-*.json` emitted.

## 2026-02-20 - NPC cast integration (SzokoBons / RageBun / Blue Eye)
- Added new retro pixel NPC sprite package under `assets/sprites/npc/`:
  - `szokobons_sheet.png` (32x32 frames, animations: idle4/walk6/attack4/hurt2/death6)
  - `ragebun_sheet.png` (32x32 frames, animations: idle4/walk6/attack4/hurt2/death6)
  - `blueeye_sheet.png` (32x32 frames, animations: idle_float6/blink4/speak_pulse4/attack_cast4/vanish6)
  - `npc_atlas.json` mapping all NPC frames (`68` total)
- Integrated NPC atlas loading/rendering in `game.js` without rewriting core architecture:
  - Added runtime loader `loadNpcSprites()` and atlas frame draw helpers.
  - Enemy render path now uses NPC sprites (`ragebun` for heart rabbits, `szokobons` for choco rabbits).
  - Dialogue render now shows active speaker NPC sprite (Blue Eye / RageBun / SzokoBons).
  - Added Blue Eye world presence hook during level-1 encounter phases.

### Encounter phase flow (level 1)
- Added structured first encounter sequence in existing tutorial flow:
  1. `blue_eye_intro` dialogue
  2. `rabbit_scene` (obsessive cactus-love theme)
  3. `szokobons_teach` (FAT pressure)
  4. `ragebun_teach` (HP pressure)
  5. `combat_tutorial`
- Extended state with story hooks:
  - `state.story.activeNPC`
  - `state.story.npcState`
  - `state.story.currentDialogueId`
  - `state.story.encounterPhase`

### Combat + NPC behavior integration
- Kept damage typing model and made roles explicit through encounter/hints:
  - SzokoBons/choco attacks -> FAT only (`damageType: fat`)
  - RageBun/heart attacks -> HP only (`damageType: hp`)
- Added enemy transient animation state support:
  - `enemy.hurtTimer`
  - `enemy.deathTimer`
  - delayed corpse removal to play death animation frames.

### Text-state hook extension
- `window.render_game_to_text()` now includes:
  - `activeNPC`
  - `npcState`
  - `currentDialogueId`
  - `encounterPhase`

### Validation
- `node --check game.js` passes.
- Playwright checkpoints verified:
  - Intro dialogue state: `output/npc2-intro/state-0.json`
  - Rabbit dialogue state: `output/npc2-rabbit-dialogue2/state-0.json`
  - Encounter progression to SzokoBons teach phase: `output/npc2-fullphase-enter/state-0.json`
- No `errors-*.json` produced in NPC test runs.

## 2026-02-21 - UX simplification + mouse menu + projectile blocking
- Removed side status panel from layout (kept pure TV screen + POWER button + external credits).
- Menu flow tuned to user request:
  - first view: black CCT1 offline screen
  - POWER button boot sequence
  - floating title main menu with mouse-only clickable options:
    - PLAY / NOWA GRA
    - ZAPISY
    - USTAWIENIA
    - ABOUT / CREDITS
- Added `MODE.SAVES` with placeholder save screen + recent achievements list.
- Settings screen switched to mouse-click toggles and clear controls text.
- Upgrade/shop reworked:
  - no auto-continue after purchase,
  - multiple purchases supported for level-based upgrades,
  - health utility remains one-time,
  - explicit CONTINUE button to start next level.
- Implemented Jump Boost behavior:
  - buying Jump Boost unlocks double jump (Space in air),
  - additional levels improve jump profile.
- Projectile/platform collision added in `updateProjectiles()` to prevent shooting through blocks.
- Added basic achievements system and text-state exposure.

### Validation runs
- `output/web-game-menu-idle-v2` (boot -> menu visuals)
- `output/web-game-mouse-menu` (mouse navigation start)
- `output/web-game-play-shot-check` (gameplay state + projectile blocked by platforms)
- No `errors-*.json` generated in these runs.

## 2026-02-21 - Polish UX pass + controls + combat polish
- Uzyto skilla `develop-web-game` i wykonano iteracje zmian pod lista 11 punktow.

### Zmiany funkcjonalne
- Spolszczono widoczne teksty UI/dialogow/komunikatow (z zachowaniem ASCII dla fontu bitmapowego).
- Dialog: kontynuacja przez `LPM` / `Spacja` / `Enter`; `Esc` robi skip calego dialogu.
- Poprawiono prompt dialogowy i zawijanie, zeby nie wychodzil poza okienko.
- Teleport bramki: przejscie wymaga interakcji (`Enter` / `Spacja` / `LPM`) po wejsciu w portal.
- Dodano patrol wrogow po platformach (strefa patrolu przypisywana z platformy pod mobem).
- Kroliki dostaly anti-highground: gdy gracz jest wyzej, strzaly ida bardziej do gory.
- Pociski kaktusa: lot po luku (grawitacja + TTL), bez nieskonczonego lotu.
- Dodano ulepszenie `spike_ballistics` (`Luk Kolcowy`) skalujace balistyke kolcow.
- Przebudowano ekran upgradow:
  - ikonki + krotkie nazwy,
  - nowy przycisk `INFO` i overlay opisu boostow,
  - przycisk `KLAW` pod wejscie do ustawien,
  - kaktusik na gorze na platformie.
- Ustawienia: dodano rebinding klawiszy (lista akcji + oczekiwanie na nowy klawisz).
- Credits/About: dopisano autora, CactuJam 15, temat oraz CES (Cactu Entertainment System).
- Usunieto auto-start nowej gry na kazdy klik canvasa w menu (zostawiono tylko `TITLE`).

### Walidacja (Playwright + screenshot/state)
- Serwer: `python3 -m http.server 5173 --directory "/Users/bartlomiejstachera/web-dev/Thick Love of Cactus"`
- Testy (client):
  - `output/web-game-pl-final` (dialog intro po zmianach)
  - `output/web-game-pl-upgrade-check2` (ekran upgradow z nowym layoutem)
- Potwierdzone na screenshotach:
  - dialog prompt miesci sie w oknie,
  - ekran upgradow ma 5 kart (w tym `Luk`), `KLAW`, `INFO`, `DALEJ`,
  - teksty sa po polsku.
- W uruchomionych przebiegach nie wygenerowano plikow `errors-*`.

### TODO / ryzyka
- Automatyczny scenariusz wejscia do `SETTINGS` z poziomu Playwright nadal bywa niestabilny (akcje testowe czesto koncza sie na intro flow), mimo ze logika rebindingu jest w kodzie.
- W side panelu lista upgradow pozostaje placeholderem (to bylo wczesniej; nie jest krytyczne dla gameplay).

## 2026-02-21 - Menu alignment + real audio assets
- Menu text alignment fix:
  - labels in menu buttons are now centered by measured width (not fixed x),
  - replaced mixed labels with cleaner Polish items (`NOWA GRA`, `ZAPISY`, `USTAWIENIA`, `O GRZE I CREDITS`).
- Audio system pass:
  - wired real files from `assets/audio` and `assets/audio/sfx` (music loops + SFX),
  - added mode-based music switching (`menu`, `game`, `boss`),
  - added SFX triggers for click, jump, player shot, enemy heart/choco shot, dialogue typing, and upgrade buy,
  - audio is unlocked on first gesture (browser autoplay-safe).
- Validation:
  - Playwright output: `output/web-game-align-audio/shot-0.png`.
  - server log confirms audio asset requests succeeded (`GET /assets/audio/...` and `GET /assets/audio/sfx/...`).

## 2026-02-21 - Settings alignment + scrollable menu panels
- Rebuilt `USTAWIENIA` panel layout to prevent text overlap:
  - fixed row geometry, clipped list viewport, right-aligned key codes,
  - label trimming (`..`) when label is too long for the row,
  - centered back button label.
- Added real scrolling for overflow content:
  - settings bindings list: mouse wheel + up/down keys,
  - about/credits text panel: mouse wheel + up/down keys,
  - visual scrollbar thumb in both panels.
- Added state fields:
  - `settingsScroll`, `aboutScroll`.
- Added helper:
  - `trimTextToWidth(text, maxWidth)`.

## 2026-02-21 - HD sprites + 480x320 + per-character dialogue voice
- Raised game native resolution from `320x240` to `480x320` in runtime constants and canvas attributes.
- Generated higher-resolution sprite assets (2x nearest-neighbor) while preserving animation frame order and naming:
  - Player: `assets/sprites/player/cactus_hero_fit_hd.png`, `cactus_hero_chubby_hd.png`, `cactus_hero_heavy_hd.png`, `cactus_hero_atlas_hd.json`
  - NPC: `assets/sprites/npc/szokobons_sheet_hd.png`, `ragebun_sheet_hd.png`, `blueeye_sheet_hd.png`, `npc_atlas_hd.json`
- Switched game loading paths to HD atlases/sheets.
- Added sprite render scale (`HD_SPRITE_RENDER_SCALE = 0.5`) so gameplay collision/feel stays stable despite HD frame dimensions.
- Replaced random dialogue voice SFX selection with deterministic character-based mapping:
  - Cactus/You -> `talkLow`
  - Rabbits (RageBun/SzokoBons/Rabbit) -> `talkHigh`
  - Blue Eye/Oczko -> `talkMid`

### Validation notes
- `node --check game.js` should be run after edits.
- Run Playwright smoke/actions to verify visual alignment and dialogue SFX mapping in live gameplay.

## 2026-02-21 - Story sync with story.md
- Updated story layer to align with `story.md` in project root:
  - title framing switched to `NAKED LOVE OF CACTUS`,
  - level names 1..5 mapped to story acts (`Ogrod Wypedzonych`, `Serce i Ciernie`, `Bagna Wspomnien`, `Pekniete Sanktuarium`, `Wieza Powrotu`),
  - intro and key dialogue blocks rewritten to story wording and tone,
  - about/credits panel rewritten to match main axis + characters + note about full 1..7 scenario,
  - ending text reframed as end of act 5 with continuation toward Inkwizycja/Brama Oka.
- Validation:
  - syntax check passed (`node --check game.js`),
  - Playwright capture: `output/web-game-story-final/shot-0.png` (menu title/story branding updated).

## 2026-02-21 - Full story + UX hotfix pass (7L/FSM/UI)
- Wdrozono duzy refaktor `game.js` pod stabilnosc UX i story-first:
  - dodany `DIALOGUE_PHASE` FSM: `OPEN -> LINE_TYPING -> LINE_SHOW -> NEXT -> END -> RETURN_MODE`.
  - dialogi przestawione na sceny (`DIALOGUE_SCENES`) z liniami speaker-based (`speakerId`, `speakerName`, `sfxKey`, `portraitId`).
  - dodany typewriter (kontrolowany char-speed) + przewidywalna obsluga `Enter/Spacja/LPM`; `Esc` skip tylko jesli `allowSkip`.
  - dodany cache layoutu dialogu dla biezacej linii (`layoutCacheKey`, `wrappedLines`, `dialogueLayoutCache`).
- Kampania rozszerzona do 7 poziomow (`LEVELS` zawiera akty 1..7, nowe poziomy 6 i 7).
  - dodane `storySceneOnStart/storySceneOnEnd` i mapowanie `LEVEL_SCENE_MAP`.
  - dodana nowa logika koncowki: `MODE.ENDING_CHOICE` + wybor `WRACAM` / `ZOSTAJE`.
  - boss przeniesiony na level 7 (`id === 7`).
- Input/hitbox hotfix:
  - centralizacja UI hitboxow (`getUiButtons`, `getMenuButtons`, `getSettingsButtons`, `getUpgradeButtons`).
  - dodany hover-state i wspolny model zaznaczenia (`state.ui.hoverButtonId`, `selectedButtonId`).
  - dodany globalny debounce klikniecia (`consumeMouseClickDebounced`, `CLICK_DEBOUNCE_SEC=0.14`).
- Debug/telemetria:
  - dodane throttled logi `console.debug("[DEBUG_STATE]", ...)` z `activeMode`, `selectedButtonId`, `dialogueIndex`, `dialoguePhase`, `returnMode`.
  - `render_game_to_text()` rozszerzony o `dialogue.phase/lineIndex/charIndex/allowSkip/returnMode`, `ui.hoverButtonId`, `ui.selectedButtonId`, `campaign.levelCount`.
- UI/asset integration:
  - dodany manifest postaci (`CHARACTER_MANIFEST`) i portret speaker-based.
  - dodany loader UI assetow (`UPGRADE_ICON_PATHS`, `PORTRAIT_PATHS`, `loadUiAssets`).
  - dodane lokalne fallbackowe ikony skilli (24x24):
    - `assets/ui/skills/metabolism_burst.png`
    - `assets/ui/skills/thin_air_dash.png`
    - `assets/ui/skills/reactive_combat.png`
    - `assets/ui/skills/sugar_guard.png`
    - `assets/ui/skills/spike_ballistics.png`
  - dodane portrety fallback:
    - `assets/portraits/redbunny.png`
    - `assets/portraits/survivor.png`
- Testy Playwright (web_game_client) uruchamiane iteracyjnie:
  - dodane scenariusze: `tests/actions_hotfix_A_boot_menu_newgame.json`,
    `tests/actions_hotfix_B_intro_dialogue.json`,
    `tests/actions_hotfix_C_tutorial_start.json`,
    `tests/actions_hotfix_D_menu_settings_clicks.json`,
    `tests/actions_hotfix_E_upgrade_info_clicks.json`,
    `tests/actions_hotfix_campaign_1_7_debug.json`.
  - outputy: `output/hotfix-A`, `output/hotfix-B`, `output/hotfix-C`, `output/hotfix-D`, `output/hotfix-E`, `output/hotfix-campaign`.
  - brak wygenerowanych `errors-*.json` po ostatnich runach.

### Blokery / TODO
- AI image generation przez `imagegen` zablokowane: `OPENAI_API_KEY` nieustawiony w tym runtime.
  - probny run: `image_gen.py generate ...` zwraca `OPENAI_API_KEY is not set`.
- Dla pelnej zgodnosci z planem nalezy po ustawieniu klucza podmienic fallbackowe ikony/portrety na docelowe assety wygenerowane przez API.
- Scenariusz kampanii debugowej dochodzi obecnie do srodkowych aktow (potwierdzony postep do lvl3+), ale wymaga dalszego dopieszczenia sekwencji akcji do automatycznego domkniecia 1->7 i wyboru finalnego w jednym przebiegu.

## 2026-02-21 - UX/dialogue hotfix stabilization (click debounce + keyboard parity + deterministic A-E)

### Root cause confirmed
- Main click freeze after `Nowa Gra` came from debounce based on `state.elapsed` while `startNewRun()` resets `state.elapsed = 0`.
- `state.ui.lastClickAt` stayed at pre-reset value, so `state.elapsed - lastClickAt` was negative and clicks were rejected.
- Reproduced before fix:
  - `output/repro-click-reset/state-0.json` stayed on intro `lineIndex: 0` after click.
- Confirmed after fix:
  - `output/repro-click-reset-fixed/state-0.json` advanced to `lineIndex: 1`.

### Code hotfixes in `game.js`
- Click debounce guard against elapsed timer rewind and reset click debounce window in `startNewRun()`.
- Settings keyboard parity:
  - Added `activateSettingsButton()`.
  - Added `moveSettingsSelection()`.
  - Added keyboard navigation + confirm activation for settings controls and back.
- Upgrade keyboard parity:
  - Added `activateUpgradeButton()`.
  - Keyboard cycling through upgrade controls uses shared UI button registry.
  - `confirm` activates selected button (card/info/settings/continue), mirroring click behavior.
- Dialogue FSM predictability:
  - Kept FSM states but made `LINE_SHOW -> NEXT -> next line` deterministic in the same update cycle (no stale wait for button release).
- Dialogue rendering/perf:
  - Cache wrapped full dialogue line once (`dialogueLayoutCache`), then slice by visible chars for typewriter.
  - Avoid repeated full `wrapTextLines()` work for each typed frame fragment.
- UI readability/selection:
  - Settings and upgrade screens now render focused/selected keyboard target, not just hover.
- About/Saves close parity:
  - Added Enter/Space close handling in addition to Esc/click.

### Test scenario files updated
- `tests/actions_hotfix_A_boot_menu_newgame.json`
- `tests/actions_hotfix_B_intro_dialogue.json`
- `tests/actions_hotfix_C_tutorial_start.json`
- `tests/actions_hotfix_D_menu_settings_clicks.json`
- `tests/actions_hotfix_E_upgrade_info_clicks.json`

### Validation runs
- A-E rerun outputs:
  - `output/hotfix-A-v4`
  - `output/hotfix-B-v4`
  - `output/hotfix-C-v4`
  - `output/hotfix-D-v4b`
  - `output/hotfix-E-v4`
- No `errors-*.json` generated for these runs.
- Final states:
  - A: intro dialogue started (`mode: dialogue`, `key: intro_cutscene`) ✅
  - B: intro completed to gameplay (`mode: playing`) ✅
  - C: tutorial gameplay active (`mode: playing`, tutorial hint visible) ✅
  - D: menu/settings interactions reflected (`mode: menu`, `musicOn: false`, `sfxOn: false`) ✅
  - E: upgrade/info flow stays stable in upgrade mode (`mode: upgrade`) ✅

### Remaining gap
- Full scripted campaign `1..7` + both endings still not fully deterministic in one static action file under current Playwright key mapping constraints.
- Needs dedicated multi-pass scripted harness or richer action branching for robust end-to-end automated validation.

### Next recommended follow-up
- Add dedicated campaign-runner action sets per level/scene transition (instead of one monolithic sequence).
- Add explicit `upgradeInfoOpen` and `activeSceneId` assertions to `render_game_to_text()` for stronger automated checks.

## 2026-02-21 - Readability + text externalization + platforming tolerance + asset templates

### Implemented
- Start/menu readability pass:
  - Reduced CRT overlays in `styles.css` (`scanlines` and `vignette` softened).
  - Enforced stronger pixel rendering CSS flags on `#game`.
  - Menu/title typography tuned for higher readability at scale.
- Global CAPS rendering:
  - Added `normalizeGameText()` and routed canvas `fillText/measureText` through uppercase normalization.
  - Ensures on-screen UI/dialogue text is consistently CAPS.
- Level color identity:
  - Added `LEVEL_BG_THEMES` and switched `drawBackground(levelId)` to per-level palettes.
- Text externalization to one editable file:
  - New file: `assets/text/game_texts.js` (menu labels, title lines, level names, upgrade labels, all dialogue scenes).
  - `index.html` now loads `assets/text/game_texts.js` before `game.js`.
  - `game.js` now consumes overrides from `window.GAME_TEXTS`:
    - `MENU_LABELS`
    - `TITLE_LINES`
    - upgrade names/short names/descriptions
    - dialogue lines (`applyDialogueTextOverrides`)
    - level names (`applyLevelNameOverrides`)
- Skill naming shortened in defaults:
  - `SPALACZ TLUSZCZU`, `SKOK+`, `KOLCE+`, `TARCZA`, `LUK+`.
- Platforming tolerance (stair-step hotfix):
  - Added step-up collision tolerance in `moveBodyWithPlatforms()` (`STEP_UP_HEIGHT = 9`) so near-edge movement can lift onto small ledges without slopes.
- Manual asset creation starter pack:
  - `assets/templates/sprite_template_32x32.png`
  - `assets/templates/sprite_sheet_template_8x8.png`
  - `assets/templates/pixel_palette_template.png`
  - `assets/templates/pixel_asset_style_guide.md`

### Validation
- Ran Playwright loops:
  - `output/hotfix-A-v6`
  - `output/hotfix-B-v6`
  - `output/hotfix-D-v6`
  - `output/hotfix-E-v6`
- State checks:
  - A start flow enters intro dialogue ✅
  - B intro completes to gameplay ✅
  - D menu/settings flow returns to menu with toggles changed ✅
  - E upgrade flow stable with shortened names visible ✅
- No `errors-*.json` in these runs.

### Notes
- Existing action payload `actions_debug_to_play_and_shoot.json` is not aligned with current boot/menu gating (starts too early), so it no longer reaches gameplay without adjustment.
