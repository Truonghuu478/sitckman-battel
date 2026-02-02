/**
 * PowerUpSystem - Handles power-up spawning and collection
 */
class PowerUpSystem {
    constructor(game) {
        this.game = game;
    }

    update() {
        const game = this.game;
        
        // Spawn power-ups
        game.powerUpSpawnTimer++;
        if (game.powerUpSpawnTimer >= game.powerUpSpawnInterval && game.powerUps.length < 2) {
            this.spawnPowerUp();
            game.powerUpSpawnTimer = 0;
        }
        
        // Check collisions with players
        for (let i = game.powerUps.length - 1; i >= 0; i--) {
            const powerUp = game.powerUps[i];
            
            // Check collision with player 1
            if (this.checkPowerUpCollision(game.player1, powerUp)) {
                this.applyPowerUp(game.player1, powerUp);
                game.powerUps.splice(i, 1);
                continue;
            }
            
            // Check collision with player 2
            if (this.checkPowerUpCollision(game.player2, powerUp)) {
                this.applyPowerUp(game.player2, powerUp);
                game.powerUps.splice(i, 1);
                continue;
            }
            
            // Update animation
            powerUp.floatOffset += 0.05;
        }
    }

    spawnPowerUp() {
        const game = this.game;
        const types = ['health', 'stones', 'speed'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const powerUp = {
            type: type,
            x: 150 + Math.random() * 500,
            y: game.groundY - 100,
            width: 30,
            height: 30,
            floatOffset: 0
        };
        
        game.powerUps.push(powerUp);
    }

    checkPowerUpCollision(player, powerUp) {
        return player.x < powerUp.x + powerUp.width &&
               player.x + player.width > powerUp.x &&
               player.y < powerUp.y + powerUp.height &&
               player.y + player.height > powerUp.y;
    }

    applyPowerUp(player, powerUp) {
        const game = this.game;
        
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
        game.particleSystem.createHitEffect(
            powerUp.x + powerUp.width / 2,
            powerUp.y + powerUp.height / 2,
            '#ffff00'
        );
    }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PowerUpSystem;
}
