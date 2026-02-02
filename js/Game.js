class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = 800;
    this.height = 500;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // Game state
    this.isRunning = false;
    this.isPaused = false;
    this.gameOver = false;
    this.gameMode = null; // 'campaign' or 'vs'

    // Ground level
    this.groundY = this.height - 50;

    // Input handler
    this.inputHandler = new InputHandler();

    // Particle system
    this.particleSystem = new ParticleSystem();
    this.shockwaves = [];

    // Campaign manager
    this.campaignManager = new CampaignManager();
    this.aiController = null;

    // UI Manager (NEW)
    this.uiManager = new UIManager();

    // Players
    this.player1 = null;
    this.player2 = null;

    // Timer
    this.timeLimit = 180; // 3 minutes
    this.timeRemaining = this.timeLimit;
    this.lastSecond = Date.now();

    // Camera shake
    this.shakeAmount = 0;
    this.shakeDecay = 0.9;

    // Track previous states for effects
    this.player1WasGrounded = true;
    this.player2WasGrounded = true;

    // Performance tracking
    this.lastFrameTime = Date.now();
    this.fps = 60;

    // Combat stats for victory screen
    this.combatStats = {
      totalDamage: 0,
      maxCombo: 0,
      currentCombo: 0,
    };

    // NEW: Slow-motion effect for combo
    this.slowMotion = 1.0; // 1.0 = normal, 0.3 = slow
    this.slowMotionDuration = 0;

    // NEW: Power-ups system
    this.powerUps = [];
    this.powerUpSpawnTimer = 0;
    this.powerUpSpawnInterval = 600; // 10 seconds

    // Initialize systems
    this.gameEngine = new GameEngine(this);
    this.renderSystem = new RenderSystem(this);
    this.powerUpSystem = new PowerUpSystem(this);
    this.combatSystem = new CombatSystem(this);
  }

  startCampaign() {
    this.gameMode = "campaign";
    const stage = this.campaignManager.getCurrentStage();

    // Create player 1 with upgrades
    this.player1 = new Player(
      150,
      this.groundY - 80,
      "#ff4444",
      this.inputHandler.getPlayer1Controls(),
    );
    this.campaignManager.applyUpgradesToPlayer(this.player1);

    // Create AI opponent
    this.player2 = new Player(
      this.width - 150,
      this.groundY - 80,
      stage.opponent.color,
      this.inputHandler.getPlayer2Controls(),
    );

    // Set opponent health
    if (stage.opponent.health) {
      this.player2.maxHealth = stage.opponent.health;
      this.player2.health = stage.opponent.health;
    }

    // Create AI controller
    this.aiController = new AIController(
      this.player2,
      this.player1,
      stage.opponent.difficulty,
    );

    this.start();
  }

  startVsMode() {
    this.gameMode = "vs";
    this.aiController = null;

    this.player1 = new Player(
      150,
      this.groundY - 80,
      "#ff4444",
      this.inputHandler.getPlayer1Controls(),
    );

    this.player2 = new Player(
      this.width - 150,
      this.groundY - 80,
      "#4444ff",
      this.inputHandler.getPlayer2Controls(),
    );

    this.start();
  }

  start() {
    this.gameEngine.start();
  }

  stop() {
    this.gameEngine.stop();
  }

  resetTimers() {
    this.gameEngine.resetTimers();
  }

  reset() {
    // Reset players based on mode
    if (this.gameMode === "campaign") {
      this.startCampaign();
    } else {
      this.startVsMode();
    }
  }

  gameLoop() {
    this.gameEngine.gameLoop();
  }

  update() {
    this.gameEngine.update();
  }

  draw() {
    this.renderSystem.draw();
  }

  updateHealthBars() {
    const p1Health = document.getElementById("player1-health");
    const p2Health = document.getElementById("player2-health");

    if (p1Health && this.player1) {
      const healthPercent =
        (this.player1.health / this.player1.maxHealth) * 100;
      p1Health.style.width = healthPercent + "%";

      // Change color based on health
      if (healthPercent > 50) {
        p1Health.style.background =
          "linear-gradient(90deg, #00ff88 0%, #00cc44 100%)";
      } else if (healthPercent > 25) {
        p1Health.style.background =
          "linear-gradient(90deg, #ffeb3b 0%, #ffc107 100%)";
      } else {
        p1Health.style.background =
          "linear-gradient(90deg, #ff5252 0%, #f44336 100%)";
      }
    }

    if (p2Health && this.player2) {
      const healthPercent =
        (this.player2.health / this.player2.maxHealth) * 100;
      p2Health.style.width = healthPercent + "%";

      // Change color based on health
      if (healthPercent > 50) {
        p2Health.style.background =
          "linear-gradient(90deg, #00ff88 0%, #00cc44 100%)";
      } else if (healthPercent > 25) {
        p2Health.style.background =
          "linear-gradient(90deg, #ffeb3b 0%, #ffc107 100%)";
      } else {
        p2Health.style.background =
          "linear-gradient(90deg, #ff5252 0%, #f44336 100%)";
      }
    }

    // NEW: Update stone counts
    this.updateStoneCounts();
  }

  // NEW: Update stone count display
  updateStoneCounts() {
    // Create stone indicators if they don't exist
    let p1Stones = document.getElementById("player1-stones");
    let p2Stones = document.getElementById("player2-stones");

    if (!p1Stones && this.player1) {
      p1Stones = document.createElement("div");
      p1Stones.id = "player1-stones";
      p1Stones.style.position = "absolute";
      p1Stones.style.left = "20px";
      p1Stones.style.top = "80px";
      p1Stones.style.color = "white";
      p1Stones.style.fontSize = "18px";
      p1Stones.style.fontWeight = "bold";
      p1Stones.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";
      document.body.appendChild(p1Stones);
    }

    if (!p2Stones && this.player2) {
      p2Stones = document.createElement("div");
      p2Stones.id = "player2-stones";
      p2Stones.style.position = "absolute";
      p2Stones.style.right = "20px";
      p2Stones.style.top = "80px";
      p2Stones.style.color = "white";
      p2Stones.style.fontSize = "18px";
      p2Stones.style.fontWeight = "bold";
      p2Stones.style.textShadow = "2px 2px 4px rgba(0,0,0,0.8)";
      document.body.appendChild(p2Stones);
    }

    if (p1Stones && this.player1) {
      p1Stones.innerHTML = `🪨 × ${this.player1.stoneCount}`;
    }

    if (p2Stones && this.player2) {
      p2Stones.innerHTML = `🪨 × ${this.player2.stoneCount}`;
    }
  }

  updateTimer() {
    const timerElement = document.getElementById("timer");
    if (timerElement) {
      timerElement.textContent = this.timeRemaining;

      // Warning color when time is low
      if (this.timeRemaining <= 10) {
        timerElement.style.color = "#ff5252";
        timerElement.style.animation = "pulse 0.5s ease-in-out infinite";
      } else {
        timerElement.style.color = "white";
        timerElement.style.animation = "";
      }
    }
  }

  updateCoins() {
    const coinsElement = document.getElementById("coins");
    if (coinsElement) {
      coinsElement.textContent = this.campaignManager.playerStats.coins;
    }
  }

  endGame() {
    this.gameOver = true;
    this.isRunning = false;

    if (this.gameMode === "campaign") {
      // Campaign mode - show victory or defeat
      if (this.player1.health > 0) {
        // Victory
        const reward = this.campaignManager.completeStage();
        this.showVictory(reward);
      } else {
        // Defeat
        this.showDefeat();
      }
    } else {
      // VS mode - determine winner
      let winner = "";
      if (this.player1.health > this.player2.health) {
        winner = "Player 1 Thắng!";
      } else if (this.player2.health > this.player1.health) {
        winner = "Player 2 Thắng!";
      } else {
        winner = "Hòa!";
      }
      this.showGameOver(winner);
    }
  }

  updateMenuStats() {
    const victories = document.getElementById("victories");
    const menuCoins = document.getElementById("menu-coins");

    if (victories) {
      victories.textContent = this.campaignManager.playerStats.victories;
    }
    if (menuCoins) {
      menuCoins.textContent = this.campaignManager.playerStats.coins;
    }
  }

  showVictory(reward) {
    // Calculate stats for new UI
    const timeElapsed = this.timeLimit - this.timeRemaining;
    const stars = this.calculateStars();

    const stats = {
      stars: stars,
      totalDamage: this.combatStats.totalDamage,
      maxCombo: this.combatStats.maxCombo,
      completionTime: this.formatTime(timeElapsed),
      coinsEarned: reward,
      xpGained: Math.floor(reward * 1.5), // XP based on coins
    };

    // Use new UI Manager (NEW)
    if (this.uiManager) {
      this.uiManager.showVictoryScreen(stats);
    } else {
      // Fallback to old UI
      const screen = document.getElementById("victoryScreen");
      document.getElementById("rewardAmount").textContent = `+${reward} 💰`;
      document.getElementById("totalCoins").textContent =
        this.campaignManager.playerStats.coins;
      this.updateMenuStats();
      screen.classList.remove("hidden");
    }

    // Reset combat stats for next battle
    this.combatStats = {
      totalDamage: 0,
      maxCombo: 0,
      currentCombo: 0,
    };
  }

  calculateStars() {
    // Star rating based on health remaining and time
    const healthPercent = this.player1.health / this.player1.maxHealth;
    const timePercent = this.timeRemaining / this.timeLimit;

    if (healthPercent > 0.7 && timePercent > 0.5) return 3;
    if (healthPercent > 0.4 && timePercent > 0.3) return 2;
    return 1;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  showDefeat() {
    const screen = document.getElementById("defeatScreen");
    screen.classList.remove("hidden");
  }

  showGameOver(winner) {
    // For VS mode
    const vsMode = document.getElementById("vsMode");
    const menu = vsMode.querySelector(".menu");

    const oldContent = menu.innerHTML;
    menu.innerHTML = `
            <h1 class="game-over-message">GAME OVER</h1>
            <div class="winner-text">${winner}</div>
            <button class="btn-start" id="restartVsBtn">Chơi Lại</button>
            <button class="btn-back" id="backToMenuFromGameOver">← Menu</button>
        `;

    vsMode.classList.remove("hidden");

    // Setup buttons
    document.getElementById("restartVsBtn").addEventListener("click", () => {
      vsMode.classList.add("hidden");
      menu.innerHTML = oldContent;
      this.startVsMode();
    });

    document
      .getElementById("backToMenuFromGameOver")
      .addEventListener("click", () => {
        vsMode.classList.add("hidden");
        menu.innerHTML = oldContent;
        document.getElementById("mainMenu").classList.remove("hidden");
      });
  }

  showStageSelect() {
    // Use UIManager to populate stage selection
    if (this.uiManager) {
      const stages = this.campaignManager.stages.map((stage, index) => ({
        name: stage.name,
        difficulty:
          stage.opponent.difficulty === "easy"
            ? "Easy"
            : stage.opponent.difficulty === "medium"
              ? "Normal"
              : stage.opponent.difficulty === "hard"
                ? "Hard"
                : "Normal",
        isBoss: stage.opponent.isBoss || false,
        locked: index + 1 > this.campaignManager.playerStats.maxStageReached,
        stars: this.campaignManager.playerStats.stageStars?.[index + 1] || 0,
        reward: stage.reward,
        enemyCount: 1,
      }));

      this.uiManager.showOverlay("stageSelect", { stages });
    }
  }

  showStoryCutscene(stage) {
    const cutscene = document.getElementById("storyCutscene");
    const storyTitle = document.getElementById("storyTitle");
    const storyText = document.getElementById("storyText");
    const enemyName = document.getElementById("enemyName");
    const enemyDifficulty = document.getElementById("enemyDifficulty");

    if (storyTitle) storyTitle.textContent = stage.name;
    if (storyText) storyText.textContent = stage.story;
    if (enemyName) enemyName.textContent = stage.opponent.name;
    if (enemyDifficulty)
      enemyDifficulty.textContent = stage.opponent.difficulty.toUpperCase();

    document.getElementById("stageSelect").classList.add("hidden");
    cutscene.classList.remove("hidden");
  }

  showUpgradeShop() {
    // Use UIManager to update shop UI
    if (this.uiManager) {
      const stats = this.campaignManager.playerStats;

      // Map upgrade stats for UIManager
      const upgradeStats = {
        coins: stats.coins,
        health: stats.upgrades.maxHealth || 0,
        attack: stats.upgrades.attackPower || 0,
        speed: stats.upgrades.speed || 0,
        defense: stats.upgrades.defense || 0,
      };

      this.uiManager.updateShopUI(upgradeStats);
    }

    // Update upgrade costs and setup button handlers
    const upgrades = ["health", "attack", "speed", "defense"];
    upgrades.forEach((upgrade) => {
      const costEl = document.getElementById(`${upgrade}-cost`);
      const btnEl = document.getElementById(`upgrade-${upgrade}`);

      const upgradeKey =
        upgrade === "health"
          ? "maxHealth"
          : upgrade === "attack"
            ? "attackPower"
            : upgrade;
      const cost = this.campaignManager.getUpgradeCost(upgradeKey);

      if (costEl) {
        costEl.textContent = cost;
      }

      // Setup button handler
      if (btnEl) {
        btnEl.onclick = () => {
          if (this.campaignManager.purchaseUpgrade(upgradeKey)) {
            this.showUpgradeShop(); // Refresh UI
          }
        };
      }
    });
  }

  resetProgress() {
    this.campaignManager.reset();
    this.showUpgradeShop(); // Refresh if shop is open
    alert("Đã reset toàn bộ tiến trình!");
  }
}
