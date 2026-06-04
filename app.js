const API_URL = "https://api.groq.com/openai/v1/chat/completions";

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const screens = document.querySelectorAll('.screen');
const bottomNav = document.querySelector('.bottom-nav');

function switchScreen(targetId) {
    if (targetId === 'voice-screen') {
        bottomNav.classList.add('hidden');
    } else {
        bottomNav.classList.remove('hidden');
    }

    navItems.forEach(nav => nav.classList.remove('active'));
    screens.forEach(screen => screen.classList.remove('active'));
    
    const targetNav = document.querySelector(`[data-target="${targetId}"]`);
    if(targetNav) targetNav.classList.add('active');
    
    document.getElementById(targetId).classList.add('active');
}

navItems.forEach(item => {
    item.addEventListener('click', () => switchScreen(item.dataset.target));
});

// State
let currentConfig = { 
    apiKey: localStorage.getItem('groqApiKey') || '',
    chatLanguage: localStorage.getItem('chatLang') || 'English',
    chatLangLabel: localStorage.getItem('chatLangLabel') || '🇺🇸',
    expressionStyle: localStorage.getItem('chatStyle') || 'polite',
    expressionStyleLabel: localStorage.getItem('chatStyleLabel') || 'مؤدب ومشجع',
    userLevel: localStorage.getItem('userLevel') || 'Beginner',
    userLevelLabel: localStorage.getItem('userLevelLabel') || 'مبتدئ',
    userRole: '', aiRole: '', scenarioPlace: ''
};

function updatePrefsDisplay() {
    document.getElementById('quick-prefs-display').textContent = `${currentConfig.chatLangLabel} • ${currentConfig.userLevelLabel}`;
    document.getElementById('style-display').textContent = currentConfig.expressionStyleLabel;
}

document.getElementById('api-key-input').value = currentConfig.apiKey;
updatePrefsDisplay();

// --- نظام الشعلة ---
function checkStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    
    let lastActive = localStorage.getItem('lastActiveDate');
    let streakCount = parseInt(localStorage.getItem('streakCount')) || 0;
    
    const streakContainer = document.getElementById('streak-container');
    const streakText = document.getElementById('streak-count');

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

document.getElementById('save-settings-btn').addEventListener('click', () => {
    currentConfig.apiKey = document.getElementById('api-key-input').value.trim();
    localStorage.setItem('groqApiKey', currentConfig.apiKey);
    alert('تم حفظ الإعدادات بنجاح!');
});

// --- Bottom Sheet Logic ---
const bottomSheet = document.getElementById('bottom-sheet');
const sheetTitle = document.getElementById('sheet-title');
const sheetOptionsContainer = document.getElementById('sheet-options');
const backSheetBtn = document.getElementById('back-sheet-btn');

document.getElementById('close-sheet-btn').addEventListener('click', () => {
    bottomSheet.classList.add('hidden');
});

function openSheet(title, options, currentValue, onSelect, goBackCallback = null) {
    sheetTitle.textContent = title;
    sheetOptionsContainer.innerHTML = '';
    
    if (goBackCallback) {
        backSheetBtn.classList.remove('hidden');
        backSheetBtn.onclick = goBackCallback;
    } else {
        backSheetBtn.classList.add('hidden');
    }

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = `sheet-option ${opt.value === currentValue ? 'selected' : ''}`;
        btn.innerHTML = opt.label;
        btn.addEventListener('click', () => onSelect(opt));
        sheetOptionsContainer.appendChild(btn);
    });
    bottomSheet.classList.remove('hidden');
}

function openQuickPrefsSheet() {
    const options = [
        { value: 'lang', label: '<i class="fa-solid fa-language"></i> تغيير اللغة' },
        { value: 'level', label: '<i class="fa-solid fa-layer-group"></i> تغيير المستوى' }
    ];
    openSheet('الإعدادات السريعة', options, null, (selected) => {
        if (selected.value === 'lang') openLangSheet(true);
        if (selected.value === 'level') openLevelSheet(true);
    });
}

