const phrases = [
    "The answer, my friend, is blowin' in the wind. <br><br> -Bob Dylan",
    "Intelligence isn’t compressed memory, it’s the ability to find those answers in the wind.",
    "The fathers and the prodigies of AI have united, to help AI reach singularity.",
    //"Perceptive, Creative, Efficient and Self-Evolving Intelligence.",
    "NUCLEUS AI",
    "NUCLEUS. General Intelligence"
];
const prefix = [0,0,0,0,0,0];
const commaOverrides = {
    0: {
        10: 0,
    },
};
const fullstopOverrides = {
    5: {
        7: 750,
    }
};
let phrasesWithPause = phrases.map((str, index) => isStringWithPause(str, index));

const typingSpeed = 30;
var deletingSpeed = 10;

const delayAfterTyping = 3500;
const delayAfterDeleting = 1500;

const defaultDelayAfterComma = 1500;
const defaultDelayAfterFullStop = 1500;

let currentPhraseIndex = 0;
let letterIndex = 0;
let isTyping = true;

const textElement = document.getElementById('text');
const cursorElement = document.querySelector('.cursor');
const emailElement = document.getElementById('email');

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isStringWithPause(str, strIndex) {
    const firstCommaIndex = str.indexOf(',');
    const firstFullstopIndex = str.indexOf('.');
    const isValidComma = firstCommaIndex === -1 ? false : firstCommaIndex === str.length - 1 ? false : true;
    const isValidFullStop = firstFullstopIndex === -1 ? false : firstFullstopIndex === str.length -1 ? false : true;
    return isValidComma || isValidFullStop;
}

async function typeWriter() {
    const currentPhrase = phrases[currentPhraseIndex];
    if (currentPhraseIndex === phrases.length - 2) deletingSpeed = 65;
    if (isTyping) { 
        if (currentPhraseIndex === phrases.length - 2) textElement.style.fontSize = '3rem';

        let charToAdd = currentPhrase.charAt(letterIndex);
        letterIndex++;

        // Handling typing of HTML tags
        if (charToAdd === '<') {
            while(currentPhrase.charAt(letterIndex) !== '>') {
                charToAdd += currentPhrase.charAt(letterIndex);
                letterIndex++;
            }
            charToAdd += '>';
            letterIndex++;
        }

        textElement.innerHTML += charToAdd;
        
        if (letterIndex < currentPhrase.length) {
            if (phrasesWithPause[currentPhraseIndex]) { 
                if (currentPhrase.charAt(letterIndex) === ',') {
                    textElement.innerHTML += ',';
                    let delay = commaOverrides.hasOwnProperty(currentPhraseIndex) && commaOverrides[currentPhraseIndex].hasOwnProperty(letterIndex) ? commaOverrides[currentPhraseIndex][letterIndex] : defaultDelayAfterComma;
                    await sleep(delay);
                    letterIndex++;
                } else if (currentPhrase.charAt(letterIndex) === '.') {
                    textElement.innerHTML += '.';
                    let delay = fullstopOverrides.hasOwnProperty(currentPhraseIndex) && fullstopOverrides[currentPhraseIndex].hasOwnProperty(letterIndex) ? fullstopOverrides[currentPhraseIndex][letterIndex] : defaultDelayAfterFullStop;
                    await sleep(delay);
                    letterIndex++;
                }
            }
            setTimeout(typeWriter, typingSpeed);
        } else {
            if (currentPhraseIndex === phrases.length - 1) {
                // cursorElement.style.opacity = '0'; // Hide cursor after typing the last phrase
                emailElement.style.animationDelay = '1s'; // Start email animation immediately after showing Nucleus AI
                emailElement.classList.add('dropDownAnimation');
            } else {
                isTyping = false;
                setTimeout(typeWriter, delayAfterTyping);
            }
        }
    } else { 
        if (letterIndex > prefix[currentPhraseIndex]) {
            // Handling deletion of HTML tags
            if (currentPhrase.charAt(letterIndex - 1) === '>') {
                while(letterIndex > 0 && currentPhrase.charAt(letterIndex - 1) !== '<') {
                    letterIndex--;
                }
                letterIndex--;
            }
            textElement.innerHTML = currentPhrase.substring(0, letterIndex - 1);
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