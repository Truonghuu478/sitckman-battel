/**
 * UIManager - Manages all UI states, overlays, and animations
 * Integrates with Game.js and uses GSAP for smooth animations
 */

class UIManager {
    constructor() {
        this.overlays = {
            mainMenu: document.getElementById('mainMenu'),
            stageSelect: document.getElementById('stageSelect'),
            upgradeShop: document.getElementById('upgradeShop'),
            victoryScreen: null, // Will be created dynamically
        };
        
        this.activeOverlay = null;
        this.gsapLoaded = false;
        
        // Performance optimization flags
        this.isMobile = window.innerWidth < 768;
        this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.lastHUDUpdate = 0;
        this.hudUpdateThrottle = 16; // ~60fps
        
        this.initializeElements();
        this.loadGSAP();
        this.setupPerformanceListeners();
    }
    
    /**
     * Initialize DOM element references
     */
    initializeElements() {
        // HUD elements
        this.hudElements = {
            player1Health: document.getElementById('player1-health'),
            player2Health: document.getElementById('player2-health'),
            player1Percent: document.getElementById('player1-percent'),
            player2Percent: document.getElementById('player2-percent'),
            coins: document.getElementById('coins'),
            timer: document.getElementById('timer'),
            stageNumber: document.getElementById('stage-number'),
            playerName: document.getElementById('player-name'),
            opponentName: document.getElementById('opponent-name'),
        };
        
        // Menu stats
        this.menuStats = {
            victories: document.getElementById('victories'),
            coins: document.getElementById('menu-coins'),
        };
        
        // Shop elements
        this.shopElements = {
            coins: document.getElementById('shop-coins'),
            healthLevel: document.getElementById('health-level'),
            attackLevel: document.getElementById('attack-level'),
            speedLevel: document.getElementById('speed-level'),
            defenseLevel: document.getElementById('defense-level'),
            healthProgress: document.getElementById('health-progress'),
            attackProgress: document.getElementById('attack-progress'),
            speedProgress: document.getElementById('speed-progress'),
            defenseProgress: document.getElementById('defense-progress'),
        };
        
        // Add ripple effect to buttons
        this.initializeRippleEffects();
    }
    
