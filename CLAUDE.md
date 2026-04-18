# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vibe Picnic is a zero-dependency TypeScript CLI tool that renders ASCII art animations in the terminal. It supports 7 themes: 4 seasonal particle effects (spring/summer/autumn/winter) and 3 special scenes (moonlake, campfire, fireworks). It can run as a standalone animation or as a terminal splash screen.

## Build & Run Commands

```bash
npm install          # Install dev dependencies (typescript, @types/node)
npm run build        # Compile TypeScript (tsc) → dist/
npm start            # Run the compiled CLI (node dist/bin/vibe-picnic.js)
npm run dev          # Build + run in one step
npm link             # Register global commands: vibe-picnic, vp
```

There are no tests or linting configured in this project.

## Architecture

**Entry point:** `src/bin/vibe-picnic.ts` — CLI argument parsing, config subcommand handling, and splash schedule logic. Calls `run()` from `src/index.ts`.

**Core loop (`src/index.ts`):** The `run()` function manages the animation loop via recursive `setTimeout`. It handles:
- Particle spawning per theme's `spawnRate()`
- Physics updates (wind, gravity) via `ParticleSystem.update()`
- Ground accumulation tracking (`GroundMap`)
- Keyboard input for real-time controls (theme switching, wind/density adjustment)
- Splash mode UI vs normal mode UI

**Renderer (`src/renderer.ts`):** A singleton double-buffer renderer using ANSI escape codes. Uses the alternate screen buffer (`?1049h`). Each frame writes character + color to a 2D buffer, then flushes as a single `stdout.write()`.

**Particle system (`src/particle.ts`):** `Particle` class with position, velocity, oscillation (amplitude/phase), and age. `ParticleSystem` manages the collection and returns landed particles for ground accumulation.

**Theme interface (`src/themes/types.ts`):** Each theme implements the `Theme` interface:
- `createParticle()` — spawn a new particle with theme-specific visuals/physics
- `spawnRate()` — how many particles to spawn per frame
- `groundDisplayH()` / `renderGround()` — ground accumulation behavior
- Optional: `renderBackground()`, `renderForeground()`, `onLanded()`

**Themes (`src/themes/`):** Each file exports a `Theme` object. Seasonal themes use particles; special scenes (moonlake, campfire, fireworks) use `renderBackground`/`renderForeground` for static scene elements like the moon, fire, or lake reflections.

**Fireworks (`src/fireworks.ts`):** Separate `FireworkManager` class handling launch, burst, and trail physics for the fireworks theme.

**Config (`src/config.ts`):** Persistent user settings stored in `~/.vibe-picnic.json`. Merged with defaults and CLI args (CLI wins over config file).

**Schedule (`src/schedule.ts`):** Controls splash frequency (always/daily/boot) using `~/.vibe-picnic-schedule.json` to track last run time and boot ID.

## Key Patterns

- The project is zero-dependency — only uses Node.js built-ins (`fs`, `path`, `os`, `process`). TypeScript is a dev dependency only.
- All terminal rendering uses raw ANSI escape sequences, no libraries.
- Themes use `renderer.set(x, y, char, color)` directly — the renderer is imported as a global singleton, not passed as a parameter.
- UI text and CLI help messages are in Korean.
- The `dist/` directory is committed to the repo for npm distribution.
