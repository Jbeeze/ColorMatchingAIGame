let targetColor, hearts, score, highScore = 0;
let timer;
let timeLeft;
let difficultyThreshold = 0.75;
let isPaused = false;
let currentDifficulty = 'Easy';

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the start screen and animated background
    createColorSquares();
    requestAnimationFrame(animateColorSquares);

    // Hide game container and game over screen initially
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-over').style.display = 'none';

    // Initialize high score display
    updateHighScoreDisplay();

    // Add event listeners
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('easy').addEventListener('click', () => setDifficulty('easy'));
    document.getElementById('medium').addEventListener('click', () => setDifficulty('medium'));
    document.getElementById('hard').addEventListener('click', () => setDifficulty('hard'));
    document.getElementById('very-hard').addEventListener('click', () => setDifficulty('very-hard'));
    document.getElementById('submit-guess').addEventListener('click', submitGuess);
    document.getElementById('restart').addEventListener('click', restartGame);
    document.getElementById('pause-game').addEventListener('click', pauseGame);
    document.getElementById('resume-game').addEventListener('click', resumeGame);
    document.getElementById('back-to-menu').addEventListener('click', showConfirmModal);
    document.getElementById('confirm-yes').addEventListener('click', backToMainMenu);
    document.getElementById('confirm-cancel').addEventListener('click', hideConfirmModal);
    document.getElementById('back-to-start').addEventListener('click', backToStart);

    // Add event listeners for updating color input values
    document.getElementById('red').addEventListener('input', updateColorInputs);
    document.getElementById('green').addEventListener('input', updateColorInputs);
    document.getElementById('blue').addEventListener('input', updateColorInputs);

    // Add event listeners for updating color inputs and guess color
    document.getElementById('red').addEventListener('input', updateGuessColor);
    document.getElementById('green').addEventListener('input', updateGuessColor);
    document.getElementById('blue').addEventListener('input', updateGuessColor);
});

function startGame() {
    const startScreen = document.getElementById('start-screen');
    const difficultyScreen = document.getElementById('difficulty-screen');

    if (startScreen && difficultyScreen) {
        startScreen.style.display = 'none';
        difficultyScreen.style.display = 'flex';
    } else {
        console.error('Start screen or difficulty screen not found');
    }
}

function setDifficulty(difficulty) {
    currentDifficulty = difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
    switch (difficulty) {
        case 'easy':
            difficultyThreshold = 0.75;
            break;
        case 'medium':
            difficultyThreshold = 0.80;
            break;
        case 'hard':
            difficultyThreshold = 0.85;
            break;
        case 'very-hard':
            difficultyThreshold = 0.90;
            break;
    }
    startGameWithDifficulty();
}

function startGameWithDifficulty() {
    const difficultyScreen = document.getElementById('difficulty-screen');
    const gameContainer = document.getElementById('game-container');

    if (difficultyScreen && gameContainer) {
        difficultyScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        initGame();
    } else {
        console.error('Difficulty screen or game container not found');
    }
}

function initGame() {
    hearts = 5;
    score = 0;
    timeLeft = 60; // Start with 60 seconds
    updateHearts();
    updateScore();
    updateTimer();
    startTimer();
    newRound();
}

function newRound() {
    targetColor = generateRandomColor();
    const targetColorElement = document.getElementById('target-color');
    targetColorElement.style.backgroundColor = targetColor;
    targetColorElement.style.display = 'block';

    // Reset the sliders to 0
    document.getElementById('red').value = 0;
    document.getElementById('green').value = 0;
    document.getElementById('blue').value = 0;

    updateGuessColor();
    updateColorInputs();
    document.getElementById('guess-result').textContent = '';
    
    // Start the timer for the new round
    startTimer();
}

function generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r}, ${g}, ${b})`;
}

function updateGuessColor() {
    const r = document.getElementById('red').value;
    const g = document.getElementById('green').value;
    const b = document.getElementById('blue').value;
    document.getElementById('guess-color').style.backgroundColor = `rgb(${r},${g},${b})`;
    updateColorInputs(); // Update the displayed values
}

function updateHearts() {
    document.getElementById('hearts').textContent = '❤️'.repeat(hearts);
}

function updateScore() {
    document.getElementById('score-value').textContent = score;
}

function calculateAccuracy(guess, target) {
    const guessRGB = guess.match(/\d+/g).map(Number);
    const targetRGB = target.match(/\d+/g).map(Number);
    
    const diff = guessRGB.reduce((sum, value, index) => {
        return sum + Math.abs(value - targetRGB[index]);
    }, 0);
    
    return 1 - (diff / (255 * 3));
}

function colorToRgbArray(color) {
    return color.match(/\d+/g).map(Number);
}

function submitGuess() {
    const guessColor = document.getElementById('guess-color').style.backgroundColor;
    const accuracy = calculateAccuracy(guessColor, targetColor);
    const percentage = (accuracy * 100).toFixed(2);
    
    const guessRgb = colorToRgbArray(guessColor);
    const targetRgb = colorToRgbArray(targetColor);
    
    const resultElement = document.getElementById('guess-result');
    
    // Pause the timer
    clearInterval(timer);
    
    if (accuracy >= difficultyThreshold) {
        score++;
        const addedTime = 5;
        timeLeft += addedTime; // Add 5 seconds for correct guess
        updateScore();
        updateTimer();
        resultElement.innerHTML = `
            <p><strong>${percentage}% match</strong></p>
            <p><strong>Target: RGB(${targetRgb.join(', ')})</strong></p>
            <p><strong>Guess: RGB(${guessRgb.join(', ')})</strong></p>
        `;
        showToast(`+${addedTime} seconds added!`, true);
        setTimeout(() => {
            newRound();
            startTimer(); // Resume the timer when the new round starts
        }, 3000);
    } else {
        hearts--;
        const removedTime = 5;
        timeLeft = Math.max(0, timeLeft - removedTime); // Subtract 5 seconds, but don't go below 0
        updateHearts();
        updateTimer();
        resultElement.innerHTML = `
            <p><strong>${percentage}% match</strong></p>
        `;
        showToast(`-${removedTime} seconds removed!`, false);
        if (hearts === 0 || timeLeft <= 0) {
            gameOver(); // Call gameOver immediately
        } else {
            // Resume the timer after 3 seconds if the game isn't over
            setTimeout(() => {
                startTimer();
            }, 3000);
        }
    }
}

function gameOver() {
    clearInterval(timer);
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-difficulty').textContent = currentDifficulty;
    
    if (score > highScore) {
        highScore = score;
        document.getElementById('new-high-score').style.display = 'block';
        document.getElementById('new-high-score-value').textContent = highScore;
        document.getElementById('new-high-score-difficulty').textContent = currentDifficulty;
        updateHighScoreDisplay();
    } else {
        document.getElementById('new-high-score').style.display = 'none';
    }
}

function restartGame() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    initGame();
}

function createColorSquares() {
    const container = document.getElementById('color-squares');
    const numSquares = 20;

    for (let i = 0; i < numSquares; i++) {
        const square = document.createElement('div');
        square.classList.add('color-square');
        square.style.backgroundColor = generateRandomColor();
        square.style.left = `${Math.random() * 100}%`;
        square.style.top = `${Math.random() * 100}%`;
        container.appendChild(square);
    }
}

function animateColorSquares() {
    const squares = document.querySelectorAll('.color-square');
    squares.forEach(square => {
        square.style.backgroundColor = generateRandomColor();
        square.style.left = `${Math.random() * 100}%`;
        square.style.top = `${Math.random() * 100}%`;
    });
    requestAnimationFrame(() => setTimeout(animateColorSquares, 3000));
}

function updateHighScoreDisplay() {
    const highScoreElement = document.getElementById('high-score');
    const highScoreValueElement = document.getElementById('high-score-value');
    const highScoreDifficultyElement = document.getElementById('high-score-difficulty');
    
    if (highScore > 0) {
        highScoreElement.style.display = 'block';
        highScoreValueElement.textContent = highScore;
        highScoreDifficultyElement.textContent = currentDifficulty;
    } else {
        highScoreElement.style.display = 'none';
    }
}

function updateColorInputs() {
    const r = document.getElementById('red').value;
    const g = document.getElementById('green').value;
    const b = document.getElementById('blue').value;
    document.getElementById('red-value').textContent = r;
    document.getElementById('green-value').textContent = g;
    document.getElementById('blue-value').textContent = b;
}

function pauseGame() {
    isPaused = true;
    clearInterval(timer);
    document.getElementById('pause-overlay').style.display = 'block';
    document.getElementById('pause-modal').style.display = 'block';
}

function resumeGame() {
    isPaused = false;
    startTimer();
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('pause-modal').style.display = 'none';
}

function showConfirmModal() {
    document.getElementById('pause-modal').style.display = 'none';
    document.getElementById('confirm-modal').style.display = 'block';
}

function hideConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
    document.getElementById('pause-modal').style.display = 'block';
}

function backToMainMenu() {
    isPaused = false;
    document.getElementById('pause-overlay').style.display = 'none';
    document.getElementById('confirm-modal').style.display = 'none';
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    
    // Reset game state
    clearInterval(timer);
    updateHighScoreDisplay();
    
    // Reset color squares
    const colorSquares = document.getElementById('color-squares');
    colorSquares.innerHTML = '';
    createColorSquares();
    requestAnimationFrame(animateColorSquares);
}

function updateTimer() {
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

function startTimer() {
    clearInterval(timer); // Clear any existing timer
    timer = setInterval(() => {
        if (!isPaused) {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0) {
                clearInterval(timer);
                gameOver();
            }
        }
    }, 1000);
}

// Add this function at the end of the file
function showToast(message, isSuccess = true) {
    const toast = document.createElement('div');
    toast.className = `toast ${isSuccess ? 'success' : 'error'}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }, 100);
}

function backToStart() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('start-screen').style.display = 'flex';
    updateHighScoreDisplay();
}