function openLangSheet(fromQuickMenu = false) {
    const options = [
        { value: 'English', label: '🇺🇸 English' },
        { value: 'French', label: '🇫🇷 Français' },
        { value: 'Spanish', label: '🇪🇸 Español' },
        { value: 'German', label: '🇩🇪 Deutsch' },
        { value: 'Arabic', label: '🇸🇦 العربية' }
    ];
    const goBack = fromQuickMenu ? openQuickPrefsSheet : null;
    
    openSheet('اللغة المراد تعلمها', options, currentConfig.chatLanguage, (selected) => {
        currentConfig.chatLanguage = selected.value;
        currentConfig.chatLangLabel = selected.label.split(' ')[0]; 
        localStorage.setItem('chatLang', selected.value);
        localStorage.setItem('chatLangLabel', currentConfig.chatLangLabel);
        updatePrefsDisplay();
        if (fromQuickMenu) openQuickPrefsSheet(); 
        else bottomSheet.classList.add('hidden');
    }, goBack);
}

function openLevelSheet(fromQuickMenu = false) {
    const options = [
        { value: 'Beginner', label: 'مبتدئ' },
        { value: 'Intermediate', label: 'متوسط' },
        { value: 'Advanced', label: 'متقدم' },
        { value: 'Native', label: 'محترف' }
    ];
    const goBack = fromQuickMenu ? openQuickPrefsSheet : null;

    openSheet('اختر مستواك', options, currentConfig.userLevel, (selected) => {
        currentConfig.userLevel = selected.value;
        currentConfig.userLevelLabel = selected.label;
        localStorage.setItem('userLevel', selected.value);
        localStorage.setItem('userLevelLabel', selected.label);
        updatePrefsDisplay();
        if (fromQuickMenu) openQuickPrefsSheet(); 
        else bottomSheet.classList.add('hidden');
    }, goBack);
}

document.getElementById('quick-prefs-btn').addEventListener('click', openQuickPrefsSheet);

document.getElementById('style-selector-btn').addEventListener('click', () => {
    const options = [
        { value: 'polite', label: 'مؤدب ومشجع' },
        { value: 'sarcastic', label: 'ساخر (Sarcastic)' },
        { value: 'strict', label: 'صارم وجدي' }
    ];
    openSheet('أسلوب المعلم', options, currentConfig.expressionStyle, (selected) => {
        currentConfig.expressionStyle = selected.value;
        currentConfig.expressionStyleLabel = selected.label;
        localStorage.setItem('chatStyle', selected.value);
        localStorage.setItem('chatStyleLabel', selected.label);
        updatePrefsDisplay();
        bottomSheet.classList.add('hidden');
    });
});

// --- Scenario Modal ---
const scenarioModal = document.getElementById('scenario-modal');
document.getElementById('open-scenario-btn').addEventListener('click', () => scenarioModal.classList.remove('hidden'));
document.getElementById('close-scenario-btn').addEventListener('click', () => scenarioModal.classList.add('hidden'));

document.getElementById('start-scenario-btn').addEventListener('click', () => {
    currentConfig.userRole = document.getElementById('user-role').value;
    currentConfig.aiRole = document.getElementById('ai-role').value;
    currentConfig.scenarioPlace = document.getElementById('scenario-place').value;
    scenarioModal.classList.add('hidden');
    startVoiceSession();
});

// --- Dedicated Voice Screen Logic ---
const guidedPracticeBtn = document.getElementById('guided-practice-btn');
const endVoiceCallBtn = document.getElementById('end-voice-call-btn');
const voiceStatusText = document.getElementById('voice-status-text');
const voiceLiveTranscript = document.getElementById('voice-live-transcript');
const voiceLogo = document.getElementById('voice-logo');

let isVoiceModeActive = false; 
let synth = window.speechSynthesis;
let recognition;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false; 
    recognition.interimResults = true; 
}

function getSpeechLangCode() {
    const langs = { 'English': 'en-US', 'French': 'fr-FR', 'Spanish': 'es-ES', 'German': 'de-DE', 'Arabic': 'ar-SA' };
    return langs[currentConfig.chatLanguage] || 'en-US';
}

function startListening() {
    if (!isVoiceModeActive || !recognition) return;
    recognition.lang = getSpeechLangCode();
    voiceStatusText.textContent = "جاري الاستماع...";
    voiceLiveTranscript.textContent = "...";
    voiceLogo.classList.remove('speaking-animation'); 
    try { recognition.start(); } catch(e) {}
}

function speakText(text) {
    if (!synth) return;
    synth.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getSpeechLangCode();
    
    voiceStatusText.textContent = "الذكاء الاصطناعي يتحدث...";
    voiceLiveTranscript.textContent = text; 
    voiceLogo.classList.add('speaking-animation');

    utterance.onend = function() {
        if (isVoiceModeActive) setTimeout(startListening, 500); 
    };
    synth.speak(utterance);
}

