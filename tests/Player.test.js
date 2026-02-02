const { describe, test, expect, beforeEach } = require('@jest/globals');

// Load the Player class
const fs = require('fs');
const path = require('path');
const playerCode = fs.readFileSync(path.join(__dirname, '../js/Player.js'), 'utf8');
eval(playerCode);

describe('Player Class', () => {
    let player;
    let opponent;
    const mockControls = {
        up: 'w',
        down: 's',
        left: 'a',
        right: 'd',
        punch: 'f',
        kick: 'g',
        isPlayer1: true
    };

    beforeEach(() => {
        player = new Player(100, 100, '#ff0000', mockControls);
        opponent = new Player(300, 100, '#0000ff', mockControls);
    });

    describe('Constructor', () => {
        test('should initialize with correct position', () => {
            expect(player.x).toBe(100);
            expect(player.y).toBe(100);
        });

        test('should initialize with correct color', () => {
            expect(player.color).toBe('#ff0000');
        });

        test('should initialize with full health', () => {
            expect(player.health).toBe(100);
            expect(player.maxHealth).toBe(100);
        });

        test('should initialize with correct dimensions', () => {
            expect(player.width).toBe(20);
            expect(player.height).toBe(80);
        });

        test('should not be attacking initially', () => {
            expect(player.isAttacking).toBe(false);
            expect(player.attackType).toBe(null);
        });
    });

    describe('Movement', () => {
        test('moveLeft should set velocity and facing', () => {
            player.moveLeft();
            expect(player.velocityX).toBe(-player.speed);
            expect(player.facing).toBe(-1);
        });

        test('moveRight should set velocity and facing', () => {
            player.moveRight();
            expect(player.velocityX).toBe(player.speed);
            expect(player.facing).toBe(1);
        });

        test('jump should work when grounded', () => {
            player.isGrounded = true;
            player.isJumping = false;
            const initialVelocityY = player.velocityY;
            
            player.jump();
            
            expect(player.velocityY).toBeLessThan(initialVelocityY);
            expect(player.isJumping).toBe(true);
        });

        test('jump should not work when already jumping', () => {
            player.isGrounded = false;
            player.isJumping = true;
            const initialVelocityY = player.velocityY;
            
            player.jump();
            
            expect(player.velocityY).toBe(initialVelocityY);
        });

        test('crouch should work when grounded', () => {
            player.isGrounded = true;
            player.crouch();
            expect(player.isCrouching).toBe(true);
        });
    });

    describe('Combat', () => {
        test('punch should start attack', () => {
            player.punch();
            expect(player.isAttacking).toBe(true);
            expect(player.attackType).toBe('punch');
        });

        test('kick should start attack', () => {
            player.kick();
            expect(player.isAttacking).toBe(true);
            expect(player.attackType).toBe('kick');
        });

        test('should not attack during cooldown', () => {
            player.punch();
            player.attackCooldown = 10;
            player.isAttacking = false;
            
            player.kick();
            
            expect(player.attackType).not.toBe('kick');
        });

        test('should not attack while stunned', () => {
            player.hitStun = 10;
            player.punch();
            expect(player.isAttacking).toBe(false);
        });

        test('takeDamage should reduce health', () => {
            const initialHealth = player.health;
            player.takeDamage(20);
            expect(player.health).toBe(initialHealth - 20);
        });

        test('takeDamage should not go below 0', () => {
            player.takeDamage(150);
            expect(player.health).toBe(0);
        });

        test('takeDamage with defense upgrade should reduce damage', () => {
            player.defenseLevel = 2; // 20% reduction
            const initialHealth = player.health;
            player.takeDamage(100);
            expect(player.health).toBe(initialHealth - 80); // 100 * 0.8
        });

        test('checkHit should detect collision', () => {
            player.hitbox = {
                x: opponent.x,
                y: opponent.y,
                width: 40,
                height: 30
            };
            
            expect(player.checkHit(opponent)).toBe(true);
        });

        test('checkHit should not detect when no overlap', () => {
            player.hitbox = {
                x: 500,
                y: 500,
                width: 40,
                height: 30
            };
            
            expect(player.checkHit(opponent)).toBe(false);
        });
    });

    describe('Update', () => {
        test('should apply gravity', () => {
            const initialY = player.y;
            const initialVelocityY = player.velocityY;
            
            player.update(400, opponent);
            
            expect(player.velocityY).toBeGreaterThan(initialVelocityY);
        });

        test('should stop at ground', () => {
            player.y = 400;
            player.velocityY = 5;
            const groundY = 400;
            
            player.update(groundY, opponent);
            
            expect(player.y).toBe(groundY - player.height);
            expect(player.velocityY).toBe(0);
            expect(player.isGrounded).toBe(true);
        });

        test('should apply friction', () => {
            player.velocityX = 5;
            player.isGrounded = true;
            
            player.update(400, opponent);
            
            expect(Math.abs(player.velocityX)).toBeLessThan(5);
        });

        test('should decrease cooldowns', () => {
            player.attackCooldown = 10;
            player.hitFlash = 5;
            player.hitStun = 8;
            
            player.update(400, opponent);
            
            expect(player.attackCooldown).toBe(9);
            expect(player.hitFlash).toBe(4);
            expect(player.hitStun).toBe(7);
        });
    });

    describe('Upgrades', () => {
        test('should apply attack power upgrade', () => {
            player.attackPowerLevel = 3;
            player.attackType = 'punch';
            
            const baseDamage = 8;
            const expectedDamage = baseDamage + (3 * 2); // +2 per level
            
            player.onHit(opponent);
            
            expect(opponent.health).toBe(100 - expectedDamage);
        });

        test('upgraded speed should be applied', () => {
            const baseSpeed = 5;
            player.speed = baseSpeed + (2 * 0.5); // 2 levels of speed upgrade
            
            player.moveRight();
            
            expect(player.velocityX).toBe(6);
        });
    });
});
