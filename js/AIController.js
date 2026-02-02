class AIController {
    constructor(player, opponent, difficulty = 'medium') {
        this.player = player;
        this.opponent = opponent;
        this.difficulty = difficulty;
        
        // AI behavior timers
        this.decisionTimer = 0;
        this.decisionDelay = this.getDecisionDelay();
        this.currentAction = null;
        this.actionDuration = 0;
        
        // AI personality based on difficulty
        this.aggressiveness = this.getAggressiveness();
        this.reactionTime = this.getReactionTime();
        this.accuracy = this.getAccuracy();
        this.defenseSkill = this.getDefenseSkill();
        
        // Combat state
        this.isAggressive = Math.random() < 0.5;
        this.comboCount = 0;
        this.maxCombo = this.difficulty === 'boss' ? 4 : this.difficulty === 'hard' ? 3 : 2;
    }
    
    getDecisionDelay() {
        switch(this.difficulty) {
            case 'easy': return 40;
            case 'medium': return 25;
            case 'hard': return 15;
            case 'boss': return 10;
            default: return 30;
        }
    }
    
    getAggressiveness() {
        switch(this.difficulty) {
            case 'easy': return 0.3;
            case 'medium': return 0.5;
            case 'hard': return 0.7;
            case 'boss': return 0.85;
            default: return 0.5;
        }
    }
    
    getReactionTime() {
        switch(this.difficulty) {
            case 'easy': return 30;
            case 'medium': return 20;
            case 'hard': return 10;
            case 'boss': return 5;
            default: return 20;
        }
    }
    
    getAccuracy() {
        switch(this.difficulty) {
            case 'easy': return 0.5;
            case 'medium': return 0.7;
            case 'hard': return 0.85;
            case 'boss': return 0.95;
            default: return 0.7;
        }
    }
    
    getDefenseSkill() {
        switch(this.difficulty) {
            case 'easy': return 0.2;
            case 'medium': return 0.4;
            case 'hard': return 0.6;
            case 'boss': return 0.8;
            default: return 0.4;
        }
    }
    
    update() {
        this.decisionTimer++;
        
        if (this.currentAction) {
            this.actionDuration--;
            if (this.actionDuration <= 0) {
                this.currentAction = null;
            } else {
                this.executeAction();
                return;
            }
        }
        
        if (this.decisionTimer >= this.decisionDelay) {
            this.makeDecision();
            this.decisionTimer = 0;
        }
    }
    
    makeDecision() {
        const distance = Math.abs(this.player.x - this.opponent.x);
        const healthRatio = this.player.health / this.player.maxHealth;
        const opponentHealthRatio = this.opponent.health / this.opponent.maxHealth;
        
        // Boss special behavior
        if (this.difficulty === 'boss' && healthRatio < 0.3) {
            // Enrage mode - more aggressive
            this.aggressiveness = 0.95;
        }
        
        // Decide combat style based on health
        if (healthRatio < 0.3 && opponentHealthRatio > 0.5) {
            // Defensive when low health
            this.isAggressive = false;
        } else if (healthRatio > opponentHealthRatio) {
            // Aggressive when winning
            this.isAggressive = Math.random() < this.aggressiveness;
        }
        
        // React to opponent's attack
        if (this.opponent.isAttacking && distance < 80) {
            if (Math.random() < this.defenseSkill) {
                this.currentAction = 'dodge';
                this.actionDuration = 20;
                return;
            }
        }
        
        // Main decision tree
        if (distance > 200) {
            // Far away - approach
            this.currentAction = 'approach';
            this.actionDuration = 30;
        } else if (distance > 100) {
            // Medium range
            if (this.isAggressive) {
                if (Math.random() < 0.3 && this.player.isGrounded) {
                    this.currentAction = 'jump_attack';
                    this.actionDuration = 40;
                } else {
                    this.currentAction = 'approach';
                    this.actionDuration = 20;
                }
            } else {
                this.currentAction = 'circle';
                this.actionDuration = 30;
            }
        } else if (distance > 50) {
            // Attack range
            if (Math.random() < this.accuracy) {
                if (this.comboCount < this.maxCombo) {
                    this.currentAction = Math.random() < 0.6 ? 'punch' : 'kick';
                    this.actionDuration = 25;
                    this.comboCount++;
                } else {
                    this.currentAction = 'back_off';
                    this.actionDuration = 20;
                    this.comboCount = 0;
                }
            } else {
                this.currentAction = 'approach';
                this.actionDuration = 15;
            }
        } else {
            // Too close - create space or attack
            if (this.isAggressive && Math.random() < 0.7) {
                this.currentAction = Math.random() < 0.5 ? 'punch' : 'kick';
                this.actionDuration = 25;
            } else {
                this.currentAction = 'back_off';
                this.actionDuration = 20;
            }
        }
    }
    
    executeAction() {
        if (!this.currentAction) return;
        
        const opponentX = this.opponent.x;
        const myX = this.player.x;
        
        switch(this.currentAction) {
            case 'approach':
                if (opponentX > myX) {
                    this.player.moveRight();
                } else {
                    this.player.moveLeft();
                }
                break;
                
            case 'back_off':
                if (opponentX > myX) {
                    this.player.moveLeft();
                } else {
                    this.player.moveRight();
                }
                break;
                
            case 'circle':
                // Circle around opponent
                if (Math.random() < 0.5) {
                    this.player.moveRight();
                } else {
                    this.player.moveLeft();
                }
                break;
                
            case 'dodge':
                // Jump or move back
                if (Math.random() < 0.5) {
                    this.player.jump();
                } else {
                    if (opponentX > myX) {
                        this.player.moveLeft();
                    } else {
                        this.player.moveRight();
                    }
                }
                break;
                
            case 'punch':
                if (!this.player.isAttacking) {
                    this.player.punch();
                }
                break;
                
            case 'kick':
                if (!this.player.isAttacking) {
                    this.player.kick();
                }
                break;
                
            case 'jump_attack':
                if (this.player.isGrounded && !this.player.isJumping) {
                    this.player.jump();
                } else if (!this.player.isGrounded && !this.player.isAttacking) {
                    // Attack in mid-air
                    if (Math.random() < 0.5) {
                        this.player.kick();
                    }
                }
                break;
        }
        
        // Boss special moves
        if (this.difficulty === 'boss' && this.actionDuration % 10 === 0) {
            if (Math.random() < 0.3 && !this.player.isAttacking) {
                // Random special move
                this.player.kick();
            }
        }
    }
    
    reset() {
        this.decisionTimer = 0;
        this.currentAction = null;
        this.actionDuration = 0;
        this.comboCount = 0;
        this.isAggressive = Math.random() < 0.5;
    }
}