// Play page functionality
let currentIndex = 0;
let currentPlayer = 1;
const totalCards = questions.length;

// Confetti system
const confettiCanvas = document.getElementById('confettiCanvas');
const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let confettiParticles = [];
let confettiAnimationId = null;

function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

class ConfettiParticle {
    constructor() {
        this.x = Math.random() * confettiCanvas.width;
        this.y = -20;
        this.size = Math.random() * 8 + 4;
        this.speedY = Math.random() * 3 + 2;
        this.speedX = Math.random() * 4 - 2;
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 10 - 5;
        this.color = ['#ff6b9d', '#c44dff', '#00d4ff', '#fbbf24', '#4ade80'][Math.floor(Math.random() * 5)];
        this.opacity = 1;
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;
        this.speedY += 0.05; // gravity

        // Fade out near bottom
        if (this.y > confettiCanvas.height - 100) {
            this.opacity -= 0.02;
        }
    }

    draw() {
        confettiCtx.save();
        confettiCtx.translate(this.x, this.y);
        confettiCtx.rotate((this.rotation * Math.PI) / 180);
        confettiCtx.globalAlpha = this.opacity;
        confettiCtx.fillStyle = this.color;
        confettiCtx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.6);
        confettiCtx.restore();
    }
}

function launchConfetti() {
    if (!confettiCanvas || !confettiCtx) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    // Create initial burst
    for (let i = 0; i < 100; i++) {
        setTimeout(() => {
            confettiParticles.push(new ConfettiParticle());
        }, i * 20);
    }

    // Add more confetti over time
    let burstCount = 0;
    const burstInterval = setInterval(() => {
        for (let i = 0; i < 20; i++) {
            confettiParticles.push(new ConfettiParticle());
        }
        burstCount++;
        if (burstCount > 3) clearInterval(burstInterval);
    }, 300);

    animateConfetti();
}

function animateConfetti() {
    if (!confettiCanvas || !confettiCtx) return;

    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiParticles = confettiParticles.filter(p => p.opacity > 0 && p.y < confettiCanvas.height + 20);

    confettiParticles.forEach(p => {
        p.update();
        p.draw();
    });

    if (confettiParticles.length > 0) {
        confettiAnimationId = requestAnimationFrame(animateConfetti);
    }
}

function stopConfetti() {
    if (confettiAnimationId) {
        cancelAnimationFrame(confettiAnimationId);
        confettiAnimationId = null;
    }
    confettiParticles = [];
    if (confettiCtx && confettiCanvas) {
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

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
    
    // Remove animation classes and reset will-change
    gameCard.classList.remove('enter', 'swipe-left', 'swipe-right', 'snap-back');
    gameCard.style.willChange = 'auto';
    
    // Use rAF to batch class changes after style recalculation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            gameCard.classList.add('enter');
        });
    });
    
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
        
        gameCard.addEventListener('animationend', function onSwipeLeft(e) {
            if (e.animationName !== 'swipeLeft') return;
            gameCard.removeEventListener('animationend', onSwipeLeft);
            gameCard.style.willChange = 'auto';
            
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
        });
    } else {
        showCompleteModal();
    }
}

// Navigate to previous card
function prevCard() {
    if (currentIndex > 0) {
        gameCard.classList.add('swipe-right');
        
        gameCard.addEventListener('animationend', function onSwipeRight(e) {
            if (e.animationName !== 'swipeRight') return;
            gameCard.removeEventListener('animationend', onSwipeRight);
            gameCard.style.willChange = 'auto';
            
            currentIndex--;
            
            // Handle player rotation backwards
            if (gameMode === 'classic') {
                currentPlayer = currentPlayer === 1 ? playerCount : currentPlayer - 1;
                currentPlayerEl.textContent = currentPlayer;
            }
            
            displayCard(currentIndex);
            updateProgress();
        });
    }
}

