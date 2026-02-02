const { describe, test, expect, beforeEach, afterEach } = require('@jest/globals');

// Load CampaignManager
const fs = require('fs');
const path = require('path');
const campaignCode = fs.readFileSync(path.join(__dirname, '../js/CampaignManager.js'), 'utf8');
eval(campaignCode);

describe('CampaignManager Class', () => {
    let campaignManager;

    beforeEach(() => {
        localStorage.clear();
        campaignManager = new CampaignManager();
    });

    afterEach(() => {
        localStorage.clear();
    });

    describe('Initialization', () => {
        test('should initialize with 10 stages', () => {
            expect(campaignManager.stages).toHaveLength(10);
            expect(campaignManager.maxStage).toBe(10);
        });

        test('should start at stage 1', () => {
            expect(campaignManager.currentStage).toBe(1);
        });

        test('should initialize player stats', () => {
            expect(campaignManager.playerStats).toHaveProperty('coins');
            expect(campaignManager.playerStats).toHaveProperty('upgrades');
            expect(campaignManager.playerStats.currentStage).toBe(1);
            expect(campaignManager.playerStats.maxStageReached).toBe(1);
        });

        test('should have all upgrades at level 0', () => {
            const upgrades = campaignManager.playerStats.upgrades;
            expect(upgrades.maxHealth).toBe(0);
            expect(upgrades.attackPower).toBe(0);
            expect(upgrades.speed).toBe(0);
            expect(upgrades.defense).toBe(0);
        });
    });

    describe('Stage Management', () => {
        test('should get current stage info', () => {
            const stage = campaignManager.getCurrentStage();
            expect(stage.id).toBe(1);
            expect(stage).toHaveProperty('name');
            expect(stage).toHaveProperty('opponent');
            expect(stage).toHaveProperty('reward');
        });

        test('should complete stage and earn reward', () => {
            const initialCoins = campaignManager.playerStats.coins;
            const reward = campaignManager.completeStage();
            
            expect(campaignManager.playerStats.coins).toBe(initialCoins + reward);
            expect(campaignManager.playerStats.victories).toBe(1);
        });

        test('should unlock next stage after completion', () => {
            campaignManager.completeStage();
            expect(campaignManager.playerStats.maxStageReached).toBe(2);
        });

        test('should advance to next stage', () => {
            const result = campaignManager.nextStage();
            expect(result).toBe(true);
            expect(campaignManager.currentStage).toBe(2);
        });

        test('should not advance beyond max stage', () => {
            campaignManager.currentStage = 10;
            const result = campaignManager.nextStage();
            expect(result).toBe(false);
            expect(campaignManager.currentStage).toBe(10);
        });

        test('should select unlocked stage', () => {
            campaignManager.playerStats.maxStageReached = 5;
            const result = campaignManager.selectStage(3);
            expect(result).toBe(true);
            expect(campaignManager.currentStage).toBe(3);
        });

        test('should not select locked stage', () => {
            campaignManager.playerStats.maxStageReached = 3;
            const result = campaignManager.selectStage(5);
            expect(result).toBe(false);
        });
    });

    describe('Stages Data', () => {
        test('stage 1 should be tutorial', () => {
            const stage1 = campaignManager.stages[0];
            expect(stage1.name).toContain('Tập Luyện');
            expect(stage1.opponent.difficulty).toBe('easy');
        });

        test('stage 5 should be first boss', () => {
            const stage5 = campaignManager.stages[4];
            expect(stage5.opponent.isBoss).toBe(true);
            expect(stage5.opponent.difficulty).toBe('hard');
        });

        test('stage 10 should be final boss', () => {
            const stage10 = campaignManager.stages[9];
            expect(stage10.opponent.isBoss).toBe(true);
            expect(stage10.opponent.difficulty).toBe('boss');
        });

        test('boss stages should have higher rewards', () => {
            const regularStage = campaignManager.stages[0];
            const bossStage = campaignManager.stages[4];
            expect(bossStage.reward).toBeGreaterThan(regularStage.reward);
        });
    });

    describe('Upgrade System', () => {
        beforeEach(() => {
            campaignManager.playerStats.coins = 1000;
        });

        test('should check if upgrade is affordable', () => {
            const canUpgrade = campaignManager.canUpgrade('maxHealth');
            expect(canUpgrade).toBe(true);
        });

        test('should not upgrade without enough coins', () => {
            campaignManager.playerStats.coins = 50;
            const canUpgrade = campaignManager.canUpgrade('maxHealth');
            expect(canUpgrade).toBe(false);
        });

        test('should purchase upgrade', () => {
            const initialCoins = campaignManager.playerStats.coins;
            const cost = campaignManager.getUpgradeCost('maxHealth');
            
            const success = campaignManager.purchaseUpgrade('maxHealth');
            
            expect(success).toBe(true);
            expect(campaignManager.playerStats.coins).toBe(initialCoins - cost);
            expect(campaignManager.playerStats.upgrades.maxHealth).toBe(1);
        });

        test('should not upgrade beyond max level', () => {
            campaignManager.playerStats.upgrades.maxHealth = 5;
            const canUpgrade = campaignManager.canUpgrade('maxHealth');
            expect(canUpgrade).toBe(false);
        });

        test('upgrade cost should increase with level', () => {
            const cost1 = campaignManager.getUpgradeCost('attackPower');
            campaignManager.purchaseUpgrade('attackPower');
            const cost2 = campaignManager.getUpgradeCost('attackPower');
            
            expect(cost2).toBeGreaterThan(cost1);
        });

        test('should apply max health upgrade', () => {
            const mockPlayer = { maxHealth: 100, health: 100 };
            campaignManager.playerStats.upgrades.maxHealth = 3;
            
            campaignManager.applyUpgradesToPlayer(mockPlayer);
            
            expect(mockPlayer.maxHealth).toBe(130); // 100 + (3 * 10)
        });

        test('should apply speed upgrade', () => {
            const mockPlayer = { speed: 5, maxHealth: 100, health: 100 };
            campaignManager.playerStats.upgrades.speed = 2;
            
            campaignManager.applyUpgradesToPlayer(mockPlayer);
            
            expect(mockPlayer.speed).toBe(6); // 5 + (2 * 0.5)
        });
    });

    describe('Damage Calculation', () => {
        test('should calculate damage with attack power', () => {
            const baseDamage = 10;
            const attackLevel = 3;
            
            const damage = campaignManager.calculateDamage(baseDamage, attackLevel);
            
            expect(damage).toBe(16); // 10 + (3 * 2)
        });

        test('should calculate defense reduction', () => {
            const damage = 100;
            const defenseLevel = 2;
            
            const reducedDamage = campaignManager.calculateDefense(damage, defenseLevel);
            
            expect(reducedDamage).toBe(80); // 100 * (1 - 0.2)
        });

        test('defense should not reduce damage below 1', () => {
            const damage = 5;
            const defenseLevel = 5;
            
            const reducedDamage = campaignManager.calculateDefense(damage, defenseLevel);
            
            expect(reducedDamage).toBeGreaterThan(0);
        });
    });

    describe('Save/Load', () => {
        test('should save player stats to localStorage', () => {
            campaignManager.playerStats.coins = 500;
            campaignManager.playerStats.victories = 5;
            
            campaignManager.savePlayerStats();
            
            expect(localStorage.setItem).toHaveBeenCalledWith(
                'stickman_campaign',
                expect.any(String)
            );
        });

        test('should load saved stats', () => {
            const savedData = {
                coins: 750,
                victories: 8,
                maxStageReached: 6,
                currentStage: 6,
                upgrades: {
                    maxHealth: 2,
                    attackPower: 1,
                    speed: 1,
                    defense: 0
                }
            };
            
            localStorage.getItem.mockReturnValue(JSON.stringify(savedData));
            
            const newManager = new CampaignManager();
            
            expect(newManager.playerStats.coins).toBe(750);
            expect(newManager.playerStats.victories).toBe(8);
        });

        test('should reset progress', () => {
            campaignManager.playerStats.coins = 500;
            campaignManager.playerStats.victories = 10;
            campaignManager.currentStage = 5;
            
            campaignManager.reset();
            
            expect(campaignManager.playerStats.coins).toBe(0);
            expect(campaignManager.playerStats.victories).toBe(0);
            expect(campaignManager.currentStage).toBe(1);
        });
    });

    describe('Game Completion', () => {
        test('should detect game completion', () => {
            campaignManager.playerStats.maxStageReached = 11;
            expect(campaignManager.isGameCompleted()).toBe(true);
        });

        test('should not be completed before finishing all stages', () => {
            campaignManager.playerStats.maxStageReached = 8;
            expect(campaignManager.isGameCompleted()).toBe(false);
        });
    });
});
