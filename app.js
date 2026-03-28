/* ========================================================
   PredictPlay — Game Engine & UI
   ======================================================== */

// ==================== DATA ====================
const SPORTS = {
    football: {
        icon: '⚽',
        name: 'Футбол',
        types: [
            { id: 'goal', label: '⚽ Гол', icon: '⚽' },
            { id: 'yellow', label: '🟨 Жёлтая', icon: '🟨' },
            { id: 'red', label: '🟥 Красная', icon: '🟥' },
            { id: 'foul', label: '🦵 Фол', icon: '🦵' },
            { id: 'corner', label: '🚩 Угловой', icon: '🚩' },
            { id: 'penalty', label: '⚡ Пенальти', icon: '⚡' },
        ],
    },
    cs2: {
        icon: '🎮',
        name: 'CS2',
        types: [
            { id: 'kill', label: '💀 Килл', icon: '💀' },
            { id: 'headshot', label: '🎯 Хедшот', icon: '🎯' },
            { id: 'bomb', label: '💣 Бомба', icon: '💣' },
            { id: 'defuse', label: '🔧 Дефуз', icon: '🔧' },
            { id: 'clutch', label: '🔥 Клатч', icon: '🔥' },
            { id: 'ace', label: '⭐ ACE', icon: '⭐' },
        ],
    },
    basketball: {
        icon: '🏀',
        name: 'Баскетбол',
        types: [
            { id: 'three', label: '🏀 3-очковый', icon: '🏀' },
            { id: 'dunk', label: '💥 Данк', icon: '💥' },
            { id: 'block', label: '🖐 Блок', icon: '🖐' },
            { id: 'steal', label: '🤏 Перехват', icon: '🤏' },
            { id: 'alley', label: '🎭 Аллей-уп', icon: '🎭' },
        ],
    },
};

const MATCHES = [
    {
        id: 'demo-football',
        sport: 'football',
        title: 'Финал Чемпионата',
        desc: 'Классический футбольный матч. Идеально для первой игры.',
        duration: 180,
        badge: 'demo',
        teamA: 'Барселона',
        teamB: 'Реал Мадрид',
        events: [
            { time: 16, type: 'corner', label: 'Угловой — подача в штрафную' },
            { time: 31, type: 'foul', label: 'Грубый фол в центре поля' },
            { time: 47, type: 'goal', label: 'ГОЛ! Удар со штрафного!', scoreA: 1 },
            { time: 68, type: 'yellow', label: 'Жёлтая карточка за симуляцию' },
            { time: 89, type: 'corner', label: 'Угловой — опасный момент' },
            { time: 108, type: 'goal', label: 'ГОЛ! Пенальти реализован!', scoreB: 1 },
            { time: 130, type: 'foul', label: 'Фол на подступах к штрафной' },
            { time: 148, type: 'penalty', label: 'ПЕНАЛЬТИ! Нарушение в штрафной' },
            { time: 165, type: 'goal', label: 'ГОЛ! Удар в девятку на последних минутах!', scoreA: 1 },
        ],
    },
    {
        id: 'demo-cs2',
        sport: 'cs2',
        title: 'CS2 Major — Гранд-финал',
        desc: 'Быстрый темп, много событий. Для продвинутых игроков.',
        duration: 200,
        badge: 'demo',
        teamA: 'NAVI',
        teamB: 'FaZe',
        events: [
            { time: 12, type: 'kill', label: 'Первый фраг раунда!' },
            { time: 24, type: 'headshot', label: 'Хедшот через smoke!' },
            { time: 38, type: 'bomb', label: 'Бомба заложена на B!' },
            { time: 52, type: 'kill', label: 'Двойной килл с AWP!' },
            { time: 67, type: 'clutch', label: '1v3 КЛАТЧ! Невероятно!' },
            { time: 85, type: 'defuse', label: 'Дефуз за 0.3 секунды!' },
            { time: 100, type: 'kill', label: 'Фраг сквозь стену!' },
            { time: 118, type: 'headshot', label: 'No-scope хедшот!' },
            { time: 135, type: 'bomb', label: 'Бомба на A! Ретейк!' },
            { time: 152, type: 'ace', label: 'ACE! Пять фрагов одного игрока!' },
            { time: 170, type: 'clutch', label: '1v2 Клатч с ножом!' },
            { time: 190, type: 'defuse', label: 'Нинзя-дефуз! Матчпоинт!' },
        ],
    },
    {
        id: 'demo-nba',
        sport: 'basketball',
        title: 'NBA Плей-офф — Игра 7',
        desc: 'Баскетбольная классика. Средний темп, высокие ставки.',
        duration: 180,
        badge: 'demo',
        teamA: 'Lakers',
        teamB: 'Celtics',
        events: [
            { time: 14, type: 'three', label: '3-очковый с дистанции!' },
            { time: 30, type: 'dunk', label: 'Мощнейший данк в проходе!' },
            { time: 48, type: 'block', label: 'Блок-шот на кольце!' },
            { time: 65, type: 'steal', label: 'Перехват и быстрый отрыв!' },
            { time: 82, type: 'three', label: '3-очковый баззер-битер!' },
            { time: 100, type: 'alley', label: 'Аллей-уп с передачи!' },
            { time: 120, type: 'dunk', label: 'Данк через двоих!' },
            { time: 140, type: 'block', label: 'Блок на последней секунде!' },
            { time: 158, type: 'three', label: '3-очковый! Разрыв растёт!' },
            { time: 172, type: 'dunk', label: 'Финальный данк! Победа!' },
        ],
    },
];

