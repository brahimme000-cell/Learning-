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
    currentConfig.elevenKey = document.getElementById('eleven-key-input').value.trim();
    localStorage.setItem('geminiApiKey', currentConfig.apiKey);
    localStorage.setItem('elevenLabsApiKey', currentConfig.elevenKey);
    alert('تم حفظ الإعدادات بنجاح!');
});

const bottomSheet = document.getElementById('bottom-sheet');
const sheetTitle = document.getElementById('sheet-title');
const sheetOptionsContainer = document.getElementById('sheet-options');
const backSheetBtn = document.getElementById('back-sheet-btn');

document.getElementById('close-sheet-btn').addEventListener('click', () => bottomSheet.classList.add('hidden'));

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
        { value: 'sarcastic', label: 'ساخر كوميدي 🤬' },
        { value: 'strict', label: 'صارم وجدي' }
    ];
    openSheet('أسلوب المعلم (قساوة التصحيح)', options, currentConfig.expressionStyle, (selected) => {
        currentConfig.expressionStyle = selected.value;
        currentConfig.expressionStyleLabel = selected.label;
        localStorage.setItem('chatStyle', selected.value);
        localStorage.setItem('chatStyleLabel', selected.label);
        updatePrefsDisplay();
        bottomSheet.classList.add('hidden');
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

let isVoiceModeActive = false; 
let synth = window.speechSynthesis;
let recognition;
let currentAudio = null;

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
    
    try {
        const voiceId = "21m00Tcm4TlvDq8ikWAM"; 
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'xi-api-key': currentConfig.elevenKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: spokenText,
                model_id: "eleven_multilingual_v2" 
            })
        });

        if (!response.ok) throw new Error("ElevenLabs API Error");

        const blob = await response.blob();
        const audioUrl = URL.createObjectURL(blob);
        
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

    } catch (error) {
        console.warn("ElevenLabs failed, falling back to free voice.", error);
        speakTextFree(spokenText);
    }
}

function speakTextFree(spokenText) {
    synth.cancel(); 
    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = getSpeechLangCode();
    
    document.getElementById('voice-status-text').textContent = "الذكاء الاصطناعي يتحدث...";
    document.getElementById('voice-live-transcript').textContent = spokenText; 
    document.getElementById('voice-logo').classList.add('speaking-animation');

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
        document.getElementById('voice-live-transcript').textContent = finalTranscript;
        triggerActivity(); 
        fetchAIResponse(finalTranscript, true); 
    }
};

recognition.onerror = function(event) {
    if (event.error === 'no-speech' && isVoiceModeActive) startListening();
};

function startVoiceSession() {
    if (!currentConfig.apiKey) {
        alert("الرجاء إدخال Gemini API Key في الإعدادات!");
        switchScreen('settings-screen');
        return;
    }
    isVoiceModeActive = true;
    switchScreen('voice-screen'); 
    speakText("Hello! I am ready. Let's go!");
}

document.getElementById('guided-practice-btn').addEventListener('click', () => {
    currentConfig.userRole = ''; currentConfig.aiRole = ''; currentConfig.scenarioPlace = '';
    startVoiceSession();
});

document.getElementById('end-voice-call-btn').addEventListener('click', () => {
    isVoiceModeActive = false;
    recognition.stop(); 
    synth.cancel();
    if(currentAudio) currentAudio.pause();
    document.getElementById('voice-logo').classList.remove('speaking-animation');
    switchScreen('home-screen'); 
});

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

// الاتصال بخوادم جوجل (تم استرجاع الاسم الكامل للموديل -latest)
async function fetchAIResponse(userText, isVoiceCall = false) {
    if (!currentConfig.apiKey) return;
    
    if (!isVoiceCall) addChatMessage(userText, true);
    else document.getElementById('voice-status-text').textContent = "يفكر...";

    try {
        const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${currentConfig.apiKey}`;
        
        const response = await fetch(GEMINI_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { 
                    parts: [{ text: getSystemPrompt() }]
                },
                contents: [{
                    role: "user",
                    parts: [{ text: userText }]
                }],
                generationConfig: { temperature: 0.7 }
            })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Gemini API Error:", data);
            const exactError = data.error?.message || "خطأ مجهول من الخادم";
            throw new Error(exactError);
        }
        
        const replyText = data.candidates[0].content.parts[0].text;
        
        addChatMessage(replyText, false); 
        if (isVoiceCall) speakText(replyText); 
        
    } catch (error) {
        console.error(error);
        const errorMsg = `⚠️ رسالة الخطأ من جوجل: ${error.message}`; 
        
        if (isVoiceCall) {
            document.getElementById('voice-status-text').textContent = "خطأ في الاتصال";
            setTimeout(startListening, 3000);
        } else {
            addChatMessage(errorMsg, false);
        }
    }
}

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
            alert("الرجاء إدخال Gemini API Key في الإعدادات!");
            switchScreen('settings-screen');
            return;
        }
        userInput.value = ''; 
        triggerActivity(); 
        fetchAIResponse(text, false); 
    }
});
        
