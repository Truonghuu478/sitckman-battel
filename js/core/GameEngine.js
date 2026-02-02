/**
 * GameEngine - Core game loop and state management
 */
class GameEngine {
  constructor(game) {
    this.game = game;
  }

  start() {
    this.game.isRunning = true;
    this.game.gameOver = false;
    this.resetTimers();
    this.gameLoop();
  }

  stop() {
    this.game.isRunning = false;
  }

  resetTimers() {
    const game = this.game;

    // Reset timer
    game.timeRemaining = game.timeLimit;
    game.lastSecond = Date.now();

    // Clear effects
    game.particleSystem.clear();
    game.shockwaves = [];
    game.shakeAmount = 0;

    // Reset tracking states
    game.player1WasGrounded = true;
    game.player2WasGrounded = true;

    // Update UI
    game.updateHealthBars();
    game.updateTimer();
    game.updateCoins();
  }

  gameLoop() {
    const game = this.game;

    if (!game.isRunning) return;

    // Calculate delta time
    const now = Date.now();
    const deltaTime = now - game.lastFrameTime;
    game.lastFrameTime = now;
    game.fps = Math.round(1000 / deltaTime);

    // Update game
    this.update();

    // Draw game
    game.renderSystem.draw();

    // Continue loop
    requestAnimationFrame(() => this.gameLoop());
  }

  update() {
    const game = this.game;

    if (game.isPaused || game.gameOver) return;

    // Store previous grounded states
    game.player1WasGrounded = game.player1.isGrounded;
    game.player2WasGrounded = game.player2.isGrounded;

    // Update slow motion effect
    if (game.slowMotionDuration > 0) {
      game.slowMotionDuration--;
      if (game.slowMotionDuration <= 0) {
        game.slowMotion = 1.0; // Return to normal speed
      }
    }

    // Handle input (affected by slow motion)
    const updates = Math.ceil(game.slowMotion * 1);
    for (let i = 0; i < updates; i++) {
      if (game.gameMode === "campaign") {
        // Player 1 controlled by user, Player 2 by AI
        game.inputHandler.handlePlayerInput(
          game.player1,
          game.player1.controls,
        );
        if (game.aiController) {
          game.aiController.update();
        }
      } else {
        // Both players controlled by users
        game.inputHandler.handlePlayerInput(
          game.player1,
          game.player1.controls,
        );
        game.inputHandler.handlePlayerInput(
          game.player2,
          game.player2.controls,
        );
      }
    }

    // Update players
    game.player1.update(game.groundY, game.player2);
    game.player2.update(game.groundY, game.player1);

    // Update combat system
    game.combatSystem.update();

    // Keep players in bounds
    game.player1.x = Math.max(
      0,
      Math.min(game.width - game.player1.width, game.player1.x),
    );
    game.player2.x = Math.max(
      0,
      Math.min(game.width - game.player2.width, game.player2.x),
    );

    // Update power-ups
    game.powerUpSystem.update();

    // Generate movement effects
    this.generateMovementEffects();

    // Update effects
    game.particleSystem.update();

    for (let i = game.shockwaves.length - 1; i >= 0; i--) {
      game.shockwaves[i].update();
      if (game.shockwaves[i].isDead()) {
        game.shockwaves.splice(i, 1);
      }
    }

    // Update camera shake
    game.shakeAmount *= game.shakeDecay;
    if (game.shakeAmount < 0.5) game.shakeAmount = 0;

    // Update timer
    if (Date.now() - game.lastSecond >= 1000) {
      game.timeRemaining--;
      game.lastSecond = Date.now();
      game.updateTimer();

      if (game.timeRemaining <= 0) {
        game.endGame();
      }
    }

    // Update health bars
    game.updateHealthBars();

    // Update UI Manager
    if (game.uiManager) {
      game.uiManager.updateHUD(
        {
          health: game.player1.health,
          maxHealth: game.player1.maxHealth,
          coins: game.campaignManager ? game.campaignManager.totalCoins : 0,
        },
        {
          health: game.player2.health,
          maxHealth: game.player2.maxHealth,
        },
        {
          timer: game.timeRemaining,
          stage: game.campaignManager
            ? game.campaignManager.currentStage + 1
            : 1,
        },
      );
    }

    // Check for knockout
    if (game.player1.health <= 0 || game.player2.health <= 0) {
      game.endGame();
    }
  }

  generateMovementEffects() {
    const game = this.game;

    // Jump dust
    if (!game.player1WasGrounded && game.player1.isGrounded) {
      game.particleSystem.createLandDust(
        game.player1.x + game.player1.width / 2,
        game.player1.y + game.player1.height,
      );
    }

    if (!game.player2WasGrounded && game.player2.isGrounded) {
      game.particleSystem.createLandDust(
        game.player2.x + game.player2.width / 2,
        game.player2.y + game.player2.height,
      );
    }

    // Running dust
    if (
      Math.abs(game.player1.velocityX) > 3 &&
      game.player1.isGrounded &&
      !game.player1.isAttacking
    ) {
      if (Math.random() < 0.3) {
        game.particleSystem.createDustCloud(
          game.player1.x + game.player1.width / 2,
          game.player1.y + game.player1.height - 5,
          -Math.sign(game.player1.velocityX),
        );
      }
    }

    if (
      Math.abs(game.player2.velocityX) > 3 &&
      game.player2.isGrounded &&
      !game.player2.isAttacking
    ) {
      if (Math.random() < 0.3) {
        game.particleSystem.createDustCloud(
          game.player2.x + game.player2.width / 2,
          game.player2.y + game.player2.height - 5,
          -Math.sign(game.player2.velocityX),
        );
      }
    }
  }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = GameEngine;
}
