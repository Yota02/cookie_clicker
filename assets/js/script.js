// Constants for objectives and unlocks
const objectif1Max = 50;   
const objectif2Max = 100;  
const objectif3Max = 1;    

// Game state variables
let points = 0;          
let maxPointsAtteints = 0; 
let autoClickersBought = 0; 
let maxAutoClickers = 0; 
let clickMultiplier = 1;

// Unlock thresholds
const UNLOCK_THRESHOLDS = {
    'section1': 100,    
    'section2': 1000,   
    'section3': 5000    
};

// DOM Elements
const scoreDisplay = document.getElementById('score');
const cookie = document.getElementById('cookie');
const shopItems = document.querySelectorAll('.shop-item');
const shopSections = document.querySelectorAll('.shop-section');
const progress1 = document.getElementById('progress1');
const progress2 = document.getElementById('progress2');
const progress3 = document.getElementById('progress3');


function createFloatingNumber(x, y, text) {
    const floatingNum = document.createElement('div');
    floatingNum.className = 'floating-number';
    floatingNum.textContent = text;
    floatingNum.style.left = `${x}px`;
    floatingNum.style.top = `${y}px`;
    document.body.appendChild(floatingNum);
    setTimeout(() => floatingNum.remove(), 1000);
}

function updateShopSections() {
    shopSections.forEach(section => {
        const requiredPoints = UNLOCK_THRESHOLDS[section.id];
        const isUnlocked = maxPointsAtteints >= requiredPoints;
        section.classList.toggle('locked', !isUnlocked);

        const lockMessage = section.querySelector('.lock-message');
        if (lockMessage) {
            if (isUnlocked) {
                lockMessage.textContent = 'Déverrouillé !';
                lockMessage.style.color = '#4CAF50';

                setTimeout(() => {
                    lockMessage.style.display = 'none';
                }, 5000);
            } else {
                lockMessage.textContent = `Se déverrouille à ${requiredPoints} points (${maxPointsAtteints}/${requiredPoints})`;
                lockMessage.style.display = 'block';
            }
        }
    });
}

function updateShop() {
    shopItems.forEach(item => {
        const baseCost = parseInt(item.getAttribute('data-base-cost'));
        const level = parseInt(item.getAttribute('data-level'));
        const cost = Math.ceil(baseCost * Math.pow(1.15, level));
        const name = item.getAttribute('data-name');

        const parentSection = item.closest('.shop-section');
        const sectionUnlocked = parentSection ? 
            maxPointsAtteints >= UNLOCK_THRESHOLDS[parentSection.id] : 
            true;

        if (item.id === 'clickUpgrade') {
            const currentMultiplier = level + 1;
            item.textContent = `${name} (${cost} points) - Ajoute +${currentMultiplier} par click`;
        } else {
            const effect = item.getAttribute('data-effect');
            item.textContent = `${name} (${cost} points) - Ajoute ${effect} points/seconde`;
        }

        item.setAttribute('data-cost', cost);
        const canAfford = points >= cost;
        
        item.style.opacity = canAfford ? '1' : '0.5';
        item.style.filter = canAfford ? 'none' : 'grayscale(100%)';
        item.style.cursor = (sectionUnlocked && canAfford) ? 'pointer' : 'not-allowed';
        item.disabled = !sectionUnlocked || !canAfford;
        item.classList.toggle('disabled', !canAfford);
    });
}

function shrinkCookie() {
    cookie.style.transition = 'transform 0.1s ease-in-out';
    cookie.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        cookie.style.transform = 'scale(1)';
    }, 100);
}

function updateObjectives() {
    const objectives = [
        { element: progress1, maxValue: objectif1Max },
        { element: progress2, maxValue: objectif2Max },
        { element: progress3, maxValue: objectif3Max }
    ];
    
    objectives.forEach(({ element, maxValue }, index) => {
        if (element) { 
            const value = index === 2 ? maxAutoClickers : maxPointsAtteints;
            element.value = Math.min(value, maxValue);
            
            const objectiveDiv = element.parentElement;
            if (value >= maxValue && !objectiveDiv.classList.contains('completed')) {
                objectiveDiv.classList.add('completed');
                setTimeout(() => {
                    objectiveDiv.style.display = 'none';
                }, 1000);
            }
        }
    });
}

function updateScore() {
    scoreDisplay.textContent = `Mineraux : ${points}`;
    maxPointsAtteints = Math.max(maxPointsAtteints, points);
    updateShop();
    updateObjectives();
    updateShopSections();
}

cookie.addEventListener('click', (e) => {
    points += clickMultiplier;
    maxPointsAtteints = Math.max(maxPointsAtteints, points);
    updateScore();
    shrinkCookie();
    
    const rect = cookie.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    createFloatingNumber(x, y, `+${clickMultiplier}`);
});

document.getElementById('clickUpgrade').addEventListener('click', () => {
    const item = document.getElementById('clickUpgrade');
    const cost = parseInt(item.getAttribute('data-cost'));
    const level = parseInt(item.getAttribute('data-level'));
    
    if (points >= cost) {
        points -= cost;
        item.setAttribute('data-level', level + 1);
        clickMultiplier = level + 2;
        updateScore();
    }
});

shopItems.forEach(item => {
    if (item.id !== 'clickUpgrade') {
        item.addEventListener('click', () => {
            const cost = parseInt(item.getAttribute('data-cost'));
            const level = parseInt(item.getAttribute('data-level'));

            const parentSection = item.closest('.shop-section');
            const sectionUnlocked = parentSection ? 
                maxPointsAtteints >= UNLOCK_THRESHOLDS[parentSection.id] : 
                true;
            
            if (sectionUnlocked && points >= cost) {
                points -= cost;
                item.setAttribute('data-level', level + 1);
                autoClickersBought++;
                maxAutoClickers = Math.max(maxAutoClickers, autoClickersBought);
                updateScore();
                updateObjectives();

                const effect = parseInt(item.getAttribute('data-effect'));
                setInterval(() => {
                    points += effect;
                    updateScore();
                }, 1000);
            }
        });
    }
});

updateScore();
updateObjectives();