const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.screen');
const bottomNav = document.querySelector('.bottom-nav');

function switchScreen(targetId) {
    if (targetId === 'voice-screen') bottomNav.classList.add('hidden');
    else bottomNav.classList.remove('hidden');

    navItems.forEach(nav => nav.classList.remove('active'));
    screens.forEach(screen => screen.classList.remove('active'));
    const targetNav = document.querySelector(`[data-target="${targetId}"]`);
    if(targetNav) targetNav.classList.add('active');
    document.getElementById(targetId).classList.add('active');
}

navItems.forEach(item => item.addEventListener('click', () => switchScreen(item.dataset.target)));

let currentConfig = { 
    apiKey: localStorage.getItem('geminiApiKey') || '',
    elevenKey: localStorage.getItem('elevenLabsApiKey') || '',
    chatLanguage: localStorage.getItem('chatLang') || 'English',
    chatLangLabel: localStorage.getItem('chatLangLabel') || '🇺🇸',
    expressionStyle: localStorage.getItem('chatStyle') || 'polite',
    expressionStyleLabel: localStorage.getItem('chatStyleLabel') || 'مؤدب ومشجع',
    userLevel: localStorage.getItem('userLevel') || 'Intermediate',
    userLevelLabel: localStorage.getItem('userLevelLabel') || 'متوسط',
    userRole: '', aiRole: '', scenarioPlace: ''
};

function updatePrefsDisplay() {
    document.getElementById('quick-prefs-display').textContent = `${currentConfig.chatLangLabel} • ${currentConfig.userLevelLabel}`;
    if (document.getElementById('style-display')) {
        document.getElementById('style-display').textContent = currentConfig.expressionStyleLabel;
    }
}

if (document.getElementById('api-key-input')) {
    document.getElementById('api-key-input').value = currentConfig.apiKey;
    document.getElementById('eleven-key-input').value = currentConfig.elevenKey;
}
updatePrefsDisplay();

// حماية الكود من الانهيار (Defensive Programming)
function checkStreak() {
    const streakContainer = document.getElementById('streak-container');
    const streakText = document.getElementById('streak-count');
    
    // إذا لم يجد العناصر في الـ HTML، يتوقف عن حساب الأيام ويكمل تشغيل التطبيق بأمان
    if (!streakContainer || !streakText) return; 

    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    let lastActive = localStorage.getItem('lastActiveDate');
    let streakCount = parseInt(localStorage.getItem('streakCount')) || 0;

    if (streakCount === 0) {
        streakContainer.classList.remove('active');
    } else if (lastActive === today) {
        streakContainer.classList.add('active'); 
    } else if (lastActive === yesterdayString) {
        streakContainer.classList.remove('active'); 
    } else {
        streakCount = 0; 
        localStorage.setItem('streakCount', streakCount);
        streakContainer.classList.remove('active');
    }
    streakText.textContent = streakCount;
}

function triggerActivity() {
    const today = new Date().toDateString();
    let lastActive = localStorage.getItem('lastActiveDate');
    let streakCount = parseInt(localStorage.getItem('streakCount')) || 0;

    if (lastActive !== today) {
        streakCount++;
        localStorage.setItem('streakCount', streakCount);
        localStorage.setItem('lastActiveDate', today);
    }
    checkStreak(); 
}
checkStreak(); 

if (document.getElementById('save-settings-btn')) {
    document.getElementById('save-settings-btn').addEventListener('click', () => {
        currentConfig.apiKey = document.getElementById('api-key-input').value.trim();
        currentConfig.elevenKey = document.getElementById('eleven-key-input').value.trim();
        localStorage.setItem('geminiApiKey', currentConfig.apiKey);
        localStorage.setItem('elevenLabsApiKey', currentConfig.elevenKey);
        alert('تم حفظ الإعدادات بنجاح!');
    });
}

const bottomSheet = document.getElementById('bottom-sheet');
const sheetTitle = document.getElementById('sheet-title');
const sheetOptionsContainer = document.getElementById('sheet-options');

if (document.getElementById('close-sheet-btn')) {
    document.getElementById('close-sheet-btn').addEventListener('click', () => bottomSheet.classList.add('hidden'));
}

