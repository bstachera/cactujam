# Cactus Hero Sprite Package

## Files
- `cactus_hero_fit.png`
- `cactus_hero_chubby.png`
- `cactus_hero_heavy.png`
- `cactus_hero_atlas.json`

Each sheet uses 32x32 frames on an 8-column grid (right-facing only).
Use horizontal flip in-game for left movement.

## Naming Convention
`player.{state}.{anim}.{frame}`

Examples:
- `player.fit.idle.00`
- `player.chubby.shoot_air.02`
- `player.heavy.death.07`

## Animation Sets (per state)
- `idle`: 6 frames
- `run`: 8 frames
- `jump_start`: 2 frames
- `jump_air`: 2 frames
- `fall`: 2 frames
- `land`: 2 frames
- `shoot_ground`: 4 frames
- `shoot_air`: 3 frames
- `hurt`: 3 frames
- `death`: 8 frames
- `interaction`: 4 frames
- `victory`: 4 frames

## Timing Recommendations
Suggested base playback speeds:
- `idle`: 8 fps
- `run`: fit 14 fps, chubby 12 fps, heavy 10 fps
- `jump_start`: 14 fps (play once)
- `jump_air`: 6 fps (loop)
- `fall`: 8 fps (loop)
- `land`: 16 fps (play once)
- `shoot_ground`: 14 fps (play once)
- `shoot_air`: 12 fps (play once)
- `hurt`: 12 fps (play once, short stun)
- `death`: 10 fps (play once, lock state)
- `interaction`: 8 fps (loop/hold)
- `victory`: 10 fps (loop)

## Integration Notes
- All frames are pixel crisp (no blur/AA) with transparent background.
- Keep nearest-neighbor scaling in engine/canvas.
- Use atlas `pivot` and `hitbox_hint` as defaults, then tune per gameplay feel.
