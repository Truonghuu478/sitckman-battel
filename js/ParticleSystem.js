class ParticleSystem {
    constructor() {
        this.particles = [];
    }
    
    update() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update();
            
            if (particle.isDead()) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }
    
    createHitEffect(x, y, color) {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const speed = 2 + Math.random() * 4;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push(new HitParticle(x, y, vx, vy, color));
        }
        
        // Add some sparks
        for (let i = 0; i < 8; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 3 + Math.random() * 5;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push(new SparkParticle(x, y, vx, vy));
        }
    }
    
    createDustCloud(x, y, direction) {
        for (let i = 0; i < 5; i++) {
            const vx = direction * (1 + Math.random() * 2);
            const vy = -Math.random() * 2;
            
            this.particles.push(new DustParticle(x, y, vx, vy));
        }
    }
    
    createJumpDust(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = Math.PI + (Math.random() - 0.5) * Math.PI * 0.5;
            const speed = 1 + Math.random() * 3;
            const vx = Math.cos(angle) * speed;
            const vy = Math.sin(angle) * speed;
            
            this.particles.push(new DustParticle(x, y, vx, vy));
        }
    }
    
    createLandDust(x, y) {
        for (let i = 0; i < 10; i++) {
            const vx = (Math.random() - 0.5) * 4;
            const vy = -Math.random() * 2;
            
            this.particles.push(new DustParticle(x, y, vx, vy));
        }
    }
    
    clear() {
        this.particles = [];
    }
}

class Particle {
    constructor(x, y, vx, vy) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = 1.0;
        this.decay = 0.02;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2; // gravity
        this.vx *= 0.98; // friction
        this.life -= this.decay;
    }
    
    isDead() {
        return this.life <= 0;
    }
}

class HitParticle extends Particle {
    constructor(x, y, vx, vy, color) {
        super(x, y, vx, vy);
        this.color = color;
        this.size = 3 + Math.random() * 3;
        this.decay = 0.03;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class SparkParticle extends Particle {
    constructor(x, y, vx, vy) {
        super(x, y, vx, vy);
        this.size = 2;
        this.length = 8 + Math.random() * 8;
        this.decay = 0.05;
        this.colors = ['#ffff00', '#ffaa00', '#ff6600', '#ffffff'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }
    
    update() {
        super.update();
        this.length *= 0.95;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        
        const angle = Math.atan2(this.vy, this.vx);
        const endX = this.x - Math.cos(angle) * this.length;
        const endY = this.y - Math.sin(angle) * this.length;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.stroke();
        
        ctx.restore();
    }
}

class DustParticle extends Particle {
    constructor(x, y, vx, vy) {
        super(x, y, vx, vy);
        this.size = 3 + Math.random() * 5;
        this.decay = 0.02;
        this.color = `rgba(200, 200, 200, ${this.life})`;
    }
    
    update() {
        super.update();
        this.size *= 1.02; // expand
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life * 0.6;
        ctx.fillStyle = '#cccccc';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Shockwave effect for powerful hits
class Shockwave {
    constructor(x, y, maxRadius = 80) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = maxRadius;
        this.life = 1.0;
        this.speed = 8;
    }
    
    update() {
        this.radius += this.speed;
        this.life -= 0.05;
    }
    
    draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.life * 0.5;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
    
    isDead() {
        return this.life <= 0 || this.radius > this.maxRadius;
    }
}

// Motion trail for fast movements
class MotionTrail {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.alpha = 0.3;
        this.decay = 0.05;
    }
    
    update() {
        this.alpha -= this.decay;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.restore();
    }
    
    isDead() {
        return this.alpha <= 0;
    }
}