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
        
        // Controls
        this.controls = controls;
    }
    
    update(groundY, opponent) {
        // Update animation frame
        this.animationFrame += this.animationSpeed;
        
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
        if (this.isGrounded && !this.isAttacking) {
            this.velocityX *= 0.85;
        }
        
        // Update attack
        if (this.isAttacking) {
            this.updateAttack(opponent);
        }
        
        // Update cooldowns
        if (this.attackCooldown > 0) this.attackCooldown--;
        if (this.hitFlash > 0) this.hitFlash--;
        if (this.hitStun > 0) this.hitStun--;
        
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
        const damage = this.attackType === 'punch' ? 8 : 12;
        opponent.takeDamage(damage);
        
        // Knockback
        const knockbackForce = this.attackType === 'punch' ? 8 : 12;
        opponent.velocityX = this.facing * knockbackForce;
        opponent.velocityY = -5;
        
        // Remove hitbox to prevent multiple hits
        this.hitbox = null;
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.hitFlash = 10;
        this.hitStun = 15;
        
        // Camera shake effect (handled by game)
        return true;
    }
    
    moveLeft() {
        if (!this.isAttacking && this.hitStun <= 0) {
            this.velocityX = -this.speed;
            this.facing = -1;
        }
    }
    
    moveRight() {
        if (!this.isAttacking && this.hitStun <= 0) {
            this.velocityX = this.speed;
            this.facing = 1;
        }
    }
    
    jump() {
        if (this.isGrounded && !this.isJumping && !this.isAttacking && this.hitStun <= 0) {
            this.velocityY = -this.jumpPower;
            this.isJumping = true;
            this.isGrounded = false;
        }
    }
    
    crouch() {
        if (this.isGrounded && !this.isAttacking && this.hitStun <= 0) {
            this.isCrouching = true;
        }
    }
    
    standUp() {
        this.isCrouching = false;
    }
    
    punch() {
        if (!this.isAttacking && this.attackCooldown <= 0 && this.hitStun <= 0) {
            this.isAttacking = true;
            this.attackType = 'punch';
            this.attackFrame = 0;
            this.attackCooldown = 20;
            this.velocityX = 0;
        }
    }
    
    kick() {
        if (!this.isAttacking && this.attackCooldown <= 0 && this.hitStun <= 0) {
            this.isAttacking = true;
            this.attackType = 'kick';
            this.attackFrame = 0;
            this.attackCooldown = 30;
            this.velocityX = 0;
        }
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