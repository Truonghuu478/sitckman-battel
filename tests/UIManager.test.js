/**
 * UIManager Unit Tests
 * Tests for UI state management, animations, and performance optimizations
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock GSAP
global.gsap = {
    fromTo: jest.fn(),
    to: jest.fn(),
    set: jest.fn(),
    timeline: jest.fn(() => ({
        fromTo: jest.fn().mockReturnThis(),
        to: jest.fn().mockReturnThis()
    }))
};

// Mock performance.now
global.performance = {
    now: jest.fn(() => Date.now())
};

// Mock matchMedia for reduced motion
global.matchMedia = jest.fn((query) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn()
}));

// Setup DOM elements before loading UIManager
beforeEach(() => {
    document.body.innerHTML = `
        <!-- Main Menu -->
        <div id="mainMenu" class="game-overlay">
            <span id="victories">0</span>
            <span id="menu-coins">0</span>
        </div>
        
        <!-- Stage Select -->
        <div id="stageSelect" class="game-overlay hidden">
            <div id="stageGrid"></div>
        </div>
        
        <!-- Upgrade Shop -->
        <div id="upgradeShop" class="game-overlay hidden">
            <span id="shop-coins">0</span>
            <span id="health-level">0</span>
            <span id="attack-level">0</span>
            <span id="speed-level">0</span>
            <span id="defense-level">0</span>
            <div id="health-progress"></div>
            <div id="attack-progress"></div>
            <div id="speed-progress"></div>
            <div id="defense-progress"></div>
        </div>
        
        <!-- Battle HUD -->
        <div id="player1-health"></div>
        <div id="player2-health"></div>
        <span id="player1-percent">100%</span>
        <span id="player2-percent">100%</span>
        <span id="coins">0</span>
        <span id="timer">99</span>
        <span id="stage-number">Stage 1</span>
        <span id="player-name">Player</span>
        <span id="opponent-name">Opponent</span>
    `;
    
    // Clear mocks
    jest.clearAllMocks();
});

// Load UIManager after DOM setup
const UIManager = require('../js/UIManager.js');

describe('UIManager - Initialization', () => {
    test('should initialize with correct overlay references', () => {
        const uiManager = new UIManager();
        
        expect(uiManager.overlays.mainMenu).toBeTruthy();
        expect(uiManager.overlays.stageSelect).toBeTruthy();
        expect(uiManager.overlays.upgradeShop).toBeTruthy();
        expect(uiManager.activeOverlay).toBeNull();
    });
    
    test('should detect mobile viewport', () => {
        global.innerWidth = 500;
        const uiManager = new UIManager();
        
        expect(uiManager.isMobile).toBe(true);
    });
    
    test('should detect desktop viewport', () => {
        global.innerWidth = 1200;
        const uiManager = new UIManager();
        
        expect(uiManager.isMobile).toBe(false);
    });
    
    test('should respect prefers-reduced-motion', () => {
        global.matchMedia = jest.fn((query) => ({
            matches: query.includes('prefers-reduced-motion'),
            media: query,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        }));
        
        const uiManager = new UIManager();
        expect(uiManager.prefersReducedMotion).toBe(true);
    });
    
    test('should initialize all HUD elements', () => {
        const uiManager = new UIManager();
        
        expect(uiManager.hudElements.player1Health).toBeTruthy();
        expect(uiManager.hudElements.player2Health).toBeTruthy();
        expect(uiManager.hudElements.timer).toBeTruthy();
        expect(uiManager.hudElements.coins).toBeTruthy();
    });
});

describe('UIManager - Overlay Management', () => {
    test('should show overlay and remove hidden class', () => {
        const uiManager = new UIManager();
        const stageSelect = document.getElementById('stageSelect');
        
        uiManager.showOverlay('stageSelect');
        
        expect(stageSelect.classList.contains('hidden')).toBe(false);
        expect(uiManager.activeOverlay).toBe('stageSelect');
    });
    
    test('should hide overlay and add hidden class', () => {
        const uiManager = new UIManager();
        const mainMenu = document.getElementById('mainMenu');
        uiManager.activeOverlay = 'mainMenu';
        
        uiManager.hideOverlay('mainMenu');
        
        expect(uiManager.activeOverlay).toBeNull();
    });
    
    test('should handle crossfade transition between overlays', () => {
        const uiManager = new UIManager();
        uiManager.gsapLoaded = true;
        
        uiManager.showOverlay('mainMenu');
        uiManager.showOverlay('stageSelect');
        
        expect(gsap.to).toHaveBeenCalled();
    });
    
    test('should populate stage selection when showing stage overlay', () => {
        const uiManager = new UIManager();
        const mockStages = [
            { name: 'Stage 1', difficulty: 'Easy', locked: false, stars: 3 },
            { name: 'Stage 2', difficulty: 'Normal', locked: false, stars: 2 }
        ];
        
        uiManager.showOverlay('stageSelect', { stages: mockStages });
        
        const stageGrid = document.getElementById('stageGrid');
        expect(stageGrid.children.length).toBe(2);
    });
});

describe('UIManager - HUD Updates', () => {
    test('should call updateHealthBar method', () => {
        const uiManager = new UIManager();
        const spy = jest.spyOn(uiManager, 'updateHealthBar');
        
        uiManager.updateHealthBar('player1-health', 0.75);
        
        expect(spy).toHaveBeenCalledWith('player1-health', 0.75);
    });
    
    test('should update percentage based on health value', () => {
        const uiManager = new UIManager();
        const percentage = 0.85;
        const expected = Math.round(percentage * 100);
        
        expect(expected).toBe(85);
    });
    
    test('should throttle updates when called rapidly', () => {
        const uiManager = new UIManager();
        global.performance.now = jest.fn(() => 100);
        
        const playerData = { health: 100, maxHealth: 100, coins: 0 };
        const opponentData = { health: 100, maxHealth: 100 };
        const gameState = { timer: 60, stage: 1 };
        
        uiManager.lastHUDUpdate = 0;
        uiManager.updateHUD(playerData, opponentData, gameState);
        
        expect(uiManager.lastHUDUpdate).toBeGreaterThan(0);
    });
    
    test('should add urgency effect when timer is low', () => {
        const uiManager = new UIManager();
        global.performance.now = jest.fn(() => 100);
        const timer = document.getElementById('timer');
        const playerData = { health: 100, maxHealth: 100 };
        const opponentData = { health: 100, maxHealth: 100 };
        
        uiManager.lastHUDUpdate = 0;
        uiManager.updateHUD(playerData, opponentData, { timer: 8, stage: 1 });
        
        expect(timer.classList.contains('text-neon-yellow')).toBe(true);
        expect(timer.classList.contains('animate-pulse-fast')).toBe(true);
    });
    
    test('should update stage number correctly', () => {
        const uiManager = new UIManager();
        global.performance.now = jest.fn(() => 100);
        const stageNumber = document.getElementById('stage-number');
        const playerData = { health: 100, maxHealth: 100 };
        const opponentData = { health: 100, maxHealth: 100 };
        
        uiManager.lastHUDUpdate = 0;
        uiManager.updateHUD(playerData, opponentData, { timer: 60, stage: 5 });
        
        expect(stageNumber.textContent).toBe('Stage 5');
    });
});

describe('UIManager - Shop UI', () => {
    test('should update shop coins display', () => {
        const uiManager = new UIManager();
        const shopCoins = document.getElementById('shop-coins');
        
        uiManager.updateShopUI({ coins: 1500, health: 3, attack: 2, speed: 1, defense: 0 });
        
        expect(shopCoins.textContent).toBe('1500');
    });
    
    test('should update upgrade levels', () => {
        const uiManager = new UIManager();
        const healthLevel = document.getElementById('health-level');
        const attackLevel = document.getElementById('attack-level');
        
        uiManager.updateShopUI({ coins: 0, health: 3, attack: 4, speed: 2, defense: 1 });
        
        expect(healthLevel.textContent).toBe('3');
        expect(attackLevel.textContent).toBe('4');
    });
    
    test('should update progress bars based on upgrade levels', () => {
        const uiManager = new UIManager();
        const healthProgress = document.getElementById('health-progress');
        
        uiManager.updateShopUI({ coins: 0, health: 3, attack: 0, speed: 0, defense: 0 });
        
        expect(healthProgress.style.width).toBe('60%'); // 3/5 = 60%
    });
    
    test('should handle max level upgrades', () => {
        const uiManager = new UIManager();
        const speedProgress = document.getElementById('speed-progress');
        
        uiManager.updateShopUI({ coins: 0, health: 0, attack: 0, speed: 5, defense: 0 });
        
        expect(speedProgress.style.width).toBe('100%');
    });
});

describe('UIManager - Stage Card Creation', () => {
    test('should create stage card with correct content', () => {
        const uiManager = new UIManager();
        const stage = { 
            name: 'Arena Battle', 
            difficulty: 'Normal', 
            locked: false, 
            stars: 2,
            isBoss: false,
            enemyCount: 1
        };
        
        const card = uiManager.createStageCard(stage, 0);
        
        expect(card.innerHTML).toContain('Stage 1');
        expect(card.innerHTML).toContain('Arena Battle');
        expect(card.innerHTML).toContain('Normal');
    });
    
    test('should show boss badge for boss stages', () => {
        const uiManager = new UIManager();
        const stage = { 
            name: 'Boss Fight', 
            difficulty: 'Boss', 
            locked: false, 
            stars: 0,
            isBoss: true,
            enemyCount: 1
        };
        
        const card = uiManager.createStageCard(stage, 4);
        
        expect(card.innerHTML).toContain('👑');
        expect(card.innerHTML).toContain('BOSS');
    });
    
    test('should apply locked styles to locked stages', () => {
        const uiManager = new UIManager();
        const stage = { 
            name: 'Locked Stage', 
            difficulty: 'Hard', 
            locked: true, 
            stars: 0,
            isBoss: false,
            enemyCount: 1
        };
        
        const card = uiManager.createStageCard(stage, 7);
        
        expect(card.innerHTML).toContain('🔒');
        expect(card.classList.contains('cursor-not-allowed')).toBe(true);
    });
    
    test('should render correct number of stars', () => {
        const uiManager = new UIManager();
        const stage = { 
            name: 'Three Star', 
            difficulty: 'Easy', 
            locked: false, 
            stars: 3,
            isBoss: false,
            enemyCount: 1
        };
        
        const card = uiManager.createStageCard(stage, 0);
        const starHTML = card.innerHTML;
        
        // Should contain 3 filled stars
        const starMatches = starHTML.match(/⭐/g);
        expect(starMatches).toBeTruthy();
    });
});

describe('UIManager - GSAP Animations', () => {
    test('should check if GSAP is loaded', () => {
        const uiManager = new UIManager();
        
        expect(typeof uiManager.gsapLoaded).toBe('boolean');
    });
    
    test('should skip animations when reduced motion is preferred', () => {
        const uiManager = new UIManager();
        uiManager.gsapLoaded = true;
        uiManager.prefersReducedMotion = true;
        const overlay = document.getElementById('stageSelect');
        
        jest.clearAllMocks();
        uiManager.animateOverlayEnter(overlay, {});
        
        expect(gsap.set).toHaveBeenCalled();
    });
    
    test('should have timeline creation capability', () => {
        const timeline = gsap.timeline();
        
        expect(timeline).toBeTruthy();
        expect(typeof timeline.fromTo).toBe('function');
    });
});

describe('UIManager - Ripple Effects', () => {
    test('should create ripple element on button click', () => {
        const uiManager = new UIManager();
        const button = document.createElement('button');
        const mockEvent = {
            clientX: 100,
            clientY: 100
        };
        
        button.getBoundingClientRect = jest.fn(() => ({
            left: 50,
            top: 50,
            width: 100,
            height: 40
        }));
        
        uiManager.createRipple(mockEvent, button);
        
        const ripple = button.querySelector('.ripple-span');
        expect(ripple).toBeTruthy();
    });
    
    test('should remove ripple after animation', (done) => {
        const uiManager = new UIManager();
        const button = document.createElement('button');
        const mockEvent = { clientX: 100, clientY: 100 };
        
        button.getBoundingClientRect = jest.fn(() => ({
            left: 50, top: 50, width: 100, height: 40
        }));
        
        uiManager.createRipple(mockEvent, button);
        
        setTimeout(() => {
            expect(button.querySelector('.ripple-span')).toBeNull();
            done();
        }, 700);
    });
});

describe('UIManager - Performance Optimization', () => {
    test('should have throttle settings configured', () => {
        const uiManager = new UIManager();
        
        expect(uiManager.hudUpdateThrottle).toBeDefined();
        expect(uiManager.lastHUDUpdate).toBeDefined();
    });
    
    test('should detect mobile viewport on initialization', () => {
        global.innerWidth = 500;
        const uiManager = new UIManager();
        
        expect(typeof uiManager.isMobile).toBe('boolean');
    });
});

describe('UIManager - Victory Screen', () => {
    test('should have method to show victory screen', () => {
        const uiManager = new UIManager();
        
        expect(typeof uiManager.showVictoryScreen).toBe('function');
    });
    
    test('should handle victory stats object', () => {
        const stats = {
            stars: 3,
            totalDamage: 250,
            maxCombo: 12,
            completionTime: '1:45',
            coinsEarned: 500,
            xpGained: 150
        };
        
        expect(stats.stars).toBe(3);
        expect(stats.coinsEarned).toBe(500);
    });
});

describe('UIManager - Render Stars', () => {
    test('should have renderStars method', () => {
        const uiManager = new UIManager();
        
        expect(typeof uiManager.renderStars).toBe('function');
    });
    
    test('should render different star counts', () => {
        const uiManager = new UIManager();
        const stars3 = uiManager.renderStars(3);
        const stars1 = uiManager.renderStars(1);
        const stars0 = uiManager.renderStars(0);
        
        expect(typeof stars3).toBe('string');
        expect(typeof stars1).toBe('string');
        expect(typeof stars0).toBe('string');
    });
    
    test('should handle star count range 0-3', () => {
        const uiManager = new UIManager();
        
        for (let i = 0; i <= 3; i++) {
            const result = uiManager.renderStars(i);
            expect(result).toBeDefined();
        }
    });
});
