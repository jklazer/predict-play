# Real Events Pipeline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded events with real events extracted from YouTube transcripts via Claude Haiku AI.

**Architecture:** One-time Python script downloads YouTube transcripts, sends to Claude Haiku to extract events, saves JSON files. FastAPI serves them. Frontend fetches at match start with fallback to hardcoded events.

**Tech Stack:** Python 3, youtube-transcript-api, anthropic SDK, FastAPI, vanilla JS

---

### Task 1: Backend — Event Extraction Script

**Files:**
- Create: `/root/predict-proxy/extract_events.py`
- Create: `/root/predict-proxy/events/` (directory)

**Server:** 5.129.230.72 (SSH root)

- [ ] **Step 1: Install dependencies on server**

```bash
ssh root@5.129.230.72
cd /root/predict-proxy
pip install youtube-transcript-api
mkdir -p events
```

- [ ] **Step 2: Create extract_events.py**

```python
#!/usr/bin/env python3
"""Extract real events from YouTube video transcripts using Claude Haiku."""

import json
import sys
from datetime import datetime, timezone

import anthropic
from youtube_transcript_api import YouTubeTranscriptApi

MATCHES = [
    {
        "matchId": "wc2022-final",
        "sport": "football",
        "videoId": "DDWYR9Oi_wI",
        "videoStart": 40,
        "duration": 1050,
        "title": "ЧМ 2022 — Финал",
        "desc": "Аргентина vs Франция. Смотри видео и предсказывай голы!",
        "teamA": "🇦🇷 Аргентина",
        "teamB": "🇫🇷 Франция",
        "badge": "live",
    },
    {
        "matchId": "cs2-highlights",
        "sport": "cs2",
        "videoId": "2GeYxpuibiE",
        "videoStart": 240,
        "duration": 500,
        "title": "CS2 Major — Гранд-финал",
        "desc": "Vitality vs TheMongolz. Смотри и предсказывай моменты!",
        "teamA": "🟡 Vitality",
        "teamB": "🔴 TheMongolz",
        "badge": "live",
    },
    {
        "matchId": "nba-finals-2024",
        "sport": "basketball",
        "videoId": "17MO0XFSPTk",
        "videoStart": 5,
        "duration": 570,
        "title": "NBA Finals 2024 — Game 5",
        "desc": "Celtics — чемпионы! Смотри хайлайты и предсказывай!",
        "teamA": "🟢 Celtics",
        "teamB": "🔵 Mavericks",
        "badge": "live",
    },
]

EVENT_TYPES = {
    "football": "goal, foul, corner, penalty",
    "cs2": "kill, headshot, bomb, clutch, ace",
    "basketball": "three, dunk, block, steal",
}

PROMPT_TEMPLATE = """You are a sports event analyst. Below is a transcript of a {sport} match video.
The video playback starts at second {video_start} of the YouTube video.
Match duration is {duration} seconds from that start point.

Teams: {team_a} vs {team_b}

Find ALL notable events from this transcript. Event types for {sport}:
{event_types}

For each event return:
- time: seconds elapsed since playback start (transcript_segment_start_seconds - {video_start}). Must be >= 0 and <= {duration}.
- type: one of [{event_types}]
- label: short Russian-language description of the event (2-8 words, exciting style with exclamation marks)

Rules:
- Include EVERY event you can identify, not just highlights
- For CS2: every kill mention, every bomb plant, every clutch, every headshot, every ace
- For football: every goal, every penalty, every foul near the box, every corner kick
- For basketball: every 3-pointer, every dunk, every block, every steal
- Sort by time ascending
- Merge duplicate events at the same timestamp
- Minimum 1 second gap between events

Return ONLY a valid JSON array. No markdown, no explanation. Example:
[{{"time": 29, "type": "kill", "label": "Фраг! Игрок снимает соперника!"}}]

TRANSCRIPT:
{transcript}"""


def get_transcript(video_id: str) -> list[dict]:
    """Download YouTube transcript with timestamps."""
    try:
        segments = YouTubeTranscriptApi.get_transcript(video_id, languages=["en"])
    except Exception:
        segments = YouTubeTranscriptApi.get_transcript(video_id, languages=["ru", "en", "auto"])
    return segments


def format_transcript(segments: list[dict]) -> str:
    """Format transcript segments into readable text with timestamps."""
    lines = []
    for seg in segments:
        start = seg["start"]
        mins = int(start // 60)
        secs = int(start % 60)
        lines.append(f"[{mins:02d}:{secs:02d}] {seg['text']}")
    return "\n".join(lines)


def extract_events(match: dict) -> list[dict]:
    """Extract events from transcript using Claude Haiku."""
    print(f"\n{'='*60}")
    print(f"Processing: {match['title']} ({match['sport']})")
    print(f"Video: {match['videoId']}, start={match['videoStart']}s, duration={match['duration']}s")

    # Step 1: Get transcript
    print("  Downloading transcript...")
    segments = get_transcript(match["videoId"])
    print(f"  Got {len(segments)} transcript segments")

    # Filter to relevant time range
    start = match["videoStart"]
    end = start + match["duration"]
    relevant = [s for s in segments if s["start"] >= start - 30 and s["start"] <= end + 30]
    print(f"  Filtered to {len(relevant)} segments in time range")

    transcript_text = format_transcript(relevant)

    # Step 2: Send to Claude Haiku
    print("  Sending to Claude Haiku...")
    client = anthropic.Anthropic()

    prompt = PROMPT_TEMPLATE.format(
        sport=match["sport"],
        video_start=match["videoStart"],
        duration=match["duration"],
        team_a=match["teamA"],
        team_b=match["teamB"],
        event_types=EVENT_TYPES[match["sport"]],
        transcript=transcript_text,
    )

    message = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}],
    )

    response_text = message.content[0].text.strip()

    # Step 3: Parse JSON
    try:
        events = json.loads(response_text)
    except json.JSONDecodeError:
        # Try to extract JSON array from response
        import re
        match_json = re.search(r'\[.*\]', response_text, re.DOTALL)
        if match_json:
            events = json.loads(match_json.group())
        else:
            print(f"  ERROR: Could not parse response:\n{response_text[:500]}")
            return []

    # Validate and clean events
    clean = []
    for ev in events:
        t = ev.get("time")
        typ = ev.get("type", "")
        label = ev.get("label", "")
        if isinstance(t, (int, float)) and 0 <= t <= match["duration"] and typ and label:
            clean.append({"time": round(t, 1), "type": typ, "label": label})

    # Sort and deduplicate (min 1s gap)
    clean.sort(key=lambda e: e["time"])
    deduped = []
    for ev in clean:
        if not deduped or ev["time"] - deduped[-1]["time"] >= 1:
            deduped.append(ev)

    print(f"  Extracted {len(deduped)} events")
    return deduped


def main():
    match_ids = sys.argv[1:] if len(sys.argv) > 1 else [m["matchId"] for m in MATCHES]

    for match in MATCHES:
        if match["matchId"] not in match_ids:
            continue

        events = extract_events(match)

        output = {
            "matchId": match["matchId"],
            "sport": match["sport"],
            "videoId": match["videoId"],
            "videoStart": match["videoStart"],
            "duration": match["duration"],
            "title": match["title"],
            "desc": match["desc"],
            "teamA": match["teamA"],
            "teamB": match["teamB"],
            "badge": match["badge"],
            "extractedAt": datetime.now(timezone.utc).isoformat(),
            "eventCount": len(events),
            "events": events,
        }

        path = f"events/{match['matchId']}.json"
        with open(path, "w", encoding="utf-8") as f:
            json.dump(output, f, ensure_ascii=False, indent=2)

        print(f"  Saved to {path} ({len(events)} events)")


if __name__ == "__main__":
    main()
```

