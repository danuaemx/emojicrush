# 🍇 EmojiCrush

<div align="center">

**A fast, fun, progressively evolving Match‑3 puzzle made with vanilla JavaScript and juicy fruit emoji**  
Match 3 or more identical fruits to score, trigger cascades, overcome spreading obstacles, and climb through infinite levels!

[![Live Demo](https://img.shields.io/badge/🎮_Play_Now-Live_Demo-1976d2?style=for-the-badge)](https://emoji-crush-infinity.web.app/)
[![GitHub Stars](https://img.shields.io/github/stars/danuaemx/emojicrush?style=for-the-badge&color=gold)](https://github.com/danuaemx/emojicrush/stargazers)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000)](#)
[![Static](https://img.shields.io/badge/100%25-Client%20Side-green?style=for-the-badge)](#)

---

**🔗 [Play Now](https://emoji-crush-infinity.web.app/) • [Report Bug](https://github.com/danuaemx/emojicrush/issues) • [Request Feature](https://github.com/danuaemx/emojicrush/issues)**

</div>

## 📸 Screenshots

> (Add real screenshots to `images/` and update the filenames below.)

### Desktop
![Desktop Gameplay](images/desktop_gameplay.png)  
*Classic grid-based match‑3 with evolving obstacles*

### Mobile
![Mobile Gameplay](images/mobile_gameplay.png)  
*Tap, swap & crush – fully responsive*

---

## 🎮 What Is EmojiCrush?

EmojiCrush is a lightweight **Match‑3 puzzle** focused on **progression and emergent challenge**. Each level introduces or scales mechanics: ice tiles, chocolate spread, timed modes, extra fruit variants, and **destructible / spreading obstacles** like trash, ice bombs, and chocolate generators.

Built with:
- **HTML + CSS + Vanilla JavaScript**
- **No frameworks / build step**
- **All assets are Unicode emoji** → instant load

---

## 🌟 Key Highlights

- 🧠 Clean modular game logic (swap → validate → resolve cascades)
- 🍉 Emoji fruit tiles (no sprite downloads)
- 🧊 Progressive mechanics (ice, chocolate, timers, special obstacles)
- 🏭 Spreading / spawning hazards (bombs & generators)
- 📈 Infinite leveling with dynamic objectives & scaling
- ✨ Combo & cascade scoring foundation (easy to extend)
- 📱 Responsive & touch friendly
- ⚙️ Config‑driven design (edit `public/js/config.js` to tweak modes)

---

## 🧪 Game Modes (from config.js)

EmojiCrush ships with two predefined modes. Each mode governs grid size, base emoji selection, objective density, movement/time allowances, and per‑board limits for special obstacles.

| Mode | Grid (W×H) | Base Emojis | Extra Emojis (unlocked later) | Max Simultaneous Objectives | Base Objective Count | Base Moves | Base Timer (s) | Special Obstacle Limits (trash / iceBomb / chocolateSpawner) |
|------|------------|------------|--------------------------------|-----------------------------|---------------------|------------|----------------|---------------------------------------------------------------|
| easy | 8×8        | 🍑 🍇 🍋 🍓 | 🍊 🍎 | 7 | 14 | 30 | 75 | 1 / 1 / 1 |
| hard | 10×10      | 🍉 🥝 🥥 🥭 🥑 | 🍒 🍍 🍑 | 9 | 20 | 40 | 90 | 2 / 2 / 2 |

Notes:
- EXTRA_EMOJIS begin appearing at higher progression (see Level Milestones).
- Objective counts, moves, and timers can be combined with scaling rules in your game logic (not all scaling is inside `config.js`; some may live in `game.js`).

---

## 🧩 Special Obstacles (configurable)

Defined in `specialObstaclesConfig`:

| Obstacle | Appears From Level | Health (Hits) | Emoji | Behavior |
|----------|--------------------|--------------|-------|----------|
| trash | 8 | 2 | 🗑️ | Static blocker until cleared by power actions / matches adjacent |
| iceBomb | 12 | 2 | ❄️ | Chance each turn to spread to adjacent (spreadRate 30%) |
| chocolateSpawner | 16 | 2 | 🏭 | Periodically creates chocolate (spreadRate 35%) |

Obstacle limits per board are enforced by the active game mode (`SPECIAL_OBSTACLES_LIMIT`).

---

## 🧊 Environmental / Board Mechanics

Global progression constants (from `config.js`):

| Mechanic | Start Level | Description |
|----------|-------------|-------------|
| ICE_START_LEVEL | 5 | Ice tiles appear and require matches to clear (up to MAX_ICE) |
| CHOCOLATE_START_LEVEL | 10 | Chocolate begins to spread (up to MAX_CHOCOLATE) |
| TIMER_START_LEVEL | 15 | Timed objectives replace or augment move-based ones |
| EXTRA_EMOJI_START_LEVEL | 20 | Additional emoji types added, increasing complexity |
| MAX_ICE | 12 | Cap of simultaneous ice pieces |
| MAX_CHOCOLATE | 12 | Cap of simultaneous chocolate tiles |

---

## 📈 Level Progression Timeline (Summary)

| Level Range | Newly Introduced / Activated Elements |
|-------------|----------------------------------------|
| 1–4 | Core fruits, basic matching |
| 5–7 | Ice tiles begin (manage freezing risk) |
| 8–11 | Trash obstacles can spawn |
| 10–11 | Chocolate spreading begins |
| 12–15 | Ice bombs begin (spreading hazard escalation) |
| 15–19 | Timed mode enabled / hybrid challenges |
| 16–19 | Chocolate Spawners appear |
| 20+ | Extra emojis added (higher color variance) |
| 20+ | All hazards interplay → strategic clearing priority |

> Adjust this table if game logic refines spawn sequencing beyond `config.js`.

---

## 🕹️ Core Gameplay Loop

1. Player selects two adjacent tiles (horizontal / vertical)
2. Tentative swap performed
3. Match detection scan
4. If no match → revert
5. If match → clear matched tiles
6. Resolve special obstacle damage/interactions
7. Apply scoring & combo multiplier
8. Gravity collapse (tiles fall)
9. Refill empty spaces (may introduce new emoji types after unlock level)
10. Cascade repetition while new matches form
11. Spawn / spread hazards (trash, chocolate, ice bomb spread, generator expansion)
12. Check objectives & level completion conditions

---

## 🧮 Scoring (Baseline / Extendable)

| Element | Suggested Base |
|---------|----------------|
| Per fruit in match | 10 pts |
| 4 in a row bonus | +10 |
| 5+ (straight/T/L) | +25 |
| Cascade multiplier | +0.5× per additional cascade |
| Hazard cleared | +variable (e.g., +15 per obstacle health depleted) |

(Adjust inside scoring functions; tune for player engagement.)

---

## 🧠 Strategy Layers

- Prioritize clearing spawning sources (🏭) before they saturate the board
- Manage space around ice bombs (❄️) to prevent large frozen zones
- Delay completing final objectives if lining up a larger combo chain
- Save easy matches to pop obstacles adjacent with minimal move waste
- Adapt when EXTRA_EMOJIS increase tile diversity (harder matches)

---

## ⌨️ & 📱 Controls

### Desktop
- Click → Click adjacent to attempt swap
- (Optional future) Keyboard navigation
- R: Restart (if implemented)
- H: Toggle hints (planned)

### Mobile / Touch
- Tap first tile → tap adjacent tile
- Long press (future idea): highlight potential matches

---

## 🧱 File / Module Overview

| File | Responsibility |
|------|---------------|
| `public/js/config.js` | Game mode + obstacle + level constants (progression knobs) |
| `public/js/state.js` | Central runtime state container |
| `public/js/utils.js` | Helpers (random, array ops, board utilities) |
| `public/js/game.js` | Core game logic: generation, matching, cascades, spawning |
| `public/js/ui.js` | Rendering & HUD updates |
| `public/js/dom.js` | Element creation / DOM references |
| `public/js/events.js` | Input binding, event orchestration |
| `public/js/audio.js` | Sound effects handling (if enabled) |
| `public/js/main.js` | Bootstrapping / initialization flow |

(Adjust description if internal structure changes.)

---

## 🚀 Quick Start

### Option 1: Play Online
Open: https://emoji-crush-infinity.web.app/

### Option 2: Run Locally
```bash
git clone https://github.com/danuaemx/emojicrush.git
cd emojicrush
# Open directly
open public/index.html  # macOS
start public/index.html # Windows
# Or serve
python -m http.server 8000
# Visit http://localhost:8000/public
```

### Option 3: Docker (Static Serve)
```bash
docker build -t emojicrush .
docker run -p 8080:80 emojicrush
# Visit http://localhost:8080
```

---

## 🧩 Customization Tips

| Goal | Where to Tweak |
|------|----------------|
| Add new mode | `gameModes` in `config.js` |
| Change start level for hazards | Global constants in `config.js` |
| Adjust spawning rates | Add / modify logic in `game.js` (spread handling) |
| Add new obstacle | Extend `specialObstaclesConfig` + integrate in spawn & resolution code |
| Limit counts per board | Update `SPECIAL_OBSTACLES_LIMIT` per mode |

### Adding a New Obstacle (Concept)
1. Add entry to `specialObstaclesConfig`:
```js
magmaVent: { startLevel: 25, health: 3, emoji: '🌋', spreadRate: 20 }
```
2. Integrate spawn condition in generation phase.
3. Implement spread/damage resolution in cascading loop.
4. Add clearing logic + scoring.

---

## 🛡️ Edge Case Handling (Implemented / Planned)

| Case | Status | Notes |
|------|--------|-------|
| Invalid swap revert | ✅ | No match → revert |
| Multiple simultaneous matches | ✅ | Consolidated before collapse |
| Cascading chain detection | ✅ | Loop until stable |
| Obstacle health tracking | ✅ | Health decrements via interactions |
| Spread probability per turn | ✅ | `spreadRate` in config |
| Board saturation limits | ✅ | `MAX_ICE`, `MAX_CHOCOLATE`, per‑mode obstacle caps |
| Dead board (no moves) | ⏳ Planned | Potential reshuffle |
| Timed mode transition | ✅ (based on level constant) | Starts at level 15 |
| Extra emojis introduction | ✅ | Starts at level 20 |
| Performance batching | ⚠️ To review | Potential future optimization |

---

## 🔭 Roadmap Ideas

| Category | Idea |
|----------|------|
| UX | Animated score popups & chain indicators |
| Mechanics | Power tiles from 4/5 matches (row clear, bomb, color clear) |
| Accessibility | Keyboard navigation & ARIA live region for score |
| Persistence | LocalStorage high scores & session resume |
| Modes | Daily Challenge / Endless Marathon |
| Social | Share final board as emoji grid |
| Analytics | Lightweight event tracking (optional / privacy-first) |

---

## 🤝 Contributing

### Bug Reports
Include:
- Browser & device
- Steps to reproduce
- Expected vs actual
- Console output (if any)
- Screenshot / short clip (if helpful)

### Feature Requests
Provide:
- Problem / opportunity
- Proposed mechanic or UX pattern
- Balancing or difficulty considerations

### Development Flow
```bash
git fork
git clone <your-fork>
git checkout -b feature/add-new-obstacle
# Implement & test
git commit -m "Add: magmaVent obstacle"
git push origin feature/add-new-obstacle
# Open Pull Request
```

### Guidelines
- Keep functions focused (single responsibility)
- Favor clarity over micro-optimizations
- Align new features with config-driven architecture
- Document new constants in README progression tables
- Test progression (level transitions, obstacle caps)

---

## 📄 License

Licensed under the **Apache License 2.0** – see [LICENSE](LICENSE).

Summary (not legal advice):
- ✔ Use, modify, distribute
- ✔ Commercial use allowed
- ✔ Must include license & notices
- ✖ No warranty

---

## 🙏 Acknowledgments

- Unicode Consortium (emoji set)
- Classic Match‑3 design lineage
- Hosting: Firebase
- Inspiration: Progressive puzzle escalation patterns

---

## 📊 Project Stats (Live Badges)

<div align="center">

![Repo size](https://img.shields.io/github/repo-size/danuaemx/emojicrush?color=blue)
![Code size](https://img.shields.io/github/languages/code-size/danuaemx/emojicrush?color=blue)
![Last commit](https://img.shields.io/github/last-commit/danuaemx/emojicrush?color=green)
![Issues](https://img.shields.io/github/issues/danuaemx/emojicrush?color=orange)
![Pull Requests](https://img.shields.io/github/issues-pr/danuaemx/emojicrush?color=purple)

</div>

---

## 🧭 Quick Reference (Progression Cheatsheet)

| Level | New / Active |
|-------|--------------|
| 5 | Ice begins |
| 8 | Trash appears |
| 10 | Chocolate spreading |
| 12 | Ice bombs |
| 15 | Timed mode activation |
| 16 | Chocolate spawners |
| 20 | Extra emojis introduced |

---

## 📞 Contact & Support

<div align="center">

**Developer**: [@danuaemx](https://github.com/danuaemx)  
[Repository](https://github.com/danuaemx/emojicrush) • [Live Demo](https://emoji-crush-infinity.web.app/) • [Issues](https://github.com/danuaemx/emojicrush/issues)

</div>

---

<div align="center">

**⭐ Enjoying EmojiCrush? Star the repo to support development!**  

[![Star on GitHub](https://img.shields.io/github/stars/danuaemx/emojicrush?style=social)](https://github.com/danuaemx/emojicrush/stargazers)

*Made with 🍒🍇🍋 & lots of ☕ by [@danuaemx](https://github.com/danuaemx)*

**Match on! 🍎🍉🍓**

</div>
