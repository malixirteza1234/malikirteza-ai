// ============================================
// MALIK IRTEZA AI — Frontend (Secure)
// API key is on backend — frontend never sees it
// ============================================

const TRANSLATIONS = {
    en: {
        newChat: 'New Chat', settings: 'Settings', clearAll: 'Clear All',
        welcomeMsg: 'How can I help you today?',
        inputPlaceholder: 'Type your message...',
        inputHint: 'Press Enter to send, Shift+Enter for new line',
        voiceEnabled: 'Voice Response', continuousListening: 'Continuous Listening',
        soundEffects: 'Sound Effects', voiceSpeed: 'Voice Speed',
        greeting: 'Hello, I am Malik Irteza AI. How can I help you?',
        online: 'Online', offline: 'Offline',
        apiError: 'API Error',
        copied: 'Copied!', copy: 'Copy', regenerate: 'Regenerate',
        thinking: 'Thinking...'
    },
    hi: {
        newChat: 'नई चैट', settings: 'सेटिंग्स', clearAll: 'सब हटाएं',
        welcomeMsg: 'आज मैं आपकी कैसे मदद कर सकता हूँ?',
        inputPlaceholder: 'अपना संदेश टाइप करें...',
        inputHint: 'भेजने के लिए Enter, नई लाइन के लिए Shift+Enter',
        voiceEnabled: 'वॉइस रिस्पॉन्स', continuousListening: 'निरंतर सुनना',
        soundEffects: 'ध्वनि प्रभाव', voiceSpeed: 'वॉइस स्पीड',
        greeting: 'नमस्ते, मैं मलिक इरतेज़ा AI हूँ। मैं आपकी कैसे मदद कर सकता हूँ?',
        online: 'ऑनलाइन', offline: 'ऑफलाइन',
        apiError: 'API त्रुटि',
        copied: 'कॉपी हो गया!', copy: 'कॉपी', regenerate: 'फिर से बनाएं',
        thinking: 'सोच रहा हूँ...'
    },
    ur: {
        newChat: 'نئی چیٹ', settings: 'ترتیبات', clearAll: 'سب صاف کریں',
        welcomeMsg: 'آج میں آپ کی کیسے مدد کر سکتا ہوں؟',
        inputPlaceholder: '...اپنا پیغام ٹائپ کریں',
        inputHint: 'بھیجنے کے لیے Enter دبائیں',
        voiceEnabled: 'وائس ریسپانس', continuousListening: 'مسلسل سننا',
        soundEffects: 'صوتی اثرات', voiceSpeed: 'وائس سپیڈ',
        greeting: 'ہیلو، میں ملک ارتضیٰ AI ہوں۔ میں آپ کی کیسے مدد کر سکتا ہوں؟',
        online: 'آن لائن', offline: 'آف لائن',
        apiError: 'API خرابی',
        copied: '!کاپی ہو گیا', copy: 'کاپی', regenerate: 'دوبارہ بنائیں',
        thinking: '...سوچ رہا ہوں'
    }
};

// === SOUND ENGINE ===
class SoundEngine {
    constructor() { this.ctx = null; this.enabled = true; }
    getCtx() { if (!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)(); return this.ctx; }
    play(f, d, t = 'sine', v = 0.05) {
        if (!this.enabled) return;
        try {
            const c = this.getCtx(), o = c.createOscillator(), g = c.createGain();
            o.connect(g); g.connect(c.destination); o.frequency.value = f; o.type = t;
            g.gain.setValueAtTime(v, c.currentTime);
            g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + d);
            o.start(c.currentTime); o.stop(c.currentTime + d);
        } catch (e) { }
    }
    click() { this.play(800, 0.08, 'sine', 0.03); }
    send() { this.play(500, 0.1); setTimeout(() => this.play(700, 0.1, 'sine', 0.04), 80); }
    receive() { this.play(700, 0.12); setTimeout(() => this.play(500, 0.15, 'sine', 0.03), 100); }
    error() { this.play(300, 0.3, 'sawtooth', 0.03); }
    success() { this.play(600, 0.1); setTimeout(() => this.play(800, 0.15, 'sine', 0.04), 100); }
}

