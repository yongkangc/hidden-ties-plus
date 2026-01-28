// Home page functionality
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('gameForm');
    const startBtn = document.getElementById('startBtn');
    const packCheckboxes = document.querySelectorAll('.pack-checkbox');
    
    // Update start button state based on pack selection
    function updateStartButton() {
        const selectedPacks = document.querySelectorAll('.pack-checkbox:checked');
        const isEnabled = selectedPacks.length > 0;
        
        startBtn.disabled = !isEnabled;
        
        if (isEnabled) {
            const packNames = Array.from(selectedPacks).map(cb => {
                const card = cb.closest('.pack-card');
                return card.querySelector('.pack-name').textContent;
            });
            
            if (packNames.length === 1) {
                startBtn.querySelector('.btn-text').textContent = `Play ${packNames[0]}`;
            } else {
                startBtn.querySelector('.btn-text').textContent = `Play with ${packNames.length} decks`;
            }
        } else {
            startBtn.querySelector('.btn-text').textContent = 'Select at least one deck to start';
        }
    }
    
    // Add click handlers to pack cards
    packCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateStartButton);
    });
    
    // Initialize button state
    updateStartButton();
    
    // Floating hearts animation
    createFloatingHearts();
});

// Create floating hearts background
function createFloatingHearts() {
    const container = document.querySelector('.floating-hearts');
    if (!container) return;
    
    const hearts = ['💕', '💗', '💖', '💝', '✨', '💫'];
    const numHearts = 15;
    
    for (let i = 0; i < numHearts; i++) {
        const heart = document.createElement('span');
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.cssText = `
            position: absolute;
            font-size: ${Math.random() * 20 + 10}px;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            opacity: ${Math.random() * 0.3 + 0.1};
            animation: float ${Math.random() * 10 + 10}s infinite ease-in-out;
            animation-delay: ${Math.random() * 5}s;
        `;
        container.appendChild(heart);
    }
    
    // Add float animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% {
                transform: translateY(0) rotate(0deg);
            }
            50% {
                transform: translateY(-30px) rotate(10deg);
            }
        }
    `;
    document.head.appendChild(style);
}
