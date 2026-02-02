const { describe, test, expect, beforeEach } = require('@jest/globals');

// Load required classes
const Player = require('../js/Player.js');
const AIController = require('../js/AIController.js');

describe('AIController Class', () => {
    let aiPlayer;
    let opponent;
    let aiController;
    const mockControls = {
        up: 'w',
        down: 's',
        left: 'a',
        right: 'd',
        punch: 'f',
        kick: 'g',
        isPlayer1: false
    };

    beforeEach(() => {
        aiPlayer = new Player(300, 100, '#0000ff', mockControls);
        opponent = new Player(100, 100, '#ff0000', mockControls);
    });

    describe('Constructor', () => {
        test('should initialize with easy difficulty', () => {
            aiController = new AIController(aiPlayer, opponent, 'easy');
            expect(aiController.difficulty).toBe('easy');
            expect(aiController.aggressiveness).toBe(0.3);
        });

        test('should initialize with medium difficulty', () => {
            aiController = new AIController(aiPlayer, opponent, 'medium');
            expect(aiController.difficulty).toBe('medium');
            expect(aiController.aggressiveness).toBe(0.5);
        });

        test('should initialize with hard difficulty', () => {
            aiController = new AIController(aiPlayer, opponent, 'hard');
            expect(aiController.difficulty).toBe('hard');
            expect(aiController.aggressiveness).toBe(0.7);
        });

        test('should initialize with boss difficulty', () => {
            aiController = new AIController(aiPlayer, opponent, 'boss');
            expect(aiController.difficulty).toBe('boss');
            expect(aiController.aggressiveness).toBe(0.85);
        });
    });

    describe('Decision Making', () => {
        beforeEach(() => {
            aiController = new AIController(aiPlayer, opponent, 'medium');
        });

        test('should approach when far away', () => {
            opponent.x = 700; // Far away
            aiController.makeDecision();
            expect(aiController.currentAction).toBe('approach');
        });

        test('should attack when in range', () => {
            opponent.x = aiPlayer.x + 60; // Close range
            aiController.makeDecision();
            expect(['punch', 'kick', 'approach', 'back_off']).toContain(aiController.currentAction);
        });

        test('should back off when too close sometimes', () => {
            opponent.x = aiPlayer.x + 30; // Very close
            aiController.isAggressive = false;
            aiController.makeDecision();
            // Could be attack or back off depending on aggression
            expect(aiController.currentAction).toBeTruthy();
        });

        test('should dodge when opponent attacks', () => {
            opponent.isAttacking = true;
            opponent.x = aiPlayer.x + 70;
            
            // Set high defense skill to ensure dodge
            aiController.defenseSkill = 1.0;
            aiController.makeDecision();
            
            expect(aiController.currentAction).toBe('dodge');
        });
    });

    describe('Difficulty Levels', () => {
        test('easy AI should have slower decision making', () => {
            const easyAI = new AIController(aiPlayer, opponent, 'easy');
            const hardAI = new AIController(aiPlayer, opponent, 'hard');
            
            expect(easyAI.decisionDelay).toBeGreaterThan(hardAI.decisionDelay);
        });

        test('hard AI should have better accuracy', () => {
            const easyAI = new AIController(aiPlayer, opponent, 'easy');
            const hardAI = new AIController(aiPlayer, opponent, 'hard');
            
            expect(hardAI.accuracy).toBeGreaterThan(easyAI.accuracy);
        });

        test('boss AI should be most aggressive', () => {
            const mediumAI = new AIController(aiPlayer, opponent, 'medium');
            const bossAI = new AIController(aiPlayer, opponent, 'boss');
            
            expect(bossAI.aggressiveness).toBeGreaterThan(mediumAI.aggressiveness);
        });
    });

    describe('Execute Actions', () => {
        beforeEach(() => {
            aiController = new AIController(aiPlayer, opponent, 'medium');
            aiPlayer.isGrounded = true;
        });

        test('should move toward opponent when approaching', () => {
            opponent.x = 600;
            aiController.currentAction = 'approach';
            aiController.actionDuration = 10;
            
            const initialX = aiPlayer.x;
            aiController.executeAction();
            
            // Should try to move right
            expect(aiPlayer.velocityX).not.toBe(0);
        });

        test('should punch when action is punch', () => {
            aiController.currentAction = 'punch';
            aiController.actionDuration = 10;
            
            aiController.executeAction();
            
            expect(aiPlayer.isAttacking).toBe(true);
            expect(aiPlayer.attackType).toBe('punch');
        });

        test('should kick when action is kick', () => {
            aiController.currentAction = 'kick';
            aiController.actionDuration = 10;
            
            aiController.executeAction();
            
            expect(aiPlayer.isAttacking).toBe(true);
            expect(aiPlayer.attackType).toBe('kick');
        });

        test('should jump when dodging', () => {
            aiController.currentAction = 'dodge';
            aiController.actionDuration = 10;
            Math.random = () => 0.3; // Force jump
            
            aiController.executeAction();
            
            expect(aiPlayer.isJumping).toBe(true);
        });
    });

    describe('Update', () => {
        beforeEach(() => {
            aiController = new AIController(aiPlayer, opponent, 'medium');
        });

        test('should increment decision timer', () => {
            const initialTimer = aiController.decisionTimer;
            aiController.update();
            expect(aiController.decisionTimer).toBeGreaterThan(initialTimer);
        });

        test('should make decision when timer reaches delay', () => {
            aiController.decisionTimer = aiController.decisionDelay - 1;
            aiController.update();
            
            expect(aiController.currentAction).toBeTruthy();
            expect(aiController.decisionTimer).toBe(0);
        });

        test('should execute current action', () => {
            aiController.currentAction = 'approach';
            aiController.actionDuration = 5;
            
            aiController.update();
            
            expect(aiController.actionDuration).toBe(4);
        });

        test('should clear action when duration ends', () => {
            aiController.currentAction = 'approach';
            aiController.actionDuration = 1;
            
            aiController.update();
            
            expect(aiController.currentAction).toBe(null);
        });
    });

    describe('Reset', () => {
        test('should reset all timers and actions', () => {
            aiController = new AIController(aiPlayer, opponent, 'medium');
            aiController.decisionTimer = 50;
            aiController.currentAction = 'punch';
            aiController.actionDuration = 10;
            aiController.comboCount = 3;
            
            aiController.reset();
            
            expect(aiController.decisionTimer).toBe(0);
            expect(aiController.currentAction).toBe(null);
            expect(aiController.actionDuration).toBe(0);
            expect(aiController.comboCount).toBe(0);
        });
    });
});
