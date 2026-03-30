# PredictPlay: Precise Short Segments — Design Spec

## Problem

Текущие события извлечены из транскриптов автоматически. Таймстемпы неточные (±3с), покрытие неполное, типы событий несбалансированы (NBA — 80% three-pointers). Предикты не совпадают с тем, что видно на экране → игра выглядит сломанной.

## Solution

Заменить длинные видео (8-17 мин) на **короткие ~90-секундные сегменты** с **ручной разметкой** каждого события до секунды. Меньше контента, но 100% точность.

## Что меняется

| Компонент | Было | Стало |
|-----------|------|-------|
| Длительность видео | 8-17 мин | ~90с на матч |
| Количество событий | 10-35 (неточных) | 8-15 (точных до секунды) |
| Разметка | GPT из транскрипта | Ручная по видео |
| Intensity bar | Привязана к неточным событиям | Точно совпадает с видео |
| AI-комментарии | Общие фразы | Привязаны к конкретным действиям |

## Выбор сегментов

Критерии:
- ~90 секунд
- Максимальная плотность событий (1 событие каждые 7-12с)
- Разнообразие типов (не только один тип)
- Зрелищные моменты

### CS2 — 2 раунда (~90с)

- Video: `2GeYxpuibiE` (BLAST Austin Major 2025)
- Выбираем 2 самых насыщенных раунда
- Ожидаемые типы: kill, headshot, bomb, clutch
- ~10-12 событий

### Football — Камбэк Мбаппе (~90с)

- Video: `DDWYR9Oi_wI` (ЧМ 2022 Финал)
- Отрезок с двумя голами Мбаппе за минуту (2:1 → 2:2)
- Ожидаемые типы: goal, foul, penalty, corner
- ~6-8 событий

### NBA — Финальный run (~90с)

- Video: `17MO0XFSPTk` (NBA Finals 2024 Game 5)
- Выбираем отрезок с миксом: three + dunk + block + steal
- Ожидаемые типы: three, dunk, block, steal
- ~8-10 событий

## Процесс разметки

Для каждого матча:

1. **Открыть видео** в Playwright browser
2. **Выбрать лучший 90с отрезок** — максимум action, разнообразие типов
3. **Зафиксировать videoStart и duration** (~90с)
4. **Посекундно пройти** — записать КАЖДОЕ видимое действие:
   - `time` — секунда относительно videoStart (целое число)
   - `type` — тип события (kill/headshot/goal/three/etc)
   - `label` — короткий русский лейбл (GPT для генерации)
   - `scoreA/scoreB` — если меняет счёт
5. **Проверить повторно** — прогнать видео ещё раз, сверить

## Что обновляем в коде

### app.js — MATCHES array

```javascript
// Пример нового формата (точные данные после разметки)
{
    id: 'cs2-highlights',
    sport: 'cs2',
    title: 'CS2 Major — Гранд-финал',
    desc: 'Vitality vs TheMongolz. 2 раунда!',
    duration: 90,
    videoId: '2GeYxpuibiE',
    videoStart: NNN,  // точное значение определяется при ручной разметке видео
    events: [
        // Каждое событие проверено вручную
        { time: X, type: 'kill', label: '...' },
    ],
}
```

### app.js — FALLBACK_EVENTS

Обновить fallback с теми же точными событиями.

### events/*.json — серверные файлы

Перегенерировать JSON-файлы на сервере с новыми событиями.

### Intensity bar

Не меняем логику — она уже привязана к events[].time. Короткий сегмент с плотными событиями → intensity будет реально отражать напряжённость.

### AI-комментарии

Не меняем ClaudeCommentary (GPT-4o-mini). Но events теперь точные → комментарии будут срабатывать в правильные моменты.

## UI Redesign — стиль live-ставок (PARI / Fonbet)

Текущий дизайн выглядит как геймерский прототип. Нужен вид **профессиональной букмекерской платформы** — узнаваемый, доверительный, live-feel.

### Цветовая палитра

| Роль | Цвет | Hex |
|------|-------|-----|
| Background (body) | Тёмный графит | `#111117` |
| Surface (cards) | Чуть светлее | `#1A1A24` |
| Header | Чёрный | `#0D0D12` |
| Primary accent (CTA, predict) | PARI teal | `#00C7B1` |
| Live indicator | Зелёный | `#4ABA24` |
| Danger / miss | Красный | `#CC5B5A` |
| Success / hit | Teal bright | `#00E6CC` |
| Text primary | Белый | `#F0F0F5` |
| Text secondary | Серый | `#8890A0` |
| Odds/event cells | Полупрозрачный серый | `rgba(255,255,255,0.06)` |

### Шрифт

Montserrat (600/700 для заголовков, 400/500 для контента). Числа (score, timer, points) — tabular-nums, bold.

### Ключевые UI-компоненты

**1. Match Card (выбор матча)**
- Тёмная карточка с лого/эмблемами команд
- Счёт крупно по центру (если live)
- Зелёный пульсирующий dot + "LIVE" badge
- Внизу: количество доступных предиктов (напр. "12 событий")
- Hover: subtle border glow teal

**2. Game Screen (во время матча)**
- Видео занимает ~60% ширины сверху
- Под видео: панель predict-кнопок (стиль odds cells)
  - Каждая кнопка = тип события (HEADSHOT, KILL, BOMB, etc.)
  - Фон: `rgba(255,255,255,0.06)`, border-radius: 6px
  - Hover: teal border, slight scale
  - Active/selected: teal background, white text
- Справа от видео или под кнопками: live-лента событий (как bet history)
- Score display: крупный, между лого команд, обновляется в реальном времени

**3. Live Event Feed**
- Вертикальный список последних событий (снизу вверх)
- Каждое: timestamp + type badge + label
- Новые события появляются с slide-in анимацией
- Hit predictions подсвечиваются teal, miss — красным

**4. Intensity Bar**
- Горизонтальная полоса под видео
- Gradient от `#1A1A24` (спокойно) → `#00C7B1` (интенсивно)
- Пульсирует ярче когда приближается событие

**5. Results / Scoreboard**
- Таблица в стиле leaderboard: позиция, ник, очки, accuracy %
- Зелёные/красные badges для hit/miss ratio
- AI-бот отображается как обычный участник

### Анимации

- **Predict hit**: teal flash + "+XX points" fly-up
- **Predict miss**: red flash + shake
- **Event fire**: pulse ripple от score display
- **Live dot**: CSS pulsing animation (green glow)
- **Odds cell press**: scale(0.96) → scale(1) bounce

### Что НЕ меняется (логика)

- GameEngine, predict(), scoring tiers (PERFECT/EXCELLENT/GREAT/GOOD/OK)
- YouTube IFrame API интеграция
- AI commentary класс (GPT-4o-mini backend)
- Серверная инфраструктура (FastAPI, Caddy, HTTPS)
- Endpoint /api/events/{matchId} — тот же формат

## Success Criteria

1. **Predict accuracy** — каждый видимый момент (килл, гол, данк) имеет событие в пределах ±1с
2. **Type coverage** — минимум 3 разных типа событий на матч
3. **Intensity bar** — пики совпадают с реальным action на видео
4. **AI commentary** — срабатывает на правильных моментах
5. **Нет ложных предиктов** — predict "headshot" → на экране headshot, не что-то другое
6. **UI** — выглядит как профессиональная live-betting платформа (PARI-стиль)
7. **90с сегменты** — каждый матч ~90с, плотный action, все 3 спорта работают
