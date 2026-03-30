# Precise Events + PARI UI — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign PredictPlay UI in PARI betting style + replace events with precise 90-second segments for 100% predict accuracy.

**Architecture:** CSS-first redesign (custom properties swap), then data update (MATCHES array + server JSON). No logic changes to GameEngine, scoring, or AI commentary.

**Tech Stack:** Vanilla CSS, Vanilla JS, YouTube IFrame API, FastAPI (existing server)

---

### Task 1: Color Palette + Font Swap

**Files:**
- Modify: `index.html:9-11` (Google Fonts link)
- Modify: `style.css:6-28` (CSS custom properties)

- [ ] **Step 1: Update Google Fonts in index.html**

Replace Inter + JetBrains Mono with Montserrat:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Replace CSS custom properties**

Replace the entire `:root` block in `style.css:6-28`:

```css
:root {
    --bg: #111117;
    --bg2: #161620;
    --surface: #1A1A24;
    --card: rgba(26, 26, 36, 0.92);
    --border: rgba(0, 199, 177, 0.10);
    --border-hover: rgba(0, 199, 177, 0.30);
    --primary: #00C7B1;
    --primary-glow: rgba(0, 199, 177, 0.30);
    --accent: #00E6CC;
    --accent-glow: rgba(0, 230, 204, 0.25);
    --success: #4ABA24;
    --warning: #f59e0b;
    --danger: #CC5B5A;
    --gold: #fbbf24;
    --text: #F0F0F5;
    --text-dim: #8890A0;
    --text-bright: #FFFFFF;
    --radius: 12px;
    --radius-sm: 8px;
    --font: 'Montserrat', system-ui, sans-serif;
    --mono: 'Montserrat', system-ui, sans-serif;
}
```

- [ ] **Step 3: Update particle color in app.js**

In `app.js` function `initBgCanvas`, change particle fill (line ~495):

```javascript
ctx.fillStyle = `rgba(0, 199, 177, ${p.a})`;
```

- [ ] **Step 4: Visual check — open index.html locally**

