# PredictPlay: Real Events Pipeline

## Problem

Events in PredictPlay are hardcoded at fixed timestamps. The CS2 match has 11 manual events, but the actual video contains dozens of kills. Players predict real kills they see in the video, get -15 penalty because those kills aren't in the event list. The game feels broken.

## Solution

Replace hardcoded events with real events extracted from YouTube video transcripts using Claude Haiku AI. Pre-process 3 existing videos once, cache results as JSON, serve via API.

## Architecture

```
YouTube Video
     |
[youtube-transcript-api] -> transcript with timestamps
     |
[Claude Haiku] -> prompt: "find all events in this {sport} transcript"
     |
events/{matchId}.json (cached on disk)
     |
[FastAPI endpoint] GET /api/events/{matchId}
     |
[Frontend] -> replaces hardcoded MATCHES[].events with real data
```

## What Changes

| Component | Change |
|-----------|--------|
| Backend (5.129.230.72) | New script `extract_events.py`, new endpoint `/api/events/{matchId}` |
| Frontend (app.js) | Fetch events from API at match start instead of hardcoded array |
| Data | 3 JSON files with AI-extracted events |

## What Does NOT Change

- GameEngine, scoring tiers, intensity bar, cooldown, decoys
- YouTube IFrame API integration
- Leaderboard, AI commentary (ClaudeCommentary)
- UI/UX, CSS, HTML structure
- Results screen, timeline, vs AI

## Backend: Event Extraction Script

### `extract_events.py`

Runs once per video. Not a server process.

**Step 1: Download transcript**

```python
from youtube_transcript_api import YouTubeTranscriptApi

transcript = YouTubeTranscriptApi.get_transcript(video_id, languages=['en', 'ru'])
# Returns: [{"text": "HEADSHOT!", "start": 269.5, "duration": 2.1}, ...]
```

**Step 2: Send to Claude Haiku**

Prompt template (per sport):

```
You are a sports event analyst. Below is a transcript of a {sport} match video.
The video playback starts at videoStart={videoStart} seconds.

Find ALL events from this transcript. Event types for {sport}:
{event_types}

For each event return:
- time: seconds from videoStart (NOT from video start)
- type: one of the event type IDs
- label: short Russian description of the event

Rules:
- Include EVERY event you can find, not just highlights
- time = transcript_start - videoStart
- Skip events with time < 0
- Sort by time ascending

Return ONLY a JSON array, no markdown.
```

Event types per sport:
- CS2: kill, headshot, bomb, clutch, ace
- Football: goal, foul, corner, penalty
- Basketball: three, dunk, block, steal

**Step 3: Save to JSON**

Output format: `events/{matchId}.json`

```json
{
  "matchId": "cs2-highlights",
  "sport": "cs2",
  "videoId": "2GeYxpuibiE",
  "videoStart": 240,
  "duration": 500,
  "title": "CS2 Major — Гранд-финал",
  "teamA": "🟡 Vitality",
  "teamB": "🔴 TheMongolz",
  "extractedAt": "2026-03-30T12:00:00Z",
  "events": [
    {"time": 29, "type": "headshot", "label": "ХЕДШОТ! Flamesy снимает Techno!"},
    {"time": 35, "type": "kill", "label": "Ответный фраг!"},
    ...
  ]
}
```

### Matches to process

| Match ID | Video ID | videoStart | Sport | Duration |
|----------|----------|------------|-------|----------|
| wc2022-final | DDWYR9Oi_wI | 40 | football | 1050 |
| cs2-highlights | 2GeYxpuibiE | 240 | cs2 | 500 |
| nba-finals-2024 | 17MO0XFSPTk | 5 | basketball | 570 |

## Backend: API Endpoint

Added to existing `main.py` on predict-proxy.

```
GET /api/events/{matchId}
```

- Reads `events/{matchId}.json` from disk
- Returns JSON response
- CORS headers (already configured for predict-proxy)
- 404 if matchId not found

No database. Just file reads.

## Frontend Changes

### 1. Remove hardcoded events from MATCHES

Keep metadata (id, sport, title, teams, videoId, videoStart, duration, badge) but remove `events` array. Keep events as fallback in a separate `FALLBACK_EVENTS` const.

### 2. Fetch events at match start

In `_startGame(match)`, before engine.start():

```javascript
async _startGame(match) {
    // Try to load real events from API
    try {
        const resp = await fetch(`${API_BASE}/api/events/${match.id}`);
        if (resp.ok) {
            const data = await resp.json();
            match.events = data.events;
        }
    } catch {
        // Fallback to hardcoded events
        match.events = FALLBACK_EVENTS[match.id] || [];
    }
    // ... rest of _startGame unchanged
}
```

### 3. Loading state

Show "Загрузка событий..." overlay while fetching. Replace countdown start — fetch first, then countdown.

### 4. Update event count display

Match card shows "🎯 N событий" — this now comes from the API response or fallback.

## File Structure

```
predict-proxy/ (server 5.129.230.72)
├── main.py              (add /api/events/{matchId})
├── extract_events.py    (new: one-time extraction script)
├── requirements.txt     (add youtube-transcript-api)
└── events/
    ├── wc2022-final.json
    ├── cs2-highlights.json
    └── nba-finals-2024.json

predict-play/ (frontend, GitHub Pages)
├── app.js               (fetch events from API, fallback to hardcoded)
├── index.html           (no changes)
└── style.css            (no changes)
```

## Cost

- youtube-transcript-api: free
- Claude Haiku (3 transcripts): ~$0.003 total
- Storage: 3 JSON files, ~10KB each
- Runtime: 0 (pre-processed)

## Error Handling

- API unreachable → fallback to hardcoded events
- Transcript unavailable → use Whisper or manual fallback
- Claude returns bad JSON → retry once, then manual fallback
- Empty events → show warning, use fallback

## Success Criteria

1. Player predicts a kill they SEE in the CS2 video → gets points (not -15)
2. Events cover 80%+ of visible action in the video
3. Match loads in <1 second (pre-cached)
4. Fallback works if API is down
