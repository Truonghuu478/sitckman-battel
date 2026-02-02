class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = 800;
        this.height = 500;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.gameOver = false;
        
        // Ground level
        this.groundY = this.height - 50;
        
        // Input handler
        this.inputHandler = new InputHandler();
        
        // Particle system
        this.particleSystem = new ParticleSystem();
        this.shockwaves = [];
        
        // Players
        this.player1 = new Player(
            150, 
            this.groundY - 80, 
            '#ff4444',
            this.inputHandler.getPlayer1Controls()
        );
        
        this.player2 = new Player(
            this.width - 150, 
            this.groundY - 80, 
            '#4444ff',
            this.inputHandler.getPlayer2Controls()
        );
        
        // Timer
        this.timeLimit = 99;
        this.timeRemaining = this.timeLimit;
        this.lastSecond = Date.now();
        
        // Camera shake
        this.shakeAmount = 0;
        this.shakeDecay = 0.9;
        
        // Track previous states for effects
        this.player1WasGrounded = true;
        this.player2WasGrounded = true;
        
        // Performance tracking
        this.lastFrameTime = Date.now();
        this.fps = 60;
    }
    
    start() {
        this.isRunning = true;
        this.gameOver = false;
        this.reset();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    reset() {
        // Reset players
        this.player1 = new Player(
            150, 
            this.groundY - 80, 
            '#ff4444',
            this.inputHandler.getPlayer1Controls()
        );
        
        this.player2 = new Player(
            this.width - 150, 
            this.groundY - 80, 
            '#4444ff',
            this.inputHandler.getPlayer2Controls()
        );
        
        // Reset timer
        this.timeRemaining = this.timeLimit;
        this.lastSecond = Date.now();
        
        // Clear effects
        this.particleSystem.clear();
        this.shockwaves = [];
        this.shakeAmount = 0;
        
        // Reset tracking states
        this.player1WasGrounded = true;
        this.player2WasGrounded = true;
        
        // Update UI
        this.updateHealthBars();
        this.updateTimer();
    }
    
    gameLoop() {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const now = Date.now();
        const deltaTime = now - this.lastFrameTime;
        this.lastFrameTime = now;
        this.fps = Math.round(1000 / deltaTime);
        
        // Update game
        this.update();
        
        // Draw game
        this.draw();
        
        // Continue loop
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.isPaused || this.gameOver) return;
        
        // Store previous grounded states
        this.player1WasGrounded = this.player1.isGrounded;
        this.player2WasGrounded = this.player2.isGrounded;
        
        // Handle input
        this.inputHandler.handlePlayerInput(this.player1, this.player1.controls);
        this.inputHandler.handlePlayerInput(this.player2, this.player2.controls);
        
        // Update players
        const player1HadHitbox = this.player1.hitbox !== null;
        const player2HadHitbox = this.player2.hitbox !== null;
        
        this.player1.update(this.groundY, this.player2);
        this.player2.update(this.groundY, this.player1);
        
        // Check if attacks just created hitboxes (for effects)
        if (this.player1.hitbox && !player1HadHitbox) {
            // Player 1 started attack
            if (this.player1.checkHit(this.player2)) {
                this.onHitLanded(this.player1, this.player2);
            }
        }
        
        if (this.player2.hitbox && !player2HadHitbox) {
            // Player 2 started attack
            if (this.player2.checkHit(this.player1)) {
                this.onHitLanded(this.player2, this.player1);
            }
        }
        
        // Keep players in bounds
        this.player1.x = Math.max(0, Math.min(this.width - this.player1.width, this.player1.x));
        this.player2.x = Math.max(0, Math.min(this.width - this.player2.width, this.player2.x));
        
        // Generate movement effects
        this.generateMovementEffects();
        
        // Update effects
        this.particleSystem.update();
        
        for (let i = this.shockwaves.length - 1; i >= 0; i--) {
            this.shockwaves[i].update();
            if (this.shockwaves[i].isDead()) {
                this.shockwaves.splice(i, 1);
            }
        }
        
        // Update camera shake
        this.shakeAmount *= this.shakeDecay;
        if (this.shakeAmount < 0.5) this.shakeAmount = 0;
        
        // Update timer
        if (Date.now() - this.lastSecond >= 1000) {
            this.timeRemaining--;
            this.lastSecond = Date.now();
            this.updateTimer();
            
            if (this.timeRemaining <= 0) {
                this.endGame();
            }
        }
        
        // Update health bars
        this.updateHealthBars();
        
        // Check for knockout
        if (this.player1.health <= 0 || this.player2.health <= 0) {
            this.endGame();
        }
    }
    
    generateMovementEffects() {
        // Jump dust
        if (!this.player1WasGrounded && this.player1.isGrounded) {
            this.particleSystem.createLandDust(
                this.player1.x + this.player1.width / 2,
                this.player1.y + this.player1.height
            );
        }
        
        if (!this.player2WasGrounded && this.player2.isGrounded) {
            this.particleSystem.createLandDust(
                this.player2.x + this.player2.width / 2,
                this.player2.y + this.player2.height
            );
        }
        
        // Running dust
        if (Math.abs(this.player1.velocityX) > 3 && this.player1.isGrounded && !this.player1.isAttacking) {
            if (Math.random() < 0.3) {
                this.particleSystem.createDustCloud(
                    this.player1.x + this.player1.width / 2,
                    this.player1.y + this.player1.height - 5,
                    -Math.sign(this.player1.velocityX)
                );
            }
        }
        
        if (Math.abs(this.player2.velocityX) > 3 && this.player2.isGrounded && !this.player2.isAttacking) {
            if (Math.random() < 0.3) {
                this.particleSystem.createDustCloud(
                    this.player2.x + this.player2.width / 2,
                    this.player2.y + this.player2.height - 5,
                    -Math.sign(this.player2.velocityX)
                );
            }
        }
    }
    
    onHitLanded(attacker, victim) {
        // Create hit effect
        const hitX = victim.x + victim.width / 2;
        const hitY = victim.y + victim.height / 2;
        
        this.particleSystem.createHitEffect(hitX, hitY, attacker.color);
        
        // Create shockwave for powerful hits
        if (attacker.attackType === 'kick') {
            this.shockwaves.push(new Shockwave(hitX, hitY, 60));
        }
        
        // Camera shake
        this.shakeAmount = attacker.attackType === 'kick' ? 10 : 5;
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Apply camera shake
        this.ctx.save();
        if (this.shakeAmount > 0) {
            const shakeX = (Math.random() - 0.5) * this.shakeAmount;
            const shakeY = (Math.random() - 0.5) * this.shakeAmount;
            this.ctx.translate(shakeX, shakeY);
        }
        
        // Draw background
        this.drawBackground();
        
        // Draw ground
        this.drawGround();
        
        // Draw shockwaves (behind players)
        this.shockwaves.forEach(shockwave => shockwave.draw(this.ctx));
        
        // Draw particles (behind players)
        this.particleSystem.draw(this.ctx);
        
        // Draw players
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
        
        // Draw FPS (debug)
        // this.ctx.fillStyle = 'black';
        // this.ctx.font = '14px monospace';
        // this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
        
        this.ctx.restore();
    }
    
    drawBackground() {
        // Sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.groundY);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(0.5, '#b0d8f0');
        gradient.addColorStop(1, '#d0e8f7');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.groundY);
        
        // Simple clouds
        this.drawCloud(150, 80, 40);
        this.drawCloud(400, 60, 50);
        this.drawCloud(650, 100, 45);
        
        // Sun
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.beginPath();
        this.ctx.arc(700, 80, 40, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Sun glow
        const sunGradient = this.ctx.createRadialGradient(700, 80, 40, 700, 80, 80);
        sunGradient.addColorStop(0, 'rgba(255, 235, 59, 0.3)');
        sunGradient.addColorStop(1, 'rgba(255, 235, 59, 0)');
        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(700, 80, 80, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawCloud(x, y, size) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.6, y, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.2, y, size * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawGround() {
        // Ground
        const groundGradient = this.ctx.createLinearGradient(0, this.groundY, 0, this.height);
        groundGradient.addColorStop(0, '#7cb342');
        groundGradient.addColorStop(0.3, '#689f38');
        groundGradient.addColorStop(1, '#558b2f');
        this.ctx.fillStyle = groundGradient;
        this.ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);
        
        // Ground line
        this.ctx.strokeStyle = '#558b2f';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.width, this.groundY);
        this.ctx.stroke();
        
        // Grass details
        this.ctx.strokeStyle = '#8bc34a';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < this.width; i += 30) {
            const height = 5 + Math.sin(i * 0.1) * 3;
            this.ctx.beginPath();
            this.ctx.moveTo(i, this.groundY);
            this.ctx.lineTo(i - 3, this.groundY - height);
            this.ctx.moveTo(i, this.groundY);
            this.ctx.lineTo(i + 3, this.groundY - height);
            this.ctx.stroke();
        }
    }
    
    updateHealthBars() {
        const p1Health = document.getElementById('player1-health');
        const p2Health = document.getElementById('player2-health');
        
        if (p1Health) {
            const healthPercent = (this.player1.health / this.player1.maxHealth) * 100;
            p1Health.style.width = healthPercent + '%';
            
            // Change color based on health
            if (healthPercent > 50) {
                p1Health.style.background = 'linear-gradient(90deg, #00ff88 0%, #00cc44 100%)';
            } else if (healthPercent > 25) {
                p1Health.style.background = 'linear-gradient(90deg, #ffeb3b 0%, #ffc107 100%)';
            } else {
                p1Health.style.background = 'linear-gradient(90deg, #ff5252 0%, #f44336 100%)';
            }
        }
        
        if (p2Health) {
            const healthPercent = (this.player2.health / this.player2.maxHealth) * 100;
            p2Health.style.width = healthPercent + '%';
            
            // Change color based on health
            if (healthPercent > 50) {
                p2Health.style.background = 'linear-gradient(90deg, #00ff88 0%, #00cc44 100%)';
            } else if (healthPercent > 25) {
                p2Health.style.background = 'linear-gradient(90deg, #ffeb3b 0%, #ffc107 100%)';
            } else {
                p2Health.style.background = 'linear-gradient(90deg, #ff5252 0%, #f44336 100%)';
            }
        }
    }
    
    updateTimer() {
        const timerElement = document.getElementById('timer');
        if (timerElement) {
            timerElement.textContent = this.timeRemaining;
            
            // Warning color when time is low
            if (this.timeRemaining <= 10) {
                timerElement.style.color = '#ff5252';
                timerElement.style.animation = 'pulse 0.5s ease-in-out infinite';
            } else {
                timerElement.style.color = 'white';
                timerElement.style.animation = '';
            }
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        
        // Determine winner
        let winner = '';
        if (this.player1.health > this.player2.health) {
            winner = 'Player 1 Thắng!';
        } else if (this.player2.health > this.player1.health) {
            winner = 'Player 2 Thắng!';
        } else {
            winner = 'Hòa!';
        }
        
        // Show game over screen
        this.showGameOver(winner);
    }
    
    showGameOver(winner) {
        const overlay = document.getElementById('gameOverlay');
        const menu = overlay.querySelector('.menu');
        
        menu.innerHTML = `
            <h1 class="game-over-message">GAME OVER</h1>
            <div class="winner-text">${winner}</div>
            <button class="btn-start" id="restartBtn">Chơi Lại</button>
        `;
        
        overlay.classList.remove('hidden');
        
        // Setup restart button
        document.getElementById('restartBtn').addEventListener('click', () => {
            overlay.classList.add('hidden');
            this.start();
        });
    }
}