Verify: dark background (#111117), teal accents, Montserrat font, no broken colors.

- [ ] **Step 5: Commit**

```bash
git add style.css index.html app.js
git commit -m "feat: PARI-style color palette + Montserrat font"
```

---

### Task 2: Live Badge + Match Cards

**Files:**
- Modify: `style.css:267-279` (badge styles)
- Modify: `style.css:232-266` (match card styles)
- Modify: `app.js:837-855` (_showMatchSelect template)

- [ ] **Step 1: Replace badge-live style**

Replace `.badge-live` in `style.css`:

```css
.badge-live {
    background: transparent;
    color: var(--success);
    border: 1px solid var(--success);
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.7rem;
}
.badge-live::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--success);
    animation: livePulse 1.5s ease-in-out infinite;
}
@keyframes livePulse {
    0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(74, 186, 36, 0.6); }
    50% { opacity: 0.7; box-shadow: 0 0 0 4px rgba(74, 186, 36, 0); }
}
```

- [ ] **Step 2: Update match card styles**

Replace `.match-card` hover effect — change from indigo glow to teal:

In `.match-card::before` change gradient:
```css
.match-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, var(--primary-glow), transparent 60%);
    opacity: 0;
    transition: opacity 0.3s;
}
```

In `.match-card:hover`:
```css
.match-card:hover { border-color: var(--border-hover); transform: translateY(-4px); box-shadow: 0 8px 32px rgba(0, 199, 177, 0.12); }
```

- [ ] **Step 3: Update match card HTML template in app.js**

In `_showMatchSelect()` (app.js ~837-855), update the template to show teams and LIVE badge properly:

```javascript
grid.innerHTML = MATCHES.map(m => {
    const sport = SPORTS[m.sport];
    const matchSecs = m.duration;
    const matchTime = matchSecs >= 60 ? `${Math.floor(matchSecs / 60)}:${String(matchSecs % 60).padStart(2, '0')}` : `${matchSecs}с`;
    return `
        <div class="match-card" data-id="${m.id}">
            <span class="match-badge badge-${m.badge}">${m.badge === 'live' ? 'LIVE' : 'DEMO'}</span>
            <div class="match-card-inner">
                <div class="match-teams-row">
                    <span class="match-team">${m.teamA}</span>
                    <span class="match-vs">vs</span>
                    <span class="match-team">${m.teamB}</span>
                </div>
                <div class="match-title">${m.title}</div>
                <div class="match-desc">${m.desc}</div>
                <div class="match-meta">
                    <span>&#9716; ${matchTime}</span>
                    <span>&#127919; ${m.events.length} событий</span>
                    <span>${sport.name}</span>
                </div>
            </div>
        </div>
    `;
}).join('');
```

- [ ] **Step 4: Add match-teams-row CSS**

Add after `.match-meta` styles:

```css
.match-teams-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 10px;
    font-size: 0.95rem;
    font-weight: 600;
}
.match-vs {
    font-size: 0.7rem;
    color: var(--text-dim);
    font-weight: 400;
    text-transform: uppercase;
}
```

- [ ] **Step 5: Commit**

```bash
git add style.css app.js
git commit -m "feat: PARI-style match cards with live pulse badge"
```

---

### Task 3: Game Screen — Odds-Style Predict Buttons

**Files:**
- Modify: `style.css:531-560` (event type buttons)
- Modify: `style.css:562-611` (predict button + zone)

- [ ] **Step 1: Redesign event type buttons as odds cells**

Replace `.etype-btn` styles in `style.css`:

```css
.event-types {
    display: flex;
    gap: 6px;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
    max-width: 800px;
    margin-top: 14px;
}
.etype-btn {
    padding: 10px 18px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.04);
    color: var(--text-dim);
    font-family: var(--font);
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}
.etype-btn:hover { border-color: var(--border-hover); color: var(--text); background: rgba(255, 255, 255, 0.06); }
.etype-btn.active {
    border-color: var(--primary);
    color: var(--text-bright);
    background: rgba(0, 199, 177, 0.12);
    box-shadow: 0 0 12px var(--primary-glow);
}
```

- [ ] **Step 2: Redesign predict button in teal**

Replace `.predict-btn` styles:

```css
.predict-btn {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 52px;
    border: 2px solid var(--primary);
    border-radius: 8px;
    background: linear-gradient(135deg, var(--primary), #009E8E);
    color: #fff;
    font-family: var(--font);
    font-size: 1.3rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: all 0.15s;
    box-shadow: 0 0 24px var(--primary-glow);
    position: relative;
    overflow: hidden;
}
.predict-btn::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--primary), var(--accent), var(--primary));
    background-size: 200% 200%;
    z-index: -1;
    animation: gradientShift 3s ease-in-out infinite;
    opacity: 0;
    transition: opacity 0.3s;
}
.predict-btn:hover:not(:disabled) { transform: scale(1.03); box-shadow: 0 0 36px var(--primary-glow); }
.predict-btn:hover:not(:disabled)::after { opacity: 1; }
.predict-btn:active:not(:disabled) { transform: scale(0.96); }
.predict-btn:disabled { opacity: 0.35; cursor: not-allowed; filter: grayscale(0.5); }
.predict-btn.cooldown { animation: none; opacity: 0.5; }
```

- [ ] **Step 3: Update popup colors for teal scheme**

In `.popup-perfect` through `.popup-false`, update:

```css
.popup-perfect { color: var(--gold); }
.popup-excellent { color: var(--accent); }
.popup-great { color: var(--primary); }
.popup-good { color: var(--text); }
.popup-ok { color: var(--text-dim); }
.popup-miss { color: var(--danger); }
.popup-false { color: var(--danger); }
```

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: odds-style predict buttons + teal predict CTA"
```

---

### Task 4: Intensity Bar + AI Commentary Restyle

**Files:**
- Modify: `style.css:446-530` (intensity + AI commentary)

- [ ] **Step 1: Update intensity bar colors**

Replace `.intensity-fill` gradient styles:

```css
.intensity-fill {
    height: 100%;
    width: 30%;
    border-radius: 5px;
    background: linear-gradient(90deg, var(--primary), var(--accent));
    transition: width 0.15s ease, background 0.4s ease, box-shadow 0.4s ease;
}
.intensity-fill.medium { background: linear-gradient(90deg, var(--warning), #f97316); }
.intensity-fill.high {
    background: linear-gradient(90deg, #f97316, var(--danger));
    box-shadow: 0 0 16px rgba(204, 91, 90, 0.5);
    animation: intensityPulse 0.6s ease-in-out infinite;
}
```

(The teal primary will take effect automatically via custom properties, so only the .high state needs explicit red.)

- [ ] **Step 2: Update AI commentary border colors**

Replace `.ai-commentary` background:

```css
.ai-commentary {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    max-width: 800px;
    margin-top: 10px;
    padding: 10px 16px;
    background: rgba(0, 199, 177, 0.05);
    border: 1px solid rgba(0, 199, 177, 0.12);
    border-radius: var(--radius-sm);
    font-size: 0.82rem;
    color: var(--text);
    min-height: 38px;
    transition: all 0.4s ease;
    overflow: hidden;
}
.ai-badge {
    padding: 3px 10px;
    border-radius: 6px;
    background: linear-gradient(135deg, var(--primary), #009E8E);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
    white-space: nowrap;
    letter-spacing: 0.05em;
    flex-shrink: 0;
}
```

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat: teal intensity bar + AI commentary restyle"
```

---

### Task 5: Landing Page + Logo Restyle

**Files:**
- Modify: `style.css:161-230` (landing styles)
- Modify: `style.css:97-102` (button primary)

- [ ] **Step 1: Update logo gradient**

Replace `.logo-text` gradient:

```css
.logo-text {
    font-size: clamp(2.5rem, 8vw, 4.5rem);
    font-weight: 900;
    letter-spacing: -0.04em;
    background: linear-gradient(135deg, var(--text-bright), var(--primary), var(--accent));
    background-size: 200% 200%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: gradientShift 4s ease-in-out infinite;
}
.logo-text .accent {
    background: linear-gradient(135deg, var(--accent), var(--success));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

- [ ] **Step 2: Update primary button**

`.btn-primary` and hover:

```css
.btn-primary {
    background: var(--primary);
    color: #fff;
    box-shadow: 0 0 20px var(--primary-glow);
}
.btn-primary:hover { background: #00D4BE; box-shadow: 0 0 30px var(--primary-glow); transform: translateY(-1px); }
```

- [ ] **Step 3: Update sport badges border**

`.sport-badge` already uses `--card` and `--border` which will auto-update.

No CSS change needed — just verify visually.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: teal landing page + logo gradient"
```

---

### Task 6: Precise 90-Second Events — Video Research

**Files:**
- Modify: `app.js:43-124` (MATCHES array)

This task requires watching each video to find the best 90-second segments and mark every event to the second.

- [ ] **Step 1: Research CS2 video segment**

Open YouTube video `2GeYxpuibiE` (BLAST Austin Major 2025). Find 2 action-packed consecutive rounds (~90s). Use Playwright to navigate and note exact timestamps.

Requirements:
- Minimum 8 events
- Types: kill, headshot, bomb, clutch
- Each event verified to ±1 second

Record: `videoStart` (exact second), `duration` (~90), and each event's `time` (relative to videoStart).

- [ ] **Step 2: Research Football video segment**

Open YouTube video `DDWYR9Oi_wI` (WC 2022 Final). Find the Mbappe comeback segment (~90s) with goals, fouls, penalty.

Requirements:
- Minimum 6 events
- Types: goal, foul, penalty, corner
- Include scoreA/scoreB on goals

- [ ] **Step 3: Research NBA video segment**

Open YouTube video `17MO0XFSPTk` (NBA Finals 2024 Game 5). Find a segment with diverse action (~90s).

Requirements:
- Minimum 8 events
- Types: three, dunk, block, steal (at least 3 types present)

- [ ] **Step 4: Update MATCHES array in app.js**

Replace `MATCHES` (app.js lines 43-124) with the researched data. Example format:

```javascript
const MATCHES = [
    {
        id: 'wc2022-final',
        sport: 'football',
        title: 'ЧМ 2022 — Финал',
        desc: 'Камбэк Мбаппе! Два гола за минуту!',
        duration: 90,
        badge: 'live',
        teamA: '🇦🇷 Аргентина',
        teamB: '🇫🇷 Франция',
        videoId: 'DDWYR9Oi_wI',
        videoStart: NNN,  // determined by research
        events: [
            // Each event verified by watching video
            { time: NN, type: 'TYPE', label: 'LABEL', scoreA: N },
            // ...
        ],
    },
    // ... cs2, nba
];
```

Exact values filled after Steps 1-3.

- [ ] **Step 5: Update FALLBACK_EVENTS**

FALLBACK_EVENTS is auto-generated from MATCHES (lines 126-130) — no change needed.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: precise 90s events — hand-verified timestamps"
```

---

### Task 7: Server Deploy — Event JSON Files

**Files:**
- Modify: Server `5.129.230.72:/root/predict-proxy/events/*.json`

- [ ] **Step 1: Generate JSON files from MATCHES data**

For each match, create a JSON file matching the server format:

```json
{
  "matchId": "wc2022-final",
  "sport": "football",
  "videoId": "DDWYR9Oi_wI",
  "videoStart": NNN,
  "duration": 90,
  "title": "ЧМ 2022 — Финал",
  "teamA": "🇦🇷 Аргентина",
  "teamB": "🇫🇷 Франция",
  "extractedAt": "2026-03-30",
  "eventCount": N,
  "events": [...]
}
```

- [ ] **Step 2: Upload to server**

```bash
scp events/wc2022-final.json root@5.129.230.72:/root/predict-proxy/events/
scp events/cs2-highlights.json root@5.129.230.72:/root/predict-proxy/events/
scp events/nba-finals-2024.json root@5.129.230.72:/root/predict-proxy/events/
```

- [ ] **Step 3: Restart predict-proxy**

```bash
ssh root@5.129.230.72 "systemctl restart predict-proxy"
```

- [ ] **Step 4: Verify API**

```bash
curl https://5-129-230-72.sslip.io/api/events/wc2022-final | python3 -m json.tool
curl https://5-129-230-72.sslip.io/api/events/cs2-highlights | python3 -m json.tool
curl https://5-129-230-72.sslip.io/api/events/nba-finals-2024 | python3 -m json.tool
```

Each should return JSON with correct events.

- [ ] **Step 5: Commit local event files**

```bash
git add events/
git commit -m "feat: deploy precise event JSON to server"
```

---

### Task 8: Push + End-to-End Verification

**Files:** None (testing only)

- [ ] **Step 1: Push to GitHub**

```bash
git push origin master
```

Wait for GitHub Pages to deploy (~1 min).

- [ ] **Step 2: Open live site**

Navigate to `https://jklazer.github.io/predict-play/`

- [ ] **Step 3: Visual check — landing page**

Verify:
- Dark background, teal accents
- Montserrat font
- PREDICTPLAY logo with teal gradient
- "ИГРАТЬ" button in teal

- [ ] **Step 4: Visual check — match select**

Verify:
- 3 match cards with team names
- Green pulsing LIVE badge
- Teal hover glow
- Duration shows ~1:30 format

- [ ] **Step 5: Gameplay check — CS2 match**

Play the CS2 match. Verify:
- Video starts at correct segment
- Event type buttons look like odds cells
- Predict button is teal
- When predicting near a visible kill → PERFECT/EXCELLENT
- Intensity bar pulses before events
- AI commentary fires on events
- Match ends after ~90s

- [ ] **Step 6: Gameplay check — Football match**

Same verification for football. Verify goals match video.

- [ ] **Step 7: Gameplay check — NBA match**

Same verification for NBA. Verify diverse event types.
