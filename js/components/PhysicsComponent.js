/**
 * PhysicsComponent - Handles player physics and movement
 */
class PhysicsComponent {
  constructor(player) {
    this.player = player;
  }

  update(groundY) {
    const player = this.player;

    // Apply gravity
    player.velocityY += player.gravity;
    player.y += player.velocityY;

    // Ground collision
    if (player.y + player.height >= groundY) {
      player.y = groundY - player.height;
      player.velocityY = 0;
      player.isGrounded = true;
      player.isJumping = false;
    } else {
      player.isGrounded = false;
    }

    // Update horizontal movement
    player.x += player.velocityX;

    // Friction
    if (player.isGrounded && !player.isAttacking && !player.isDashing) {
      player.velocityX *= 0.85;
    }
  }

  moveLeft() {
    const player = this.player;
    if (
      !player.isAttacking &&
      player.hitStun <= 0 &&
      !player.isKnockedDown &&
      !player.isDashing
    ) {
      player.velocityX = -player.speed;
      player.facing = -1;
    }
  }

  moveRight() {
    const player = this.player;
    if (
      !player.isAttacking &&
      player.hitStun <= 0 &&
      !player.isKnockedDown &&
      !player.isDashing
    ) {
      player.velocityX = player.speed;
      player.facing = 1;
    }
  }

  jump() {
    const player = this.player;
    if (
      player.isGrounded &&
      !player.isJumping &&
      !player.isAttacking &&
      player.hitStun <= 0 &&
      !player.isKnockedDown
    ) {
      player.velocityY = -player.jumpPower;
      player.isJumping = true;
      player.isGrounded = false;
    }
  }

  dash() {
    const player = this.player;
    if (
      player.dashCooldown <= 0 &&
      !player.isDashing &&
      !player.isKnockedDown &&
      !player.isAttacking &&
      player.hitStun <= 0 &&
      player.isGrounded
    ) {
      player.isDashing = true;
      player.dashFrame = 0;
      player.velocityX = player.facing * player.dashSpeed;
      player.dashCooldown = 60; // 1 second cooldown
    }
  }

  updateDash() {
    const player = this.player;
    if (player.isDashing) {
      player.dashFrame++;
      if (player.dashFrame >= 10) {
        player.isDashing = false;
        player.dashFrame = 0;
        player.velocityX *= 0.5; // Slow down after dash
      }
    }
  }

  knockDown() {
    const player = this.player;
    if (!player.isKnockedDown) {
      player.isKnockedDown = true;
      player.knockdownTime = 60; // 1 second at 60fps
      player.velocityY = -8;
      player.velocityX = -player.facing * 5;
      player.isAttacking = false;
      player.attackType = null;
    }
  }

  updateKnockdown() {
    const player = this.player;

    if (player.isKnockedDown) {
      player.knockdownTime--;
      if (player.knockdownTime <= 0) {
        player.isKnockedDown = false;
        player.getUpFrame = 20; // Getting up animation
      }
      player.velocityX *= 0.9; // Slow down while knocked down
    }

    if (player.getUpFrame > 0) {
      player.getUpFrame--;
    }
  }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = PhysicsComponent;
}
