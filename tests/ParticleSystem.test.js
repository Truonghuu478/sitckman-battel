const { describe, test, expect, beforeEach } = require('@jest/globals');

// Load ParticleSystem
const fs = require('fs');
const path = require('path');
const particleCode = fs.readFileSync(path.join(__dirname, '../js/ParticleSystem.js'), 'utf8');
eval(particleCode);

describe('ParticleSystem Class', () => {
    let particleSystem;

    beforeEach(() => {
        particleSystem = new ParticleSystem();
    });

    describe('Initialization', () => {
        test('should initialize with empty particles array', () => {
            expect(particleSystem.particles).toEqual([]);
        });
    });

    describe('Particle Creation', () => {
        test('should create hit effect particles', () => {
            particleSystem.createHitEffect(100, 100, '#ff0000');
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        test('hit effect should create multiple particle types', () => {
            particleSystem.createHitEffect(100, 100, '#ff0000');
            
            const hasHitParticles = particleSystem.particles.some(p => p instanceof HitParticle);
            const hasSparks = particleSystem.particles.some(p => p instanceof SparkParticle);
            
            expect(hasHitParticles).toBe(true);
            expect(hasSparks).toBe(true);
        });

        test('should create dust cloud particles', () => {
            particleSystem.createDustCloud(100, 100, 1);
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        test('should create jump dust', () => {
            particleSystem.createJumpDust(100, 100);
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });

        test('should create land dust', () => {
            particleSystem.createLandDust(100, 100);
            expect(particleSystem.particles.length).toBeGreaterThan(0);
        });
    });

    describe('Particle Update', () => {
        test('should update particles', () => {
            particleSystem.createDustCloud(100, 100, 1);
            const initialLife = particleSystem.particles[0].life;
            
            particleSystem.update();
            
            expect(particleSystem.particles[0].life).toBeLessThan(initialLife);
        });

        test('should remove dead particles', () => {
            particleSystem.createDustCloud(100, 100, 1);
            
            // Force particles to die
            particleSystem.particles.forEach(p => p.life = 0);
            
            particleSystem.update();
            
            expect(particleSystem.particles.length).toBe(0);
        });

        test('should keep alive particles', () => {
            particleSystem.createDustCloud(100, 100, 1);
            const initialCount = particleSystem.particles.length;
            
            particleSystem.update();
            
            expect(particleSystem.particles.length).toBeGreaterThan(0);
            expect(particleSystem.particles.length).toBeLessThanOrEqual(initialCount);
        });
    });

    describe('Clear', () => {
        test('should clear all particles', () => {
            particleSystem.createHitEffect(100, 100, '#ff0000');
            particleSystem.createDustCloud(200, 200, 1);
            
            expect(particleSystem.particles.length).toBeGreaterThan(0);
            
            particleSystem.clear();
            
            expect(particleSystem.particles).toEqual([]);
        });
    });
});

describe('Particle Base Class', () => {
    test('should initialize with position and velocity', () => {
        const particle = new Particle(10, 20, 1, 2);
        expect(particle.x).toBe(10);
        expect(particle.y).toBe(20);
        expect(particle.vx).toBe(1);
        expect(particle.vy).toBe(2);
    });

    test('should have life value', () => {
        const particle = new Particle(0, 0, 0, 0);
        expect(particle.life).toBe(1.0);
    });

    test('should update position', () => {
        const particle = new Particle(0, 0, 5, 5);
        particle.update();
        expect(particle.x).toBe(5);
        expect(particle.y).toBeGreaterThan(5); // Including gravity
    });

    test('should apply gravity', () => {
        const particle = new Particle(0, 0, 0, 0);
        const initialVY = particle.vy;
        particle.update();
        expect(particle.vy).toBeGreaterThan(initialVY);
    });

    test('should apply friction', () => {
        const particle = new Particle(0, 0, 10, 0);
        particle.update();
        expect(particle.vx).toBeLessThan(10);
    });

    test('should decay life', () => {
        const particle = new Particle(0, 0, 0, 0);
        particle.update();
        expect(particle.life).toBeLessThan(1.0);
    });

    test('should be dead when life reaches 0', () => {
        const particle = new Particle(0, 0, 0, 0);
        particle.life = 0;
        expect(particle.isDead()).toBe(true);
    });
});

describe('Shockwave Class', () => {
    test('should initialize with position and radius', () => {
        const shockwave = new Shockwave(100, 100, 80);
        expect(shockwave.x).toBe(100);
        expect(shockwave.y).toBe(100);
        expect(shockwave.maxRadius).toBe(80);
    });

    test('should expand radius on update', () => {
        const shockwave = new Shockwave(100, 100, 80);
        const initialRadius = shockwave.radius;
        shockwave.update();
        expect(shockwave.radius).toBeGreaterThan(initialRadius);
    });

    test('should decay life', () => {
        const shockwave = new Shockwave(100, 100, 80);
        shockwave.update();
        expect(shockwave.life).toBeLessThan(1.0);
    });

    test('should be dead when reaching max radius', () => {
        const shockwave = new Shockwave(100, 100, 80);
        shockwave.radius = 85;
        expect(shockwave.isDead()).toBe(true);
    });

    test('should be dead when life reaches 0', () => {
        const shockwave = new Shockwave(100, 100, 80);
        shockwave.life = 0;
        expect(shockwave.isDead()).toBe(true);
    });
});

describe('MotionTrail Class', () => {
    test('should initialize with position and color', () => {
        const trail = new MotionTrail(50, 60, 20, 80, '#ff0000');
        expect(trail.x).toBe(50);
        expect(trail.y).toBe(60);
        expect(trail.color).toBe('#ff0000');
    });

    test('should decay alpha', () => {
        const trail = new MotionTrail(50, 60, 20, 80, '#ff0000');
        const initialAlpha = trail.alpha;
        trail.update();
        expect(trail.alpha).toBeLessThan(initialAlpha);
    });

    test('should be dead when alpha reaches 0', () => {
        const trail = new MotionTrail(50, 60, 20, 80, '#ff0000');
        trail.alpha = 0;
        expect(trail.isDead()).toBe(true);
    });
});