function openSheet(title, options, currentValue, onSelect) {
    sheetTitle.textContent = title;
    sheetOptionsContainer.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = `sheet-option ${opt.value === currentValue ? 'selected' : ''}`;
        btn.innerHTML = opt.label;
        btn.addEventListener('click', () => onSelect(opt));
        sheetOptionsContainer.appendChild(btn);
    });
    bottomSheet.classList.remove('hidden');
}

if (document.getElementById('quick-prefs-btn')) {
    document.getElementById('quick-prefs-btn').addEventListener('click', () => {
        openSheet('الإعدادات السريعة', [
            { value: 'lang', label: '<i class="fa-solid fa-language"></i> تغيير اللغة' },
            { value: 'level', label: '<i class="fa-solid fa-layer-group"></i> تغيير المستوى' }
        ], null, (sel) => {
            if(sel.value === 'lang') openLangSheet();
            if(sel.value === 'level') openLevelSheet();
        });
    });
}

function openLangSheet() {
    openSheet('اللغة', [
        { value: 'English', label: '🇺🇸 English' }, 
        { value: 'French', label: '🇫🇷 Français' },
        { value: 'Spanish', label: '🇪🇸 Español' }, 
        { value: 'German', label: '🇩🇪 Deutsch' },
        { value: 'Arabic', label: '🇸🇦 العربية' },
        { value: 'Italian', label: '🇮🇹 Italiano' },
        { value: 'Portuguese', label: '🇵🇹 Português' },
        { value: 'Turkish', label: '🇹🇷 Türkçe' }
    ], currentConfig.chatLanguage, (sel) => {
        currentConfig.chatLanguage = sel.value; currentConfig.chatLangLabel = sel.label.split(' ')[0];
        localStorage.setItem('chatLang', sel.value); localStorage.setItem('chatLangLabel', currentConfig.chatLangLabel);
        updatePrefsDisplay(); bottomSheet.classList.add('hidden');
    });
}

function openLevelSheet() {
    openSheet('المستوى', [
        { value: 'Beginner', label: 'مبتدئ' }, { value: 'Intermediate', label: 'متوسط' },
        { value: 'Advanced', label: 'متقدم' }, { value: 'Native', label: 'محترف' }
    ], currentConfig.userLevel, (sel) => {
        currentConfig.userLevel = sel.value; currentConfig.userLevelLabel = sel.label;
        localStorage.setItem('userLevel', sel.value); localStorage.setItem('userLevelLabel', sel.label);
        updatePrefsDisplay(); bottomSheet.classList.add('hidden');
    });
}

if (document.getElementById('style-selector-btn')) {
    document.getElementById('style-selector-btn').addEventListener('click', () => {
        openSheet('أسلوب المعلم', [
            { value: 'polite', label: 'مؤدب ومشجع' }, { value: 'sarcastic', label: 'ساخر كوميدي 🤬' }, { value: 'strict', label: 'صارم وجدي' }
        ], currentConfig.expressionStyle, (sel) => {
            currentConfig.expressionStyle = sel.value; currentConfig.expressionStyleLabel = sel.label;
            localStorage.setItem('chatStyle', sel.value); localStorage.setItem('chatStyleLabel', sel.label);
            updatePrefsDisplay(); bottomSheet.classList.add('hidden');
        });
    });
}

const scenarioModal = document.getElementById('scenario-modal');
if (document.getElementById('open-scenario-btn')) {
    document.getElementById('open-scenario-btn').addEventListener('click', () => scenarioModal.classList.remove('hidden'));
    document.getElementById('close-scenario-btn').addEventListener('click', () => scenarioModal.classList.add('hidden'));

    document.getElementById('start-scenario-btn').addEventListener('click', () => {
        currentConfig.userRole = document.getElementById('user-role').value.trim();
        currentConfig.aiRole = document.getElementById('ai-role').value.trim();
        currentConfig.scenarioPlace = document.getElementById('scenario-place').value.trim();
        scenarioModal.classList.add('hidden');
        startVoiceSession();
    });

    document.getElementById('guided-practice-btn').addEventListener('click', () => {
        currentConfig.userRole = ''; currentConfig.aiRole = ''; currentConfig.scenarioPlace = '';
        startVoiceSession();
    });
}