// Skip current card (shuffle to end)
function skipCard() {
    if (totalCards > 1) {
        const skipped = questions.splice(currentIndex, 1)[0];
        questions.push(skipped);
        
        gameCard.classList.add('swipe-left');
        gameCard.addEventListener('animationend', function onSkip(e) {
            if (e.animationName !== 'swipeLeft') return;
            gameCard.removeEventListener('animationend', onSkip);
            gameCard.style.willChange = 'auto';
            displayCard(currentIndex);
        });
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
    // Dynamic celebration messages
    const messages = [
        { emoji: '🎉', title: 'Amazing Session!', subtitle: 'You really went there!' },
        { emoji: '🔥', title: 'That Got Spicy!', subtitle: 'Hope you learned something new!' },
        { emoji: '💕', title: 'Connection Made!', subtitle: 'You\'re closer than ever!' },
        { emoji: '🎊', title: 'Game Complete!', subtitle: 'What a ride!' },
    ];

    const msg = messages[Math.floor(Math.random() * messages.length)];

    const modalEmoji = completeModal.querySelector('.modal-emoji');
    const modalTitle = completeModal.querySelector('h2');

    if (modalEmoji) modalEmoji.textContent = msg.emoji;
    if (modalTitle) modalTitle.textContent = msg.title;

    completeModal.classList.add('active');
    launchConfetti();

    // Optional: haptic burst
    if (navigator.vibrate) {
        navigator.vibrate([50, 30, 50, 30, 100]);
    }
}

// Restart game
function restartGame() {
    stopConfetti();
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

// Setup swipe gestures with Tinder-grade physics
function setupSwipeGestures() {
    const cardWrapper = document.getElementById('cardWrapper');
    const swipeHintLeft = document.querySelector('.swipe-hint.left');
    const swipeHintRight = document.querySelector('.swipe-hint.right');
    
    // rAF-based drag state
    let rafId = null;
    let dragState = { x: 0, rotation: 0 };
    
    // Velocity tracking
    let lastX = 0;
    let lastTime = 0;
    let velocity = 0;
    
    // Drag state
    let startX = 0;
    let isDragging = false;
    
    const maxRotation = 15;
    const distanceThreshold = window.innerWidth * 0.2;
    const velocityThreshold = 0.5;
    
    function updateDragVisual() {
        gameCard.style.transform = `translateX(${dragState.x}px) rotate(${dragState.rotation}deg)`;
        rafId = null;
    }
    
    function updateSwipeHints(diff) {
        if (!swipeHintLeft || !swipeHintRight) return;
        const progress = Math.min(Math.abs(diff) / distanceThreshold, 1);
        if (diff < 0) {
            swipeHintLeft.classList.toggle('active', progress > 0.3);
            swipeHintRight.classList.remove('active');
        } else if (diff > 0) {
            swipeHintRight.classList.toggle('active', progress > 0.3);
            swipeHintLeft.classList.remove('active');
        } else {
            swipeHintLeft.classList.remove('active');
            swipeHintRight.classList.remove('active');
        }
    }
    
    function handleDragStart(x) {
        startX = x;
        lastX = x;
        lastTime = performance.now();
        velocity = 0;
        isDragging = true;
        cardWrapper.classList.add('dragging');
        gameCard.style.willChange = 'transform';
        gameCard.style.transition = 'none';
    }
    
    function handleDragMove(x) {
        if (!isDragging) return;
        
        const now = performance.now();
        const dt = now - lastTime;
        if (dt > 0) {
            velocity = (x - lastX) / dt;
        }
        lastX = x;
        lastTime = now;
        
        const diff = x - startX;
        dragState.x = diff;
        dragState.rotation = (diff / window.innerWidth) * maxRotation;
        
        updateSwipeHints(diff);
        
        if (!rafId) {
            rafId = requestAnimationFrame(updateDragVisual);
        }
    }
    
    function handleDragEnd(x) {
        if (!isDragging) return;
        isDragging = false;
        cardWrapper.classList.remove('dragging');
        
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        
        updateSwipeHints(0);
        
        const diff = x - startX;
        const absVelocity = Math.abs(velocity);
        const shouldSwipe = Math.abs(diff) > distanceThreshold || absVelocity > velocityThreshold;
        
        if (shouldSwipe) {
            gameCard.style.transform = '';
            gameCard.style.transition = '';
            
            if (navigator.vibrate) navigator.vibrate(15);
            
            if (diff < 0 || (absVelocity > velocityThreshold && velocity < 0)) {
                nextCard();
            } else {
                prevCard();
            }
        } else {
            // Snap back
            gameCard.classList.add('snap-back');
            gameCard.addEventListener('animationend', function onSnapEnd(e) {
                if (e.animationName === 'snapBack') {
                    gameCard.classList.remove('snap-back');
                    gameCard.style.transform = '';
                    gameCard.style.transition = '';
                    gameCard.style.willChange = 'auto';
                    gameCard.removeEventListener('animationend', onSnapEnd);
                }
            });
        }
    }
    
    // Touch events
    cardWrapper.addEventListener('touchstart', (e) => {
        handleDragStart(e.changedTouches[0].screenX);
    }, { passive: true });
    
    cardWrapper.addEventListener('touchmove', (e) => {
        handleDragMove(e.changedTouches[0].screenX);
    }, { passive: true });
    
    cardWrapper.addEventListener('touchend', (e) => {
        handleDragEnd(e.changedTouches[0].screenX);
    }, { passive: true });
    
    // Mouse events for desktop
    cardWrapper.addEventListener('mousedown', (e) => {
        handleDragStart(e.screenX);
        cardWrapper.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        handleDragMove(e.screenX);
    });
    
    document.addEventListener('mouseup', (e) => {
        if (isDragging) {
            cardWrapper.style.cursor = '';
            handleDragEnd(e.screenX);
        }
    });
}

// Make functions globally accessible
window.restartGame = restartGame;
window.closePassModal = closePassModal;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
