/**
 * CombatSystem - Handles combat interactions between players
 */
class CombatSystem {
    constructor(game) {
        this.game = game;
    }

    update() {
        const game = this.game;
        const player1HadHitbox = game.player1.hitbox !== null;
        const player2HadHitbox = game.player2.hitbox !== null;
        
        // Check stone hits
        const stone1Hit = game.player1.checkStoneHit(game.player2);
        if (stone1Hit) {
            this.onStoneHit(game.player1, game.player2, stone1Hit);
        }
        
        const stone2Hit = game.player2.checkStoneHit(game.player1);
        if (stone2Hit) {
            this.onStoneHit(game.player2, game.player1, stone2Hit);
        }
        
        // Check if attacks just created hitboxes (for effects)
        if (game.player1.hitbox && !player1HadHitbox) {
            if (game.player1.checkHit(game.player2)) {
                this.onHitLanded(game.player1, game.player2);
            }
        }
        
        if (game.player2.hitbox && !player2HadHitbox) {
            if (game.player2.checkHit(game.player1)) {
                this.onHitLanded(game.player2, game.player1);
            }
        }
    }

    onHitLanded(attacker, victim) {
        const game = this.game;
        
        // Create hit effect
        const hitX = victim.x + victim.width / 2;
        const hitY = victim.y + victim.height / 2;
        
        game.particleSystem.createHitEffect(hitX, hitY, attacker.color);
        
        // Check for critical hit
        const wasCrit = attacker.lastHitWasCrit;
        
        // Create shockwave for powerful hits or crits
        if (attacker.attackType === 'kick' || wasCrit) {
            game.shockwaves.push(new Shockwave(hitX, hitY, wasCrit ? 80 : 60));
        }
        
        // Camera shake (stronger for crits)
        if (wasCrit) {
            game.shakeAmount = 15;
        } else {
            game.shakeAmount = attacker.attackType === 'kick' ? 10 : 5;
        }
        
        // Track combat stats
        if (attacker === game.player1) {
            game.combatStats.totalDamage += attacker.damage || 0;
            game.combatStats.currentCombo++;
            if (game.combatStats.currentCombo > game.combatStats.maxCombo) {
                game.combatStats.maxCombo = game.combatStats.currentCombo;
            }
            
            // Trigger slow motion on 3+ combo
            if (game.combatStats.currentCombo >= 3) {
                game.slowMotion = 0.5;
                game.slowMotionDuration = 20; // frames
            }
            
            // Show combo notification for high combos
            if (game.combatStats.currentCombo >= 5 && game.uiManager) {
                game.uiManager.showComboNotification(game.combatStats.currentCombo);
            }
        } else {
            // Reset combo when player gets hit
            game.combatStats.currentCombo = 0;
        }
    }

    onStoneHit(attacker, victim, stone) {
        const game = this.game;
        const hitX = stone.x;
        const hitY = stone.y;
        
        // Create hit effect
        game.particleSystem.createHitEffect(hitX, hitY, attacker.color);
        
        // Knockdown the victim
        victim.knockDown();
        
        // Take damage
        victim.takeDamage(10);
        
        // Strong camera shake
        game.shakeAmount = 12;
        
        // Create shockwave
        game.shockwaves.push(new Shockwave(hitX, hitY, 70));
        
        // Reset combo if player gets hit
        if (victim === game.player1) {
            game.combatStats.currentCombo = 0;
        }
    }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CombatSystem;
}
