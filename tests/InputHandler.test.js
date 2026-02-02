const { describe, test, expect, beforeEach } = require('@jest/globals');

// Load InputHandler
const InputHandler = require('../js/InputHandler.js');
const Player = require('../js/Player.js');

describe('InputHandler Class', () => {
    let inputHandler;
    let player;

    beforeEach(() => {
        inputHandler = new InputHandler();
        const controls = inputHandler.getPlayer1Controls();
        player = new Player(100, 100, '#ff0000', controls);
        player.isGrounded = true;
    });

    describe('Initialization', () => {
        test('should initialize with empty keys object', () => {
            expect(inputHandler.keys).toEqual({});
        });

        test('should have player 1 controls defined', () => {
            const controls = inputHandler.getPlayer1Controls();
            expect(controls.up).toBe('w');
            expect(controls.down).toBe('s');
            expect(controls.left).toBe('a');
            expect(controls.right).toBe('d');
            expect(controls.punch).toBe('f');
            expect(controls.kick).toBe('g');
        });

        test('should have player 2 controls defined', () => {
            const controls = inputHandler.getPlayer2Controls();
            expect(controls.up).toBe('ArrowUp');
            expect(controls.down).toBe('ArrowDown');
            expect(controls.left).toBe('ArrowLeft');
            expect(controls.right).toBe('ArrowRight');
            expect(controls.punch).toBe('1');
            expect(controls.kick).toBe('2');
        });
    });

    describe('Key Tracking', () => {
        test('should track pressed keys', () => {
            inputHandler.keys['w'] = true;
            expect(inputHandler.isKeyPressed('w')).toBe(true);
        });

        test('should return false for unpressed keys', () => {
            expect(inputHandler.isKeyPressed('w')).toBe(false);
        });

        test('should handle multiple keys', () => {
            inputHandler.keys['w'] = true;
            inputHandler.keys['d'] = true;
            expect(inputHandler.isKeyPressed('w')).toBe(true);
            expect(inputHandler.isKeyPressed('d')).toBe(true);
            expect(inputHandler.isKeyPressed('a')).toBe(false);
        });
    });

    describe('Player Input Handling', () => {
        test('should move player left when A is pressed', () => {
            inputHandler.keys['a'] = true;
            const initialVelocity = player.velocityX;
            
            inputHandler.handlePlayerInput(player, player.controls);
            
            expect(player.velocityX).toBeLessThan(initialVelocity);
            expect(player.facing).toBe(-1);
        });

        test('should move player right when D is pressed', () => {
            inputHandler.keys['d'] = true;
            const initialVelocity = player.velocityX;
            
            inputHandler.handlePlayerInput(player, player.controls);
            
            expect(player.velocityX).toBeGreaterThan(initialVelocity);
            expect(player.facing).toBe(1);
        });

        test('should make player jump when W is pressed', () => {
            inputHandler.keys['w'] = true;
            player.isGrounded = true;
            
            inputHandler.handlePlayerInput(player, player.controls);
            
            expect(player.isJumping).toBe(true);
        });

        test('should make player crouch when S is pressed', () => {
            inputHandler.keys['s'] = true;
            
            inputHandler.handlePlayerInput(player, player.controls);
            
            expect(player.isCrouching).toBe(true);
        });

        test('should make player stand when S is released', () => {
            player.isCrouching = true;
            inputHandler.keys['s'] = false;
            
            inputHandler.handlePlayerInput(player, player.controls);
            
            expect(player.isCrouching).toBe(false);
        });

        test('should make player punch when F is pressed', () => {
            inputHandler.keys['f'] = true;
            
            inputHandler.handlePlayerInput(player, player.controls);
            
            expect(player.isAttacking).toBe(true);
            expect(player.attackType).toBe('punch');
        });

        test('should make player kick when G is pressed', () => {
            inputHandler.keys['g'] = true;
            
            inputHandler.handlePlayerInput(player, player.controls);
            
            expect(player.isAttacking).toBe(true);
            expect(player.attackType).toBe('kick');
        });

        test('should apply friction when no horizontal input', () => {
            player.velocityX = 10;
            player.isGrounded = true;
            inputHandler.keys = {};
            
            inputHandler.handlePlayerInput(player, player.controls);
            
            expect(Math.abs(player.velocityX)).toBeLessThan(10);
        });
    });

    describe('Reset', () => {
        test('should clear all keys', () => {
            inputHandler.keys = {
                'w': true,
                'a': true,
                'd': true,
                'f': true
            };
            
            inputHandler.reset();
            
            expect(inputHandler.keys).toEqual({});
        });
    });

    describe('Player 2 Controls', () => {
        let player2;

        beforeEach(() => {
            const controls = inputHandler.getPlayer2Controls();
            player2 = new Player(300, 100, '#0000ff', controls);
            player2.isGrounded = true;
        });

        test('should handle arrow keys for movement', () => {
            inputHandler.keys['ArrowLeft'] = true;
            
            inputHandler.handlePlayerInput(player2, player2.controls);
            
            expect(player2.facing).toBe(-1);
        });

        test('should handle number keys for attacks', () => {
            inputHandler.keys['1'] = true;
            
            inputHandler.handlePlayerInput(player2, player2.controls);
            
            expect(player2.isAttacking).toBe(true);
            expect(player2.attackType).toBe('punch');
        });
    });
});
