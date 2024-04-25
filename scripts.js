const phrases = [
    "AI reimagined, Products redefined",
    "From the OG visionaries of AI,",
    "Perceptive, Creative, Efficient and  Self-Evolving Intelligence.",
    "NUCLEUS AI",
    "NUCLEUS. General Intelligence"
];
const prefix = [0,0,0,7,0];

const typingSpeed = 40;
const deletingSpeed = 40;
const delayAfterTyping = 2500;
const delayAfterTypingWord = 1200;
const delayAfterDeleting = 1000;

let currentPhraseIndex = 0;
let letterIndex = 0;
let isTyping = true;

const textElement = document.getElementById('text');
const cursorElement = document.querySelector('.cursor');
const emailElement = document.getElementById('email');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isStringWithCommas(str) {
    const firstIndex = str.indexOf(',');
    return firstIndex === -1 ? false : firstIndex === str.length - 1 ? false : true;
}

async function typeWriter() {
    const currentPhrase = phrases[currentPhraseIndex];
    if (isTyping) { 
        if (currentPhraseIndex === phrases.length - 2) textElement.style.fontSize = '3rem';
        textElement.textContent += currentPhrase.charAt(letterIndex);
        letterIndex++;
        
        if (letterIndex < currentPhrase.length) {
            if (isStringWithCommas(currentPhrase) && currentPhrase.charAt(letterIndex) === ',') await sleep(delayAfterTypingWord);
            setTimeout(typeWriter, typingSpeed);
        } else {
            if (currentPhraseIndex === phrases.length - 1) {
                // cursorElement.style.opacity = '0'; // Hide cursor after typing the last phrase
                emailElement.style.animationDelay = '3s'; // Start email animation immediately after showing Nucleus AI
                emailElement.classList.add('dropDownAnimation');
            } else {
                isTyping = false;
                setTimeout(typeWriter, delayAfterTyping);
            }
        }
    } else { 
        if (letterIndex > prefix[currentPhraseIndex]) {
            textElement.textContent = currentPhrase.substring(0, letterIndex - 1);
            letterIndex--;
            setTimeout(typeWriter, deletingSpeed);
        } else {
            isTyping = true;
            currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
            setTimeout(typeWriter, delayAfterDeleting);
        }
    }
}

typeWriter();