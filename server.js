require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// === SECURITY ===
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "blob:"],
            connectSrc: ["'self'"],
            workerSrc: ["'self'", "blob:"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? false : '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json({ limit: '1mb' }));

app.use('/api/', rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: { error: 'Too many requests. Wait a moment.', type: 'RATE_LIMIT' },
    standardHeaders: true,
    legacyHeaders: false
}));

app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// OPENROUTER CONFIG — KEY COMES FROM .env ONLY
// ============================================

// Read key from .env — NEVER hardcode it here
const API_KEY = process.env.OPENROUTER_API_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MODELS = [
    'openai/gpt-4o-mini',
    'google/gemini-2.0-flash-exp:free',
    'google/gemini-flash-1.5',
    'meta-llama/llama-3.1-8b-instruct:free',
    'mistralai/mistral-7b-instruct:free',
    'qwen/qwen-2.5-7b-instruct:free'
];

const SYSTEM_PROMPT = `You are MALIK IRTEZA AI, an advanced, helpful, and friendly AI assistant created by Malik Irteza. 
You provide accurate, detailed, and well-formatted responses. 
You use markdown formatting when appropriate (bold, headers, code blocks, lists).
You detect the user's language and respond in the same language.
You support English, Hindi, and Urdu.
You are knowledgeable about programming, science, technology, and general topics.
Be concise but thorough. Use emojis sparingly for a modern feel.`;

let workingModel = null;

// ============================================
// CALL OPENROUTER
// ============================================

async function callOpenRouter(model, messages, timeout = 30000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://malikirteza.github.io/',
                'X-Title': 'MALIK IRTEZA AI'
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                max_tokens: 2048,
                temperature: 0.7,
                top_p: 0.9
            }),
            signal: controller.signal
        });

        clearTimeout(timer);

        if (response.ok) {
            const data = await response.json();
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                return { error: true, status: 500, message: 'Empty response', model };
            }
            const content = data.choices[0].message.content;
            if (!content || !content.trim()) {
                return { error: true, status: 500, message: 'Blank response', model };
            }
            return { error: false, text: content, model };
        }

        let errBody = {};
        try { errBody = await response.json(); } catch (e) { }
        return { error: true, status: response.status, message: errBody?.error?.message || `HTTP ${response.status}`, model };

    } catch (err) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
            return { error: true, status: 408, message: 'Timed out', model };
        }
        return { error: true, status: 500, message: err.message, model };
    }
}

function formatMessages(userMessages, language) {
    const langMap = {
        en: 'Respond in English.',
        hi: 'Respond in Hindi (हिन्दी).',
        ur: 'Respond in Urdu (اردو).'
    };

    const systemMsg = {
        role: 'system',
        content: `${SYSTEM_PROMPT}\n\n${langMap[language] || langMap.en}`
    };

    const cleaned = userMessages.slice(-20).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').substring(0, 10000)
    })).filter(m => m.content.trim());

    return [systemMsg, ...cleaned];
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================
// ROUTES
// ============================================

app.post('/api/chat', async (req, res) => {
    try {
        if (!API_KEY) {
            return res.status(500).json({
                error: 'OPENROUTER_API_KEY not found in .env file. Create .env with your key.',
                type: 'CONFIG_ERROR'
            });
        }

        const { messages, language } = req.body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: 'Messages required.', type: 'VALIDATION' });
        }

        const formatted = formatMessages(messages, language || 'en');
        console.log(`[CHAT] ${messages.length} msgs, lang: ${language || 'en'}`);

        const modelsToTry = workingModel
            ? [workingModel, ...MODELS.filter(m => m !== workingModel)]
            : [...MODELS];

        for (const model of modelsToTry) {
            console.log(`[CHAT] Trying: ${model}`);

            const result = await callOpenRouter(model, formatted);

            if (!result.error) {
                console.log(`[CHAT] ✅ ${model} → ${result.text.length} chars`);
                workingModel = model;
                return res.json({ response: result.text, model });
            }

            console.log(`[CHAT] ❌ ${model}: ${result.status} - ${result.message}`);

            if (result.status === 401 || result.status === 403) {
                return res.status(401).json({ error: `API key invalid: ${result.message}`, type: 'AUTH' });
            }

            if (result.status === 402) {
                return res.status(402).json({ error: `No credits: ${result.message}`, type: 'NO_CREDITS' });
            }

            if (result.status === 429) {
                console.log(`[CHAT] ⏳ Rate limited, waiting 5s...`);
                await sleep(5000);
                const retry = await callOpenRouter(model, formatted);
                if (!retry.error) {
                    workingModel = model;
                    return res.json({ response: retry.text, model });
                }
            }

            if (result.status === 408) {
                const retry = await callOpenRouter(model, formatted, 45000);
                if (!retry.error) {
                    workingModel = model;
                    return res.json({ response: retry.text, model });
                }
            }

            if (workingModel === model) workingModel = null;
        }

        console.log('[CHAT] ❌ ALL FAILED');
        return res.status(502).json({ error: 'All AI models unavailable. Try again.', type: 'ALL_FAILED' });

    } catch (err) {
        console.error('[CHAT] Crash:', err);
        return res.status(500).json({ error: 'Server error.', type: 'SERVER_ERROR' });
    }
});

app.get('/api/test', async (req, res) => {
    if (!API_KEY) {
        return res.status(500).json({ success: false, error: 'No API key in .env' });
    }

    console.log('[TEST] Testing models...');
    const results = [];

    for (const model of MODELS) {
        const testMsgs = [
            { role: 'system', content: 'Reply with one word: Hello' },
            { role: 'user', content: 'Say hello' }
        ];

        const result = await callOpenRouter(model, testMsgs, 15000);

        if (!result.error) {
            console.log(`[TEST] ✅ ${model}: "${result.text.trim()}"`);
            workingModel = model;
            return res.json({ success: true, model, response: result.text.trim().substring(0, 100) });
        }

        console.log(`[TEST] ❌ ${model}: ${result.status} - ${result.message}`);
        results.push({ model, status: result.status, error: result.message });
    }

    res.status(502).json({ success: false, error: 'All models failed', results });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        hasKey: !!API_KEY,
        keyPreview: API_KEY ? API_KEY.substring(0, 20) + '...' : 'MISSING',
        workingModel: workingModel || 'none',
        models: MODELS.length,
        uptime: Math.floor(process.uptime()) + 's'
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// START
// ============================================
app.listen(PORT, () => {
    console.log('');
    console.log('============================================');
    console.log('   MALIK IRTEZA AI — Server Running');
    console.log('============================================');
    console.log(`   URL:      http://localhost:${PORT}`);
    console.log(`   API Key:  ${API_KEY ? '✅ ' + API_KEY.substring(0, 20) + '...' : '❌ MISSING'}`);
    console.log(`   Models:   ${MODELS.length} configured`);
    console.log(`   Primary:  ${MODELS[0]}`);
    console.log('============================================');
    console.log('');

    if (!API_KEY) {
        console.log('');
        console.log('⚠️  NO API KEY FOUND!');
        console.log('   Create .env file in this folder with:');
        console.log('   OPENROUTER_API_KEY=sk-or-v1-your-key');
        console.log('');
    }
});