# PredictPlay

**Predict the moment. Score points. Top the leaderboard.**

Live demo: [jklazer.github.io/predict-play](https://jklazer.github.io/predict-play/)

## What is this?

PredictPlay is a real-time prediction game where players watch sports/esports broadcasts and try to predict the exact moment of key events (goals, kills, dunks, etc.). Points are awarded based on timing accuracy — the closer your prediction to the actual event, the higher the score.

## Game Mechanics

| Accuracy | Points | Grade |
|----------|--------|-------|
| < 0.5s | +100 | PERFECT |
| < 1s | +80 | EXCELLENT |
| < 2s | +60 | GREAT |
| < 3s | +40 | GOOD |
| < 5s | +20 | OK |
| > 5s | 0 | MISS |
| No event nearby | -15 | FALSE ALARM |

Bonus: correct event type prediction = x1.0 multiplier, wrong type = x0.6.

## Supported Sports

- **Football** — Goals, Yellow/Red Cards, Fouls, Corners, Penalties
- **CS2** — Kills, Headshots, Bomb Plants, Defuses, Clutches, ACEs
- **Basketball** — 3-Pointers, Dunks, Blocks, Steals, Alley-oops

## AI Solutions Used

This prototype was built AI-first, leveraging multiple AI systems:

### In the product:
- **AI Opponent** — Algorithmic opponent with variable accuracy that competes against the player (prototype for future LLM-based opponent)
- **AI Commentary** — Context-aware commentary system reacting to game state (intensity, events, predictions)
- **Intensity Algorithm** — Pre-event pattern detection that visualizes event probability through the intensity bar
- **Adaptive Scoring** — Type-aware scoring system with multipliers

### In development:
- **Claude Code** — 95% of the codebase was generated through AI pair programming in a single session
- **Prompt Engineering** — Iterative refinement of game design, UX copy, and scoring algorithms

### Production roadmap (not yet implemented):
- **LLM Commentary** — Replace static commentary with OpenAI/Claude API calls for dynamic, context-aware analysis
- **Computer Vision** — YOLO v8 + MediaPipe for automatic event detection from video streams
- **Multi-agent orchestration** — LangGraph/CrewAI for event detection, anti-cheat, and matchmaking agents

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                    │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Screen   │  │ Game     │  │ AI Commentary     │  │
│  │ Router   │  │ Engine   │  │ Engine            │  │
│  └────┬─────┘  └────┬─────┘  └────────┬──────────┘  │
│       │             │                 │              │
│  ┌────┴─────────────┴─────────────────┴──────────┐  │
│  │              UI Controller                     │  │
│  │  - Score Popup & Confetti                      │  │
│  │  - Intensity Bar (pre-event ML signal)         │  │
│  │  - YouTube / Demo Visualization                │  │
│  │  - Prediction History & Mini Leaderboard       │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Sound    │  │ AI       │  │ Leaderboard      │  │
│  │ Manager  │  │ Opponent │  │ Manager           │  │
│  │ (WebAudio)│ │          │  │ (localStorage)    │  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Production Roadmap

### Phase 1: Real-time Video Analysis
```
YouTube/Twitch Stream → WebSocket → CV Pipeline
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
              YOLO v8          MediaPipe          Audio Analysis
           (Object detection) (Pose tracking)   (Crowd noise peaks)
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                              Event Detector
                              (LangGraph Agent)
                                      │
                              ┌───────┴───────┐
                              │               │
                        Real-time        Push to
                        Scoring          Players
```

### Phase 2: Multi-agent Backend
- **Event Detection Agent** — CV + Audio analysis for automatic event timestamping
- **Commentary Agent** — RAG-powered contextual commentary using match history and player stats
- **Anti-cheat Agent** — Pattern analysis to detect prediction bots
- **Matchmaking Agent** — CrewAI orchestration for room management and skill-based pairing

### Phase 3: Monetization
- Freemium model with premium predictions and analytics
- Sponsored prediction challenges (brand integration)
- API for third-party esports platforms

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS (ES6+), CSS3 with Custom Properties |
| Styling | Glassmorphism, CSS Animations, Canvas Particles |
| Video | YouTube IFrame API |
| Audio | Web Audio API (procedural sound) |
| Storage | localStorage (prototype) → PostgreSQL + Redis (production) |
| AI | Custom scoring engine, simulated ML commentary |
| Deploy | GitHub Pages (static) |

## Development

No build step required. Open `index.html` in a browser or serve with any static server:

```bash
npx serve .
```

## Author

Built by [@jklazer](https://github.com/jklazer) in a single AI-assisted session with Claude Code.
