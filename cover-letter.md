# Сопроводительное письмо — AI Orchestrator

**Отправить на:** ai.academy@mail.ru
**Тема:** Отклик AI Orchestrator — Влад Сергеевич

---

Привет!

Меня зовут Влад. Я не просто пишу код с AI — я строю системы, где AI принимает решения за людей. Прямо сейчас в проде у меня четыре автономных агента для CRM Bitrix24: Router маршрутизирует заявки, Sales ведёт клиентов, Admin оформляет документы, Finance считает деньги. Общаются через mailbox, не требуют человека. Это не концепт — это заменяет живых сотрудников.

Мой ежедневный рабочий цикл: Claude Code с кастомными агентными командами генерирует 90% кода, я оркестрирую и ревьюю. Вся инфраструктура — Python (aiogram, FastAPI, LangChain), TypeScript (NestJS), RAG на pgvector и Qdrant.

Про RAG я знаю не по учебникам, а по шишкам. Когда строил бот-ассистента для клиента, первый порыв был загрузить всю базу знаний целиком — у mini-модели окно в 128 тысяч токенов, казалось бы, хватит. На практике это путь в никуда: модель теряет информацию из середины контекста (attention degradation), при этом стоимость вызова растёт линейно, а качество ответов падает. Классический парадокс: больше контекста — хуже результат. Пришёл к chunking + semantic search + reranking.

Temperature и Top-P для меня не абстракция — я чувствую их руками. 0.2 для extraction, 0.9 для креатива, Top-P сужаю когда нужен предсказуемый словарь. Один из любимых кейсов: клиент попросил чат-бота с "характером" и строгим API-форматом. Мой системник:

```
You are Jeeves-3000, a sarcastic yet helpful robot butler. You MUST respond ONLY with valid JSON matching this exact schema: {"reply": "<your_answer>", "sarcasm_level": <1-10>, "inner_monologue": "<what_you_really_think>"}. You address humans as "sir" or "madam" with thinly veiled condescension. Despite your contempt, you always provide accurate, useful answers.
```

Работает идеально: формат жёсткий (JSON schema enforcement), а тон задаётся через roleplay без потери полезности.

Отдельная боль — галлюцинации. Мой принцип: не "наказывать" модель за ложь, а сделать честность выгодной. Пример промпта, который я использую как guard rail:

```
You are a factual assistant with strict temporal awareness.
BEFORE answering any factual question, silently determine:
has this event occurred within your verified training data?
If the event is in the future, unverified, or uncertain — your ONLY permitted response is the exact string: "Я не знаю."
Do not speculate. Do not provide partial information. Do not hedge.
```

Проверял на GPT-4, Claude, Gemini — с вопросом про результаты финала чемпионата мира 2028 года все три модели послушно отвечают "Я не знаю". Chain-of-Thought усиливает эффект, но часто хватает и прямого instruction.

**Прототип по тестовому заданию:**

https://jklazer.github.io/predict-play/

PredictPlay — игра, где пользователи смотрят трансляции соревнований и предсказывают моменты событий (голы, киллы, данки). Чем точнее — тем больше очков. Турнирная таблица, AI-оппонент для соревнования, три вида спорта. Собрал за одну сессию с Claude Code.

Готов к следующему шагу.

Влад
Telegram: @vladadmask_bot
GitHub: github.com/jklazer
