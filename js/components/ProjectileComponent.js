/**
 * ProjectileComponent - Handles player projectile system (stones)
 */
class ProjectileComponent {
    constructor(player) {
        this.player = player;
    }

    throwStone() {
        const player = this.player;
        if (player.stoneCooldown <= 0 && player.stoneCount > 0 && !player.isAttacking && !player.isKnockedDown) {
            const stone = {
                x: player.x + (player.facing === 1 ? player.width : 0),
                y: player.y + 30,
                velocityX: player.facing * 12,
                velocityY: -3,
                size: 8,
                rotation: 0,
                active: true
            };
            player.projectiles.push(stone);
            player.stoneCount--;
            player.stoneCooldown = 40;
        }
    }

    updateProjectiles(groundY) {
        const player = this.player;
        
        for (let i = player.projectiles.length - 1; i >= 0; i--) {
            const stone = player.projectiles[i];
            
            if (!stone.active) {
                player.projectiles.splice(i, 1);
                continue;
            }
            
            // Update position
            stone.x += stone.velocityX;
            stone.y += stone.velocityY;
            stone.velocityY += 0.4; // Gravity
            stone.rotation += 0.3;
            
            // Check ground collision
            if (stone.y >= groundY - stone.size) {
                stone.active = false;
            }
            
            // Remove if off screen
            if (stone.x < -50 || stone.x > 850 || stone.y > groundY) {
                stone.active = false;
            }
        }
    }

    checkStoneHit(opponent) {
        const player = this.player;
        
        for (let stone of player.projectiles) {
            if (stone.active) {
                const hit = stone.x < opponent.x + opponent.width &&
                           stone.x + stone.size > opponent.x &&
                           stone.y < opponent.y + opponent.height &&
                           stone.y + stone.size > opponent.y;
                
                if (hit) {
                    stone.active = false;
                    return stone;
                }
            }
        }
        return null;
    }

    refillStones() {
        const player = this.player;
        player.stoneCount = player.maxStones;
    }

    updateCooldown() {
        const player = this.player;
        if (player.stoneCooldown > 0) player.stoneCooldown--;
    }

    updateDashCooldown() {
        const player = this.player;
        if (player.dashCooldown > 0) player.dashCooldown--;
    }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjectileComponent;
}
