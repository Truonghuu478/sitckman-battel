# 🛠️ Phase 2 Implementation Guide

## Quick Start for Developers

This guide shows how to integrate Phase 2 features into your game code.

---

## 🎯 UIManager Phase 2 API

### 1. Update HUD with New Data

```javascript
// In your game loop (Game.js update method)
this.uiManager.updateHUD(
  {
    health: this.player1.health,
    maxHealth: this.player1.maxHealth,
    coins: this.coins,
    combo: this.player1.combo || 0, // NEW in Phase 2
    stones: this.player1.stonesLeft || 3, // NEW in Phase 2
  },
  {
    health: this.player2.health,
    maxHealth: this.player2.maxHealth,
  },
  {
    timer: this.timer,
    stage: this.currentStage,
  },
);
```

### 2. Show Stage Selection

```javascript
// When starting campaign
this.uiManager.showOverlay("stageSelect", {
  stages: this.campaignManager.stages.map((stage, index) => ({
    name: stage.name || `Arena ${index + 1}`,
    difficulty: stage.difficulty || "Normal",
    stars: stage.starsEarned || 0,
    locked: stage.locked !== false,
    isBoss: stage.isBoss || false,
    enemyCount: stage.enemies?.length || 1,
  })),
});
```

### 3. Setup Upgrade Shop

```javascript
// When showing shop
this.uiManager.showOverlay("upgradeShop");

// Setup purchase handlers
this.uiManager.setupUpgradeHandlers(this.player1, this.coins);

// Update shop display
this.uiManager.updateShopUI({
  coins: this.coins,
  health: this.player1.upgrades?.health || 0,
  attack: this.player1.upgrades?.attack || 0,
  speed: this.player1.upgrades?.speed || 0,
  defense: this.player1.upgrades?.defense || 0,
});
```

### 4. Screen Shake on Impacts

```javascript
// On critical hit
if (this.isCriticalHit) {
  this.uiManager.screenShake(15);
}

// On knockdown
if (player.isKnockedDown) {
  this.uiManager.screenShake(20);
}

// On normal hit
if (hitDetected) {
  this.uiManager.screenShake(5);
}
```

### 5. Show Notifications

```javascript
// Success notification
this.uiManager.showNotification("✅ Upgrade complete!", "success");

// Error notification
this.uiManager.showNotification("💰 Not enough coins!", "error");

// Warning notification
this.uiManager.showNotification("⚠️ Max level reached!", "warning");

// Info notification
this.uiManager.showNotification("ℹ️ Stage unlocked!", "info");
```

### 6. Particle Effects

```javascript
// On successful purchase
this.uiManager.createPurchaseParticles();

// Particles will auto-cleanup after animation
```

---

## 🎮 Player Class Integration

### Add Combo Tracking

```javascript
class Player {
  constructor(x, y, controls) {
    // ... existing code

    // Phase 2 additions
    this.combo = 0;
    this.comboTimer = 0;
    this.comboTimeout = 120; // 2 seconds
  }

  update(groundY, opponent) {
    // ... existing code

    // Update combo timer
    if (this.comboTimer > 0) {
      this.comboTimer--;
    } else if (this.combo > 0) {
      this.combo = 0; // Reset combo on timeout
    }
  }

  onHit(opponent) {
    // ... existing hit code

    // Increment combo
    this.combo++;
    this.comboTimer = this.comboTimeout;

    // Show combo notification if > 2
    if (this.combo > 2 && window.game?.uiManager) {
      window.game.uiManager.showComboCounter(this.combo);
    }
  }
}
```

### Add Stone Tracking

```javascript
// In Player constructor
this.stonesLeft = 3;
this.maxStones = 3;

// When throwing stone
throwStone() {
    if (this.stonesLeft > 0) {
        this.stonesLeft--;
        // ... throw logic

        // Update UI
        if (window.game?.uiManager) {
            window.game.uiManager.updateStoneCounter(this.stonesLeft);
        }
    }
}

// Restore stones (from power-up)
restoreStones() {
    this.stonesLeft = this.maxStones;

    // Update UI
    if (window.game?.uiManager) {
        window.game.uiManager.updateStoneCounter(this.stonesLeft);
    }
}
```

---

## 🏪 Upgrade System Integration

### In Game.js