let isVoiceModeActive = false; 
let synth = window.speechSynthesis;
let recognition;
let currentAudio = null;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR(); recognition.continuous = false; recognition.interimResults = true; 
}

function startListening() {
    if (!isVoiceModeActive || !recognition) return;
    
    const langCodes = {
        'English': 'en-US', 'French': 'fr-FR', 'Spanish': 'es-ES', 'German': 'de-DE', 
        'Arabic': 'ar-SA', 'Italian': 'it-IT', 'Portuguese': 'pt-PT', 'Turkish': 'tr-TR'
    };
    recognition.lang = langCodes[currentConfig.chatLanguage] || 'en-US';
    
    document.getElementById('voice-status-text').textContent = "جاري الاستماع...";
    document.getElementById('voice-live-transcript').textContent = "...";
    document.getElementById('voice-logo').classList.remove('speaking-animation'); 
    try { recognition.start(); } catch(e) {}
}

async function speakText(text) {
    let spokenText = text.split("💡")[0].trim();
    
    if (!currentConfig.elevenKey) { 
        speakTextFree(spokenText); 
        return; 
    }
    
    document.getElementById('voice-status-text').textContent = "يجهز الصوت البشري...";
    document.getElementById('voice-status-text').style.color = "var(--text-light)";
    
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
            method: 'POST', 
            headers: { 'xi-api-key': currentConfig.elevenKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: spokenText, model_id: "eleven_multilingual_v2" })
        });
        
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.detail?.status || errData.detail?.message || "مفتاح غير صالح أو رصيد منتهي");
        }
        
        const audioUrl = URL.createObjectURL(await response.blob());
        if (currentAudio) currentAudio.pause();
        currentAudio = new Audio(audioUrl);
        document.getElementById('voice-status-text').textContent = "الذكاء الاصطناعي يتحدث...";
        document.getElementById('voice-live-transcript').textContent = spokenText; 
        document.getElementById('voice-logo').classList.add('speaking-animation');
        currentAudio.play();
        
        currentAudio.onended = () => { 
            document.getElementById('voice-logo').classList.remove('speaking-animation'); 
            if (isVoiceModeActive) setTimeout(startListening, 500); 
        };
        
    } catch (e) { 
        console.warn("ElevenLabs failed:", e);
        
        document.getElementById('voice-status-text').textContent = `خطأ ElevenLabs: ${e.message}`;
        document.getElementById('voice-status-text').style.color = "var(--brand-danger)";
        
        setTimeout(() => {
            document.getElementById('voice-status-text').style.color = "var(--text-light)";
            speakTextFree(spokenText); 
        }, 3500);
    }
}

function speakTextFree(spokenText) {
    synth.cancel(); const utterance = new SpeechSynthesisUtterance(spokenText);
    
    const langCodes = {
        'English': 'en-US', 'French': 'fr-FR', 'Spanish': 'es-ES', 'German': 'de-DE', 
        'Arabic': 'ar-SA', 'Italian': 'it-IT', 'Portuguese': 'pt-PT', 'Turkish': 'tr-TR'
    };
    utterance.lang = langCodes[currentConfig.chatLanguage] || 'en-US';
    
    document.getElementById('voice-status-text').textContent = "الذكاء الاصطناعي يتحدث (صوت المتصفح)...";
    document.getElementById('voice-live-transcript').textContent = spokenText; 
    document.getElementById('voice-logo').classList.add('speaking-animation');
    utterance.onend = function() { if (isVoiceModeActive) setTimeout(startListening, 500); };
    synth.speak(utterance);
}

recognition.onresult = function(event) {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) { if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript; }
    if (finalTranscript !== '') {
        recognition.stop(); document.getElementById('voice-live-transcript').textContent = finalTranscript;
        triggerActivity();
        fetchAIResponse(finalTranscript, true); 
    }
};

recognition.onerror = function(event) { if (event.error === 'no-speech' && isVoiceModeActive) startListening(); };

function startVoiceSession() {
    if (!currentConfig.apiKey) { alert("الرجاء إدخال Gemini API Key في الإعدادات!"); switchScreen('settings-screen'); return; }
    isVoiceModeActive = true; switchScreen('voice-screen'); speakText("Hello! Let's go!");
}

