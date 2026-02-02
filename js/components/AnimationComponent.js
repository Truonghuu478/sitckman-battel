/**
 * AnimationComponent - Handles player rendering and animations
 */
class AnimationComponent {
    constructor(player) {
        this.player = player;
    }

    update() {
        const player = this.player;
        player.animationFrame += player.animationSpeed;
        
        // Walk animation
        if (Math.abs(player.velocityX) > 0.5 && player.isGrounded && !player.isAttacking) {
            player.walkCycle += 0.2;
        }
    }

    draw(ctx) {
        const player = this.player;
        ctx.save();
        
        // Hit flash effect
        if (player.hitFlash > 0) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = 'white';
            ctx.fillRect(player.x - 5, player.y - 5, player.width + 10, player.height + 10);
            ctx.globalAlpha = 1;
        }
        
        // Draw stick figure
        this.drawStickFigure(ctx);
        
        ctx.restore();
    }

    drawStickFigure(ctx) {
        const player = this.player;
        const centerX = player.x + player.width / 2;
        const headY = player.y + 15;
        const bodyStartY = player.y + 25;
        const bodyEndY = player.y + 50;
        const crouchOffset = player.isCrouching ? 20 : 0;
        
        ctx.strokeStyle = player.color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Knockdown animation
        if (player.isKnockedDown || player.getUpFrame > 0) {
            this.drawKnockedDownPose(ctx, centerX, headY, bodyStartY, bodyEndY);
            return;
        }
        
        // Dash effect
        if (player.isDashing) {
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
        if (player.isAttacking) {
            this.drawAttackPose(ctx, centerX, bodyStartY, bodyEndY);
        } else if (!player.isGrounded) {
            this.drawJumpPose(ctx, centerX, bodyStartY, bodyEndY);
        } else if (Math.abs(player.velocityX) > 0.5) {
            this.drawWalkPose(ctx, centerX, bodyStartY, bodyEndY);
        } else {
            this.drawIdlePose(ctx, centerX, bodyStartY, bodyEndY, crouchOffset);
        }
    }

    drawKnockedDownPose(ctx, centerX, headY, bodyStartY, bodyEndY) {
        const player = this.player;
        const groundY = player.y + player.height;
        
        if (player.getUpFrame > 0) {
            // Getting up animation
            const progress = 1 - (player.getUpFrame / 20);
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

    drawDashPose(ctx, centerX, headY, bodyStartY, bodyEndY) {
        const player = this.player;
        
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
        ctx.lineTo(centerX + player.facing * 10, bodyEndY);
        ctx.stroke();
        
        // Arms back
        ctx.beginPath();
        ctx.moveTo(centerX, bodyStartY + 10);
        ctx.lineTo(centerX - player.facing * 20, bodyStartY + 20);
        ctx.stroke();
        
        // Legs running
        ctx.beginPath();
        ctx.moveTo(centerX + player.facing * 10, bodyEndY);
        ctx.lineTo(centerX + player.facing * 20, player.y + player.height);
        ctx.stroke();
        
        ctx.restore();
    }

    drawIdlePose(ctx, centerX, bodyStartY, bodyEndY, crouchOffset) {
        const player = this.player;
        const armY = bodyStartY + 10;
        const legSplit = 15;
        
        // Arms
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX - 20 * player.facing, armY + 20 + crouchOffset);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX + 20 * player.facing, armY + 20 + crouchOffset);
        ctx.stroke();
        
        // Legs
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY + crouchOffset);
        ctx.lineTo(centerX - legSplit, player.y + player.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY + crouchOffset);
        ctx.lineTo(centerX + legSplit, player.y + player.height);
        ctx.stroke();
    }

    drawWalkPose(ctx, centerX, bodyStartY, bodyEndY) {
        const player = this.player;
        const armY = bodyStartY + 10;
        const swing = Math.sin(player.walkCycle) * 15;
        
        // Arms (swinging)
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX - 15 * player.facing, armY + 20 + swing);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX + 15 * player.facing, armY + 20 - swing);
        ctx.stroke();
        
        // Legs (walking)
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY);
        ctx.lineTo(centerX - 10, bodyEndY + 20 - swing);
        ctx.lineTo(centerX - 15, player.y + player.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY);
        ctx.lineTo(centerX + 10, bodyEndY + 20 + swing);
        ctx.lineTo(centerX + 15, player.y + player.height);
        ctx.stroke();
    }

    drawJumpPose(ctx, centerX, bodyStartY, bodyEndY) {
        const player = this.player;
        const armY = bodyStartY + 10;
        
        // Arms (raised)
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX - 25 * player.facing, armY - 10);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, armY);
        ctx.lineTo(centerX + 25 * player.facing, armY - 10);
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
        const player = this.player;
        const armY = bodyStartY + 10;
        const progress = player.attackFrame / 15;
        const extend = Math.sin(progress * Math.PI) * 30;
        
        if (player.attackType === 'punch') {
            // Punching arm extended
            ctx.beginPath();
            ctx.moveTo(centerX, armY);
            ctx.lineTo(centerX + (25 + extend) * player.facing, armY);
            ctx.stroke();
            
            // Other arm back
            ctx.beginPath();
            ctx.moveTo(centerX, armY);
            ctx.lineTo(centerX - 15 * player.facing, armY + 15);
            ctx.stroke();
        } else {
            // Kicking leg extended
            ctx.beginPath();
            ctx.moveTo(centerX, bodyEndY);
            ctx.lineTo(centerX + (30 + extend) * player.facing, bodyEndY);
            ctx.stroke();
            
            // Standing leg
            ctx.beginPath();
            ctx.moveTo(centerX, bodyEndY);
            ctx.lineTo(centerX - 5, player.y + player.height);
            ctx.stroke();
            
            // Arms balanced
            ctx.beginPath();
            ctx.moveTo(centerX, armY);
            ctx.lineTo(centerX - 20 * player.facing, armY + 10);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(centerX, armY);
            ctx.lineTo(centerX + 15 * player.facing, armY - 5);
            ctx.stroke();
            
            return;
        }
        
        // Legs for punch
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY);
        ctx.lineTo(centerX - 15, player.y + player.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, bodyEndY);
        ctx.lineTo(centerX + 15, player.y + player.height);
        ctx.stroke();
    }
}

// Export for Node.js (tests) while maintaining browser compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationComponent;
}