```javascript
class Game {
  constructor() {
    // ... existing code

    // Initialize upgrades
    this.upgrades = {
      health: 0,
      attack: 0,
      speed: 0,
      defense: 0,
    };

    this.loadUpgrades();
  }

  purchaseUpgrade(upgradeId, cost) {
    if (this.coins < cost) return false;

    // Deduct coins
    this.coins -= cost;

    // Increment upgrade level
    this.upgrades[upgradeId]++;

    // Apply upgrade to player
    this.applyUpgrade(upgradeId, this.upgrades[upgradeId]);

    // Save progress
    this.saveUpgrades();

    // Update UI
    this.uiManager.updateShopUI({
      coins: this.coins,
      ...this.upgrades,
    });

    return true;
  }

  applyUpgrade(upgradeId, level) {
    switch (upgradeId) {
      case "health":
        this.player1.maxHealth = 100 + level * 10;
        this.player1.health = this.player1.maxHealth;
        break;
      case "attack":
        this.player1.punchDamage = 10 + level * 2;
        this.player1.kickDamage = 15 + level * 2;
        break;
      case "speed":
        this.player1.speed = 5 + level * 0.5;
        this.player1.jumpPower = 12 + level * 0.5;
        break;
      case "defense":
        this.player1.damageReduction = level * 0.1;
        break;
    }
  }

  saveUpgrades() {
    localStorage.setItem("upgrades", JSON.stringify(this.upgrades));
  }

  loadUpgrades() {
    const saved = localStorage.getItem("upgrades");
    if (saved) {
      this.upgrades = JSON.parse(saved);

      // Apply all upgrades to player
      Object.keys(this.upgrades).forEach((key) => {
        this.applyUpgrade(key, this.upgrades[key]);
      });
    }
  }
}
```

---

## 🎨 Custom Styling

### Override Default Colors

```css
/* In your custom CSS file */
:root {
  --color-primary: #6467f2; /* Main purple */
  --color-neon-cyan: #05d9e8; /* Cyan accents */
  --color-neon-pink: #ff2a6d; /* Pink highlights */
  --color-neon-yellow: #facc15; /* Yellow combo */
}

/* Custom combo style */
#combo-hud {
  /* Your custom styles */
}

/* Custom stone counter */
#stone-counter {
  /* Your custom styles */
}
```

---

## 📱 Mobile Optimizations

Phase 2 automatically handles mobile, but you can customize:

```javascript
// In UIManager constructor
this.isMobile = window.innerWidth < 768;

// Use in your code
if (this.uiManager.isMobile) {
  // Reduce particle count
  // Simplify animations
  // Hide non-essential UI
}
```

---

## ⚡ Performance Tips

### 1. Throttle HUD Updates

Already implemented! Updates limited to 60 FPS.

### 2. Lazy Load GSAP

GSAP loads asynchronously. Always check:

```javascript
if (this.uiManager.gsapLoaded) {
  // Use GSAP animations
} else {
  // Use CSS fallback
}
```

### 3. Cleanup Particles

All particles auto-cleanup. No manual removal needed!

### 4. Reuse Notification Element

Notification system reuses single DOM element for performance.

---

## 🐛 Debugging

### Check if UIManager Loaded

```javascript
console.log("UIManager:", window.game?.uiManager);
```

### Verify GSAP

```javascript
console.log("GSAP loaded:", typeof gsap !== "undefined");
```

### Test Notifications

```javascript
game.uiManager.showNotification("🧪 Test message", "info");
```

### Test Screen Shake

```javascript
game.uiManager.screenShake(10);
```

---

## 🎯 Common Patterns

### Pattern 1: Show Menu → Play → Return

```javascript
// Show main menu
uiManager.showOverlay("mainMenu");

// User clicks campaign
uiManager.hideOverlay("mainMenu");
uiManager.showOverlay("stageSelect", { stages });

// User selects stage
uiManager.hideOverlay("stageSelect");
game.startStage(stageId);

// Game ends → Show victory
uiManager.showVictoryScreen(stats);

// User clicks next
uiManager.hideOverlay("victoryScreen");
uiManager.showOverlay("stageSelect", { stages });
```

### Pattern 2: Upgrade Flow

```javascript
// Show shop
uiManager.showOverlay("upgradeShop");
uiManager.updateShopUI(currentStats);
uiManager.setupUpgradeHandlers(player, coins);

// User clicks upgrade
// → Handlers automatically call game.purchaseUpgrade()
// → UIManager shows notification
// → UIManager creates particles
// → UIManager updates shop display

// User clicks back
uiManager.hideOverlay("upgradeShop");
uiManager.showOverlay("mainMenu");
```

### Pattern 3: Combat Feedback

```javascript
// In combat system
function onPlayerHit(attacker, defender) {
  // Deal damage
  defender.takeDamage(damage);

  // Update combo
  attacker.combo++;
  attacker.comboTimer = 120;

  // Visual feedback
  if (isCritical) {
    uiManager.screenShake(15);
  } else {
    uiManager.screenShake(5);
  }

  // Update HUD
  uiManager.updateHUD(playerData, opponentData, gameState);
}
```

---

## ✅ Checklist for Implementation

- [ ] Add combo tracking to Player class
- [ ] Add stone tracking to Player class
- [ ] Integrate updateHUD with new parameters
- [ ] Add screenShake calls on impacts
- [ ] Setup stage selection data structure
- [ ] Implement purchaseUpgrade method
- [ ] Add notification calls where appropriate
- [ ] Test on desktop browser
- [ ] Test on mobile device
- [ ] Verify all animations work
- [ ] Check console for errors

---

## 🚀 You're Ready!

Phase 2 is fully implemented and ready to use. All methods are documented and tested. If you need help, check:

1. `PHASE2_COMPLETE.md` - Full feature list
2. `UIManager.js` - All method implementations
3. This guide - Usage examples

Have fun building your game! 🎮✨
