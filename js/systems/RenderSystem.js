/**
 * RenderSystem - Handles all rendering logic
 */
class RenderSystem {
  constructor(game) {
    this.game = game;
  }

  draw() {
    const { ctx, width, height, groundY, shakeAmount } = this.game;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Apply camera shake
    ctx.save();
    if (shakeAmount > 0) {
      const shakeX = (Math.random() - 0.5) * shakeAmount;
      const shakeY = (Math.random() - 0.5) * shakeAmount;
      ctx.translate(shakeX, shakeY);
    }

    // Draw background
    this.drawBackground();

    // Draw ground
    this.drawGround();

    // Draw shockwaves (behind players)
    this.game.shockwaves.forEach((shockwave) => shockwave.draw(ctx));

    // Draw particles (behind players)
    this.game.particleSystem.draw(ctx);

    // Draw power-ups
    this.drawPowerUps();

    // Draw players
    this.game.player1.draw(ctx);
    this.game.player2.draw(ctx);

    // Draw projectiles (stones)
    this.drawProjectiles();

    // Draw slow-motion indicator
    if (this.game.slowMotion < 1.0) {
      this.drawSlowMotionEffect();
    }

    ctx.restore();
  }

  drawBackground() {
    const { ctx, width, groundY } = this.game;

    // Sky gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, groundY);
    gradient.addColorStop(0, "#87ceeb");
    gradient.addColorStop(0.5, "#b0d8f0");
    gradient.addColorStop(1, "#d0e8f7");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, groundY);

    // Simple clouds
    this.drawCloud(150, 80, 40);
    this.drawCloud(400, 60, 50);
    this.drawCloud(650, 100, 45);

    // Sun
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath();
    ctx.arc(700, 80, 40, 0, Math.PI * 2);
    ctx.fill();

    // Sun glow
    const sunGradient = ctx.createRadialGradient(700, 80, 40, 700, 80, 80);
    sunGradient.addColorStop(0, "rgba(255, 235, 59, 0.3)");
    sunGradient.addColorStop(1, "rgba(255, 235, 59, 0)");
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(700, 80, 80, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCloud(x, y, size) {
    const { ctx } = this.game;
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.6, y, size * 0.8, 0, Math.PI * 2);
    ctx.arc(x + size * 1.2, y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  drawGround() {
    const { ctx, width, height, groundY } = this.game;

    // Ground
    const groundGradient = ctx.createLinearGradient(0, groundY, 0, height);
    groundGradient.addColorStop(0, "#7cb342");
    groundGradient.addColorStop(0.3, "#689f38");
    groundGradient.addColorStop(1, "#558b2f");
    ctx.fillStyle = groundGradient;
    ctx.fillRect(0, groundY, width, height - groundY);

    // Ground line
    ctx.strokeStyle = "#558b2f";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Grass details
    ctx.strokeStyle = "#8bc34a";
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 30) {
      const h = 5 + Math.sin(i * 0.1) * 3;
      ctx.beginPath();
      ctx.moveTo(i, groundY);
      ctx.lineTo(i - 3, groundY - h);
      ctx.moveTo(i, groundY);
      ctx.lineTo(i + 3, groundY - h);
      ctx.stroke();
    }
  }

  drawProjectiles() {
    const { ctx, player1, player2 } = this.game;

    const drawStones = (player) => {
      player.projectiles.forEach((stone) => {
        if (stone.active) {
          ctx.save();
          ctx.translate(stone.x + stone.size / 2, stone.y + stone.size / 2);
          ctx.rotate(stone.rotation);

          // Draw stone
          ctx.fillStyle = "#666";
          ctx.strokeStyle = "#333";
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.arc(0, 0, stone.size / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.restore();
        }
      });
    };

    drawStones(player1);
    drawStones(player2);
  }

  drawPowerUps() {
    const { ctx } = this.game;

    this.game.powerUps.forEach((powerUp) => {
      const floatY = powerUp.y + Math.sin(powerUp.floatOffset) * 5;

      ctx.save();

      // Glow effect
      const glow = ctx.createRadialGradient(
        powerUp.x + powerUp.width / 2,
        floatY + powerUp.height / 2,
        0,
        powerUp.x + powerUp.width / 2,
        floatY + powerUp.height / 2,
        powerUp.width,
      );
      glow.addColorStop(0, "rgba(255, 255, 0, 0.5)");
      glow.addColorStop(1, "rgba(255, 255, 0, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(
        powerUp.x - 10,
        floatY - 10,
        powerUp.width + 20,
        powerUp.height + 20,
      );

      // Power-up box
      ctx.fillStyle = "#ffeb3b";
      ctx.strokeStyle = "#ff9800";
      ctx.lineWidth = 3;
      ctx.fillRect(powerUp.x, floatY, powerUp.width, powerUp.height);
      ctx.strokeRect(powerUp.x, floatY, powerUp.width, powerUp.height);

      // Icon based on type
      ctx.fillStyle = "#333";
      ctx.font = "bold 20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      let icon = "";
      if (powerUp.type === "health") icon = "❤️";
      else if (powerUp.type === "stones") icon = "⚫";
      else if (powerUp.type === "speed") icon = "⚡";

      ctx.fillText(
        icon,
        powerUp.x + powerUp.width / 2,
        floatY + powerUp.height / 2,
      );

      ctx.restore();
    });
  }

  drawSlowMotionEffect() {
    const { ctx, width, height } = this.game;

    ctx.save();
    ctx.fillStyle = "rgba(0, 100, 255, 0.15)";
    ctx.fillRect(0, 0, width, height);

    // "COMBO!" text
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillText("COMBO!", width / 2, 100);

    ctx.restore();
  }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== "undefined" && module.exports) {
  module.exports = RenderSystem;
}