    /**
     * Initialize ripple effects on buttons
     */
    initializeRippleEffects() {
        const rippleButtons = document.querySelectorAll('.ripple-btn');
        rippleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.createRipple(e, button);
            });
        });
    }
    
    /**
     * Setup performance optimization listeners
     */
    setupPerformanceListeners() {
        // Detect mobile/tablet resize
        window.addEventListener('resize', () => {
            this.isMobile = window.innerWidth < 768;
        });
        
        // Detect reduced motion preference
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        motionQuery.addEventListener('change', (e) => {
            this.prefersReducedMotion = e.matches;
        });
    }
    
    /**
     * Load GSAP library dynamically
     */
    async loadGSAP() {
        if (typeof gsap !== 'undefined') {
            this.gsapLoaded = true;
            return;
        }
        
        try {
            // GSAP is already loaded via CDN in HTML
            await new Promise((resolve) => {
                const checkGSAP = setInterval(() => {
                    if (typeof gsap !== 'undefined') {
                        clearInterval(checkGSAP);
                        this.gsapLoaded = true;
                        resolve();
                    }
                }, 100);
            });
        } catch (error) {
            console.warn('GSAP not available, using CSS animations fallback');
            this.gsapLoaded = false;
        }
    }
    
    /**
     * Show overlay with animation
     */
    showOverlay(name, data = {}) {
        const overlay = this.overlays[name];
        if (!overlay) return;
        
        // Crossfade transition if switching overlays
        if (this.activeOverlay && this.activeOverlay !== name && this.gsapLoaded) {
            const previousOverlay = this.overlays[this.activeOverlay];
            if (previousOverlay) {
                gsap.to(previousOverlay, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.3,
                    ease: 'power2.in',
                    onComplete: () => {
                        previousOverlay.classList.add('hidden');
                        gsap.set(previousOverlay, { scale: 1 }); // Reset for next time
                    }
                });
            }
        } else if (this.activeOverlay && this.activeOverlay !== name) {
            this.hideOverlay(this.activeOverlay);
        }
        
        overlay.classList.remove('hidden');
        
        // Populate data before animation
        if (name === 'stageSelect' && data.stages) {
            this.populateStageSelection(data.stages);
        }
        
        if (this.gsapLoaded) {
            this.animateOverlayEnter(overlay, data);
        } else {
            overlay.style.opacity = '1';
        }
        
        this.activeOverlay = name;
    }
    
    /**
     * Hide overlay with animation
     */
    hideOverlay(name) {
        const overlay = this.overlays[name];
        if (!overlay) return;
        
        if (this.gsapLoaded) {
            gsap.to(overlay, {
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    overlay.classList.add('hidden');
                }
            });
        } else {
            overlay.classList.add('hidden');
        }
        
        if (this.activeOverlay === name) {
            this.activeOverlay = null;
        }
    }
    
    /**
     * Animate overlay entrance with GSAP
     */
    animateOverlayEnter(overlay, data) {
        if (!this.gsapLoaded) return;
        
        // Respect reduced motion preference
        if (this.prefersReducedMotion) {
            gsap.set(overlay, { opacity: 1 });
            return;
        }
        
        // Main overlay fade in with scale
        gsap.fromTo(overlay,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }
        );
        
        // Stagger animations for different element types
        const timeline = gsap.timeline({ delay: 0.1 });
        
        // Animate headers
        const headers = overlay.querySelectorAll('h1, h2, .text-5xl, .text-6xl');
        if (headers.length > 0) {
            timeline.fromTo(headers,
                { opacity: 0, y: -30 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "back.out(1.2)" },
                0
            );
        }
        
        // Animate cards with stagger
        const cards = overlay.querySelectorAll('.glass-card, .stat-card, .upgrade-card, .stage-card');
        if (cards.length > 0) {
            timeline.fromTo(cards,
                { opacity: 0, y: 30, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(1.4)" },
                0.2
            );
        }
        
        // Animate buttons
        const buttons = overlay.querySelectorAll('.btn-glass, .btn-base, .neon-button');
        if (buttons.length > 0) {
            timeline.fromTo(buttons,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" },
                0.3
            );
        }
    }
    
    /**
     * Update HUD during gameplay with throttling
     */
    updateHUD(playerData, opponentData, gameState) {
        // Throttle updates for performance (60fps max)
        const now = performance.now();
        if (now - this.lastHUDUpdate < this.hudUpdateThrottle) {
            return;
        }
        this.lastHUDUpdate = now;
        
        // Update health bars
        this.updateHealthBar('player1-health', playerData.health / playerData.maxHealth);
        this.updateHealthBar('player2-health', opponentData.health / opponentData.maxHealth);
        
        // Update coins
        if (this.hudElements.coins) {
            this.hudElements.coins.textContent = playerData.coins || 0;
        }
        
        // Update timer
        if (this.hudElements.timer && gameState.timer !== undefined) {
            this.hudElements.timer.textContent = Math.ceil(gameState.timer);
            
            // Add urgency effect when time is low
            if (gameState.timer <= 10) {
                this.hudElements.timer.classList.add('text-neon-yellow', 'animate-pulse-fast');
            } else {
                this.hudElements.timer.classList.remove('text-neon-yellow', 'animate-pulse-fast');
            }
        }
        
        // Update stage number
        if (this.hudElements.stageNumber && gameState.stage !== undefined) {
            this.hudElements.stageNumber.textContent = `Stage ${gameState.stage}`;
        }
    }
    
    /**
     * Update shop UI with upgrade levels and progress bars
     */
    updateShopUI(upgradeStats) {
        // Update coins
        if (this.shopElements.coins && upgradeStats.coins !== undefined) {
            this.shopElements.coins.textContent = upgradeStats.coins;
        }
        
        // Update upgrade levels and progress bars
        const upgrades = ['health', 'attack', 'speed', 'defense'];
        upgrades.forEach(upgrade => {
            const level = upgradeStats[upgrade] || 0;
            const maxLevel = 5;
            const percentage = (level / maxLevel) * 100;
            
            // Update level text
            const levelElement = this.shopElements[`${upgrade}Level`];
            if (levelElement) {
                levelElement.textContent = level;
            }
            
            // Update progress bar
            const progressBar = this.shopElements[`${upgrade}Progress`];
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
        });
    }
    
    /**
     * Update health bar with smooth animation
     */
    updateHealthBar(id, percentage) {
        const bar = this.hudElements[id === 'player1-health' ? 'player1Health' : 'player2Health'];
        const percentText = this.hudElements[id === 'player1-health' ? 'player1Percent' : 'player2Percent'];
        
        if (!bar) return;
        
        const targetWidth = Math.max(0, Math.min(100, percentage * 100));
        
        if (this.gsapLoaded) {
            gsap.to(bar, {
                width: `${targetWidth}%`,
                duration: 0.3,
                ease: "power2.out"
            });
        } else {
            bar.style.width = `${targetWidth}%`;
        }
        
        // Update percentage text
        if (percentText) {
            percentText.textContent = `${Math.round(targetWidth)}%`;
        }
        
        // Change color based on health (remove old classes first)
        bar.classList.remove('from-cyan-600', 'via-cyan-400', 'to-cyan-300');
        bar.classList.remove('from-fuchsia-600', 'via-fuchsia-500', 'to-fuchsia-300');
        bar.classList.remove('from-yellow-600', 'via-yellow-400', 'to-yellow-300');
        bar.classList.remove('from-red-600', 'via-red-500', 'to-red-400');
        
        // Apply new gradient based on health
        if (id === 'player1-health') {
            if (percentage > 0.5) {
                bar.classList.add('from-cyan-600', 'via-cyan-400', 'to-cyan-300');
            } else if (percentage > 0.25) {
                bar.classList.add('from-yellow-600', 'via-yellow-400', 'to-yellow-300');
            } else {
                bar.classList.add('from-red-600', 'via-red-500', 'to-red-400');
            }
        } else {
            if (percentage > 0.5) {
                bar.classList.add('from-fuchsia-600', 'via-fuchsia-500', 'to-fuchsia-300');
            } else if (percentage > 0.25) {
                bar.classList.add('from-yellow-600', 'via-yellow-400', 'to-yellow-300');
            } else {
                bar.classList.add('from-red-600', 'via-red-500', 'to-red-400');
            }
        }
    }
    
    /**
     * Show victory screen with animations
     */
    showVictoryScreen(stats) {
        const data = {
            stars: stats.stars || 3,
            damage: stats.totalDamage || 0,
            combo: stats.maxCombo || 0,
            time: stats.completionTime || '0:00',
            coinsEarned: stats.coinsEarned || 0,
            xpGained: stats.xpGained || 0
        };
        
        // Create victory screen if it doesn't exist
        if (!this.overlays.victoryScreen) {
            this.createVictoryScreen();
        }
        
        this.showOverlay('victoryScreen', data);
        this.animateVictoryScreen(data);
        this.populateVictoryData(data);
    }
    
    /**
     * Create victory screen dynamically
     */
    createVictoryScreen() {
        const victoryHTML = `
            <div class="game-overlay hidden" id="victoryScreen">
                <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
                <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
                    <div class="w-full max-w-2xl">
                        <div class="text-center mb-8" id="victory-title">
                            <h1 class="text-6xl md:text-8xl font-black text-neon-cyan text-glow-cyan italic uppercase">
                                VICTORY
                            </h1>
                            <div class="h-1 w-32 bg-cyan-500 mx-auto mt-4 rounded-full" id="victory-line"></div>
                        </div>
                        
                        <div class="flex justify-center gap-4 mb-8" id="stars-container">
                            <span class="star-item text-5xl">⭐</span>
                            <span class="star-item text-5xl">⭐</span>
                            <span class="star-item text-5xl">⭐</span>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-4 mb-8">
                            <div class="stat-card glass-panel rounded-xl p-4 text-center">
                                <div class="text-3xl mb-2">⚔️</div>
                                <div class="text-sm text-gray-400">Damage</div>
                                <div class="text-2xl font-bold" id="stat-damage">0</div>
                            </div>
                            <div class="stat-card glass-panel rounded-xl p-4 text-center">
                                <div class="text-3xl mb-2">🔥</div>
                                <div class="text-sm text-gray-400">Combo</div>
                                <div class="text-2xl font-bold" id="stat-combo">0</div>
                            </div>
                            <div class="stat-card glass-panel rounded-xl p-4 text-center">
                                <div class="text-3xl mb-2">⏱️</div>
                                <div class="text-sm text-gray-400">Time</div>
                                <div class="text-2xl font-bold" id="stat-time">0:00</div>
                            </div>
                        </div>
                        
                        <div class="glass-panel rounded-xl p-4 mb-6">
                            <div class="flex justify-between items-center">
                                <div class="flex items-center gap-2">
                                    <span class="text-2xl">💰</span>
                                    <span class="text-sm text-gray-400">Coins</span>
                                </div>
                                <div class="text-2xl font-bold">+<span id="coins-earned">0</span></div>
                            </div>
                        </div>
                        
                        <div class="flex gap-4">
                            <button class="flex-1 btn-glass btn-base" id="victory-share">
                                Share
                            </button>
                            <button class="flex-1 neon-button btn-base" id="victory-next">
                                Next Stage
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const container = document.querySelector('.game-container');
        if (container) {
            container.insertAdjacentHTML('beforeend', victoryHTML);
            this.overlays.victoryScreen = document.getElementById('victoryScreen');
        }
    }
    
    /**
     * Animate victory screen elements
     */
    animateVictoryScreen(data) {
        if (!this.gsapLoaded) return;
        
        const timeline = gsap.timeline();
        
        // Title animation
        timeline.from('#victory-title', {
            opacity: 0,
            y: -50,
            duration: 0.8,
            ease: "back.out(1.7)"
        })
        .to('#victory-line', {
            width: '8rem',
            duration: 0.6
        })
        // Stars animation
        .from('.star-item', {
            scale: 0,
            opacity: 0,
            stagger: 0.2,
            ease: "elastic.out(1, 0.5)"
        })
        // Stats cards
        .from('.stat-card', {
            opacity: 0,
            y: 20,
            stagger: 0.1
        });
    }
    
    /**
     * Populate victory screen with data
     */
    populateVictoryData(data) {
        const elements = {
            damage: document.getElementById('stat-damage'),
            combo: document.getElementById('stat-combo'),
            time: document.getElementById('stat-time'),
            coins: document.getElementById('coins-earned'),
        };
        
        if (elements.damage) {
            this.animateCounter(elements.damage, 0, data.damage, 1);
        }
        if (elements.combo) {
            elements.combo.textContent = `x${data.combo}`;
        }
        if (elements.time) {
            elements.time.textContent = data.time;
        }
        if (elements.coins) {
            this.animateCounter(elements.coins, 0, data.coinsEarned, 1);
        }
        
        // Show/hide stars based on rating
        const stars = document.querySelectorAll('.star-item');
        stars.forEach((star, index) => {
            if (index < data.stars) {
                star.style.opacity = '1';
            } else {
                star.style.opacity = '0.3';
            }
        });
    }
    
    /**
     * Animate number counter
     */
    animateCounter(element, from, to, duration) {
        if (!this.gsapLoaded || !element) {
            element.textContent = to;
            return;
        }
        
        const counter = { value: from };
        
        gsap.to(counter, {
            value: to,
            duration: duration,
            ease: "power1.out",
            onUpdate: () => {
                element.textContent = Math.floor(counter.value);
            }
        });
    }
    
    /**
     * Update menu statistics
     */
    updateMenuStats(stats) {
        if (this.menuStats.victories) {
            this.menuStats.victories.textContent = stats.victories || 0;
        }
        if (this.menuStats.coins) {
            this.menuStats.coins.textContent = stats.coins || 0;
        }
    }
    
    /**
     * Populate stage selection grid
     */
    populateStageSelection(stages) {
        const grid = document.getElementById('stageGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        stages.forEach((stage, index) => {
            const card = this.createStageCard(stage, index);
            grid.appendChild(card);
        });
    }
    
    /**
     * Create a stage card element with 3D glassmorphism effects
     */
    createStageCard(stage, index) {
        const card = document.createElement('div');
        const isLocked = stage.locked;
        const isBoss = stage.isBoss;
        
        card.className = `stage-card group relative overflow-hidden rounded-xl transition-all duration-300 cursor-pointer ripple-btn
            ${isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 hover:z-20'}`;
        
        // Get difficulty colors
        const difficultyColors = {
            'Easy': 'text-green-400',
            'Normal': 'text-cyan-400',
            'Hard': 'text-orange-400',
            'Boss': 'text-pink-500'
        };
        const difficultyColor = difficultyColors[stage.difficulty] || 'text-cyan-400';
        
        card.innerHTML = `
            <!-- Glassmorphism background -->
            <div class="absolute inset-0 bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-xl transition-all group-hover:border-primary/60"></div>
            
            <!-- Neon glow effect on hover -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
            
            <!-- Lock overlay -->
            ${isLocked ? `
                <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                    <span class="text-5xl filter drop-shadow-lg">🔒</span>
                </div>
            ` : ''}
            
            <!-- Content -->
            <div class="relative z-20 p-5 flex flex-col h-full">
                <!-- Header -->
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h3 class="text-xl font-black italic text-white mb-1">Stage ${index + 1}</h3>
                        <p class="text-xs ${difficultyColor} font-bold uppercase tracking-wider">${stage.difficulty || 'Normal'}</p>
                    </div>
                    ${isBoss ? '<span class="text-3xl filter drop-shadow-lg animate-float">👑</span>' : ''}
                </div>
                
                <!-- Stage Name -->
                <p class="text-sm text-slate-300 font-semibold mb-3">${stage.name || 'Arena ' + (index + 1)}</p>
                
                <!-- Star Rating -->
                <div class="flex gap-1 mb-auto">
                    ${this.renderStars(stage.stars || 0)}
                </div>
                
                <!-- Stats Badge -->
                ${!isLocked ? `
                    <div class="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                        <span class="px-2 py-1 bg-primary/20 border border-primary/40 rounded text-xs font-bold text-primary">
                            ${stage.enemyCount || 1} 👤
                        </span>
                        ${isBoss ? '<span class="px-2 py-1 bg-pink-500/20 border border-pink-500/40 rounded text-xs font-bold text-pink-400">BOSS</span>' : ''}
                    </div>
                ` : ''}
            </div>
        `;
        
        if (!isLocked) {
            card.addEventListener('click', () => {
                if (window.game && window.game.campaignManager) {
                    // Set current stage and show story cutscene
                    window.game.campaignManager.currentStage = index + 1;
                    const stageData = window.game.campaignManager.stages[index];
                    window.game.showStoryCutscene(stageData);
                    this.hideOverlay('stageSelect');
                }
            });
        }
        
        return card;
    }
    
    /**
     * Render star rating
     */
    renderStars(count) {
        let stars = '';
        for (let i = 0; i < 3; i++) {
            stars += i < count ? '⭐' : '☆';
        }
        return stars;
    }
    
    /**
     * Show combo notification
     */
    showComboNotification(combo) {
        // Create or update combo element
        let comboEl = document.getElementById('combo-notification');
        
        if (!comboEl) {
            comboEl = document.createElement('div');
            comboEl.id = 'combo-notification';
            comboEl.className = 'fixed top-1/3 right-8 z-50 text-6xl font-black text-neon-yellow';
            document.body.appendChild(comboEl);
        }
        
        comboEl.innerHTML = `
            <div class="animate-shake">
                <div class="text-8xl">${combo}</div>
                <div class="text-4xl">HITS!</div>
            </div>
        `;
        
        if (this.gsapLoaded) {
            gsap.fromTo(comboEl,
                { scale: 0.5, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(2)" }
            );
            
            gsap.to(comboEl, {
                opacity: 0,
                delay: 1.5,
                duration: 0.5
            });
        }
    }
    
    /**
     * Create ripple effect on click
     */
    createRipple(event, element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-span';
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}