- [ ] **Step 3: Set ANTHROPIC_API_KEY and run**

```bash
export ANTHROPIC_API_KEY="sk-ant-..."  # real key
python extract_events.py
```

Expected output:
```
============================================================
Processing: ЧМ 2022 — Финал (football)
  Downloading transcript...
  Got ~850 transcript segments
  Filtered to ~400 segments in time range
  Sending to Claude Haiku...
  Extracted 25-40 events
  Saved to events/wc2022-final.json (N events)
...
```

- [ ] **Step 4: Verify JSON files**

```bash
ls -la events/
cat events/cs2-highlights.json | python -m json.tool | head -30
```

Check: each file has `events` array with `time`, `type`, `label` fields.

- [ ] **Step 5: Commit on server**

```bash
cd /root/predict-proxy
git add extract_events.py events/
git commit -m "feat: add event extraction pipeline from YouTube transcripts"
```

---

### Task 2: Backend — API Endpoint

**Files:**
- Modify: `/root/predict-proxy/main.py`

- [ ] **Step 1: Add events endpoint to main.py**

Add this to existing FastAPI app in `main.py`:

```python
import os

EVENTS_DIR = os.path.join(os.path.dirname(__file__), "events")

@app.get("/api/events/{match_id}")
async def get_events(match_id: str):
    """Serve pre-extracted events for a match."""
    safe_id = match_id.replace("/", "").replace("..", "")
    path = os.path.join(EVENTS_DIR, f"{safe_id}.json")
    if not os.path.exists(path):
        return JSONResponse(status_code=404, content={"error": "Match not found"})
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return JSONResponse(content=data)


@app.get("/api/matches")
async def list_matches():
    """List all available matches with metadata (without full events)."""
    matches = []
    for filename in sorted(os.listdir(EVENTS_DIR)):
        if not filename.endswith(".json"):
            continue
        path = os.path.join(EVENTS_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        matches.append({
            "matchId": data["matchId"],
            "sport": data["sport"],
            "title": data["title"],
            "desc": data.get("desc", ""),
            "teamA": data["teamA"],
            "teamB": data["teamB"],
            "videoId": data["videoId"],
            "videoStart": data["videoStart"],
            "duration": data["duration"],
            "badge": data.get("badge", "live"),
            "eventCount": data.get("eventCount", len(data.get("events", []))),
        })
    return JSONResponse(content={"matches": matches})
```

