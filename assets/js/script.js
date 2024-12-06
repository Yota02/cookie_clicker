let objectif1Max = 50;   
let objectif2Max = 100;  
let objectif3Max = 1;    

let points = 0;          
let maxPointsAtteints = 0; 
let autoClickersBought = 0; 
let maxAutoClickers = 0; 
let clickMultiplier = 1;

const scoreDisplay = document.getElementById('score');
const cookie = document.getElementById('cookie');
const shopItems = document.querySelectorAll('.shop-item');
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

function updateScore() {
    scoreDisplay.textContent = `Mineraux : ${points}`;
    updateShop();
    updateObjectives();
}

function updateShop() {
    shopItems.forEach(item => {
        const baseCost = parseInt(item.getAttribute('data-base-cost'));
        const level = parseInt(item.getAttribute('data-level'));
        const cost = Math.ceil(baseCost * Math.pow(1.15, level));
        const name = item.getAttribute('data-name');

        if (item.id === 'clickUpgrade') {
            const currentMultiplier = level + 1;
            item.textContent = `${name} (${cost} points) - Ajoute +${currentMultiplier} par click`;
        } else {
            const effect = item.getAttribute('data-effect');
            item.textContent = `${name} (${cost} points) - Ajoute ${effect} points/seconde`;
        }

        item.setAttribute('data-cost', cost);
        item.style.pointerEvents = points >= cost ? 'auto' : 'none';
        item.disabled = points < cost;
    });
}

function shrinkCookie() {
    cookie.classList.add('clicked');
    setTimeout(() => cookie.classList.remove('clicked'), 100);
}

function updateObjectives() {
    const objectives = [
        { element: progress1, maxValue: objectif1Max },
        { element: progress2, maxValue: objectif2Max },
        { element: progress3, maxValue: objectif3Max }
    ];
    
    objectives.forEach(({ element, maxValue }, index) => {
        const value = index === 2 ? maxAutoClickers : maxPointsAtteints;
        element.value = Math.min(value, maxValue);
        
        const objectiveDiv = element.parentElement;
        if (value >= maxValue && !objectiveDiv.classList.contains('completed')) {
            objectiveDiv.classList.add('completed');
            setTimeout(() => {
                objectiveDiv.style.display = 'none';
            }, 1000);
        }
    });
}

cookie.addEventListener('click', (e) => {
    points += clickMultiplier;
    maxPointsAtteints = Math.max(maxPointsAtteints, points);
    updateScore();
    shrinkCookie();
    createFloatingNumber(e.clientX, e.clientY, `+${clickMultiplier}`);
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
            if (points >= cost) {
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