// === LOADER ===
class LoaderAnimator {
    constructor() {
        this.statusTexts = [
            'Initializing neural networks...',
            'Loading AI models...',
            'Connecting to server...',
            'Calibrating response engine...',
            'Syncing language processors...',
            'Preparing interface...',
            'Testing backend connection...',
            'Activating voice synthesis...',
            'System ready. Welcome.'
        ];
    }
    start() { this.animateStatus(); this.animatePercent(); this.createParticles(); }
    animateStatus() {
        const el = document.getElementById('loaderStatus');
        if (!el) return;
        let i = 0;
        const show = () => {
            if (i >= this.statusTexts.length) return;
            this.typeText(el, this.statusTexts[i], () => { i++; setTimeout(show, 300); });
        };
        show();
    }
    typeText(el, text, cb) {
        el.innerHTML = ''; let i = 0;
        const cursor = '<span class="status-cursor"></span>';
        const type = () => {
            if (i < text.length) { el.innerHTML = text.slice(0, i + 1) + cursor; i++; setTimeout(type, 30 + Math.random() * 30); }
            else setTimeout(() => { if (cb) cb(); }, 200);
        };
        type();
    }
    animatePercent() {
        const el = document.getElementById('progressPercent');
        if (!el) return;
        const dur = CONFIG.LOADER_DURATION - 1500, start = Date.now();
        const update = () => {
            const p = Math.min((Date.now() - start) / dur, 1);
            el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * 100) + '%';
            if (p < 1) requestAnimationFrame(update);
        };
        requestAnimationFrame(update);
    }
    createParticles() {
        const c = document.getElementById('loaderParticles');
        if (!c) return;
        const colors = ['#007bff', '#00d4ff', '#7c3aed', '#00ff88', '#ec4899', '#fff'];
        for (let i = 0; i < 50; i++) {
            const p = document.createElement('div');
            p.className = 'lp';
            p.style.cssText = `left:${Math.random() * 100}%;top:${60 + Math.random() * 40}%;width:${2 + Math.random() * 4}px;height:${2 + Math.random() * 4}px;background:${colors[Math.floor(Math.random() * colors.length)]};box-shadow:0 0 ${4 + Math.random() * 8}px currentColor;animation-duration:${4 + Math.random() * 6}s;animation-delay:${Math.random() * 3}s;`;
            c.appendChild(p);
        }
    }
}

// ============================================
// SECURE API CLIENT — calls YOUR backend only
// ============================================
class SecureAPIClient {
    constructor() { this.requestCount = 0; }

    log(msg, data = null) {
        if (CONFIG.DEBUG) console.log(`[API] ${msg}`, data || '');
    }

    // Main chat — calls backend /api/chat
    async chat(messages, language = 'en', onStatus = null) {
        if (!navigator.onLine) {
            throw { type: 'OFFLINE', message: 'You are offline. Check your internet connection.' };
        }

        if (onStatus) onStatus('Thinking...');

        this.log('Sending chat request...');

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 35000);

        try {
            const response = await fetch(CONFIG.API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: messages.slice(-20).map(m => ({
                        role: m.role,
                        content: m.content,
                        isError: m.isError || false
                    })),
                    language
                }),
                signal: controller.signal
            });

            clearTimeout(timeout);

            if (response.ok) {
                const data = await response.json();
                this.log('Response received:', data.model);
                this.requestCount++;
                return data.response;
            }

            // Handle errors from backend
            let errData = {};
            try { errData = await response.json(); } catch (e) { }

            const errMsg = errData.error || `Server error (${response.status})`;
            const errType = errData.type || 'SERVER';

            this.log('Error:', errType, errMsg);

            throw {
                type: errType,
                message: errMsg,
                status: response.status
            };

        } catch (error) {
            clearTimeout(timeout);

            if (error.name === 'AbortError') {
                throw { type: 'TIMEOUT', message: 'Request timed out. Server might be busy.' };
            }

            if (error.type) throw error; // Already formatted

            // Network error
            throw {
                type: 'NETWORK',
                message: navigator.onLine
                    ? 'Cannot reach server. It might be starting up — try again in 30 seconds.'
                    : 'You are offline.'
            };
        }
    }

    // Test connection — calls backend /api/test
    async test() {
        try {
            const response = await fetch(CONFIG.TEST_URL, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();
            return data;

        } catch (e) {
            return {
                success: false,
                error: navigator.onLine
                    ? 'Cannot reach server'
                    : 'You are offline'
            };
        }
    }

    // Health check
    async health() {
        try {
            const response = await fetch(CONFIG.HEALTH_URL);
            return await response.json();
        } catch (e) {
            return { status: 'unreachable' };
        }
    }
}

