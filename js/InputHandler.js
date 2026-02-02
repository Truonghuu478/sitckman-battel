class InputHandler {
    constructor() {
        this.keys = {};
        this.prevKeys = {}; // Track previous frame keys
        this.setupEventListeners();
        
        // Player 1 controls (WASD + FG + R for stone, Shift for dash)
        this.player1Controls = {
            up: 'w',
            down: 's',
            left: 'a',
            right: 'd',
            punch: 'f',
            kick: 'g',
            stone: 'r',
            dash: 'Shift',
            isPlayer1: true
        };
        
        // Player 2 controls (Arrow keys + 1/2 + 3 for stone, Enter for dash)
        this.player2Controls = {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight',
            punch: '1',
            kick: '2',
            stone: '3',
            dash: 'Enter',
            isPlayer1: false
        };
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Prevent default behavior for arrow keys and space
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // Handle losing focus
        window.addEventListener('blur', () => {
            this.keys = {};
        });
    }
    
    isKeyPressed(key) {
        return this.keys[key] || false;
    }
    
    handlePlayerInput(player, controls) {
        // Reset velocityX if no horizontal input
        let hasHorizontalInput = false;
        
        // Movement
        if (this.isKeyPressed(controls.left)) {
            player.moveLeft();
            hasHorizontalInput = true;
        }
        
        if (this.isKeyPressed(controls.right)) {
            player.moveRight();
            hasHorizontalInput = true;
        }
        
        if (!hasHorizontalInput && player.isGrounded && !player.isAttacking) {
            player.velocityX *= 0.7;
        }
        
        // Jump
        if (this.isKeyPressed(controls.up)) {
            player.jump();
        }
        
        // Crouch
        if (this.isKeyPressed(controls.down)) {
            player.crouch();
        } else {
            player.standUp();
        }
        
        // Attacks (only register on key press, not hold)
        if (this.isKeyPressed(controls.punch) && !this.wasKeyPressed(controls.punch)) {
            player.punch();
        }
        
        if (this.isKeyPressed(controls.kick) && !this.wasKeyPressed(controls.kick)) {
            player.kick();
        }
        
        // NEW: Throw stone
        if (this.isKeyPressed(controls.stone) && !this.wasKeyPressed(controls.stone)) {
            player.throwStone();
        }
        
        // NEW: Dash
        if (this.isKeyPressed(controls.dash) && !this.wasKeyPressed(controls.dash)) {
            player.dash();
        }
        
        // Update previous keys state
        this.updatePrevKeys();
    }
    
    wasKeyPressed(key) {
        return this.prevKeys[key] || false;
    }
    
    updatePrevKeys() {
        this.prevKeys = { ...this.keys };
    }
    
    getPlayer1Controls() {
        return this.player1Controls;
    }
    
    getPlayer2Controls() {
        return this.player2Controls;
    }
    
    reset() {
        this.keys = {};
    }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputHandler;
}