recognition.onresult = function(event) {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) finalTranscript += event.results[i][0].transcript;
    }
    if (finalTranscript !== '') {
        recognition.stop();
        voiceLiveTranscript.textContent = finalTranscript;
        triggerActivity(); 
        fetchAIResponse(finalTranscript, true); 
    }
};

recognition.onerror = function(event) {
    if (event.error === 'no-speech' && isVoiceModeActive) startListening();
};

function startVoiceSession() {
    if (!currentConfig.apiKey) {
        alert("الرجاء إدخال API Key في الإعدادات!");
        switchScreen('settings-screen');
        return;
    }
    isVoiceModeActive = true;
    switchScreen('voice-screen'); 
    speakText("Hello. I am ready.");
}

guidedPracticeBtn.addEventListener('click', () => {
    currentConfig.userRole = ''; currentConfig.aiRole = ''; currentConfig.scenarioPlace = '';
    startVoiceSession();
});

endVoiceCallBtn.addEventListener('click', () => {
    isVoiceModeActive = false;
    recognition.stop(); 
    synth.cancel();
    voiceLogo.classList.remove('speaking-animation');
    switchScreen('home-screen'); 
});

// --- AI Engine (Strict Level Control) ---
function getSystemPrompt() {
    let levelInstructions = "";
    // توجيهات صارمة جداً للذكاء الاصطناعي ليتحدث بناءً على المستوى المختار
    switch(currentConfig.userLevel) {
        case 'Beginner': 
            levelInstructions = "Use extremely simple vocabulary, basic grammar, and short sentences. Speak slowly and clearly. Avoid complex idioms."; 
            break;
        case 'Intermediate': 
            levelInstructions = "Use everyday conversational language, moderate sentence structures, and common phrasal verbs."; 
            break;
        case 'Advanced': 
            levelInstructions = "Use advanced vocabulary, complex grammar, rich idioms, and speak like a well-educated native speaker."; 
            break;
        case 'Native': 
            levelInstructions = "Use natural slang, deep cultural expressions, highly complex idioms, and speak fast and naturally as if talking to a local friend."; 
            break;
    }

    let basePrompt = `You are a highly adaptive language tutor for ${currentConfig.chatLanguage}. 
    CRITICAL: You MUST refuse any general knowledge questions outside of language learning. 
    User's Level: ${currentConfig.userLevel}. 
    YOUR SPEAKING STYLE: ${levelInstructions}. 
    Keep all your responses short (1-2 sentences maximum) to keep the conversation flowing. `;
    
    if (currentConfig.expressionStyle === 'sarcastic') basePrompt += "Mock mistakes ruthlessly before correcting. ";
    else if (currentConfig.expressionStyle === 'polite') basePrompt += "Gently correct mistakes. ";
    
    if (currentConfig.userRole && currentConfig.aiRole && currentConfig.scenarioPlace) {
        basePrompt += `\nROLEPLAY SCENARIO: Place: ${currentConfig.scenarioPlace}. User is ${currentConfig.userRole}, YOU are ${currentConfig.aiRole}. Stay in character.`;
    }
    return basePrompt;
}

async function fetchAIResponse(userText, isVoiceCall = false) {
    if (!currentConfig.apiKey) return;
    
    if (!isVoiceCall) addChatMessage(userText, true);
    else voiceStatusText.textContent = "يفكر...";

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${currentConfig.apiKey}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    { role: "system", content: getSystemPrompt() },
                    { role: "user", content: userText }
                ]
            })
        });
        const data = await response.json();
        const replyText = data.choices[0].message.content;
        
        if (isVoiceCall) speakText(replyText); 
        else addChatMessage(replyText, false);
    } catch (error) {
        if (isVoiceCall) {
            voiceStatusText.textContent = "خطأ في الاتصال";
            setTimeout(startListening, 2000);
        }
    }
}

// Text Chat Logic
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

function addChatMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user-msg' : 'bot-msg'}`;
    div.innerHTML = `<div class="msg-content">${text}</div>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

sendBtn.addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) { 
        if (!currentConfig.apiKey) {
            alert("الرجاء إدخال API Key في الإعدادات!");
            switchScreen('settings-screen');
            return;
        }
        userInput.value = ''; 
        triggerActivity(); 
        fetchAIResponse(text, false); 
    }
});
    
