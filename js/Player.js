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
    }
    
    update(groundY, opponent) {
        // Update animation frame
        this.animationFrame += this.animationSpeed;
        
        // NEW: Handle knockdown state
        if (this.isKnockedDown) {
            this.knockdownTime--;
            if (this.knockdownTime <= 0) {
                this.isKnockedDown = false;
                this.getUpFrame = 20; // Getting up animation
            }
            this.velocityX *= 0.9; // Slow down while knocked down
        }
        
        // NEW: Handle getting up animation
        if (this.getUpFrame > 0) {
            this.getUpFrame--;
        }
        
        // NEW: Handle dash
        if (this.isDashing) {
            this.dashFrame++;
            if (this.dashFrame >= 10) {
                this.isDashing = false;
                this.dashFrame = 0;
                this.velocityX *= 0.5; // Slow down after dash
            }
        }
        
        // Apply gravity
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        
        // Ground collision
        if (this.y + this.height >= groundY) {
            this.y = groundY - this.height;
            this.velocityY = 0;
            this.isGrounded = true;
            this.isJumping = false;
        } else {
            this.isGrounded = false;
        }
        
        // Update horizontal movement
        this.x += this.velocityX;
        
        // Friction
        if (this.isGrounded && !this.isAttacking && !this.isDashing) {
            this.velocityX *= 0.85;
        }
        
        // Update attack
        if (this.isAttacking) {
            this.updateAttack(opponent);
        }
        
        // NEW: Update projectiles
        this.updateProjectiles(groundY);
        
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.hitFlash > 0) this.hitFlash--;
        if (this.hitStun > 0) this.hitStun--;
        if (this.stoneCooldown > 0) this.stoneCooldown--;
        if (this.dashCooldown > 0) this.dashCooldown--;
        
        // Walk animation
        if (Math.abs(this.velocityX) > 0.5 && this.isGrounded && !this.isAttacking) {
            this.walkCycle += 0.2;
        }
    }
    
    updateAttack(opponent) {
        this.attackFrame++;
        
        const attackDuration = this.attackType === 'punch' ? 15 : 20;
        
        // Create hitbox during attack frames 5-10
        if (this.attackFrame >= 5 && this.attackFrame <= 10) {
            const hitboxWidth = this.attackType === 'punch' ? 40 : 60;
            const hitboxHeight = this.attackType === 'punch' ? 30 : 40;
            const hitboxX = this.x + (this.facing === 1 ? this.width : -hitboxWidth);
            const hitboxY = this.y + (this.attackType === 'punch' ? 20 : 40);
            
            this.hitbox = {
                x: hitboxX,
                y: hitboxY,
                width: hitboxWidth,
                height: hitboxHeight
            };
            
            // Check collision with opponent
            if (this.checkHit(opponent)) {
                this.onHit(opponent);
            }
        } else {
            this.hitbox = null;
        }
        
        // End attack
        if (this.attackFrame >= attackDuration) {
            this.isAttacking = false;
            this.attackType = null;
            this.attackFrame = 0;
            this.hitbox = null;
        }
    }
    
    checkHit(opponent) {
        if (!this.hitbox || opponent.hitStun > 0) return false;
        
        return (
            this.hitbox.x < opponent.x + opponent.width &&
            this.hitbox.x + this.hitbox.width > opponent.x &&
            this.hitbox.y < opponent.y + opponent.height &&
            this.hitbox.y + this.hitbox.height > opponent.y
        );
    }
    
    onHit(opponent) {
        let baseDamage = this.attackType === 'punch' ? 8 : 12;
        
        // Apply attack power upgrade if exists
        if (this.attackPowerLevel) {
            baseDamage += (this.attackPowerLevel * 2);
        }
        
        // NEW: Critical hit chance
        this.lastHitWasCrit = Math.random() < this.critChance;
        if (this.lastHitWasCrit) {
            baseDamage *= 1.5;
        }
        
        opponent.takeDamage(baseDamage, this.attackPowerLevel || 0);
        
        // Knockback
        const knockbackForce = this.attackType === 'punch' ? 8 : 12;
        opponent.velocityX = this.facing * knockbackForce;
        opponent.velocityY = -5;
        
        // Remove hitbox to prevent multiple hits
        this.hitbox = null;
        
        return this.lastHitWasCrit; // Return if it was a crit
    }
    
    takeDamage(amount, attackerPowerLevel = 0) {
        // Apply defense if exists
        let finalDamage = amount;
        if (this.defenseLevel) {
            const reduction = this.defenseLevel * 0.1; // 10% per level
            finalDamage = Math.ceil(amount * (1 - reduction));
        }
        
        this.health = Math.max(0, this.health - finalDamage);
        this.hitFlash = 10;
        this.hitStun = 15;
        
        // Camera shake effect (handled by game)
        return true;
    }
    
    moveLeft() {
        if (!this.isAttacking && this.hitStun <= 0 && !this.isKnockedDown && !this.isDashing) {
            this.velocityX = -this.speed;
            this.facing = -1;
        }
    }
    
    moveRight() {
        if (!this.isAttacking && this.hitStun <= 0 && !this.isKnockedDown && !this.isDashing) {
            this.velocityX = this.speed;
            this.facing = 1;
        }
    }
    
    jump() {
        if (this.isGrounded && !this.isJumping && !this.isAttacking && this.hitStun <= 0 && !this.isKnockedDown) {
            this.velocityY = -this.jumpPower;
            this.isJumping = true;
            this.isGrounded = false;
        }
    }
    
    crouch() {
        if (this.isGrounded && !this.isAttacking && this.hitStun <= 0 && !this.isKnockedDown) {
            this.isCrouching = true;
        }
    }
    
    standUp() {
        this.isCrouching = false;
    }
    
    punch() {
        if (!this.isAttacking && this.attackCooldown <= 0 && this.hitStun <= 0 && !this.isKnockedDown) {
            this.isAttacking = true;
            this.attackType = 'punch';
            this.attackFrame = 0;
            this.attackCooldown = 20;
            this.velocityX = 0;
        }
    }
    
    kick() {
        if (!this.isAttacking && this.attackCooldown <= 0 && this.hitStun <= 0 && !this.isKnockedDown) {
            this.isAttacking = true;
            this.attackType = 'kick';
            this.attackFrame = 0;
            this.attackCooldown = 30;
            this.velocityX = 0;
        }
    }
    
    // NEW: Throw stone projectile
    throwStone() {
        if (this.stoneCooldown <= 0 && this.stoneCount > 0 && !this.isAttacking && !this.isKnockedDown) {
            const stone = {
                x: this.x + (this.facing === 1 ? this.width : 0),
                y: this.y + 30,
                velocityX: this.facing * 12,
                velocityY: -3,
                size: 8,
                rotation: 0,
                active: true
            };
            this.projectiles.push(stone);
            this.stoneCount--;
            this.stoneCooldown = 40;
        }
    }
    
    // NEW: Update projectiles
    updateProjectiles(groundY) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const stone = this.projectiles[i];
            
            if (!stone.active) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            // Update position
            stone.x += stone.velocityX;
            stone.y += stone.velocityY;
            stone.velocityY += 0.4; // Gravity
            stone.rotation += 0.3;
            
            // Check ground collision
            if (stone.y >= groundY - stone.size) {
                stone.active = false;
            }
            
            // Remove if off screen
            if (stone.x < -50 || stone.x > 850 || stone.y > groundY) {
                stone.active = false;
            }
        }
    }
    
    // NEW: Check if stone hits opponent
    checkStoneHit(opponent) {
        for (let stone of this.projectiles) {
            if (stone.active) {
                const hit = stone.x < opponent.x + opponent.width &&
                           stone.x + stone.size > opponent.x &&
                           stone.y < opponent.y + opponent.height &&
                           stone.y + stone.size > opponent.y;
                
                if (hit) {
                    stone.active = false;
                    return stone;
                }
            }
        }
        return null;
    }
    
    // NEW: Knockdown from stone hit
    knockDown() {
        if (!this.isKnockedDown) {
            this.isKnockedDown = true;
            this.knockdownTime = 60; // 1 second at 60fps
            this.velocityY = -8;
            this.velocityX = -this.facing * 5;
            this.isAttacking = false;
            this.attackType = null;
        }
    }
    
    // NEW: Dash ability
    dash() {
        if (this.dashCooldown <= 0 && !this.isDashing && !this.isKnockedDown && this.isGrounded) {
            this.isDashing = true;
            this.dashFrame = 0;
            this.velocityX = this.facing * this.dashSpeed;
            this.dashCooldown = 60; // 1 second cooldown
        }
    }
    
    // NEW: Refill stones (called when picking up power-up)
    refillStones() {
        this.stoneCount = this.maxStones;
    }
    
    draw(ctx) {
        ctx.save();
        
        // Hit flash effect
        if (this.hitFlash > 0) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'white';
            ctx.fillRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
            ctx.globalAlpha = 1;
        }
        
        // Draw stick figure
        this.drawStickFigure(ctx);
        
        // Draw hitbox (for debugging)
        // if (this.hitbox) {
        //     ctx.strokeStyle = 'red';
        //     ctx.lineWidth = 2;
        //     ctx.strokeRect(this.hitbox.x, this.hitbox.y, this.hitbox.width, this.hitbox.height);
        // }
        
        ctx.restore();
    }
    
    drawStickFigure(ctx) {
        const centerX = this.x + this.width / 2;
        const headY = this.y + 15;
        const bodyStartY = this.y + 25;
        const bodyEndY = this.y + 50;
        const crouchOffset = this.isCrouching ? 20 : 0;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // NEW: Knockdown animation
        if (this.isKnockedDown || this.getUpFrame > 0) {
            this.drawKnockedDownPose(ctx, centerX, headY, bodyStartY, bodyEndY);
            return;
        }
        
        // NEW: Dash effect
        if (this.isDashing) {
            this.drawDashPose(ctx, centerX, headY, bodyStartY, bodyEndY);
            return;
        }
        
        // Head
        ctx.beginPath();
        ctx.arc(centerX, headY, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Body
        ctx.beginPath();
        ctx.moveTo(centerX, bodyStartY);
        ctx.lineTo(centerX, bodyEndY + crouchOffset);
        ctx.stroke();
        
        // Draw arms and legs based on state
        if (this.isAttacking) {
            this.drawAttackPose(ctx, centerX, bodyStartY, bodyEndY);
        } else if (!this.isGrounded) {
            this.drawJumpPose(ctx, centerX, bodyStartY, bodyEndY);
        } else if (Math.abs(this.velocityX) > 0.5) {
            this.drawWalkPose(ctx, centerX, bodyStartY, bodyEndY);
        } else {
            this.drawIdlePose(ctx, centerX, bodyStartY, bodyEndY, crouchOffset);
        }
    }
    
    // NEW: Draw knocked down pose
    drawKnockedDownPose(ctx, centerX, headY, bodyStartY, bodyEndY) {
        const groundY = this.y + this.height;
        
        if (this.getUpFrame > 0) {
            // Getting up animation
            const progress = 1 - (this.getUpFrame / 20);
            const liftY = (1 - progress) * 30;
            
            ctx.beginPath();
            ctx.arc(centerX - 15, groundY - 20 - liftY, 10, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX - 25, groundY - 10 - liftY);
            ctx.lineTo(centerX + 5, groundY - 10 - liftY);
            ctx.stroke();
        } else {
            // Fully knocked down
            ctx.beginPath();
            ctx.arc(centerX - 15, groundY - 20, 10, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX - 25, groundY - 10);
            ctx.lineTo(centerX + 5, groundY - 10);
            ctx.stroke();
            
            // Legs
            ctx.beginPath();
            ctx.moveTo(centerX - 5, groundY - 10);
            ctx.lineTo(centerX - 10, groundY - 5);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX + 5, groundY - 10);
            ctx.lineTo(centerX + 10, groundY - 5);
            ctx.stroke();
        }
    }
    
    // NEW: Draw dash pose
    drawDashPose(ctx, centerX, headY, bodyStartY, bodyEndY) {
        // Motion blur effect
        ctx.save();
        ctx.globalAlpha = 0.5;
        
        // Head
        ctx.beginPath();
        ctx.arc(centerX, headY, 10, 0, Math.PI * 2);
        ctx.stroke();
        
        // Body leaning forward
        ctx.beginPath();
        ctx.moveTo(centerX, bodyStartY);
        ctx.lineTo(centerX + this.facing * 10, bodyEndY);
        ctx.stroke();
        
        // Arms back
        ctx.beginPath();
        ctx.moveTo(centerX, bodyStartY + 10);
        ctx.lineTo(centerX - this.facing * 20, bodyStartY + 20);
        ctx.stroke();
        
        // Legs running
        ctx.beginPath();
        ctx.moveTo(centerX + this.facing * 10, bodyEndY);
        ctx.lineTo(centerX + this.facing * 20, this.y + this.height);
        ctx.stroke();
        
        ctx.restore();
    }
    
    drawIdlePose(ctx, centerX, bodyStartY, bodyEndY, crouchOffset) {
        const armY = bodyStartY + 10;
        const legSplit = 15;
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX - 20 * this.facing, armY + 20 + crouchOffset);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX + 20 * this.facing, armY + 20 + crouchOffset);
        ctx.stroke();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY + crouchOffset);
        ctx.lineTo(centerX - legSplit, this.y + this.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY + crouchOffset);
        ctx.lineTo(centerX + legSplit, this.y + this.height);
        ctx.stroke();
    }
    
    drawWalkPose(ctx, centerX, bodyStartY, bodyEndY) {
        const armY = bodyStartY + 10;
        const swing = Math.sin(this.walkCycle) * 15;
        
        // Arms (swinging)
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX - 15 * this.facing, armY + 20 + swing);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX + 15 * this.facing, armY + 20 - swing);
        ctx.stroke();
        
        // Legs (walking)
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY);
        ctx.lineTo(centerX - 10, bodyEndY + 20 - swing);
        ctx.lineTo(centerX - 15, this.y + this.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY);
        ctx.lineTo(centerX + 10, bodyEndY + 20 + swing);
        ctx.lineTo(centerX + 15, this.y + this.height);
        ctx.stroke();
    }
    
    drawJumpPose(ctx, centerX, bodyStartY, bodyEndY) {
        const armY = bodyStartY + 10;
        
        // Arms (raised)
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX - 25 * this.facing, armY - 10);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX + 25 * this.facing, armY - 10);
        ctx.stroke();
        
        // Legs (tucked)
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY);
        ctx.lineTo(centerX - 20, bodyEndY + 15);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY);
        ctx.lineTo(centerX + 20, bodyEndY + 15);
        ctx.stroke();
    }
    
    drawAttackPose(ctx, centerX, bodyStartY, bodyEndY) {
        const armY = bodyStartY + 10;
        const progress = this.attackFrame / 15;
        const extend = Math.sin(progress * Math.PI) * 30;
        
        if (this.attackType === 'punch') {
            // Punching arm extended
            ctx.beginPath();
            ctx.moveTo(centerX, armY);
            ctx.lineTo(centerX + (25 + extend) * this.facing, armY);
            ctx.stroke();
            
            // Other arm back
            ctx.beginPath();
            ctx.moveTo(centerX, armY);
            ctx.lineTo(centerX - 15 * this.facing, armY + 15);
            ctx.stroke();
        } else {
            // Kicking leg extended
            ctx.beginPath();
            ctx.moveTo(centerX, bodyEndY);
            ctx.lineTo(centerX + (30 + extend) * this.facing, bodyEndY);
            ctx.stroke();
            
            // Standing leg
            ctx.beginPath();
            ctx.moveTo(centerX, bodyEndY);
            ctx.lineTo(centerX - 5, this.y + this.height);
            ctx.stroke();
            
            // Arms balanced
            ctx.beginPath();
            ctx.moveTo(centerX, armY);
            ctx.lineTo(centerX - 20 * this.facing, armY + 10);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX, armY);
            ctx.lineTo(centerX + 15 * this.facing, armY - 5);
            ctx.stroke();
            
            return;
        }
        
        // Legs for punch
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY);
        ctx.lineTo(centerX - 15, this.y + this.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY);
        ctx.lineTo(centerX + 15, this.y + this.height);
        ctx.stroke();
    }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Player;
}