const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset');
const playerScoreText = document.getElementById('playerScore');
const aiScoreText = document.getElementById('aiScore');
const difficultyText = document.getElementById('difficulty');
const clickSound = document.getElementById('clickSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');
const drawSound = document.getElementById('drawSound');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let playerScore = 0;
let aiScore = 0;
let timeLeft = 45; // Temps en secondes pour chaque tour
let timerInterval;
let difficultyLevel = 1; // Niveau de difficulté initial
let playerWins = 0; // Compteur de victoires du joueur
let difficultyPoints = 0; // Points pour gérer la difficulté progressive
let drawCount = 0; // Ajouter un compteur pour les matchs nuls
let isSoundPlaying = false; // Variable pour suivre si le son est en cours de lecture
let totalGameTime = 0; // Temps total de jeu en secondes

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Fonction pour jouer un son et mettre à jour l'indicateur
function playSound(sound) {
    isSoundPlaying = true;
    sound.play();
    sound.onended = () => {
        isSoundPlaying = false;
    };
}

// Ouverture des liens sociaux
document.getElementById('socialButton').addEventListener('click', function() {
    Swal.fire({
        title: 'Connectez-vous avec moi!',
        html: `
            <a href="https://github.com/NoeMarchal" target="_blank" style="color: #0ff; font-size: 1.2em; text-decoration: none;">GitHub</a><br>
            <a href="https://www.instagram.com/noe__marchal" target="_blank" style="color: #0ff; font-size: 1.2em; text-decoration: none;">Instagram</a><br>
            <a href="https://fr.linkedin.com/in/no%C3%A9-marchal-21221a27b" target="_blank" style="color: #0ff; font-size: 1.2em; text-decoration: none;">LinkedIn</a>
        `,
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#0ff',
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#0ff',
        customClass: {
            popup: 'custom-swal-popup'
        }
    });
});

// Ajouter un écouteur d'événements pour le bouton Statistiques
document.getElementById('statsButton').addEventListener('click', showStats);

// Fonction pour afficher les statistiques
function showStats() {
    const totalGames = playerScore + aiScore + drawCount; // Total des parties jouées
    const winPercentage = totalGames === 0 ? 0 : Math.round((playerScore / totalGames) * 100); // Pourcentage de parties gagnées (arrondi)
    const losePercentage = totalGames === 0 ? 0 : Math.round((aiScore / totalGames) * 100); // Pourcentage de parties perdues (arrondi)

    Swal.fire({
        title: 'Statistiques du Joueur',
        html: `
            <p>Nombre total de matchs joués: ${totalGames}</p>
            <p>Parties gagnées: ${playerScore}</p>
            <p>Parties perdues: ${aiScore}</p>
            <p>Matchs nuls: ${drawCount}</p>
            <p>Pourcentage de parties gagnées: ${winPercentage}%</p>
            <p>Pourcentage de parties perdues: ${losePercentage}%</p>
            <p>Temps de jeu total: ${formatTime(totalGameTime)}</p>
        `,
        background: 'rgba(0, 0, 0, 0.9)',
        color: '#0ff',
        confirmButtonText: 'Fermer',
        confirmButtonColor: '#0ff',
        customClass: {
            popup: 'custom-swal-popup'
        }
    });
}

// Changement de thème
document.getElementById('toggleTheme').addEventListener('click', function() {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
});

function startTimer() {
    timeLeft = 45; // Réinitialiser le temps pour chaque tour
    timerInterval = setInterval(() => {
        timeLeft--;
        totalGameTime++; // Ajouter 1 seconde au temps total de jeu
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endTurn();
        }
    }, 1000);
}

function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Mettre à jour le temps total de jeu toutes les secondes
setInterval(() => {
    if (gameActive) { // Mettre à jour uniquement si le jeu est actif
        totalGameTime++; // Incrémenter le temps total
    }
}, 1000);

// Arrêter le timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Gestion du tour de jeu
function endTurn() {
    if (currentPlayer === "X") {
        statusText.textContent = "Temps écoulé ! L'IA joue.";
        robotMove();
    } else if (currentPlayer === "O") {
        statusText.textContent = "Temps écoulé ! Le joueur doit jouer.";
    }
    gameActive = false;
}

// Gestion de chaque clic sur les cases
function handleClick(e) {
    if (!gameActive || isSoundPlaying) return; // Empêcher le joueur de jouer si le son est en cours

    const index = e.target.dataset.index;
    if (board[index] !== "" || !gameActive) return;

    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;

    // Jouer le son du clic
    playSound(clickSound);

    if (checkWinner(currentPlayer)) return;

    stopTimer();
    currentPlayer = "O"; // Tour de l'IA
    setTimeout(robotMove, 1500);
    startTimer(); // Relancer le timer pour l'IA
}