// ============================================
// MAIN APPLICATION
// ============================================
class MalikIrtezaAI {
    constructor() {
        this.conversations = {};
        this.currentChatId = null;
        this.currentLanguage = 'en';
        this.isProcessing = false;
        this.isListening = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.settings = { voiceEnabled: true, continuousListening: false, soundEffects: true, voiceSpeed: 1 };
        this.sound = new SoundEngine();
        this.loader = new LoaderAnimator();
        this.api = new SecureAPIClient();
        this.init();
    }

    init() {
        this.loadFromStorage();
        this.cacheElements();
        this.bindEvents();
        this.setupSpeechRecognition();
        this.setupOnlineDetection();
        this.startLoader();
    }

    cacheElements() {
        this.els = {
            loader: document.getElementById('loader'),
            app: document.getElementById('app'),
            sidebar: document.getElementById('sidebar'),
            sidebarToggle: document.getElementById('sidebarToggle'),
            chatHistory: document.getElementById('chatHistory'),
            newChatBtn: document.getElementById('newChatBtn'),
            settingsBtn: document.getElementById('settingsBtn'),
            settingsPanel: document.getElementById('settingsPanel'),
            closeSettings: document.getElementById('closeSettings'),
            clearAllBtn: document.getElementById('clearAllBtn'),
            testApiBtn: document.getElementById('testApiBtn'),
            chatArea: document.getElementById('chatArea'),
            welcomeScreen: document.getElementById('welcomeScreen'),
            messagesContainer: document.getElementById('messagesContainer'),
            typingIndicator: document.getElementById('typingIndicator'),
            typingText: document.getElementById('typingText'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            micBtn: document.getElementById('micBtn'),
            voiceToggle: document.getElementById('voiceToggle'),
            continuousListenToggle: document.getElementById('continuousListenToggle'),
            soundToggle: document.getElementById('soundToggle'),
            voiceSpeed: document.getElementById('voiceSpeed'),
            langBtns: document.querySelectorAll('.lang-btn'),
            chips: document.querySelectorAll('.chip'),
            inputArea: document.querySelector('.input-area'),
            footer: document.querySelector('.footer'),
            statusDot: document.querySelector('.status-dot'),
            statusText: document.querySelector('.ai-status span')
        };
    }

    bindEvents() {
        this.els.sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        this.els.newChatBtn.addEventListener('click', () => { this.newChat(); this.sound.click(); });
        this.els.clearAllBtn.addEventListener('click', () => this.clearAllChats());
        this.els.settingsBtn.addEventListener('click', () => this.openSettings());
        this.els.closeSettings.addEventListener('click', () => this.closeSettingsPanel());
        this.els.settingsPanel.addEventListener('click', (e) => { if (e.target === this.els.settingsPanel) this.closeSettingsPanel(); });
        if (this.els.testApiBtn) this.els.testApiBtn.addEventListener('click', () => this.testAPI());
        this.els.voiceToggle.addEventListener('change', (e) => { this.settings.voiceEnabled = e.target.checked; this.saveToStorage(); });
        this.els.continuousListenToggle.addEventListener('change', (e) => { this.settings.continuousListening = e.target.checked; this.saveToStorage(); });
        this.els.soundToggle.addEventListener('change', (e) => { this.settings.soundEffects = e.target.checked; this.sound.enabled = e.target.checked; this.saveToStorage(); });
        this.els.voiceSpeed.addEventListener('input', (e) => { this.settings.voiceSpeed = parseFloat(e.target.value); this.saveToStorage(); });
        this.els.messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); } });
        this.els.messageInput.addEventListener('input', () => this.autoResize());
        this.els.sendBtn.addEventListener('click', () => this.sendMessage());
        this.els.micBtn.addEventListener('click', () => this.toggleVoice());
        this.els.langBtns.forEach(b => b.addEventListener('click', () => { this.setLanguage(b.dataset.lang); this.sound.click(); }));
        this.els.chips.forEach(c => c.addEventListener('click', () => { this.els.messageInput.value = c.dataset.prompt; this.sendMessage(); this.sound.click(); }));
        this.createSidebarOverlay();
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { this.closeSettingsPanel(); if (window.innerWidth <= 768) this.closeSidebar(); } });
    }

    setupOnlineDetection() {
        window.addEventListener('online', () => { this.updateStatus(true); this.showToast('Back online! ✓', 'success'); });
        window.addEventListener('offline', () => { this.updateStatus(false); this.showToast('You are offline', 'error'); });
        this.updateStatus(navigator.onLine);
    }

    updateStatus(online) {
        const t = TRANSLATIONS[this.currentLanguage];
        if (this.els.statusDot) {
            this.els.statusDot.style.background = online ? '#22c55e' : '#ef4444';
            this.els.statusDot.style.boxShadow = online ? '0 0 8px rgba(34,197,94,0.5)' : '0 0 8px rgba(239,68,68,0.5)';
        }
        if (this.els.statusText) this.els.statusText.textContent = online ? t.online : t.offline;
    }

    async testAPI() {
        const btn = this.els.testApiBtn;
        if (!btn) return;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing server...';

        const result = await this.api.test();

        if (result.success) {
            btn.innerHTML = `<i class="fas fa-check" style="color:#22c55e"></i> ${result.model} works!`;
            this.showToast(`✅ Backend connected!\nModel: ${result.model}\nResponse: "${result.response}"`, 'success', 8000);
            this.sound.success();
        } else {
            btn.innerHTML = '<i class="fas fa-times" style="color:#ef4444"></i> Failed';
            this.showToast(`❌ Connection failed\n${result.error || 'Server unreachable'}`, 'error', 8000);
            this.sound.error();
        }

        setTimeout(() => { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plug"></i> Test Connection'; }, 5000);
    }

    startLoader() {
        this.loader.start();
        setTimeout(() => {
            this.els.loader.classList.add('fade-out');
            this.els.app.classList.remove('hidden');
            setTimeout(() => {
                this.els.app.classList.add('visible');
                if (typeof threeScene !== 'undefined' && threeScene) threeScene.transitionToBackground();
                setTimeout(() => { if (this.settings.voiceEnabled) this.speak(TRANSLATIONS[this.currentLanguage].greeting); }, 600);
            }, 150);
            setTimeout(() => { this.els.loader.style.display = 'none'; }, 1200);
        }, CONFIG.LOADER_DURATION);
        this.applySettings();
        this.renderHistory();
        if (this.currentChatId && this.conversations[this.currentChatId])
            setTimeout(() => this.loadChat(this.currentChatId), CONFIG.LOADER_DURATION + 400);
        if (window.innerWidth <= 768) this.els.sidebar.classList.add('collapsed');
    }

    createSidebarOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        document.body.appendChild(this.overlay);
        this.overlay.addEventListener('click', () => this.closeSidebar());
    }

    toggleSidebar() {
        this.sound.click();
        if (window.innerWidth <= 768) {
            if (this.els.sidebar.classList.contains('open')) this.closeSidebar();
            else { this.els.sidebar.classList.add('open'); this.els.sidebar.classList.remove('collapsed'); this.overlay.classList.add('show'); }
        } else {
            this.els.sidebar.classList.toggle('collapsed');
            this.els.chatArea.classList.toggle('expanded');
            this.els.inputArea.classList.toggle('expanded');
            this.els.footer.classList.toggle('expanded');
        }
    }
    closeSidebar() { this.els.sidebar.classList.remove('open'); this.overlay.classList.remove('show'); }
    openSettings() { this.els.settingsPanel.classList.remove('hidden'); this.sound.click(); }
    closeSettingsPanel() { this.els.settingsPanel.classList.add('hidden'); }

    applySettings() {
        this.els.voiceToggle.checked = this.settings.voiceEnabled;
        this.els.continuousListenToggle.checked = this.settings.continuousListening;
        this.els.soundToggle.checked = this.settings.soundEffects;
        this.els.voiceSpeed.value = this.settings.voiceSpeed;
        this.sound.enabled = this.settings.soundEffects;
    }

    setLanguage(lang) {
        this.currentLanguage = lang;
        this.els.langBtns.forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
        const t = TRANSLATIONS[lang];
        document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if (t[k]) el.textContent = t[k]; });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const k = el.dataset.i18nPlaceholder; if (t[k]) el.placeholder = t[k]; });
        this.saveToStorage();
    }

    detectLang(text) {
        if (/[\u0900-\u097F]/.test(text)) return 'hi';
        if (/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text)) return 'ur';
        return 'en';
    }

    newChat() {
        const id = 'chat_' + Date.now();
        this.conversations[id] = { id, title: 'New Chat', messages: [], created: Date.now() };
        this.currentChatId = id;
        this.els.welcomeScreen.style.display = 'flex';
        this.els.messagesContainer.innerHTML = '';
        this.els.messagesContainer.style.display = 'none';
        this.renderHistory();
        this.saveToStorage();
    }

    loadChat(id) {
        if (!this.conversations[id]) return;
        this.currentChatId = id;
        this.renderHistory();
        this.renderMessages();
        this.saveToStorage();
        if (window.innerWidth <= 768) this.closeSidebar();
    }

    deleteChat(id, e) {
        e.stopPropagation();
        delete this.conversations[id];
        if (this.currentChatId === id) {
            const keys = Object.keys(this.conversations);
            keys.length > 0 ? this.loadChat(keys[keys.length - 1]) : this.newChat();
        }
        this.renderHistory();
        this.saveToStorage();
        this.sound.click();
    }

    clearAllChats() { this.conversations = {}; this.newChat(); this.sound.click(); }

    renderHistory() {
        const c = this.els.chatHistory; c.innerHTML = '';
        Object.values(this.conversations).sort((a, b) => b.created - a.created).forEach(chat => {
            const d = document.createElement('div');
            d.className = `chat-history-item ${chat.id === this.currentChatId ? 'active' : ''}`;
            d.innerHTML = `<i class="fas fa-message" style="font-size:0.78rem;flex-shrink:0;color:var(--text-muted)"></i><span class="chat-title">${this.esc(chat.title)}</span><button class="delete-chat"><i class="fas fa-trash-alt"></i></button>`;
            d.addEventListener('click', () => { this.loadChat(chat.id); this.sound.click(); });
            d.querySelector('.delete-chat').addEventListener('click', (e) => this.deleteChat(chat.id, e));
            c.appendChild(d);
        });
    }

    // === SEND MESSAGE ===
    async sendMessage() {
        const text = this.els.messageInput.value.trim();
        if (!text || this.isProcessing) return;
        if (!navigator.onLine) { this.showToast('You are offline.', 'error'); this.sound.error(); return; }

        this.sound.send();
        if (!this.currentChatId || !this.conversations[this.currentChatId]) this.newChat();

        const chat = this.conversations[this.currentChatId];
        chat.messages.push({ role: 'user', content: text, timestamp: Date.now() });

        if (chat.messages.filter(m => m.role === 'user').length === 1) {
            chat.title = text.substring(0, 40) + (text.length > 40 ? '...' : '');
            this.renderHistory();
        }

        this.els.messageInput.value = '';
        this.autoResize();
        this.els.welcomeScreen.style.display = 'none';
        this.els.messagesContainer.style.display = 'flex';
        this.renderMessages();
        this.scroll();
        this.showTyping('Thinking...');
        this.isProcessing = true;
        this.els.sendBtn.disabled = true;

        const lang = this.detectLang(text);

        try {
            const response = await this.api.chat(
                chat.messages, lang,
                (s) => this.updateTyping(s)
            );

            this.hideTyping();
            chat.messages.push({ role: 'assistant', content: response, timestamp: Date.now() });
            this.saveToStorage();
            await this.typeResponse(response);
            this.sound.receive();
            if (this.settings.voiceEnabled) this.speak(response, lang);

        } catch (error) {
            this.hideTyping();

            const msg = error.message || 'Something went wrong';
            let hint = '';
            switch (error.type) {
                case 'AUTH': hint = '💡 Server API key is invalid'; break;
                case 'RATE_LIMIT': hint = '💡 Too many requests. Wait a moment.'; break;
                case 'TIMEOUT': hint = '💡 Server is busy. Try again.'; break;
                case 'OFFLINE': case 'NETWORK': hint = '💡 Check your internet connection'; break;
                case 'BLOCKED': hint = '💡 Try rephrasing your question'; break;
                case 'ALL_FAILED': hint = '💡 All AI models are down. Try later.'; break;
            }

            this.showToast(`❌ ${msg}${hint ? '\n' + hint : ''}`, 'error', 8000);
            this.sound.error();

            chat.messages.push({
                role: 'assistant',
                content: `⚠️ **Error:** ${msg}\n\n${hint || 'Try again or check Settings → Test Connection.'}`,
                timestamp: Date.now(),
                isError: true
            });
            this.saveToStorage();
            this.renderMessages();
        }

        this.isProcessing = false;
        this.els.sendBtn.disabled = false;
        this.els.messageInput.focus();
    }

    renderMessages() {
        const chat = this.conversations[this.currentChatId];
        if (!chat) return;
        this.els.messagesContainer.innerHTML = '';
        chat.messages.forEach((m, i) => this.els.messagesContainer.appendChild(this.createMsg(m, i)));
        this.scroll();
    }

    async typeResponse(text) {
        const chat = this.conversations[this.currentChatId];
        if (!chat) return;
        this.els.messagesContainer.innerHTML = '';
        chat.messages.slice(0, -1).forEach((m, i) => this.els.messagesContainer.appendChild(this.createMsg(m, i)));
        const last = chat.messages[chat.messages.length - 1];
        const el = this.createMsg(last, chat.messages.length - 1, true);
        this.els.messagesContainer.appendChild(el);
        const content = el.querySelector('.message-content');

        const parsed = this.md(text);
        const words = text.split(/(\s+)/);
        let acc = '', idx = 0;
        await new Promise(resolve => {
            const type = () => {
                for (let i = 0; i < 3 && idx < words.length; i++, idx++) acc += words[idx];
                content.innerHTML = this.md(acc);
                this.scroll();
                if (idx < words.length) setTimeout(type, CONFIG.TYPING_SPEED);
                else { content.innerHTML = parsed; resolve(); }
            };
            type();
        });
        this.scroll();
    }

    createMsg(msg, index, empty = false) {
        const d = document.createElement('div');
        const isUser = msg.role === 'user';
        d.className = `message message-${isUser ? 'user' : 'ai'} ${msg.isError ? 'message-error' : ''}`;
        const av = isUser ? '<i class="fas fa-user" style="font-size:0.7rem"></i>' : '<div class="ai-avatar-dot"></div>';
        const t = TRANSLATIONS[this.currentLanguage];

        d.innerHTML = `<div class="message-avatar">${av}</div><div class="message-body"><div class="message-content">${empty ? '' : (isUser ? this.esc(msg.content) : this.md(msg.content))}</div><div class="message-actions"><button class="msg-action-btn copy-msg-btn"><i class="fas fa-copy"></i> <span>${t.copy}</span></button>${!isUser ? `<button class="msg-action-btn regenerate-btn"><i class="fas fa-rotate"></i> <span>${t.regenerate}</span></button>` : ''}</div></div>`;

        d.querySelector('.copy-msg-btn').addEventListener('click', () => {
            navigator.clipboard.writeText(msg.content).then(() => {
                const b = d.querySelector('.copy-msg-btn');
                b.innerHTML = `<i class="fas fa-check"></i> <span>${t.copied}</span>`;
                setTimeout(() => { b.innerHTML = `<i class="fas fa-copy"></i> <span>${t.copy}</span>`; }, 2000);
            });
            this.sound.click();
        });

        const regen = d.querySelector('.regenerate-btn');
        if (regen) regen.addEventListener('click', () => this.regen(index));
        return d;
    }

    async regen(index) {
        if (this.isProcessing || !navigator.onLine) return;
        const chat = this.conversations[this.currentChatId];
        if (!chat) return;
        chat.messages = chat.messages.slice(0, index);
        this.saveToStorage();
        this.renderMessages();
        this.showTyping('Regenerating...');
        this.isProcessing = true;
        this.els.sendBtn.disabled = true;
        const lastUser = chat.messages.filter(m => m.role === 'user').pop();
        const lang = lastUser ? this.detectLang(lastUser.content) : this.currentLanguage;
        try {
            const response = await this.api.chat(chat.messages, lang, (s) => this.updateTyping(s));
            this.hideTyping();
            chat.messages.push({ role: 'assistant', content: response, timestamp: Date.now() });
            this.saveToStorage();
            await this.typeResponse(response);
            this.sound.receive();
            if (this.settings.voiceEnabled) this.speak(response, lang);
        } catch (e) {
            this.hideTyping();
            this.showToast(`❌ ${e.message || 'Failed'}`, 'error');
            this.sound.error();
        }
        this.isProcessing = false;
        this.els.sendBtn.disabled = false;
    }

    // Markdown parser
    md(text) {
        const cb = []; let h = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (m, l, c) => { cb.push({ l: l || 'code', c: c.trim() }); return `\x00CB${cb.length - 1}\x00`; });
        const ic = []; h = h.replace(/`([^`]+)`/g, (m, c) => { ic.push(c); return `\x00IC${ic.length - 1}\x00`; });
        h = this.esc(h);
        h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        h = h.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
        h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        h = h.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        h = h.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        h = h.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        h = h.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
        h = h.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        h = h.replace(/((?:<li>.*?<\/li>\s*)+)/g, '<ul>$1</ul>');
        h = h.replace(/\n\n/g, '</p><p>');
        h = h.replace(/\n/g, '<br>');
        ic.forEach((c, i) => { h = h.replace(`\x00IC${i}\x00`, `<code class="inline-code">${this.esc(c)}</code>`); });
        cb.forEach((b, i) => { h = h.replace(`\x00CB${i}\x00`, `<div class="code-block"><div class="code-header"><span class="code-lang">${b.l}</span><button class="copy-code-btn" onclick="app.copyCode(this)"><i class="fas fa-copy"></i> Copy</button></div><pre><code>${this.esc(b.c)}</code></pre></div>`); });
        return h;
    }

    esc(t) { const m = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }; return t.replace(/[&<>"']/g, c => m[c]); }

    copyCode(btn) {
        const code = btn.closest('.code-block').querySelector('code').textContent;
        navigator.clipboard.writeText(code).then(() => {
            btn.innerHTML = '<i class="fas fa-check"></i> Copied!'; btn.classList.add('copied');
            setTimeout(() => { btn.innerHTML = '<i class="fas fa-copy"></i> Copy'; btn.classList.remove('copied'); }, 2000);
        });
        this.sound.click();
    }

    showTyping(t = 'Thinking...') { this.els.typingIndicator.classList.remove('hidden'); if (this.els.typingText) this.els.typingText.textContent = t; this.scroll(); }
    updateTyping(t) { if (this.els.typingText) this.els.typingText.textContent = t; }
    hideTyping() { this.els.typingIndicator.classList.add('hidden'); }
    scroll() { requestAnimationFrame(() => { this.els.chatArea.scrollTop = this.els.chatArea.scrollHeight; }); }
    autoResize() { const t = this.els.messageInput; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 140) + 'px'; }

    setupSpeechRecognition() {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) { if (this.els.micBtn) this.els.micBtn.style.display = 'none'; return; }
        this.recognition = new SR();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        const lm = { en: 'en-US', hi: 'hi-IN', ur: 'ur-PK' };
        this.recognition.onstart = () => { this.isListening = true; this.els.micBtn.classList.add('listening'); };
        this.recognition.onresult = (e) => {
            let t = ''; for (let i = e.resultIndex; i < e.results.length; i++) t += e.results[i][0].transcript;
            this.els.messageInput.value = t; this.autoResize();
            if (e.results[e.results.length - 1].isFinal && !this.settings.continuousListening) this.sendMessage();
        };
        this.recognition.onend = () => {
            if (this.settings.continuousListening && this.isListening) { this.recognition.lang = lm[this.currentLanguage] || 'en-US'; try { this.recognition.start(); } catch (e) { } }
            else { this.isListening = false; this.els.micBtn.classList.remove('listening'); }
        };
        this.recognition.onerror = () => { this.isListening = false; this.els.micBtn.classList.remove('listening'); };
    }

    toggleVoice() {
        if (!this.recognition) return; this.sound.click();
        const lm = { en: 'en-US', hi: 'hi-IN', ur: 'ur-PK' };
        if (this.isListening) { this.isListening = false; this.recognition.stop(); }
        else { this.recognition.lang = lm[this.currentLanguage] || 'en-US'; try { this.recognition.start(); } catch (e) { } }
    }

    speak(text, lang) {
        if (!this.synthesis) return; this.synthesis.cancel();
        const clean = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]+`/g, '').replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,3}\s/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[-*] /g, '').replace(/⚠️/g, '').replace(/\n/g, '. ').substring(0, 500);
        const u = new SpeechSynthesisUtterance(clean);
        u.rate = this.settings.voiceSpeed; u.pitch = 1; u.volume = 0.8;
        const tl = { en: 'en', hi: 'hi', ur: 'ur' }[lang || this.currentLanguage] || 'en';
        const v = this.synthesis.getVoices().find(v => v.lang.startsWith(tl));
        if (v) u.voice = v;
        const ind = document.createElement('div');
        ind.className = 'ai-speaking';
        ind.innerHTML = `<div class="speaking-waves"><span></span><span></span><span></span><span></span><span></span></div><span>AI Speaking</span>`;
        document.querySelector('.ai-speaking')?.remove();
        document.body.appendChild(ind);
        u.onend = () => ind.remove(); u.onerror = () => ind.remove();
        this.synthesis.speak(u);
    }

    showToast(message, type = 'info', duration = 6000) {
        document.querySelectorAll('.toast-notification').forEach(t => t.remove());
        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;
        const icon = { error: 'fa-exclamation-circle', success: 'fa-check-circle', info: 'fa-info-circle' }[type] || 'fa-info-circle';
        const ic = { error: '#ef4444', success: '#22c55e', info: '#3b82f6' }[type];
        toast.innerHTML = `<div class="toast-icon"><i class="fas ${icon}" style="color:${ic}"></i></div><div class="toast-body"><div class="toast-message">${message.replace(/\n/g, '<br>')}</div></div><button class="toast-close" onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button><div class="toast-progress" style="animation-duration:${duration}ms"></div>`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => { toast.classList.add('hiding'); setTimeout(() => toast.remove(), 300); }, duration);
    }

    saveToStorage() { try { localStorage.setItem('malikIrtezaAI', JSON.stringify({ conversations: this.conversations, currentChatId: this.currentChatId, currentLanguage: this.currentLanguage, settings: this.settings })); } catch (e) { } }

    loadFromStorage() {
        try {
            const raw = localStorage.getItem('malikIrtezaAI');
            if (raw) { const d = JSON.parse(raw); this.conversations = d.conversations || {}; this.currentChatId = d.currentChatId || null; this.currentLanguage = d.currentLanguage || 'en'; if (d.settings) this.settings = { ...this.settings, ...d.settings }; }
        } catch (e) { }
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    if (window.speechSynthesis) { window.speechSynthesis.getVoices(); window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices(); }
    app = new MalikIrtezaAI();
});