// Simulated leaderboard players
const BOT_PLAYERS = [
    { name: 'xPredictor', avatar: '🤖', base: 420 },
    { name: 'GoalHunter', avatar: '🎯', base: 380 },
    { name: 'ClutchKing', avatar: '👑', base: 350 },
    { name: 'TimeSeer', avatar: '🔮', base: 310 },
    { name: 'SharpEye', avatar: '🦅', base: 280 },
    { name: 'ProGamer', avatar: '🕹️', base: 250 },
    { name: 'EventRadar', avatar: '📡', base: 220 },
    { name: 'LuckyShot', avatar: '🍀', base: 180 },
];

// ==================== SOUND MANAGER ====================
class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch { this.enabled = false; }
    }

    _tone(freq, dur, type = 'sine', vol = 0.15) {
        if (!this.ctx || !this.enabled) return;
        if (this.ctx.state === 'suspended') this.ctx.resume();
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(vol, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
        osc.start();
        osc.stop(this.ctx.currentTime + dur);
    }

    predict() {
        this._tone(600, 0.08, 'square', 0.1);
        setTimeout(() => this._tone(800, 0.06, 'square', 0.08), 50);
    }

    score(quality) {
        const map = { perfect: [1200, 1500, 1800], excellent: [800, 1100], great: [700, 900], good: [600], ok: [400], miss: [200], false: [150] };
        const freqs = map[quality] || [400];
        freqs.forEach((f, i) => setTimeout(() => this._tone(f, 0.15, 'sine', 0.12), i * 80));
    }

    countdown() { this._tone(440, 0.15, 'sine', 0.1); }
    go() { this._tone(880, 0.3, 'sine', 0.15); setTimeout(() => this._tone(1320, 0.2, 'sine', 0.1), 100); }
    end() { this._tone(440, 0.2, 'sine', 0.1); setTimeout(() => this._tone(330, 0.3, 'sine', 0.12), 150); }
    event() { this._tone(1000, 0.1, 'square', 0.08); setTimeout(() => this._tone(1200, 0.08, 'square', 0.06), 60); }
}

// ==================== AI OPPONENT ====================
class AIOpponent {
    constructor() {
        this.name = 'AI Predictor';
        this.avatar = '🤖';
        this.predictions = [];
        this.score = 0;
    }

    reset() { this.predictions = []; this.score = 0; }

