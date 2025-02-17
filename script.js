const cells = document.querySelectorAll('.cell');
const statusText = document.getElementById('status');
const resetButton = document.getElementById('reset');
const playerScoreText = document.getElementById('playerScore');
const aiScoreText = document.getElementById('aiScore');

let board = ["", "", "", "", "", "", "", "", ""];
let currentPlayer = "X";
let gameActive = true;
let playerScore = 0;
let aiScore = 0;
let timeLeft = 30; // secondes
let timerInterval;

const winningConditions = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// Fonction de démarrage du timer
function startTimer() {
    timeLeft = 30;
    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endTurn();
        }
    }, 1000);
}

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
    if (!gameActive) return;
    
    const index = e.target.dataset.index;
    if (board[index] !== "" || !gameActive) return;

    board[index] = currentPlayer;
    e.target.textContent = currentPlayer;
    clickSound.play();
    
    if (checkWinner(currentPlayer)) return;

    stopTimer();
    currentPlayer = "O"; // Tour de l'IA
    setTimeout(robotMove, 500);
    startTimer(); // Relancer le timer pour l'IA
}

// Mouvement de l'IA
function robotMove() {
    if (!gameActive) return;

    let availableCells = board
        .map((val, idx) => val === "" ? idx : null)
        .filter(v => v !== null);

    if (availableCells.length === 0) return;

    let randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    board[randomIndex] = "O";
    cells[randomIndex].textContent = "O";
    clickSound.play();

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
            gameActive = false;
            statusText.textContent = `${player} a gagné !`;
            updateScore(player);
            return true;
        }
    }

    if (!board.includes("")) {
        gameActive = false;
        statusText.textContent = "Match nul !";
    }
    return false;
}

// Mise à jour du score
function updateScore(winner) {
    if (winner === "X") {
        playerScore++;
        playerScoreText.textContent = playerScore;
    } else if (winner === "O") {
        aiScore++;
        aiScoreText.textContent = aiScore;
    }
}

// Réinitialisation du jeu
resetButton.addEventListener('click', () => {
    board.fill("");
    cells.forEach(cell => cell.textContent = "");
    gameActive = true;
    currentPlayer = "X";
    statusText.textContent = "";
    stopTimer();
    startTimer(); // Relancer le timer dès le début
});

// Changement de thème
document.getElementById('toggleTheme').addEventListener('click', function() {
    document.body.classList.toggle('dark');
    document.body.classList.toggle('light');
});

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

// Démarrer le timer dès le début du jeu
startTimer();

// Écouteurs d'événements pour les cases
cells.forEach(cell => cell.addEventListener('click', handleClick));