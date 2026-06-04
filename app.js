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
    document.getElementById('style-display').textContent = currentConfig.expressionStyleLabel;
}

document.getElementById('api-key-input').value = currentConfig.apiKey;
document.getElementById('eleven-key-input').value = currentConfig.elevenKey;
updatePrefsDisplay();

document.getElementById('save-settings-btn').addEventListener('click', () => {
    currentConfig.apiKey = document.getElementById('api-key-input').value.trim();
    currentConfig.elevenKey = document.getElementById('eleven-key-input').value.trim();
    localStorage.setItem('geminiApiKey', currentConfig.apiKey);
    localStorage.setItem('elevenLabsApiKey', currentConfig.elevenKey);
    alert('تم حفظ الإعدادات بنجاح!');
});

const bottomSheet = document.getElementById('bottom-sheet');
const sheetTitle = document.getElementById('sheet-title');
const sheetOptionsContainer = document.getElementById('sheet-options');

document.getElementById('close-sheet-btn').addEventListener('click', () => bottomSheet.classList.add('hidden'));

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

document.getElementById('quick-prefs-btn').addEventListener('click', () => {
    openSheet('الإعدادات السريعة', [
        { value: 'lang', label: '<i class="fa-solid fa-language"></i> تغيير اللغة' },
        { value: 'level', label: '<i class="fa-solid fa-layer-group"></i> تغيير المستوى' }
    ], null, (sel) => {
        if(sel.value === 'lang') openLangSheet();
        if(sel.value === 'level') openLevelSheet();
    });
});

function openLangSheet() {
    openSheet('اللغة', [
        { value: 'English', label: '🇺🇸 English' }, { value: 'French', label: '🇫🇷 Français' },
        { value: 'Spanish', label: '🇪🇸 Español' }, { value: 'German', label: '🇩🇪 Deutsch' }
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

document.getElementById('style-selector-btn').addEventListener('click', () => {
    openSheet('أسلوب المعلم', [
        { value: 'polite', label: 'مؤدب ومشجع' }, { value: 'sarcastic', label: 'ساخر كوميدي 🤬' }, { value: 'strict', label: 'صارم وجدي' }
    ], currentConfig.expressionStyle, (sel) => {
        currentConfig.expressionStyle = sel.value; currentConfig.expressionStyleLabel = sel.label;
        localStorage.setItem('chatStyle', sel.value); localStorage.setItem('chatStyleLabel', sel.label);
        updatePrefsDisplay(); bottomSheet.classList.add('hidden');
    });
});

const scenarioModal = document.getElementById('scenario-modal');
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
    recognition.lang = currentConfig.chatLanguage === 'English' ? 'en-US' : (currentConfig.chatLanguage === 'French' ? 'fr-FR' : 'ar-SA');
    document.getElementById('voice-status-text').textContent = "جاري الاستماع...";
    document.getElementById('voice-live-transcript').textContent = "...";
    document.getElementById('voice-logo').classList.remove('speaking-animation'); 
    try { recognition.start(); } catch(e) {}
}

async function speakText(text) {
    let spokenText = text.split("💡")[0].trim();
    if (!currentConfig.elevenKey) { speakTextFree(spokenText); return; }
    document.getElementById('voice-status-text').textContent = "يجهز الصوت البشري...";
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`, {
            method: 'POST', headers: { 'xi-api-key': currentConfig.elevenKey, 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: spokenText, model_id: "eleven_multilingual_v2" })
        });
        if (!response.ok) throw new Error("ElevenLabs Error");
        const audioUrl = URL.createObjectURL(await response.blob());
        if (currentAudio) currentAudio.pause();
        currentAudio = new Audio(audioUrl);
        document.getElementById('voice-status-text').textContent = "الذكاء الاصطناعي يتحدث...";
        document.getElementById('voice-live-transcript').textContent = spokenText; 
        document.getElementById('voice-logo').classList.add('speaking-animation');
        currentAudio.play();
        currentAudio.onended = () => { document.getElementById('voice-logo').classList.remove('speaking-animation'); if (isVoiceModeActive) setTimeout(startListening, 500); };
    } catch (e) { speakTextFree(spokenText); }
}

function speakTextFree(spokenText) {
    synth.cancel(); const utterance = new SpeechSynthesisUtterance(spokenText);
    document.getElementById('voice-status-text').textContent = "الذكاء الاصطناعي يتحدث...";
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
        fetchAIResponse(finalTranscript, true); 
    }
};

recognition.onerror = function(event) { if (event.error === 'no-speech' && isVoiceModeActive) startListening(); };

function startVoiceSession() {
    if (!currentConfig.apiKey) { alert("أدخل مفتاح Gemini في الإعدادات!"); switchScreen('settings-screen'); return; }
    isVoiceModeActive = true; switchScreen('voice-screen'); speakText("Hello! Let's go!");
}

document.getElementById('end-voice-call-btn').addEventListener('click', () => {
    isVoiceModeActive = false; recognition.stop(); synth.cancel();
    if(currentAudio) currentAudio.pause();
    document.getElementById('voice-logo').classList.remove('speaking-animation'); switchScreen('home-screen'); 
});

function getSystemPrompt() {
    return `You are a professional language tutor and actor for ${currentConfig.chatLanguage}. User level: ${currentConfig.userLevel}.
    ${currentConfig.scenarioPlace ? `Scenario: ${currentConfig.scenarioPlace}. User is ${currentConfig.userRole}. You are ${currentConfig.aiRole}.` : ''}
    Reply in character (1-2 sentences). Add a newline starting with "💡 الملاحظة:" in Arabic ONLY if there's a language mistake.`;
}

// محرك الطوارئ الشامل للاتصال بالذكاء الاصطناعي
async function fetchAIResponse(userText, isVoiceCall = false) {
    if (!currentConfig.apiKey) return;
    if (!isVoiceCall) addChatMessage(userText, true); else document.getElementById('voice-status-text').textContent = "يفكر...";

    let modelsToTry = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro", "gemini-pro"];
    let success = false;
    let replyText = "";

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
            console.log(`Failed with model ${model}, trying next...`);
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
            addChatMessage("⚠️ فشل الاتصال بجميع الموديلات. تأكد من أن الـ API Key منسوخ بالكامل ولا يحتوي على مسافات.", false);
        }
    }
}

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
document.getElementById('send-btn').addEventListener('click', () => {
    const text = userInput.value.trim();
    if (text) { 
        if (!currentConfig.apiKey) { alert("الرجاء إدخال Gemini API Key!"); return; }
        userInput.value = ''; fetchAIResponse(text, false); 
    }
});

function addChatMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = `message ${isUser ? 'user-msg' : 'bot-msg'}`;
    div.innerHTML = `<div class="msg-content">${text}</div>`;
    chatBox.appendChild(div); chatBox.scrollTop = chatBox.scrollHeight;
}