    simulateMatch(events) {
        this.reset();
        for (const ev of events) {
            // AI predicts with some noise — usually 0.5-4 seconds off
            const offset = (Math.random() - 0.35) * 5;
            const predTime = ev.time + offset;
            const diff = Math.abs(offset);
            const result = this._evaluate(diff);
            this.predictions.push({ time: predTime, eventTime: ev.time, type: ev.type, ...result });
            this.score += result.pts;
        }
    }

    _evaluate(diff) {
        if (diff <= 0.5) return { pts: 100, label: 'PERFECT', quality: 'perfect' };
        if (diff <= 1) return { pts: 80, label: 'EXCELLENT', quality: 'excellent' };
        if (diff <= 2) return { pts: 60, label: 'GREAT', quality: 'great' };
        if (diff <= 3) return { pts: 40, label: 'GOOD', quality: 'good' };
        if (diff <= 5) return { pts: 20, label: 'OK', quality: 'ok' };
        return { pts: 0, label: 'MISS', quality: 'miss' };
    }
}

// ==================== GAME ENGINE ====================
class GameEngine {
    constructor() {
        this.match = null;
        this.predictions = [];
        this.score = 0;
        this.currentTime = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.selectedType = null;
        this.cooldown = false;
        this.eventsFound = 0;
        this.claimedEvents = new Set();
        this.matchScoreA = 0;
        this.matchScoreB = 0;
        this.tickInterval = null;
        this.startTimestamp = 0;
        this.onTick = null;
        this.onEvent = null;
        this.onEnd = null;
    }

    start(match) {
        this.match = { ...match, events: match.events.map(e => ({ ...e })) };
        this.predictions = [];
        this.score = 0;
        this.currentTime = 0;
        this.isPlaying = true;
        this.isPaused = false;
        this.cooldown = false;
        this.eventsFound = 0;
        this.claimedEvents = new Set();
        this.matchScoreA = 0;
        this.matchScoreB = 0;
        this.selectedType = this.match.events[0]?.type || null;
        this.startTimestamp = performance.now();

        this.tickInterval = setInterval(() => this._tick(), 50);
    }

    stop() {
        this.isPlaying = false;
        clearInterval(this.tickInterval);
        if (this.onEnd) this.onEnd();
    }

    _tick() {
        if (!this.isPlaying || this.isPaused) return;
        this.currentTime = (performance.now() - this.startTimestamp) / 1000;

        // Check for events that just happened (for flash display)
        for (const ev of this.match.events) {
            if (!ev._fired && this.currentTime >= ev.time) {
                ev._fired = true;
                if (ev.scoreA) this.matchScoreA += ev.scoreA;
                if (ev.scoreB) this.matchScoreB += ev.scoreB;
                if (this.onEvent) this.onEvent(ev);
            }
        }

        if (this.onTick) this.onTick(this.currentTime);

        if (this.currentTime >= this.match.duration) {
            this.stop();
        }
    }

    predict() {
        if (!this.isPlaying || this.cooldown) return null;

        const predTime = this.currentTime;
        const predType = this.selectedType;

        // Find nearest unclaimed event within ±10 seconds
        let nearest = null;
        let minDiff = Infinity;
        for (let i = 0; i < this.match.events.length; i++) {
            if (this.claimedEvents.has(i)) continue;
            const diff = Math.abs(predTime - this.match.events[i].time);
            if (diff < minDiff && diff <= 10) {
                minDiff = diff;
                nearest = { index: i, event: this.match.events[i], diff };
            }
        }

        let result;
        if (!nearest) {
            result = { pts: -15, label: 'ПРОМАХ', quality: 'false', diff: null };
        } else {
            const d = nearest.diff;
            const typeMatch = nearest.event.type === predType;
            const bonus = typeMatch ? 1 : 0.6;

            let base;
            if (d <= 0.5) base = { pts: 100, label: 'PERFECT!', quality: 'perfect' };
            else if (d <= 1) base = { pts: 80, label: 'EXCELLENT!', quality: 'excellent' };
            else if (d <= 2) base = { pts: 60, label: 'GREAT!', quality: 'great' };
            else if (d <= 3) base = { pts: 40, label: 'GOOD', quality: 'good' };
            else if (d <= 5) base = { pts: 20, label: 'OK', quality: 'ok' };
            else base = { pts: 0, label: 'MISS', quality: 'miss' };

            const pts = Math.round(base.pts * bonus);
            result = { ...base, pts, diff: d, typeMatch };
            this.claimedEvents.add(nearest.index);
            if (pts > 0) this.eventsFound++;
        }

        this.score += result.pts;
        if (this.score < 0) this.score = 0;
        this.predictions.push({ time: predTime, type: predType, ...result });

        // Cooldown
        this.cooldown = true;
        setTimeout(() => { this.cooldown = false; }, 1500);

        return result;
    }

