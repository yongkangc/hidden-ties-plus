// Play page functionality
let currentIndex = 0;
let currentPlayer = 1;
const totalCards = questions.length;

// DOM Elements
const gameCard = document.getElementById('gameCard');
const cardText = document.getElementById('cardText');
const cardPack = document.getElementById('cardPack');
const cardTypeBadge = document.getElementById('cardTypeBadge');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const playerIndicator = document.getElementById('playerIndicator');
const currentPlayerEl = document.getElementById('currentPlayer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
const completeModal = document.getElementById('completeModal');
const passModal = document.getElementById('passModal');
const nextPlayerNum = document.getElementById('nextPlayerNum');

// Initialize game
function init() {
    if (totalCards === 0) {
        cardText.textContent = 'No cards available. Please go back and select a deck.';
        return;
    }
    
    displayCard(currentIndex);
    updateProgress();
    setupEventListeners();
    setupSwipeGestures();
    
    // Hide player indicator for couples mode
    if (gameMode === 'couples' || playerCount <= 1) {
        playerIndicator.style.display = 'none';
    }
}

// Display current card
function displayCard(index) {
    const question = questions[index];
    
    // Animate card
    gameCard.classList.remove('enter', 'swipe-left', 'swipe-right');
    void gameCard.offsetWidth; // Trigger reflow
    gameCard.classList.add('enter');
    
    // Update content
    cardText.textContent = question.text;
    cardPack.textContent = question.pack;
    
    // Update type badge
    if (question.type === 'action') {
        cardTypeBadge.textContent = '🎬 Action';
        cardTypeBadge.classList.add('action');
    } else {
        cardTypeBadge.textContent = '💭 Question';
        cardTypeBadge.classList.remove('action');
    }
    
    // Update navigation buttons
    prevBtn.disabled = index === 0;
    
    // Update button text for last card
    if (index === totalCards - 1) {
        nextBtn.querySelector('.control-text').textContent = 'Finish';
    } else {
        nextBtn.querySelector('.control-text').textContent = 'Next';
    }
}

// Update progress bar
function updateProgress() {
    const progress = ((currentIndex + 1) / totalCards) * 100;
    progressFill.style.width = `${progress}%`;
    progressText.textContent = `${currentIndex + 1} / ${totalCards}`;
}

// Navigate to next card
function nextCard() {
    if (currentIndex < totalCards - 1) {
        gameCard.classList.add('swipe-left');
        
        setTimeout(() => {
            currentIndex++;
            
            // Handle player rotation based on game mode
            if (gameMode === 'classic' || gameMode === 'wild') {
                if (gameMode === 'wild') {
                    currentPlayer = Math.floor(Math.random() * playerCount) + 1;
                } else {
                    currentPlayer = (currentPlayer % playerCount) + 1;
                }
                currentPlayerEl.textContent = currentPlayer;
                
                // Show pass modal for multiplayer
                if (playerCount > 1 && gameMode === 'classic') {
                    showPassModal();
                    return;
                }
            }
            
            displayCard(currentIndex);
            updateProgress();
        }, 200);
    } else {
        showCompleteModal();
    }
}

// Navigate to previous card
function prevCard() {
    if (currentIndex > 0) {
        gameCard.classList.add('swipe-right');
        
        setTimeout(() => {
            currentIndex--;
            
            // Handle player rotation backwards
            if (gameMode === 'classic') {
                currentPlayer = currentPlayer === 1 ? playerCount : currentPlayer - 1;
                currentPlayerEl.textContent = currentPlayer;
            }
            
            displayCard(currentIndex);
            updateProgress();
        }, 200);
    }
}

// Skip current card (shuffle to end)
function skipCard() {
    if (totalCards > 1) {
        const skipped = questions.splice(currentIndex, 1)[0];
        questions.push(skipped);
        
        gameCard.classList.add('swipe-left');
        setTimeout(() => {
            displayCard(currentIndex);
        }, 200);
    }
}

// Show pass modal
function showPassModal() {
    nextPlayerNum.textContent = currentPlayer;
    passModal.classList.add('active');
}

// Close pass modal
function closePassModal() {
    passModal.classList.remove('active');
    displayCard(currentIndex);
    updateProgress();
}

// Show complete modal
function showCompleteModal() {
    completeModal.classList.add('active');
}

// Restart game
function restartGame() {
    completeModal.classList.remove('active');
    currentIndex = 0;
    currentPlayer = 1;
    currentPlayerEl.textContent = currentPlayer;
    
    // Reshuffle questions
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
    
    displayCard(currentIndex);
    updateProgress();
}

// Setup event listeners
function setupEventListeners() {
    nextBtn.addEventListener('click', nextCard);
    prevBtn.addEventListener('click', prevCard);
    skipBtn.addEventListener('click', skipCard);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (passModal.classList.contains('active') || completeModal.classList.contains('active')) {
            if (e.key === 'Enter' || e.key === ' ') {
                if (passModal.classList.contains('active')) {
                    closePassModal();
                } else {
                    restartGame();
                }
            }
            return;
        }
        
        switch (e.key) {
            case 'ArrowRight':
            case ' ':
                nextCard();
                break;
            case 'ArrowLeft':
                prevCard();
                break;
            case 's':
            case 'S':
                skipCard();
                break;
            case 'Escape':
                window.location.href = '/';
                break;
        }
    });
}

// Setup swipe gestures
function setupSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    
    const cardWrapper = document.getElementById('cardWrapper');
    
    cardWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isDragging = true;
    }, { passive: true });
    
    cardWrapper.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        const currentX = e.changedTouches[0].screenX;
        const diff = currentX - touchStartX;
        const maxRotation = 15;
        const rotation = (diff / window.innerWidth) * maxRotation;
        
        gameCard.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
        gameCard.style.transition = 'none';
    }, { passive: true });
    
    cardWrapper.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        isDragging = false;
        
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        
        gameCard.style.transform = '';
        gameCard.style.transition = '';
        
        const threshold = window.innerWidth * 0.2;
        
        if (diff < -threshold) {
            nextCard();
        } else if (diff > threshold) {
            prevCard();
        }
    }, { passive: true });
    
    // Mouse drag for desktop
    let mouseStartX = 0;
    let isMouseDragging = false;
    
    cardWrapper.addEventListener('mousedown', (e) => {
        mouseStartX = e.screenX;
        isMouseDragging = true;
        cardWrapper.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isMouseDragging) return;
        
        const diff = e.screenX - mouseStartX;
        const maxRotation = 15;
        const rotation = (diff / window.innerWidth) * maxRotation;
        
        gameCard.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
        gameCard.style.transition = 'none';
    });
    
    document.addEventListener('mouseup', (e) => {
        if (!isMouseDragging) return;
        isMouseDragging = false;
        cardWrapper.style.cursor = '';
        
        const diff = e.screenX - mouseStartX;
        
        gameCard.style.transform = '';
        gameCard.style.transition = '';
        
        const threshold = window.innerWidth * 0.15;
        
        if (diff < -threshold) {
            nextCard();
        } else if (diff > threshold) {
            prevCard();
        }
    });
}

// Make functions globally accessible
window.restartGame = restartGame;
window.closePassModal = closePassModal;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