// Mouvement de l'IA
function robotMove() {
    if (!gameActive) return;

    let availableCells = board
        .map((val, idx) => val === "" ? idx : null)
        .filter(v => v !== null);

    if (availableCells.length === 0) return;

    let move;
    if (difficultyLevel === 1) {
        // Niveau 1 : Mouvement aléatoire
        move = availableCells[Math.floor(Math.random() * availableCells.length)];
    } else if (difficultyLevel === 2) {
        // Niveau 2 : 50% de chance de faire un mouvement intelligent, sinon aléatoire
        if (Math.random() < 0.5) {
            move = getWinningMove("O") || getWinningMove("X") || availableCells[Math.floor(Math.random() * availableCells.length)];
        } else {
            move = availableCells[Math.floor(Math.random() * availableCells.length)];
        }
    } else if (difficultyLevel === 3) {
        // Niveau 3 : Utilise un algorithme plus avancé (minimax simplifié)
        move = getBestMove();
    }

    // Jouer le son du clic
    playSound(clickSound);
    
    board[move] = "O";
    cells[move].textContent = "O";

    checkWinner("O");
    currentPlayer = "X"; // Tour du joueur
    stopTimer(); // Arrêter le timer de l'IA
    startTimer(); // Relancer le timer pour le joueur
}

// Vérification des conditions de victoire
function checkWinner(player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            cells[a].classList.add('winner-cell');
            cells[b].classList.add('winner-cell');
            cells[c].classList.add('winner-cell');

            gameActive = false;
            statusText.textContent = `${player} a gagné !`;

            if (player === "X") {
                winSound.play();
            } else if (player === "O") {
                loseSound.play();
            }

            updateScore(player);
            return true;
        }
    }

    if (!board.includes("")) {
        gameActive = false;
        statusText.textContent = "Match nul !";
        drawSound.play();
        drawCount++; // Incrémenter le compteur de matchs nuls
    }
    return false;
}


// Mise à jour du score et de la difficulté
function updateScore(winner) {
    if (winner === "X") {
        playerScore++;
        playerScoreText.textContent = playerScore;
        difficultyPoints += 1; // Ajouter un point de difficulté

        // Augmenter la difficulté après un certain nombre de points
        if (difficultyPoints >= 2) { // Augmenter la difficulté après 2 points
            increaseDifficulty();
            difficultyPoints = 0; // Réinitialiser les points
        }
    } else if (winner === "O") {
        aiScore++;
        aiScoreText.textContent = aiScore;
        difficultyPoints = Math.max(0, difficultyPoints - 1); // Réduire les points si l'IA gagne
        decreaseDifficulty(); // Réduire la difficulté si l'IA gagne
    }
}

resetButton.addEventListener('click', () => {
    board.fill("");
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('winner-cell'); // Retirer la surbrillance
    });
    gameActive = true;
    currentPlayer = "X";
    statusText.textContent = "";
    stopTimer();
    startTimer();
});

// Augmenter la difficulté
function increaseDifficulty() {
    if (difficultyLevel < 3) { // Supposons que nous avons 3 niveaux de difficulté
        difficultyLevel++;
        updateDifficultyDisplay();
        statusText.textContent = `Niveau de difficulté augmenté : Niveau ${difficultyLevel}`;
    }
}

// Réduire la difficulté
function decreaseDifficulty() {
    if (difficultyLevel > 1) {
        difficultyLevel--;
        updateDifficultyDisplay();
        statusText.textContent = `Niveau de difficulté réduit : Niveau ${difficultyLevel}`;
    }
}

// Afficher le niveau de difficulté
function updateDifficultyDisplay() {
    difficultyText.textContent = `Difficulté : Niveau ${difficultyLevel}`;
}

// Fonction pour obtenir un mouvement gagnant ou bloquant
function getWinningMove(player) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] === player && board[b] === player && board[c] === "") return c;
        if (board[a] === player && board[c] === player && board[b] === "") return b;
        if (board[b] === player && board[c] === player && board[a] === "") return a;
    }
    return null;
}

// Fonction pour obtenir le meilleur mouvement (minimax simplifié)
function getBestMove() {
    let bestScore = -Infinity;
    let move;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === "") {
            board[i] = "O";
            let score = minimax(board, 0, false);
            board[i] = "";
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    return move;
}

// Algorithme Minimax simplifié
function minimax(board, depth, isMaximizing) {
    const scores = {
        "O": 1,
        "X": -1,
        "tie": 0
    };

    let result = checkWinnerMinimax(board);
    if (result !== null) {
        return scores[result];
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "O";
                let score = minimax(board, depth + 1, false);
                board[i] = "";
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === "") {
                board[i] = "X";
                let score = minimax(board, depth + 1, true);
                board[i] = "";
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Vérification des conditions de victoire pour Minimax
function checkWinnerMinimax(board) {
    for (let condition of winningConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (!board.includes("")) return "tie";
    return null;
}

// Démarrer le timer dès le début du jeu
startTimer();

// Écouteurs d'événements pour les cases
cells.forEach(cell => cell.addEventListener('click', handleClick));

// Initialiser l'affichage de la difficulté
updateDifficultyDisplay();