if (document.getElementById('end-voice-call-btn')) {
    document.getElementById('end-voice-call-btn').addEventListener('click', () => {
        isVoiceModeActive = false; recognition.stop(); synth.cancel();
        if(currentAudio) currentAudio.pause();
        document.getElementById('voice-logo').classList.remove('speaking-animation'); switchScreen('home-screen'); 
    });
}

function getSystemPrompt() {
    let levelInstructions = "";
    switch(currentConfig.userLevel) {
        case 'Beginner': levelInstructions = "Use simple words and basic sentences."; break;
        case 'Intermediate': levelInstructions = "Use common conversational vocabulary."; break;
        case 'Advanced': levelInstructions = "Use advanced vocabulary and natural idioms."; break;
        case 'Native': levelInstructions = "Use natural local slang, idioms, and normal fast pacing."; break;
    }

    let roleplaySetup = "";
    if (currentConfig.userRole && currentConfig.aiRole && currentConfig.scenarioPlace) {
        roleplaySetup = `\nROLEPLAY SCENARIO: We are at [${currentConfig.scenarioPlace}]. The user acts as [${currentConfig.userRole}]. YOU must act strictly as [${currentConfig.aiRole}].
        DYNAMICS: You must completely embody this character. Match the emotional tone perfectly.`;
    } else {
        let styleText = currentConfig.expressionStyle === 'strict' ? "strict and formal tutor." : "polite, encouraging, and friendly language partner.";
        roleplaySetup = `\nSCENARIO: General guided practice. Act as a ${styleText}`;
    }

    let basePrompt = `You are a professional language tutor and an exceptional improvisational actor for ${currentConfig.chatLanguage}.
    Your sole task is to engage the user in a highly realistic conversation. Never break character.

    USER LEVEL CONTROL: ${currentConfig.userLevel} (${levelInstructions}).
    ${roleplaySetup}

    STRICT CORRECTION AND ARABIC OUTPUT FORMAT:
    - Line 1: Your conversational response in character. Keep it strictly to 1-2 sentences max. Speak entirely in ${currentConfig.chatLanguage}.
    - Line 2 (MUST START WITH A NEWLINE): "💡 الملاحظة: " (In clear, simple Arabic).
      * CRITICAL: ONLY make a correction if they made an actual grammar or vocabulary mistake in the target language.
      * If the phrase was correct, just write "تعبير صحيح، تابع!" and do not add any extra text.`;
    
    return basePrompt;
}

async function fetchAIResponse(userText, isVoiceCall = false) {
    if (!currentConfig.apiKey) return;
    if (!isVoiceCall) addChatMessage(userText, true); else document.getElementById('voice-status-text').textContent = "يفكر...";

    let modelsToTry = ["gemini-3.5-flash", "gemini-2.5-flash", "gemini-flash-latest"];
    let success = false;
    let replyText = "";
    let lastError = "";

    for (let model of modelsToTry) {
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${currentConfig.apiKey}`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    systemInstruction: { parts: [{ text: getSystemPrompt() }] },
                    contents: [{ role: "user", parts: [{ text: userText }] }],
                    generationConfig: { temperature: 0.7 }
                })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.error?.message || "Error");
            
            replyText = data.candidates[0].content.parts[0].text;
            success = true;
            break; 
        } catch (error) {
            lastError = error.message;
        }
    }

    if (success) {
        addChatMessage(replyText, false); 
        if (isVoiceCall) speakText(replyText); 
    } else {
        if (isVoiceCall) {
            document.getElementById('voice-status-text').textContent = "خطأ نهائي في الاتصال";
            setTimeout(startListening, 3000);
        } else {
            addChatMessage(`⚠️ رسالة الخطأ من جوجل: ${lastError}`, false);
        }
    }
}

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
if (document.getElementById('send-btn')) {
    document.getElementById('send-btn').addEventListener('click', () => {
        const text = userInput.value.trim();
        if (text) { 
            if (!currentConfig.apiKey) { alert("الرجاء إدخال Gemini API Key!"); return; }
            userInput.value = ''; fetchAIResponse(text, false); 
        }
    });
}

function addChatMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user-msg' : 'bot-msg'}`;
    div.innerHTML = `<div class="msg-content">${text}</div>`;
    if (chatBox) {
        chatBox.appendChild(div); 
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}
    
