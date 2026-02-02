/**
 * CombatComponent - Handles player combat mechanics
 */
class CombatComponent {
  constructor(player) {
    this.player = player;
  }

  punch() {
    const player = this.player;
    if (
      !player.isAttacking &&
      player.attackCooldown <= 0 &&
      player.hitStun <= 0 &&
      !player.isKnockedDown
    ) {
      player.isAttacking = true;
      player.attackType = "punch";
      player.attackFrame = 0;
      player.attackCooldown = 20;
      player.velocityX = 0;
    }
  }

  kick() {
    const player = this.player;
    if (
      !player.isAttacking &&
      player.attackCooldown <= 0 &&
      player.hitStun <= 0 &&
      !player.isKnockedDown
    ) {
      player.isAttacking = true;
      player.attackType = "kick";
      player.attackFrame = 0;
      player.attackCooldown = 30;
      player.velocityX = 0;
    }
  }

  crouch() {
    const player = this.player;
    if (
      player.isGrounded &&
      !player.isAttacking &&
      player.hitStun <= 0 &&
      !player.isKnockedDown
    ) {
      player.isCrouching = true;
    }
  }

  standUp() {
    this.player.isCrouching = false;
  }

  updateAttack(opponent) {
    const player = this.player;
    player.attackFrame++;

    const attackDuration = player.attackType === "punch" ? 15 : 20;

    // Create hitbox during attack frames 5-10
    if (player.attackFrame >= 5 && player.attackFrame <= 10) {
      const hitboxWidth = player.attackType === "punch" ? 40 : 60;
      const hitboxHeight = player.attackType === "punch" ? 30 : 40;
      const hitboxX =
        player.x + (player.facing === 1 ? player.width : -hitboxWidth);
      const hitboxY = player.y + (player.attackType === "punch" ? 20 : 40);

      player.hitbox = {
        x: hitboxX,
        y: hitboxY,
        width: hitboxWidth,
        height: hitboxHeight,
      };

      // Check collision with opponent
      if (this.checkHit(opponent)) {
        this.onHit(opponent);
      }
    } else {
      player.hitbox = null;
    }

    // End attack
    if (player.attackFrame >= attackDuration) {
      player.isAttacking = false;
      player.attackType = null;
      player.attackFrame = 0;
      player.hitbox = null;
    }
  }

  checkHit(opponent) {
    const player = this.player;
    if (!player.hitbox || opponent.hitStun > 0) return false;

    return (
      player.hitbox.x < opponent.x + opponent.width &&
      player.hitbox.x + player.hitbox.width > opponent.x &&
      player.hitbox.y < opponent.y + opponent.height &&
      player.hitbox.y + player.hitbox.height > opponent.y
    );
  }

  onHit(opponent) {
    const player = this.player;
    let baseDamage = player.attackType === "punch" ? 8 : 12;

    // Apply attack power upgrade if exists
    if (player.attackPowerLevel) {
      baseDamage += player.attackPowerLevel * 2;
    }

    // Critical hit chance
    player.lastHitWasCrit = Math.random() < player.critChance;
    if (player.lastHitWasCrit) {
      baseDamage *= 1.5;
    }

    opponent.takeDamage(baseDamage, player.attackPowerLevel || 0);

    // Knockback
    const knockbackForce = player.attackType === "punch" ? 8 : 12;
    opponent.velocityX = player.facing * knockbackForce;
    opponent.velocityY = -5;

    // Remove hitbox to prevent multiple hits
    player.hitbox = null;

    return player.lastHitWasCrit; // Return if it was a crit
  }

  takeDamage(amount, attackerPowerLevel = 0) {
    const player = this.player;
    // Apply defense if exists
    let finalDamage = amount;
    if (player.defenseLevel) {
      const reduction = player.defenseLevel * 0.1; // 10% per level
      finalDamage = Math.ceil(amount * (1 - reduction));
    }

    player.health = Math.max(0, player.health - finalDamage);
    player.hitFlash = 10;
    player.hitStun = 15;

    return true;
  }

  updateCooldowns() {
    const player = this.player;
    if (player.attackCooldown > 0) player.attackCooldown--;
    if (player.hitFlash > 0) player.hitFlash--;
    if (player.hitStun > 0) player.hitStun--;
  }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = CombatComponent;
}