Add `import json` to top if not already there.

- [ ] **Step 2: Restart predict-proxy**

```bash
systemctl restart predict-proxy
```

- [ ] **Step 3: Test endpoints**

```bash
curl -s https://5-129-230-72.sslip.io/api/matches | python -m json.tool | head -20
curl -s https://5-129-230-72.sslip.io/api/events/cs2-highlights | python -m json.tool | head -30
curl -s https://5-129-230-72.sslip.io/api/events/nonexistent
```

Expected: matches list, events array, 404 error.

- [ ] **Step 4: Commit**

```bash
git add main.py
git commit -m "feat: add /api/events and /api/matches endpoints"
```

---

### Task 3: Frontend — Fetch Events from API

**Files:**
- Modify: `C:\Users\sazon\OneDrive\Desktop\predict-play\app.js`

- [ ] **Step 1: Add API base URL constant**

At the top of app.js, after CLAUDE_PROXY (line ~591):

```javascript
const EVENTS_API = 'https://5-129-230-72.sslip.io';
```

- [ ] **Step 2: Move hardcoded events to FALLBACK_EVENTS**

After the MATCHES array, add:

```javascript
// Fallback events (used when API is unavailable)
const FALLBACK_EVENTS = {};
for (const m of MATCHES) {
    FALLBACK_EVENTS[m.id] = m.events || [];
}
```

Then remove the `events` arrays from each match in MATCHES, replacing with empty arrays:

In each match object, replace the events array with:
```javascript
events: [], // loaded from API at match start
```

Keep all other fields (id, sport, title, desc, duration, badge, teamA, teamB, videoId, videoStart).