    getIntensity() {
        let base = 0.2 + Math.sin(this.currentTime * 0.7) * 0.08 + Math.sin(this.currentTime * 1.3) * 0.05;

        for (const ev of this.match.events) {
            if (ev._fired) continue;
            const dt = ev.time - this.currentTime;
            if (dt > 0 && dt < 10) {
                const factor = 1 - dt / 10;
                base += factor * factor * 0.55;
            } else if (dt >= -1 && dt <= 0) {
                base = 1.0;
            }
        }

        return Math.min(Math.max(base, 0.08), 1.0);
    }
}

// ==================== LEADERBOARD MANAGER ====================
class LeaderboardManager {
    constructor() {
        this.storageKey = 'pp_leaderboard';
        this.nickname = localStorage.getItem('pp_nick') || '';
    }

    setNickname(name) {
        this.nickname = name;
        localStorage.setItem('pp_nick', name);
    }

    getAll() {
        try { return JSON.parse(localStorage.getItem(this.storageKey)) || []; }
        catch { return []; }
    }

    addScore(score, matchId) {
        const entries = this.getAll();
        const existing = entries.find(e => e.name === this.nickname);
        if (existing) {
            existing.totalScore += score;
            existing.games++;
            if (score > existing.bestScore) existing.bestScore = score;
        } else {
            entries.push({ name: this.nickname, avatar: '🎮', totalScore: score, bestScore: score, games: 1 });
        }
        localStorage.setItem(this.storageKey, JSON.stringify(entries));
    }

    getFullBoard() {
        const real = this.getAll();
        const bots = BOT_PLAYERS.map(b => ({
            name: b.name,
            avatar: b.avatar,
            totalScore: b.base + Math.floor(Math.random() * 80),
            bestScore: b.base,
            games: 3 + Math.floor(Math.random() * 10),
            isBot: true,
        }));
        const all = [...real, ...bots];
        all.sort((a, b) => b.totalScore - a.totalScore);
        return all;
    }

    getMiniBoard(currentScore) {
        const board = this.getFullBoard();
        // Inject current session score for preview
        const me = board.find(e => e.name === this.nickname);
        if (me) me.totalScore += currentScore;
        else board.push({ name: this.nickname, avatar: '🎮', totalScore: currentScore, games: 1 });
        board.sort((a, b) => b.totalScore - a.totalScore);
        return board.slice(0, 8);
    }
}

