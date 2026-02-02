// Import components
if (typeof require !== "undefined") {
  var PhysicsComponent = require("./components/PhysicsComponent.js");
  var CombatComponent = require("./components/CombatComponent.js");
  var ProjectileComponent = require("./components/ProjectileComponent.js");
  var AnimationComponent = require("./components/AnimationComponent.js");
}

class Player {
  constructor(x, y, color, controls) {
    // Position and physics
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 80;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 5;
    this.jumpPower = 15;
    this.gravity = 0.6;

    // Visual
    this.color = color;
    this.facing = controls.isPlayer1 ? 1 : -1; // 1 = right, -1 = left

    // Combat
    this.health = 100;
    this.maxHealth = 100;
    this.isAttacking = false;
    this.attackType = null;
    this.attackFrame = 0;
    this.attackCooldown = 0;
    this.hitbox = null;

    // State
    this.isJumping = false;
    this.isCrouching = false;
    this.isGrounded = false;

    // Animation
    this.animationFrame = 0;
    this.animationSpeed = 0.15;
    this.walkCycle = 0;

    // Hit effect
    this.hitFlash = 0;
    this.hitStun = 0;

    // NEW: Knockdown effect
    this.isKnockedDown = false;
    this.knockdownTime = 0;
    this.getUpFrame = 0;

    // NEW: Projectiles (stones)
    this.projectiles = [];
    this.stoneCooldown = 0;
    this.maxStones = 3;
    this.stoneCount = 3;

    // NEW: Dash ability
    this.isDashing = false;
    this.dashFrame = 0;
    this.dashCooldown = 0;
    this.dashSpeed = 15;

    // NEW: Critical hit system
    this.critChance = 0.15; // 15% chance
    this.lastHitWasCrit = false;

    // Controls
    this.controls = controls;

    // Initialize components
    this.physics = new PhysicsComponent(this);
    this.combat = new CombatComponent(this);
    this.projectile = new ProjectileComponent(this);
    this.animation = new AnimationComponent(this);
  }

  update(groundY, opponent) {
    // Update animation frame
    this.animation.update();

    // Handle knockdown state
    this.physics.updateKnockdown();

    // Handle dash
    this.physics.updateDash();

    // Update physics
    this.physics.update(groundY);

    // Update attack
    if (this.isAttacking) {
      this.combat.updateAttack(opponent);
    }

    // Update projectiles
    this.projectile.updateProjectiles(groundY);

    // Update cooldowns
    this.combat.updateCooldowns();
    this.projectile.updateCooldown();
    this.projectile.updateDashCooldown();
  }

  checkHit(opponent) {
    return this.combat.checkHit(opponent);
  }

  onHit(opponent) {
    return this.combat.onHit(opponent);
  }

  takeDamage(amount, attackerPowerLevel = 0) {
    return this.combat.takeDamage(amount, attackerPowerLevel);
  }

  moveLeft() {
    this.physics.moveLeft();
  }

  moveRight() {
    this.physics.moveRight();
  }

  jump() {
    this.physics.jump();
  }

  crouch() {
    this.combat.crouch();
  }

  standUp() {
    this.combat.standUp();
  }

  punch() {
    this.combat.punch();
  }

  kick() {
    this.combat.kick();
  }

  // NEW: Throw stone projectile
  throwStone() {
    this.projectile.throwStone();
  }

  // NEW: Update projectiles (public API for tests)
  updateProjectiles(groundY) {
    this.projectile.updateProjectiles(groundY);
  }

  // NEW: Check if stone hits opponent
  checkStoneHit(opponent) {
    return this.projectile.checkStoneHit(opponent);
  }
  // NEW: Knockdown from stone hit
  knockDown() {
    this.physics.knockDown();
  }
  // NEW: Dash ability
  dash() {
    this.physics.dash();
  }
  // NEW: Refill stones (called when picking up power-up)
  refillStones() {
    this.projectile.refillStones();
  }

  draw(ctx) {
    this.animation.draw(ctx);
  }

  drawStickFigure(ctx) {
    // Delegated to animation component
    this.animation.drawStickFigure(ctx);
  }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = Player;
}