- [ ] **Step 3: Make _startCountdown fetch events first**

Replace the `_startCountdown` method to fetch events before countdown:

```javascript
    async _startCountdown(match) {
        if (this._countdownInterval) clearInterval(this._countdownInterval);
        this.selectedMatch = match;

        // Fetch real events from API
        const overlay = document.getElementById('countdown-overlay');
        const numEl = document.getElementById('cd-num');
        overlay.classList.remove('hidden');
        numEl.textContent = '⏳';
        numEl.style.color = 'var(--accent)';
        numEl.style.animation = 'none';

        try {
            const resp = await fetch(`${EVENTS_API}/api/events/${match.id}`);
            if (resp.ok) {
                const data = await resp.json();
                match.events = data.events;
                match.duration = data.duration || match.duration;
            } else {
                match.events = FALLBACK_EVENTS[match.id] || [];
            }
        } catch {
            match.events = FALLBACK_EVENTS[match.id] || [];
        }

        // Start countdown 3-2-1-GO
        let count = 3;
        numEl.textContent = count;
        numEl.style.color = '';
        numEl.style.animation = 'cdPop 0.7s ease-out';
        this.sound.countdown();

        this._countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                numEl.textContent = count;
                numEl.style.animation = 'none';
                void numEl.offsetWidth;
                numEl.style.animation = 'cdPop 0.7s ease-out';
                this.sound.countdown();
            } else if (count === 0) {
                numEl.textContent = 'GO!';
                numEl.style.color = 'var(--success)';
                numEl.style.animation = 'none';
                void numEl.offsetWidth;
                numEl.style.animation = 'cdPop 0.7s ease-out';
                this.sound.go();
            } else {
                clearInterval(this._countdownInterval);
                this._countdownInterval = null;
                overlay.classList.add('hidden');
                numEl.style.color = '';
                this._startGame(match);
            }
        }, 800);
    }
```

- [ ] **Step 4: Update match card to show dynamic event count**

In `_showMatchSelect`, change the event count line:

```javascript
const evtCount = match.events.length || FALLBACK_EVENTS[match.id]?.length || '?';
```

Use this in the template:
```javascript
<span>🎯 ${evtCount} событий</span>
```

- [ ] **Step 5: Verify syntax**

```bash
cd "C:\Users\sazon\OneDrive\Desktop\predict-play"
node -c app.js
```

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat: fetch real events from API with fallback to hardcoded"
```

---

### Task 4: Run Extraction and End-to-End Test

- [ ] **Step 1: SSH to server and run extraction**

```bash
ssh root@5.129.230.72
cd /root/predict-proxy
export ANTHROPIC_API_KEY="sk-ant-..."
python extract_events.py
```

- [ ] **Step 2: Verify all 3 JSON files exist**

```bash
ls -la events/
for f in events/*.json; do echo "$f: $(python -c "import json; d=json.load(open('$f')); print(len(d['events']), 'events')") "; done
```

Expected: each match has 20+ events.

- [ ] **Step 3: Restart predict-proxy and test API**

```bash
systemctl restart predict-proxy
curl -s https://5-129-230-72.sslip.io/api/matches | python -m json.tool
curl -s https://5-129-230-72.sslip.io/api/events/cs2-highlights | python -m json.tool | grep '"type"' | sort | uniq -c | sort -rn
```

Expected: variety of event types (kill, headshot, bomb, clutch, ace).

- [ ] **Step 4: Test frontend locally**

Open http://localhost:8765, select CS2 match, verify:
- Events load (not "?" on match card)
- Game starts with real events
- Kills you see in video match events in the game
- No -15 for predicting visible kills

- [ ] **Step 5: Push frontend changes**

```bash
cd "C:\Users\sazon\OneDrive\Desktop\predict-play"
git add -A
git commit -m "feat: real events pipeline — transcript extraction + API integration"
git push origin master
```

- [ ] **Step 6: Verify on GitHub Pages**

Open https://jklazer.github.io/predict-play/ and test the full flow.
