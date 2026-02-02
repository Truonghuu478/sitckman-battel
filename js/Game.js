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
        this.gameMode = null; // 'campaign' or 'vs'
        
        // Ground level
        this.groundY = this.height - 50;
        
        // Input handler
        this.inputHandler = new InputHandler();
        
        // Particle system
        this.particleSystem = new ParticleSystem();
        this.shockwaves = [];
        
        // Campaign manager
        this.campaignManager = new CampaignManager();
        this.aiController = null;
        
        // UI Manager (NEW)
        this.uiManager = new UIManager();
        
        // Players
        this.player1 = null;
        this.player2 = null;
        
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
        
        // Combat stats for victory screen
        this.combatStats = {
            totalDamage: 0,
            maxCombo: 0,
            currentCombo: 0
        };
        
        // NEW: Slow-motion effect for combo
        this.slowMotion = 1.0; // 1.0 = normal, 0.3 = slow
        this.slowMotionDuration = 0;
        
        // NEW: Power-ups system
        this.powerUps = [];
        this.powerUpSpawnTimer = 0;
        this.powerUpSpawnInterval = 600; // 10 seconds
    }
    
    startCampaign() {
        this.gameMode = 'campaign';
        const stage = this.campaignManager.getCurrentStage();
        
        // Create player 1 with upgrades
        this.player1 = new Player(
            150, 
            this.groundY - 80, 
            '#ff4444',
            this.inputHandler.getPlayer1Controls()
        );
        this.campaignManager.applyUpgradesToPlayer(this.player1);
        
        // Create AI opponent
        this.player2 = new Player(
            this.width - 150, 
            this.groundY - 80, 
            stage.opponent.color,
            this.inputHandler.getPlayer2Controls()
        );
        
        // Set opponent health
        if (stage.opponent.health) {
            this.player2.maxHealth = stage.opponent.health;
            this.player2.health = stage.opponent.health;
        }
        
        // Create AI controller
        this.aiController = new AIController(this.player2, this.player1, stage.opponent.difficulty);
        
        this.start();
    }
    
    startVsMode() {
        this.gameMode = 'vs';
        this.aiController = null;
        
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
        
        this.start();
    }
    
    start() {
        this.isRunning = true;
        this.gameOver = false;
        this.resetTimers();
        this.gameLoop();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    resetTimers() {
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
        this.updateCoins();
    }
    
    reset() {
        // Reset players based on mode
        if (this.gameMode === 'campaign') {
            this.startCampaign();
        } else {
            this.startVsMode();
        }
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
        
        // NEW: Update slow motion effect
        if (this.slowMotionDuration > 0) {
            this.slowMotionDuration--;
            if (this.slowMotionDuration <= 0) {
                this.slowMotion = 1.0; // Return to normal speed
            }
        }
        
        // Handle input (affected by slow motion)
        const updates = Math.ceil(this.slowMotion * 1);
        for (let i = 0; i < updates; i++) {
            if (this.gameMode === 'campaign') {
                // Player 1 controlled by user, Player 2 by AI
                this.inputHandler.handlePlayerInput(this.player1, this.player1.controls);
                if (this.aiController) {
                    this.aiController.update();
                }
            } else {
                // Both players controlled by users
                this.inputHandler.handlePlayerInput(this.player1, this.player1.controls);
                this.inputHandler.handlePlayerInput(this.player2, this.player2.controls);
            }
        }
        
        // Update players
        const player1HadHitbox = this.player1.hitbox !== null;
        const player2HadHitbox = this.player2.hitbox !== null;
        
        this.player1.update(this.groundY, this.player2);
        this.player2.update(this.groundY, this.player1);
        
        // NEW: Check stone hits
        const stone1Hit = this.player1.checkStoneHit(this.player2);
        if (stone1Hit) {
            this.onStoneHit(this.player1, this.player2, stone1Hit);
        }
        
        const stone2Hit = this.player2.checkStoneHit(this.player1);
        if (stone2Hit) {
            this.onStoneHit(this.player2, this.player1, stone2Hit);
        }
        
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
        
        // NEW: Update power-ups
        this.updatePowerUps();
        
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
        
        // Update UI Manager (NEW)
        if (this.uiManager) {
            this.uiManager.updateHUD({
                health: this.player1.health,
                maxHealth: this.player1.maxHealth,
                coins: this.campaignManager ? this.campaignManager.totalCoins : 0
            }, {
                health: this.player2.health,
                maxHealth: this.player2.maxHealth
            }, {
                timer: this.timeRemaining,
                stage: this.campaignManager ? this.campaignManager.currentStage + 1 : 1
            });
        }
        
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
        
        // NEW: Check for critical hit
        const wasCrit = attacker.lastHitWasCrit;
        
        // Create shockwave for powerful hits or crits
        if (attacker.attackType === 'kick' || wasCrit) {
            this.shockwaves.push(new Shockwave(hitX, hitY, wasCrit ? 80 : 60));
        }
        
        // Camera shake (stronger for crits)
        if (wasCrit) {
            this.shakeAmount = 15;
        } else {
            this.shakeAmount = attacker.attackType === 'kick' ? 10 : 5;
        }
        
        // Track combat stats (NEW)
        if (attacker === this.player1) {
            this.combatStats.totalDamage += attacker.damage;
            this.combatStats.currentCombo++;
            if (this.combatStats.currentCombo > this.combatStats.maxCombo) {
                this.combatStats.maxCombo = this.combatStats.currentCombo;
            }
            
            // NEW: Trigger slow motion on 3+ combo
            if (this.combatStats.currentCombo >= 3) {
                this.slowMotion = 0.5;
                this.slowMotionDuration = 20; // frames
            }
            
            // Show combo notification for high combos
            if (this.combatStats.currentCombo >= 5 && this.uiManager) {
                this.uiManager.showComboNotification(this.combatStats.currentCombo);
            }
        } else {
            // Reset combo when player gets hit
            this.combatStats.currentCombo = 0;
        }
    }
    
    // NEW: Handle stone hit
    onStoneHit(attacker, victim, stone) {
        const hitX = stone.x;
        const hitY = stone.y;
        
        // Create hit effect
        this.particleSystem.createHitEffect(hitX, hitY, attacker.color);
        
        // Knockdown the victim
        victim.knockDown();
        
        // Take damage
        victim.takeDamage(10);
        
        // Strong camera shake
        this.shakeAmount = 12;
        
        // Create shockwave
        this.shockwaves.push(new Shockwave(hitX, hitY, 70));
        
        // Reset combo if player gets hit
        if (victim === this.player1) {
            this.combatStats.currentCombo = 0;
        }
    }
    
    // NEW: Update power-ups
    updatePowerUps() {
        // Spawn power-ups
        this.powerUpSpawnTimer++;
        if (this.powerUpSpawnTimer >= this.powerUpSpawnInterval && this.powerUps.length < 2) {
            this.spawnPowerUp();
            this.powerUpSpawnTimer = 0;
        }
        
        // Check collisions with players
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            // Check collision with player 1
            if (this.checkPowerUpCollision(this.player1, powerUp)) {
                this.applyPowerUp(this.player1, powerUp);
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // Check collision with player 2
            if (this.checkPowerUpCollision(this.player2, powerUp)) {
                this.applyPowerUp(this.player2, powerUp);
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // Update animation
            powerUp.floatOffset += 0.05;
        }
    }
    
    // NEW: Spawn power-up
    spawnPowerUp() {
        const types = ['health', 'stones', 'speed'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const powerUp = {
            type: type,
            x: 150 + Math.random() * 500,
            y: this.groundY - 100,
            width: 30,
            height: 30,
            floatOffset: 0
        };
        
        this.powerUps.push(powerUp);
    }
    
    // NEW: Check power-up collision
    checkPowerUpCollision(player, powerUp) {
        return player.x < powerUp.x + powerUp.width &&
               player.x + player.width > powerUp.x &&
               player.y < powerUp.y + powerUp.height &&
               player.y + player.height > powerUp.y;
    }
    
    // NEW: Apply power-up effect
    applyPowerUp(player, powerUp) {
        switch (powerUp.type) {
            case 'health':
                player.health = Math.min(player.maxHealth, player.health + 30);
                break;
            case 'stones':
                player.refillStones();
                break;
            case 'speed':
                player.speed += 1;
                player.jumpPower += 2;
                setTimeout(() => {
                    player.speed -= 1;
                    player.jumpPower -= 2;
                }, 8000);
                break;
        }
        
        // Create effect
        this.particleSystem.createHitEffect(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2, '#ffff00');
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
        
        // NEW: Draw power-ups
        this.drawPowerUps();
        
        // Draw players
        this.player1.draw(this.ctx);
        this.player2.draw(this.ctx);
        
        // NEW: Draw projectiles (stones)
        this.drawProjectiles();
        
        // NEW: Draw slow-motion indicator
        if (this.slowMotion < 1.0) {
            this.drawSlowMotionEffect();
        }
        
        // Draw FPS (debug)
        // this.ctx.fillStyle = 'black';
        // this.ctx.font = '14px monospace';
        // this.ctx.fillText(`FPS: ${this.fps}`, 10, 20);
        
        this.ctx.restore();
    }
    
    // NEW: Draw projectiles
    drawProjectiles() {
        const drawStones = (player) => {
            player.projectiles.forEach(stone => {
                if (stone.active) {
                    this.ctx.save();
                    this.ctx.translate(stone.x + stone.size / 2, stone.y + stone.size / 2);
                    this.ctx.rotate(stone.rotation);
                    
                    // Draw stone
                    this.ctx.fillStyle = '#666';
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 2;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, stone.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.stroke();
                    
                    this.ctx.restore();
                }
            });
        };
        
        drawStones(this.player1);
        drawStones(this.player2);
    }
    
    // NEW: Draw power-ups
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            const floatY = powerUp.y + Math.sin(powerUp.floatOffset) * 5;
            
            this.ctx.save();
            
            // Glow effect
            const glow = this.ctx.createRadialGradient(
                powerUp.x + powerUp.width / 2, floatY + powerUp.height / 2, 0,
                powerUp.x + powerUp.width / 2, floatY + powerUp.height / 2, powerUp.width
            );
            glow.addColorStop(0, 'rgba(255, 255, 0, 0.5)');
            glow.addColorStop(1, 'rgba(255, 255, 0, 0)');
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(powerUp.x - 10, floatY - 10, powerUp.width + 20, powerUp.height + 20);
            
            // Power-up box
            this.ctx.fillStyle = '#ffeb3b';
            this.ctx.strokeStyle = '#ff9800';
            this.ctx.lineWidth = 3;
            this.ctx.fillRect(powerUp.x, floatY, powerUp.width, powerUp.height);
            this.ctx.strokeRect(powerUp.x, floatY, powerUp.width, powerUp.height);
            
            // Icon based on type
            this.ctx.fillStyle = '#333';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            let icon = '';
            if (powerUp.type === 'health') icon = '❤️';
            else if (powerUp.type === 'stones') icon = '⚫';
            else if (powerUp.type === 'speed') icon = '⚡';
            
            this.ctx.fillText(icon, powerUp.x + powerUp.width / 2, floatY + powerUp.height / 2);
            
            this.ctx.restore();
        });
    }
    
    // NEW: Draw slow-motion effect
    drawSlowMotionEffect() {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 100, 255, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // "COMBO!" text
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = 'bold 40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('COMBO!', this.width / 2, 100);
        
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
        
        if (p1Health && this.player1) {
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
        
        if (p2Health && this.player2) {
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
        
        // NEW: Update stone counts
        this.updateStoneCounts();
    }
    
    // NEW: Update stone count display
    updateStoneCounts() {
        // Create stone indicators if they don't exist
        let p1Stones = document.getElementById('player1-stones');
        let p2Stones = document.getElementById('player2-stones');
        
        if (!p1Stones && this.player1) {
            p1Stones = document.createElement('div');
            p1Stones.id = 'player1-stones';
            p1Stones.style.position = 'absolute';
            p1Stones.style.left = '20px';
            p1Stones.style.top = '80px';
            p1Stones.style.color = 'white';
            p1Stones.style.fontSize = '18px';
            p1Stones.style.fontWeight = 'bold';
            p1Stones.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            document.body.appendChild(p1Stones);
        }
        
        if (!p2Stones && this.player2) {
            p2Stones = document.createElement('div');
            p2Stones.id = 'player2-stones';
            p2Stones.style.position = 'absolute';
            p2Stones.style.right = '20px';
            p2Stones.style.top = '80px';
            p2Stones.style.color = 'white';
            p2Stones.style.fontSize = '18px';
            p2Stones.style.fontWeight = 'bold';
            p2Stones.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            document.body.appendChild(p2Stones);
        }
        
        if (p1Stones && this.player1) {
            p1Stones.innerHTML = `🪨 × ${this.player1.stoneCount}`;
        }
        
        if (p2Stones && this.player2) {
            p2Stones.innerHTML = `🪨 × ${this.player2.stoneCount}`;
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
    
    updateCoins() {
        const coinsElement = document.getElementById('coins');
        if (coinsElement) {
            coinsElement.textContent = this.campaignManager.playerStats.coins;
        }
    }
    
    endGame() {
        this.gameOver = true;
        this.isRunning = false;
        
        if (this.gameMode === 'campaign') {
            // Campaign mode - show victory or defeat
            if (this.player1.health > 0) {
                // Victory
                const reward = this.campaignManager.completeStage();
                this.showVictory(reward);
            } else {
                // Defeat
                this.showDefeat();
            }
        } else {
            // VS mode - determine winner
            let winner = '';
            if (this.player1.health > this.player2.health) {
                winner = 'Player 1 Thắng!';
            } else if (this.player2.health > this.player1.health) {
                winner = 'Player 2 Thắng!';
            } else {
                winner = 'Hòa!';
            }
            this.showGameOver(winner);
        }
    }
    
    updateMenuStats() {
        const victories = document.getElementById('victories');
        const menuCoins = document.getElementById('menu-coins');
        
        if (victories) {
            victories.textContent = this.campaignManager.playerStats.victories;
        }
        if (menuCoins) {
            menuCoins.textContent = this.campaignManager.playerStats.coins;
        }
    }
    
    showVictory(reward) {
        // Calculate stats for new UI
        const timeElapsed = this.timeLimit - this.timeRemaining;
        const stars = this.calculateStars();
        
        const stats = {
            stars: stars,
            totalDamage: this.combatStats.totalDamage,
            maxCombo: this.combatStats.maxCombo,
            completionTime: this.formatTime(timeElapsed),
            coinsEarned: reward,
            xpGained: Math.floor(reward * 1.5) // XP based on coins
        };
        
        // Use new UI Manager (NEW)
        if (this.uiManager) {
            this.uiManager.showVictoryScreen(stats);
        } else {
            // Fallback to old UI
            const screen = document.getElementById('victoryScreen');
            document.getElementById('rewardAmount').textContent = `+${reward} 💰`;
            document.getElementById('totalCoins').textContent = this.campaignManager.playerStats.coins;
            this.updateMenuStats();
            screen.classList.remove('hidden');
        }
        
        // Reset combat stats for next battle
        this.combatStats = {
            totalDamage: 0,
            maxCombo: 0,
            currentCombo: 0
        };
    }
    
    calculateStars() {
        // Star rating based on health remaining and time
        const healthPercent = this.player1.health / this.player1.maxHealth;
        const timePercent = this.timeRemaining / this.timeLimit;
        
        if (healthPercent > 0.7 && timePercent > 0.5) return 3;
        if (healthPercent > 0.4 && timePercent > 0.3) return 2;
        return 1;
    }
    
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
    
    showDefeat() {
        const screen = document.getElementById('defeatScreen');
        screen.classList.remove('hidden');
    }
    
    showGameOver(winner) {
        // For VS mode
        const vsMode = document.getElementById('vsMode');
        const menu = vsMode.querySelector('.menu');
        
        const oldContent = menu.innerHTML;
        menu.innerHTML = `
            <h1 class="game-over-message">GAME OVER</h1>
            <div class="winner-text">${winner}</div>
            <button class="btn-start" id="restartVsBtn">Chơi Lại</button>
            <button class="btn-back" id="backToMenuFromGameOver">← Menu</button>
        `;
        
        vsMode.classList.remove('hidden');
        
        // Setup buttons
        document.getElementById('restartVsBtn').addEventListener('click', () => {
            vsMode.classList.add('hidden');
            menu.innerHTML = oldContent;
            this.startVsMode();
        });
        
        document.getElementById('backToMenuFromGameOver').addEventListener('click', () => {
            vsMode.classList.add('hidden');
            menu.innerHTML = oldContent;
            document.getElementById('mainMenu').classList.remove('hidden');
        });
    }
    
    showStageSelect() {
        // Use UIManager to populate stage selection
        if (this.uiManager) {
            const stages = this.campaignManager.stages.map((stage, index) => ({
                name: stage.name,
                difficulty: stage.opponent.difficulty === 'easy' ? 'Easy' : 
                           stage.opponent.difficulty === 'medium' ? 'Normal' : 
                           stage.opponent.difficulty === 'hard' ? 'Hard' : 'Normal',
                isBoss: stage.opponent.isBoss || false,
                locked: (index + 1) > this.campaignManager.playerStats.maxStageReached,
                stars: this.campaignManager.playerStats.stageStars?.[index + 1] || 0,
                reward: stage.reward,
                enemyCount: 1
            }));
            
            this.uiManager.showOverlay('stageSelect', { stages });
        }
    }
    
    showStoryCutscene(stage) {
        const cutscene = document.getElementById('storyCutscene');
        const storyTitle = document.getElementById('storyTitle');
        const storyText = document.getElementById('storyText');
        const enemyName = document.getElementById('enemyName');
        const enemyDifficulty = document.getElementById('enemyDifficulty');
        
        if (storyTitle) storyTitle.textContent = stage.name;
        if (storyText) storyText.textContent = stage.story;
        if (enemyName) enemyName.textContent = stage.opponent.name;
        if (enemyDifficulty) enemyDifficulty.textContent = stage.opponent.difficulty.toUpperCase();
        
        document.getElementById('stageSelect').classList.add('hidden');
        cutscene.classList.remove('hidden');
    }
    
    showUpgradeShop() {
        // Use UIManager to update shop UI
        if (this.uiManager) {
            const stats = this.campaignManager.playerStats;
            
            // Map upgrade stats for UIManager
            const upgradeStats = {
                coins: stats.coins,
                health: stats.upgrades.maxHealth || 0,
                attack: stats.upgrades.attackPower || 0,
                speed: stats.upgrades.speed || 0,
                defense: stats.upgrades.defense || 0
            };
            
            this.uiManager.updateShopUI(upgradeStats);
        }
        
        // Update upgrade costs and setup button handlers
        const upgrades = ['health', 'attack', 'speed', 'defense'];
        upgrades.forEach(upgrade => {
            const costEl = document.getElementById(`${upgrade}-cost`);
            const btnEl = document.getElementById(`upgrade-${upgrade}`);
            
            const upgradeKey = upgrade === 'health' ? 'maxHealth' : upgrade === 'attack' ? 'attackPower' : upgrade;
            const cost = this.campaignManager.getUpgradeCost(upgradeKey);
            
            if (costEl) {
                costEl.textContent = cost;
            }
            
            // Setup button handler
            if (btnEl) {
                btnEl.onclick = () => {
                    if (this.campaignManager.purchaseUpgrade(upgradeKey)) {
                        this.showUpgradeShop(); // Refresh UI
                    }
                };
            }
        });
    }
    
    resetProgress() {
        this.campaignManager.reset();
        this.showUpgradeShop(); // Refresh if shop is open
        alert('Đã reset toàn bộ tiến trình!');
    }
}