// ==================== BACKGROUND PARTICLES ====================
function initBgCanvas() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = Array.from({ length: 60 }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.5 + 0.3,
            dx: (Math.random() - 0.5) * 0.3,
            dy: (Math.random() - 0.5) * 0.3,
            a: Math.random() * 0.3 + 0.05,
        }));
    }

    function draw() {
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
            p.x += p.dx;
            p.y += p.dy;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(99, 102, 241, ${p.a})`;
            ctx.fill();
        }
        requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();
    window.addEventListener('resize', () => { resize(); createParticles(); });
}

// ==================== CONFETTI ====================
class Confetti {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.running = false;
        this._resize();
        window.addEventListener('resize', () => this._resize());
    }

    _resize() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    fire() {
        if (!this.canvas) return;
        const colors = ['#fbbf24', '#6366f1', '#06b6d4', '#10b981', '#ef4444', '#f97316', '#a855f7'];
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: window.innerWidth / 2 + (Math.random() - 0.5) * 300,
                y: window.innerHeight / 2,
                dx: (Math.random() - 0.5) * 14,
                dy: (Math.random() - 0.5) * 14 - 5,
                w: Math.random() * 10 + 4,
                h: Math.random() * 6 + 2,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                dr: (Math.random() - 0.5) * 12,
                life: 1,
                decay: 0.007 + Math.random() * 0.008,
                gravity: 0.12,
            });
        }
        if (!this.running) { this.running = true; this._animate(); }
    }

    _animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.particles = this.particles.filter(p => p.life > 0);
        for (const p of this.particles) {
            p.x += p.dx;
            p.dy += p.gravity;
            p.y += p.dy;
            p.dx *= 0.985;
            p.rotation += p.dr;
            p.life -= p.decay;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate((p.rotation * Math.PI) / 180);
            this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            this.ctx.restore();
        }
        if (this.particles.length > 0) {
            requestAnimationFrame(() => this._animate());
        } else {
            this.running = false;
        }
    }
}

// ==================== UI CONTROLLER ====================
class App {
    constructor() {
        this.engine = new GameEngine();
        this.ai = new AIOpponent();
        this.lb = new LeaderboardManager();
        this.sound = new SoundManager();
        this.confetti = null;
        this.currentScreen = 'landing';
        this.selectedMatch = null;
    }

    init() {
        this.sound.init();
        this.confetti = new Confetti('confetti-canvas');
        initBgCanvas();
        this._bindEvents();

        // Restore nickname
        if (this.lb.nickname) {
            document.getElementById('input-nickname').value = this.lb.nickname;
        }
    }

    // --- Navigation ---
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const el = document.getElementById('screen-' + id);
        if (el) el.classList.add('active');
        this.currentScreen = id;
    }

    // --- Events ---
    _bindEvents() {
        const $ = id => document.getElementById(id);

        $('btn-play').addEventListener('click', () => {
            if (!this.lb.nickname) {
                $('modal-nickname').classList.remove('hidden');
                $('input-nickname').focus();
            } else {
                this._showMatchSelect();
            }
        });

        $('btn-nickname-ok').addEventListener('click', () => this._submitNickname());
        $('input-nickname').addEventListener('keydown', e => { if (e.key === 'Enter') this._submitNickname(); });

        $('btn-back-landing').addEventListener('click', () => this.showScreen('landing'));
        $('btn-to-lb').addEventListener('click', () => { this._renderFullLB(); this.showScreen('leaderboard'); });
        $('btn-back-select').addEventListener('click', () => this._showMatchSelect());
        $('btn-again').addEventListener('click', () => this._showMatchSelect());
        $('btn-results-lb').addEventListener('click', () => { this._renderFullLB(); this.showScreen('leaderboard'); });

        $('predict-btn').addEventListener('click', () => this._onPredict());

        // Keyboard shortcut: space to predict
        document.addEventListener('keydown', e => {
            if (e.code === 'Space' && this.currentScreen === 'game' && this.engine.isPlaying) {
                e.preventDefault();
                this._onPredict();
            }
        });
    }

    _submitNickname() {
        const input = document.getElementById('input-nickname');
        const name = input.value.trim();
        if (!name) return;
        this.lb.setNickname(name);
        document.getElementById('modal-nickname').classList.add('hidden');
        this._showMatchSelect();
    }

    // --- Match Selection ---
    _showMatchSelect() {
        this.showScreen('select');
        const grid = document.getElementById('matches-grid');
        grid.innerHTML = MATCHES.map(m => {
            const sport = SPORTS[m.sport];
            const mins = Math.floor(m.duration / 60);
            const secs = m.duration % 60;
            return `
                <div class="match-card" data-id="${m.id}">
                    <span class="match-badge badge-${m.badge}">${m.badge === 'live' ? '● LIVE' : 'DEMO'}</span>
                    <div class="match-card-inner">
                        <div class="match-sport">${sport.icon}</div>
                        <div class="match-title">${m.title}</div>
                        <div class="match-desc">${m.desc}</div>
                        <div class="match-meta">
                            <span>⏱ ${mins}:${String(secs).padStart(2, '0')}</span>
                            <span>🎯 ${m.events.length} событий</span>
                            <span>${sport.name}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        grid.querySelectorAll('.match-card').forEach(card => {
            card.addEventListener('click', () => {
                const match = MATCHES.find(m => m.id === card.dataset.id);
                if (match) this._startCountdown(match);
            });
        });
    }

    // --- Countdown ---
    _startCountdown(match) {
        this.selectedMatch = match;
        const overlay = document.getElementById('countdown-overlay');
        const numEl = document.getElementById('cd-num');
        overlay.classList.remove('hidden');

        let count = 3;
        numEl.textContent = count;
        numEl.style.animation = 'none';
        void numEl.offsetWidth;
        numEl.style.animation = 'cdPop 0.7s ease-out';
        this.sound.countdown();

        const interval = setInterval(() => {
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
                clearInterval(interval);
                overlay.classList.add('hidden');
                numEl.style.color = '';
                this._startGame(match);
            }
        }, 800);
    }

    // --- Game ---
    _startGame(match) {
        this.showScreen('game');
        const sport = SPORTS[match.sport];

        // Setup event type buttons
        const typesEl = document.getElementById('event-types');
        typesEl.innerHTML = sport.types.map(t =>
            `<button class="etype-btn" data-type="${t.id}">${t.label}</button>`
        ).join('');

        typesEl.querySelectorAll('.etype-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                typesEl.querySelectorAll('.etype-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.engine.selectedType = btn.dataset.type;
            });
        });

        // Setup teams
        document.getElementById('tm-a').textContent = match.teamA;
        document.getElementById('tm-b').textContent = match.teamB;
        document.getElementById('ts-a').textContent = '0';
        document.getElementById('ts-b').textContent = '0';

        // Reset UI
        document.getElementById('g-score').textContent = '0';
        document.getElementById('g-events').textContent = `0/${match.events.length}`;
        document.getElementById('pred-list').innerHTML = '';
        document.getElementById('predict-btn').disabled = false;

        // Setup engine callbacks
        this.engine.onTick = (t) => this._onTick(t);
        this.engine.onEvent = (ev) => this._onMatchEvent(ev);
        this.engine.onEnd = () => this._onGameEnd();

        // Start AI simulation
        this.ai.simulateMatch(match.events);

        // Start engine
        this.engine.start(match);

        // Select first event type
        const firstBtn = typesEl.querySelector('.etype-btn');
        if (firstBtn) { firstBtn.classList.add('active'); this.engine.selectedType = firstBtn.dataset.type; }

        // Initial mini leaderboard
        this._renderMiniLB(0);
    }

    _onTick(t) {
        const match = this.engine.match;
        const mins = Math.floor(t / 60);
        const secs = Math.floor(t % 60);
        const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

        document.getElementById('g-timer').textContent = timeStr;
        document.getElementById('demo-clock').textContent = timeStr;
        document.getElementById('g-score').textContent = this.engine.score;
        document.getElementById('g-events').textContent = `${this.engine.eventsFound}/${match.events.length}`;

        // Progress bar
        const pct = (t / match.duration) * 100;
        document.getElementById('progress-fill').style.width = pct + '%';

        // Intensity
        const intensity = this.engine.getIntensity();
        const fill = document.getElementById('intensity-fill');
        fill.style.width = (intensity * 100) + '%';
        fill.classList.remove('medium', 'high');
        if (intensity > 0.7) fill.classList.add('high');
        else if (intensity > 0.45) fill.classList.add('medium');

        // Arena glow at high intensity
        const arena = document.getElementById('game-arena');
        arena.classList.toggle('intense', intensity > 0.75);

        // Predict button visual state
        const btn = document.getElementById('predict-btn');
        btn.disabled = this.engine.cooldown || !this.engine.isPlaying;
        btn.classList.toggle('cooldown', this.engine.cooldown);

        // Team scores
        document.getElementById('ts-a').textContent = this.engine.matchScoreA;
        document.getElementById('ts-b').textContent = this.engine.matchScoreB;
    }

    _onMatchEvent(ev) {
        this.sound.event();
        const flash = document.getElementById('event-flash');
        flash.textContent = ev.label;
        flash.classList.add('show');
        setTimeout(() => flash.classList.remove('show'), 2500);

        // Shake arena
        const arena = document.getElementById('game-arena');
        arena.classList.add('shake');
        setTimeout(() => arena.classList.remove('shake'), 500);
    }

    _onPredict() {
        const result = this.engine.predict();
        if (!result) return;

        this.sound.predict();
        setTimeout(() => this.sound.score(result.quality), 200);

        // Show popup
        this._showScorePopup(result);

        // Confetti on perfect/excellent
        if (result.quality === 'perfect' || result.quality === 'excellent') {
            this.confetti.fire();
        }

        // Add to prediction list
        this._addPredictionItem(result);

        // Update mini leaderboard
        this._renderMiniLB(this.engine.score);
    }

    _showScorePopup(result) {
        const popup = document.getElementById('score-popup');
        const scoreEl = popup.querySelector('.popup-score');
        const labelEl = popup.querySelector('.popup-label');

        scoreEl.textContent = result.pts >= 0 ? `+${result.pts}` : result.pts;
        labelEl.textContent = result.label;

        popup.className = 'score-popup popup-' + result.quality;

        // Restart animation
        scoreEl.style.animation = 'none';
        labelEl.style.animation = 'none';
        void popup.offsetWidth;
        scoreEl.style.animation = 'popUp 0.8s ease-out forwards';
        labelEl.style.animation = 'popUp 0.8s ease-out 0.1s forwards';

        setTimeout(() => popup.classList.add('hidden'), 900);
    }

    _addPredictionItem(result) {
        const list = document.getElementById('pred-list');
        const t = this.engine.currentTime;
        const timeStr = `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
        const ptsColor = result.pts > 0 ? 'text-green' : result.pts < 0 ? 'text-red' : 'text-dim';

        const div = document.createElement('div');
        div.className = 'pred-item';
        div.innerHTML = `
            <span class="pred-time">${timeStr}</span>
            <span>${result.label}</span>
            <span class="pred-pts ${ptsColor}">${result.pts >= 0 ? '+' + result.pts : result.pts}</span>
        `;
        list.prepend(div);
    }

    _renderMiniLB(currentScore) {
        const board = this.lb.getMiniBoard(currentScore);
        const container = document.getElementById('mini-lb');
        container.innerHTML = board.map((entry, i) => {
            const isMe = entry.name === this.lb.nickname;
            return `
                <div class="lb-row${isMe ? ' me' : ''}">
                    <span class="lb-rank">${i + 1}</span>
                    <span class="lb-name">${isMe ? '→ ' : ''}${entry.name}</span>
                    <span class="lb-pts">${entry.totalScore}</span>
                </div>
            `;
        }).join('');
    }

    // --- Game End ---
    _onGameEnd() {
        this.sound.end();
        document.getElementById('predict-btn').disabled = true;

        // Save score
        this.lb.addScore(this.engine.score, this.selectedMatch.id);

        // Show results after short delay
        setTimeout(() => this._showResults(), 1200);
    }

    _showResults() {
        this.showScreen('results');
        const score = this.engine.score;
        const preds = this.engine.predictions;
        const match = this.engine.match;
        const totalEvents = match.events.length;
        const found = this.engine.eventsFound;
        const accuracy = preds.length > 0 ? Math.round((found / totalEvents) * 100) : 0;

        // Grade
        const grade = score >= 500 ? 'S' : score >= 350 ? 'A' : score >= 200 ? 'B' : score >= 100 ? 'C' : 'D';
        const gradeEl = document.getElementById('r-grade');
        gradeEl.textContent = grade;
        gradeEl.className = 'results-grade grade-' + grade.toLowerCase();

        document.getElementById('r-score').textContent = score;

        // Stats
        const bestPred = preds.reduce((best, p) => p.pts > (best?.pts || 0) ? p : best, null);
        document.getElementById('r-stats').innerHTML = `
            <div class="rstat"><div class="rstat-val">${found}/${totalEvents}</div><div class="rstat-label">Событий найдено</div></div>
            <div class="rstat"><div class="rstat-val">${accuracy}%</div><div class="rstat-label">Точность</div></div>
            <div class="rstat"><div class="rstat-val">${bestPred ? '+' + bestPred.pts : '—'}</div><div class="rstat-label">Лучшее предсказание</div></div>
        `;

        // VS AI
        this._renderVsAI();

        // Timeline
        this._renderTimeline();
    }

    _renderVsAI() {
        const container = document.getElementById('r-vs');
        const myPreds = this.engine.predictions.filter(p => p.pts > 0);
        const aiPreds = this.ai.predictions;
        const myTotal = this.engine.score;
        const aiTotal = this.ai.score;
        const maxScore = Math.max(myTotal, aiTotal, 1);

        let html = `
            <div class="vs-row">
                <span class="vs-score vs-score-you">${myTotal}</span>
                <div class="vs-bar vs-bar-you" style="width:${(myTotal / maxScore) * 100}%"></div>
                <span class="vs-label">очки</span>
                <div class="vs-bar vs-bar-ai" style="width:${(aiTotal / maxScore) * 100}%"></div>
                <span class="vs-score vs-score-ai">${aiTotal}</span>
            </div>
            <div class="vs-row">
                <span class="vs-score vs-score-you">${myPreds.length}</span>
                <div class="vs-bar vs-bar-you" style="width:${(myPreds.length / Math.max(aiPreds.length, myPreds.length, 1)) * 100}%"></div>
                <span class="vs-label">хитов</span>
                <div class="vs-bar vs-bar-ai" style="width:${(aiPreds.length / Math.max(aiPreds.length, myPreds.length, 1)) * 100}%"></div>
                <span class="vs-score vs-score-ai">${aiPreds.length}</span>
            </div>
        `;
        container.innerHTML = html;
    }

    _renderTimeline() {
        const container = document.getElementById('r-timeline');
        const match = this.engine.match;
        const dur = match.duration;

        let html = '<h4 style="margin-bottom:12px">Таймлайн предсказаний</h4>';
        html += '<div class="tl-track">';

        // Event markers
        for (const ev of match.events) {
            const left = (ev.time / dur) * 100;
            html += `<div class="tl-event" style="left:${left}%" title="${ev.label}"></div>`;
        }

        // Prediction markers
        for (const pred of this.engine.predictions) {
            const left = (pred.time / dur) * 100;
            const cls = pred.pts > 0 ? 'hit' : 'miss';
            html += `<div class="tl-pred ${cls}" style="left:${left}%" title="${pred.label} ${pred.pts}pts"></div>`;
        }

        html += '</div>';
        html += `<div class="tl-legend">
            <span class="leg-event">Событие</span>
            <span class="leg-hit">Попадание</span>
            <span class="leg-miss">Промах</span>
        </div>`;
        container.innerHTML = html;
    }

    // --- Full Leaderboard ---
    _renderFullLB() {
        const board = this.lb.getFullBoard();
        const container = document.getElementById('lb-full');
        container.innerHTML = board.map((entry, i) => {
            const isMe = entry.name === this.lb.nickname;
            const rankEmoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
            return `
                <div class="lb-full-row${isMe ? ' me' : ''}">
                    <span class="lb-rank">${rankEmoji}</span>
                    <span class="lb-avatar">${entry.avatar || '🎮'}</span>
                    <div class="lb-info">
                        <div class="lb-name-full">${entry.name}${isMe ? ' (ты)' : ''}</div>
                        <div class="lb-games">${entry.games} ${entry.games === 1 ? 'игра' : entry.games < 5 ? 'игры' : 'игр'}</div>
                    </div>
                    <span class="lb-pts">${entry.totalScore}</span>
                </div>
            `;
        }).join('');
    }
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
