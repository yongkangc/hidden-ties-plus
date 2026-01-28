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
    
    // Session summary update
    function updateSessionSummary() {
        const selectedPacks = document.querySelectorAll('.pack-checkbox:checked');
        const cardsPerPlayer = parseInt(document.querySelector('input[name="cards_per_player"]:checked').value);
        const playerCount = parseInt(document.querySelector('input[name="player_count"]:checked').value);
        
        const deckNames = [];
        let totalCards = 0;
        
        selectedPacks.forEach(cb => {
            const card = cb.closest('.pack-card');
            deckNames.push(card.querySelector('.pack-name').textContent);
            const countText = card.querySelector('.card-count').textContent;
            totalCards += parseInt(countText);
        });
        
        const actualCards = Math.min(cardsPerPlayer * playerCount, totalCards);
        const estMinutes = Math.round(actualCards * 0.5); // ~30 sec per card
        
        document.getElementById('summaryDecks').textContent = deckNames.length > 0 
            ? (deckNames.length === 1 ? deckNames[0] : `${deckNames.length} decks`)
            : 'None selected';
        document.getElementById('summaryCards').textContent = actualCards > 0 ? actualCards : '0';
        document.getElementById('summaryTime').textContent = `~${estMinutes} min`;
    }
    
    // Quick start buttons
    document.querySelectorAll('.quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cards = btn.dataset.cards;
            // Select the matching cards per player option
            document.querySelector(`input[name="cards_per_player"][value="${cards}"]`).checked = true;
            // Open advanced settings to show selection
            document.getElementById('advancedContent').classList.add('open');
            document.getElementById('advancedToggle').classList.add('open');
            updateSessionSummary();
        });
    });
    
    // Advanced settings toggle
    document.getElementById('advancedToggle').addEventListener('click', () => {
        document.getElementById('advancedContent').classList.toggle('open');
        document.getElementById('advancedToggle').classList.toggle('open');
    });
    
    // Add click handlers to pack cards
    packCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateStartButton();
            updateSessionSummary();
        });
    });
    
    // Update summary on player count and cards per player changes
    document.querySelectorAll('input[name="player_count"], input[name="cards_per_player"]').forEach(input => {
        input.addEventListener('change', updateSessionSummary);
    });
    
    // Initialize
    updateStartButton();
    updateSessionSummary();
    
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
