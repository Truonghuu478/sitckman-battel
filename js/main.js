// Main entry point
let game;

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const startBtn = document.getElementById('startBtn');
    const overlay = document.getElementById('gameOverlay');
    
    // Initialize game
    game = new Game(canvas);
    
    // Start button handler
    startBtn.addEventListener('click', () => {
        overlay.classList.add('hidden');
        game.start();
    });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        // Keep canvas responsive
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        // Canvas size is set in Game constructor, but we could adjust here if needed
    });
    
    // Prevent context menu on canvas
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });
    
    console.log('Game initialized! Press "Bắt Đầu" to start.');
});