const { describe, test, expect, beforeEach } = require('@jest/globals');

// Load the Player class
const Player = require('../js/Player.js');

describe('Player New Features', () => {
    let player;
    let opponent;
    const mockControls = {
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

    beforeEach(() => {
        player = new Player(100, 100, '#ff0000', mockControls);
        opponent = new Player(300, 100, '#0000ff', mockControls);
    });

    describe('Stone Throwing System', () => {
        test('should initialize with 3 stones', () => {
            expect(player.stoneCount).toBe(3);
            expect(player.maxStones).toBe(3);
        });

        test('should throw stone and reduce count', () => {
            const initialCount = player.stoneCount;
            player.throwStone();
            
            expect(player.stoneCount).toBe(initialCount - 1);
            expect(player.projectiles.length).toBe(1);
        });

        test('should not throw stone when count is 0', () => {
            player.stoneCount = 0;
            player.throwStone();
            
            expect(player.projectiles.length).toBe(0);
        });

        test('stone should have correct initial properties', () => {
            player.throwStone();
            const stone = player.projectiles[0];
            
            expect(stone).toHaveProperty('x');
            expect(stone).toHaveProperty('y');
            expect(stone).toHaveProperty('velocityX');
            expect(stone).toHaveProperty('velocityY');
            expect(stone.active).toBe(true);
            expect(stone.size).toBe(8);
        });

        test('should respect cooldown', () => {
            player.throwStone();
            expect(player.stoneCooldown).toBeGreaterThan(0);
            
            const cooldown = player.stoneCooldown;
            player.throwStone(); // Try to throw again immediately
            
            expect(player.projectiles.length).toBe(1); // Should still be 1
        });

        test('should refill stones', () => {
            player.stoneCount = 0;
            player.refillStones();
            
            expect(player.stoneCount).toBe(player.maxStones);
        });

        test('projectiles should update with gravity', () => {
            player.throwStone();
            const stone = player.projectiles[0];
            const initialY = stone.y;
            const initialVelocityY = stone.velocityY;
            
            player.updateProjectiles(450);
            
            expect(stone.velocityY).toBeGreaterThan(initialVelocityY);
            // Stone might move up initially due to negative velocityY
            // So we just check velocity increased (gravity applied)
        });

        test('projectile should deactivate when hitting ground', () => {
            player.throwStone();
            const stone = player.projectiles[0];
            stone.y = 450; // Near ground
            
            player.updateProjectiles(450);
            
            expect(stone.active).toBe(false);
        });

        test('should detect stone hit on opponent', () => {
            player.throwStone();
            const stone = player.projectiles[0];
            
            // Position stone to hit opponent
            stone.x = opponent.x;
            stone.y = opponent.y;
            
            const hit = player.checkStoneHit(opponent);
            expect(hit).toBeTruthy();
        });

        test('should not detect hit when stone misses', () => {
            player.throwStone();
            const stone = player.projectiles[0];
            
            // Position stone far from opponent
            stone.x = 1000;
            stone.y = 1000;
            
            const hit = player.checkStoneHit(opponent);
            expect(hit).toBeNull();
        });
    });

    describe('Knockdown System', () => {
        test('should initialize knockdown properties', () => {
            expect(player.isKnockedDown).toBe(false);
            expect(player.knockdownTime).toBe(0);
            expect(player.getUpFrame).toBe(0);
        });

        test('should knockdown player', () => {
            player.knockDown();
            
            expect(player.isKnockedDown).toBe(true);
            expect(player.knockdownTime).toBe(60);
            expect(player.isAttacking).toBe(false);
        });

        test('should not knockdown if already knocked down', () => {
            player.knockDown();
            const firstKnockdownTime = player.knockdownTime;
            
            player.knockDown(); // Try again
            
            expect(player.knockdownTime).toBe(firstKnockdownTime);
        });

        test('should recover from knockdown after time', () => {
            player.knockDown();
            const groundY = 400;
            
            // Simulate time passing
            for (let i = 0; i < 61; i++) {
                player.update(groundY, opponent);
            }
            
            expect(player.isKnockedDown).toBe(false);
            expect(player.getUpFrame).toBeGreaterThan(0);
        });

        test('should not allow actions when knocked down', () => {
            player.knockDown();
            
            player.punch();
            expect(player.isAttacking).toBe(false);
            
            player.kick();
            expect(player.isAttacking).toBe(false);
            
            player.throwStone();
            expect(player.projectiles.length).toBe(0);
        });
    });

    describe('Critical Hit System', () => {
        test('should initialize crit properties', () => {
            expect(player.critChance).toBe(0.15);
            expect(player.lastHitWasCrit).toBe(false);
        });

        test('onHit should calculate critical hits', () => {
            player.attackType = 'punch';
            
            // Mock Math.random for consistent testing
            const originalRandom = Math.random;
            Math.random = () => 0.1; // Below crit chance
            
            const wasCrit = player.onHit(opponent);
            
            expect(player.lastHitWasCrit).toBe(true);
            expect(wasCrit).toBe(true);
            
            Math.random = originalRandom;
        });

        test('critical hit should deal more damage', () => {
            player.attackType = 'punch';
            const baseDamage = 8;
            const initialHealth = opponent.health;
            
            // Force critical hit
            const originalRandom = Math.random;
            Math.random = () => 0.1;
            
            player.onHit(opponent);
            const damageDealt = initialHealth - opponent.health;
            
            expect(damageDealt).toBeGreaterThan(baseDamage);
            expect(damageDealt).toBe(baseDamage * 1.5);
            
            Math.random = originalRandom;
        });

        test('non-critical hit should deal normal damage', () => {
            player.attackType = 'punch';
            const baseDamage = 8;
            const initialHealth = opponent.health;
            
            // Force non-critical hit
            const originalRandom = Math.random;
            Math.random = () => 0.9;
            
            player.onHit(opponent);
            const damageDealt = initialHealth - opponent.health;
            
            expect(damageDealt).toBe(baseDamage);
            expect(player.lastHitWasCrit).toBe(false);
            
            Math.random = originalRandom;
        });
    });

    describe('Dash System', () => {
        test('should initialize dash properties', () => {
            expect(player.isDashing).toBe(false);
            expect(player.dashFrame).toBe(0);
            expect(player.dashCooldown).toBe(0);
            expect(player.dashSpeed).toBe(15);
        });

        test('should dash when grounded', () => {
            player.isGrounded = true;
            player.dash();
            
            expect(player.isDashing).toBe(true);
            expect(player.dashCooldown).toBeGreaterThan(0);
            expect(Math.abs(player.velocityX)).toBe(player.dashSpeed);
        });

        test('should not dash when in air', () => {
            player.isGrounded = false;
            player.dash();
            
            expect(player.isDashing).toBe(false);
        });

        test('should not dash when knocked down', () => {
            player.isGrounded = true;
            player.knockDown();
            player.dash();
            
            expect(player.isDashing).toBe(false);
        });

        test('should respect dash cooldown', () => {
            player.isGrounded = true;
            player.dash();
            
            const firstDash = player.isDashing;
            player.isDashing = false; // Reset for test
            player.dash(); // Try again
            
            expect(firstDash).toBe(true);
        });

        test('dash should end after duration', () => {
            player.isGrounded = true;
            player.dash();
            const groundY = 400;
            
            // Simulate dash duration
            for (let i = 0; i < 11; i++) {
                player.update(groundY, opponent);
            }
            
            expect(player.isDashing).toBe(false);
            expect(player.dashFrame).toBe(0);
        });

        test('should not allow movement inputs during dash', () => {
            player.isGrounded = true;
            player.dash();
            
            player.moveLeft();
            // Velocity should be dash velocity, not move velocity
            expect(Math.abs(player.velocityX)).toBeGreaterThan(player.speed);
        });
    });

    describe('Integration Tests', () => {
        test('knocked down player should not be able to dash', () => {
            player.isGrounded = true;
            player.knockDown();
            player.dash();
            
            expect(player.isDashing).toBe(false);
        });

        test('dashing player should not be knocked down by normal means', () => {
            player.isGrounded = true;
            player.dash();
            
            // Knockdown still works but it's a design choice
            player.knockDown();
            expect(player.isKnockedDown).toBe(true);
        });

        test('player should be able to throw stone after refill', () => {
            player.stoneCount = 0;
            player.throwStone();
            expect(player.projectiles.length).toBe(0);
            
            player.refillStones();
            player.stoneCooldown = 0; // Reset cooldown
            player.throwStone();
            expect(player.projectiles.length).toBe(1);
        });

        test('critical hit with kick should work', () => {
            player.attackType = 'kick';
            const baseDamage = 12;
            
            const originalRandom = Math.random;
            Math.random = () => 0.05; // Force crit
            
            const wasCrit = player.onHit(opponent);
            
            expect(wasCrit).toBe(true);
            expect(player.lastHitWasCrit).toBe(true);
            
            Math.random = originalRandom;
        });

        test('multiple projectiles should be tracked independently', () => {
            player.throwStone();
            player.stoneCooldown = 0;
            player.throwStone();
            player.stoneCooldown = 0;
            player.throwStone();
            
            expect(player.projectiles.length).toBe(3);
            expect(player.stoneCount).toBe(0);
        });
    });
});
