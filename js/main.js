// Main entry point
let game;

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("gameCanvas");

  // Get all overlays
  const mainMenu = document.getElementById("mainMenu");
  const stageSelect = document.getElementById("stageSelect");
  const upgradeShop = document.getElementById("upgradeShop");
  const storyCutscene = document.getElementById("storyCutscene");
  const victoryScreen = document.getElementById("victoryScreen");
  const defeatScreen = document.getElementById("defeatScreen");
  const vsMode = document.getElementById("vsMode");

  // Get all buttons
  const campaignBtn = document.getElementById("campaignBtn");
  const vsBtn = document.getElementById("vsBtn");
  const shopBtn = document.getElementById("shopBtn");
  const resetBtn = document.getElementById("resetBtn");
  const startFight = document.getElementById("startFight");
  const startVsBtn = document.getElementById("startVsBtn");

  // Initialize game
  game = new Game(canvas);
  game.updateMenuStats();

  // Main menu handlers
  if (campaignBtn) {
    campaignBtn.addEventListener("click", () => {
      if (game.uiManager) {
        game.uiManager.hideOverlay("mainMenu");
        game.showStageSelect();
      }
    });
  }

  if (vsBtn) {
    vsBtn.addEventListener("click", () => {
      mainMenu.classList.add("hidden");
      vsMode.classList.remove("hidden");
    });
  }

  if (shopBtn) {
    shopBtn.addEventListener("click", () => {
      if (game.uiManager) {
        game.uiManager.hideOverlay("mainMenu");
        game.uiManager.showOverlay("upgradeShop");
        game.showUpgradeShop();
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Bạn có chắc muốn reset toàn bộ tiến trình?")) {
        game.resetProgress();
      }
    });
  }

  // Start fight button
  if (startFight) {
    startFight.addEventListener("click", () => {
      storyCutscene.classList.add("hidden");
      game.startCampaign();
    });
  }

  // VS Mode start button
  if (startVsBtn) {
    startVsBtn.addEventListener("click", () => {
      vsMode.classList.add("hidden");
      game.startVsMode();
    });
  }

  // Victory screen buttons
  const nextStageBtn = document.getElementById("nextStageBtn");
  const retryBtn = document.getElementById("retryBtn");

  if (nextStageBtn) {
    nextStageBtn.addEventListener("click", () => {
      victoryScreen.classList.add("hidden");
      if (game.campaignManager.nextStage()) {
        stageSelect.classList.remove("hidden");
        game.showStageSelect();
      } else {
        // No more stages, show main menu
        mainMenu.classList.remove("hidden");
        alert("Chúc mừng! Bạn đã hoàn thành tất cả các màn!");
      }
    });
  }

  if (retryBtn) {
    retryBtn.addEventListener("click", () => {
      victoryScreen.classList.add("hidden");
      game.startCampaign();
    });
  }

  // Defeat screen buttons
  const retryDefeatBtn = document.getElementById("retryDefeatBtn");
  const upgradeFromDefeat = document.getElementById("upgradeFromDefeat");

  if (retryDefeatBtn) {
    retryDefeatBtn.addEventListener("click", () => {
      defeatScreen.classList.add("hidden");
      game.startCampaign();
    });
  }

  if (upgradeFromDefeat) {
    upgradeFromDefeat.addEventListener("click", () => {
      defeatScreen.classList.add("hidden");
      upgradeShop.classList.remove("hidden");
      game.showUpgradeShop();
    });
  }

  // Back buttons
  const backButtons = [
    { id: "backToMenu", target: mainMenu, sources: [stageSelect] },
    { id: "backToMenuFromShop", target: mainMenu, sources: [upgradeShop] },
    { id: "backToMenuFromVs", target: mainMenu, sources: [vsMode] },
    { id: "backToMenuFromVictory", target: mainMenu, sources: [victoryScreen] },
    { id: "backToMenuFromDefeat", target: mainMenu, sources: [defeatScreen] },
  ];

  backButtons.forEach((btn) => {
    const element = document.getElementById(btn.id);
    if (element) {
      element.addEventListener("click", () => {
        // Stop game if running
        if (game.isRunning) {
          game.stop();
        }

        // Hide all overlays first
        btn.sources.forEach((source) => source.classList.add("hidden"));

        // Show target menu
        btn.target.classList.remove("hidden");

        // Reset game state when going back to main menu
        if (btn.target === mainMenu) {
          game.updateMenuStats();
          game.reset();

          // Hide HUD when back to menu
          const gameHeader = document.getElementById("game-header");
          if (gameHeader) {
            gameHeader.classList.add("hidden");
          }
        }
      });
    }
  });

  // Handle window resize
  window.addEventListener("resize", () => {
    // Keep canvas responsive
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    // Canvas size is set in Game constructor, but we could adjust here if needed
  });

  // Prevent context menu on canvas
  canvas.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });

  // Game initialized and ready
});
