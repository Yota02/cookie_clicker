// Définir les variables maximales pour chaque objectif
let objectif1Max = 50;   // Maximum de points pour le premier objectif
let objectif2Max = 100;  // Maximum de points pour le deuxième objectif
let objectif3Max = 1;    // Maximum de clickers achetés pour le troisième objectif

let points = 0;           // Points accumulés par le joueur
let maxPointsAtteints = 0; // Suivi du maximum de points atteints
let autoClickersBought = 0; // Nombre d'auto-clickers achetés
let maxAutoClickers = 0; // Suivi du maximum de clickers achetés

// Sélection des éléments
const scoreDisplay = document.getElementById('score');
const cookie = document.getElementById('cookie');
const shopItems = document.querySelectorAll('.shop-item');

// Fonction pour mettre à jour le score
function updateScore() {
    scoreDisplay.textContent = `Mineraux : ${points}`;
    updateShop();
    updateObjectives();
}

// Fonction pour mettre à jour le magasin
function updateShop() {
    shopItems.forEach(item => {
        const baseCost = parseInt(item.getAttribute('data-base-cost'));
        const level = parseInt(item.getAttribute('data-level'));
        const cost = Math.ceil(baseCost * Math.pow(1.15, level));

        const name = item.getAttribute('data-name');
        const effect = item.getAttribute('data-effect');
        item.textContent = `${name} (${cost} points) - Ajoute ${effect} points/seconde`;

        item.setAttribute('data-cost', cost);
        if (points >= cost) {
            item.removeAttribute('disabled');
            item.style.pointerEvents = 'auto';
        } else {
            item.setAttribute('disabled', true);
            item.style.pointerEvents = 'none';
        }
    });
}

// Fonction pour gérer le clic sur le cookie
function shrinkCookie() {
    cookie.classList.add('clicked');
    setTimeout(() => {
        cookie.classList.remove('clicked');
    }, 100);
}

// Mise à jour des barres de progression des objectifs
function updateObjectives() {
    // Mise à jour des objectifs basés sur les points
    progress1.value = Math.min(maxPointsAtteints, objectif1Max); // Barre 1 : Max 50 points
    progress2.value = Math.min(maxPointsAtteints, objectif2Max); // Barre 2 : Max 100 points

    // Mise à jour de l'objectif d'achat
    progress3.value = Math.min(maxAutoClickers, objectif3Max); // Barre 3 : Max 1 achat
}

// Sélection des barres de progression
const progress1 = document.getElementById('progress1');
const progress2 = document.getElementById('progress2');
const progress3 = document.getElementById('progress3');

// Écouteur d'événement pour le clic sur le cookie
cookie.addEventListener('click', () => {
    points++;
    maxPointsAtteints = Math.max(maxPointsAtteints, points); // Suivi du maximum atteint
    updateScore();
    shrinkCookie();
});

// Écouteurs d'événements pour les achats d'auto-clickers
shopItems.forEach(item => {
    item.addEventListener('click', () => {
        const cost = parseInt(item.getAttribute('data-cost'));
        const level = parseInt(item.getAttribute('data-level'));
        if (points >= cost) {
            points -= cost;
            item.setAttribute('data-level', level + 1); // Augmenter le niveau
            autoClickersBought++;
            maxAutoClickers = Math.max(maxAutoClickers, autoClickersBought); // Suivi du maximum de clickers achetés
            updateScore();
            updateObjectives();

            const effect = parseInt(item.getAttribute('data-effect'));
            setInterval(() => {
                points += effect;
                updateScore();
            }, 1000);
        }
    });
});

// Initialisation
updateScore();
updateObjectives();
