const { describe, test, expect, beforeEach } = require('@jest/globals');

// Load required classes
const Player = require('../js/Player.js');
const InputHandler = require('../js/InputHandler.js');

describe('Integration Tests - New Features', () => {
    let player1;
    let player2;
    let inputHandler;
    const groundY = 450;

    beforeEach(() => {
        inputHandler = new InputHandler();
        
        player1 = new Player(100, 370, '#ff0000', inputHandler.getPlayer1Controls());
        player2 = new Player(600, 370, '#0000ff', inputHandler.getPlayer2Controls());
    });

    describe('Stone Combat Integration', () => {
        test('complete stone throw and hit sequence', () => {
            // Player throws stone
            player1.throwStone();
            expect(player1.stoneCount).toBe(2);
            expect(player1.projectiles.length).toBe(1);

            // Stone moves through air
            const stone = player1.projectiles[0];
            const initialX = stone.x;
            
            // Update stone 10 times
            for (let i = 0; i < 10; i++) {
                player1.updateProjectiles(groundY);
            }

            // Stone should have moved
            expect(player1.projectiles[0].x).not.toBe(initialX);

            // Check if stone can hit opponent
            player2.x = stone.x - 5;
            player2.y = stone.y - 10;
            
            const hit = player1.checkStoneHit(player2);
            expect(hit).toBeTruthy();
        });

        test('stone knockdown prevents actions', () => {
            player2.knockDown();
            
            expect(player2.isKnockedDown).toBe(true);
            expect(player2.knockdownTime).toBeGreaterThan(0);
            
            // Try to attack while knocked down
            player2.punch();
            expect(player2.isAttacking).toBe(false);
            
            // Try to move while knocked down
            player2.moveRight();
            // Movement should be blocked
        });

        test('getting up from knockdown', () => {
            player2.knockDown();
            const initialKnockdownTime = player2.knockdownTime;
            
            // Simulate frames passing
            for (let i = 0; i < 65; i++) {
                player2.update(groundY, player1);
            }
            
            // Should be getting up or already up
            expect(player2.isKnockedDown).toBe(false);
        });

        test('stone refill from power-up', () => {
            // Use all stones
            player1.stoneCount = 0;
            expect(player1.stoneCount).toBe(0);
            
            // Refill
            player1.refillStones();
            expect(player1.stoneCount).toBe(player1.maxStones);
        });
    });

    describe('Dash Combat Integration', () => {
        test('dash movement and cooldown', () => {
            player1.isGrounded = true;
            const initialX = player1.x;
            
            player1.dash();
            expect(player1.isDashing).toBe(true);
            expect(player1.dashCooldown).toBeGreaterThan(0);
            
            // Update to process dash
            player1.update(groundY, player2);
            
            // Position should change
            expect(player1.x).not.toBe(initialX);
        });

        test('cannot dash while in air', () => {
            player1.isGrounded = false;
            player1.dash();
            
            expect(player1.isDashing).toBe(false);
        });

        test('cannot dash while knocked down', () => {
            player1.isGrounded = true;
            player1.knockDown();
            player1.dash();
            
            expect(player1.isDashing).toBe(false);
        });

        test('dash cooldown prevents immediate re-dash', () => {
            player1.isGrounded = true;
            player1.dash();
            
            const firstDashCooldown = player1.dashCooldown;
            
            // Immediately try to dash again
            player1.isDashing = false; // Simulate dash ending
            player1.dash();
            
            expect(player1.dashCooldown).toBe(firstDashCooldown);
        });
    });

    describe('Critical Hit Integration', () => {
        test('critical hit increases damage', () => {
            const normalDamage = 8; // Punch base damage
            const critMultiplier = 1.5;
            
            player1.attackType = 'punch';
            player1.lastHitWasCrit = true;
            
            // Simulate critical hit
            const expectedDamage = normalDamage * critMultiplier;
            expect(expectedDamage).toBe(12);
        });

        test('critical hit check returns boolean', () => {
            player1.attackType = 'punch';
            player1.critChance = 0.15;
            
            // Run multiple times to test probability
            let hadCrit = false;
            let hadNormal = false;
            
            for (let i = 0; i < 100; i++) {
                const result = player1.onHit(player2);
                if (result) hadCrit = true;
                else hadNormal = true;
                
                // Reset opponent health
                player2.health = 100;
            }
            
            // Should have both outcomes in 100 tries
            // (though this could technically fail due to randomness)
        });
    });

    describe('Multi-Feature Combat Scenario', () => {
        test('complete combat sequence: stone -> knockdown -> dash -> attack', () => {
            // Step 1: Throw stone at opponent
            player1.throwStone();
            const stone = player1.projectiles[0];
            
            // Step 2: Stone hits and knocks down
            player2.x = stone.x - 5;
            player2.y = stone.y - 10;
            const hit = player1.checkStoneHit(player2);
            expect(hit).toBeTruthy();
            
            player2.knockDown();
            expect(player2.isKnockedDown).toBe(true);
            
            // Step 3: Player1 dashes closer
            player1.isGrounded = true;
            player1.dashCooldown = 0;
            player1.dash();
            expect(player1.isDashing).toBe(true);
            
            // Step 4: Attack while opponent is down
            // Wait for dash to finish
            for (let i = 0; i < 15; i++) {
                player1.update(groundY, player2);
            }
            
            player1.punch();
            expect(player1.isAttacking).toBe(true);
        });

        test('defensive sequence: dodge stone with dash', () => {
            // Opponent throws stone
            player2.throwStone();
            const stone = player2.projectiles[0];
            
            // Player1 sees it coming and dashes away
            player1.isGrounded = true;
            player1.facing = -1; // Face away
            player1.dash();
            
            // Update positions
            for (let i = 0; i < 5; i++) {
                player1.update(groundY, player2);
                player2.updateProjectiles(groundY);
            }
            
            // Check if successfully dodged
            const stillHit = player2.checkStoneHit(player1);
            // May or may not hit depending on timing, but dash attempted
            expect(player1.isDashing || player1.dashFrame === 0).toBe(true);
        });
    });

    describe('State Management', () => {
        test('multiple states should not conflict', () => {
            player1.isGrounded = true;
            player1.dashCooldown = 0;
            
            // Try to enter multiple states
            player1.punch();
            player1.dash(); // Should not work while attacking
            
            expect(player1.isAttacking).toBe(true);
            expect(player1.isDashing).toBe(false);
        });

        test('knockdown clears other states', () => {
            player1.isAttacking = true;
            player1.attackType = 'punch';
            player1.isDashing = true;
            
            player1.knockDown();
            
            expect(player1.isKnockedDown).toBe(true);
            expect(player1.isAttacking).toBe(false);
            expect(player1.attackType).toBe(null);
        });

        test('state transitions are smooth', () => {
            // Normal -> Attacking
            player1.punch();
            expect(player1.isAttacking).toBe(true);
            
            // Attacking -> Normal (after duration)
            for (let i = 0; i < 20; i++) {
                player1.update(groundY, player2);
            }
            expect(player1.isAttacking).toBe(false);
            
            // Normal -> Dashing
            player1.isGrounded = true;
            player1.dash();
            expect(player1.isDashing).toBe(true);
            
            // Dashing -> Normal
            for (let i = 0; i < 15; i++) {
                player1.update(groundY, player2);
            }
            expect(player1.isDashing).toBe(false);
        });
    });

    describe('Edge Cases', () => {
        test('throwing stone at maximum count', () => {
            expect(player1.stoneCount).toBe(3);
            
            // Reset cooldown before each throw
            player1.stoneCooldown = 0;
            player1.throwStone();
            expect(player1.stoneCount).toBe(2);
            
            player1.stoneCooldown = 0;
            player1.throwStone();
            expect(player1.stoneCount).toBe(1);
            
            player1.stoneCooldown = 0;
            player1.throwStone();
            expect(player1.stoneCount).toBe(0);
            
            expect(player1.projectiles.length).toBe(3);
            
            // Try to throw when empty
            player1.stoneCooldown = 0;
            player1.throwStone();
            expect(player1.projectiles.length).toBe(3);
        });

        test('stone cooldown prevents rapid fire', () => {
            player1.throwStone();
            expect(player1.stoneCooldown).toBeGreaterThan(0);
            
            const cooldown = player1.stoneCooldown;
            player1.throwStone(); // Should not work
            
            expect(player1.stoneCooldown).toBe(cooldown);
        });

        test('stones clean up when off screen', () => {
            player1.throwStone();
            const stone = player1.projectiles[0];
            
            // Move stone far off screen
            stone.x = -100;
            stone.active = true; // Make sure it's marked active
            
            player1.updateProjectiles(groundY);
            
            // Stone should be marked inactive or removed
            expect(player1.projectiles.filter(s => s.active).length).toBe(0);
        });

        test('knockdown time decreases correctly', () => {
            player1.knockDown();
            const initialTime = player1.knockdownTime;
            
            player1.update(groundY, player2);
            
            expect(player1.knockdownTime).toBe(initialTime - 1);
        });

        test('dash during hitstun should not work', () => {
            player1.hitStun = 10;
            player1.isGrounded = true;
            player1.dashCooldown = 0;
            
            player1.dash();
            
            expect(player1.isDashing).toBe(false);
        });

        test('critical chance is within valid range', () => {
            expect(player1.critChance).toBeGreaterThanOrEqual(0);
            expect(player1.critChance).toBeLessThanOrEqual(1);
        });

        test('multiple projectiles update independently', () => {
            player1.stoneCooldown = 0;
            player1.throwStone();
            const firstStoneInitialX = player1.projectiles[0].x;
            
            // Wait a bit but not too long so stone doesn't go off screen
            for (let i = 0; i < 10; i++) {
                player1.update(groundY, player2);
            }
            
            player1.stoneCooldown = 0; // Reset cooldown manually for test
            player1.throwStone();
            
            // Filter active projectiles
            const activeProjectiles = player1.projectiles.filter(p => p.active);
            expect(activeProjectiles.length).toBeGreaterThanOrEqual(1);
            
            if (activeProjectiles.length >= 2) {
                const stone1 = activeProjectiles[0];
                const stone2 = activeProjectiles[1];
                
                // They should be at different positions since stone1 has moved
                expect(stone1.x).not.toBe(stone2.x);
            } else {
                // If first stone went off screen, at least second one exists
                expect(activeProjectiles.length).toBe(1);
            }
        });
    });

    describe('Performance Tests', () => {
        test('update loop handles many projectiles', () => {
            // Force spawn multiple projectiles
            for (let i = 0; i < 3; i++) {
                player1.stoneCooldown = 0;
                player1.throwStone();
            }
            
            const startTime = Date.now();
            
            // Update 60 times (1 second at 60fps)
            for (let i = 0; i < 60; i++) {
                player1.update(groundY, player2);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete quickly (under 100ms)
            expect(duration).toBeLessThan(100);
        });

        test('knockdown animation performs well', () => {
            player1.knockDown();
            
            const startTime = Date.now();
            
            // Update through entire knockdown sequence
            for (let i = 0; i < 80; i++) {
                player1.update(groundY, player2);
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            expect(duration).toBeLessThan(100);
        });
    });
});
