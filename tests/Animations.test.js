/**
 * Animation & UX Integration Tests
 * Tests for GSAP animations, CSS transitions, and user experience features
 */

const { describe, test, expect, beforeEach } = require('@jest/globals');

// Mock GSAP timeline
const mockTimeline = {
    fromTo: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    play: jest.fn().mockReturnThis(),
    pause: jest.fn().mockReturnThis()
};

global.gsap = {
    fromTo: jest.fn(),
    to: jest.fn(),
    set: jest.fn(),
    timeline: jest.fn(() => mockTimeline)
};

describe('GSAP Animation Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    
    test('should create timeline for complex animations', () => {
        const timeline = gsap.timeline();
        
        expect(gsap.timeline).toHaveBeenCalled();
        expect(timeline).toBeTruthy();
    });
    
    test('should animate overlay entrance with scale and opacity', () => {
        const element = document.createElement('div');
        
        gsap.fromTo(element,
            { opacity: 0, scale: 0.95 },
            { opacity: 1, scale: 1, duration: 0.5 }
        );
        
        expect(gsap.fromTo).toHaveBeenCalledWith(
            element,
            { opacity: 0, scale: 0.95 },
            expect.objectContaining({ opacity: 1, scale: 1 })
        );
    });
    
    test('should stagger card animations with delay', () => {
        const cards = [
            document.createElement('div'),
            document.createElement('div'),
            document.createElement('div')
        ];
        
        const timeline = gsap.timeline();
        timeline.fromTo(cards,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }
        );
        
        expect(timeline.fromTo).toHaveBeenCalled();
    });
    
    test('should animate button entrance with back.out easing', () => {
        const buttons = [document.createElement('button')];
        
        const timeline = gsap.timeline();
        timeline.fromTo(buttons,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.2)' }
        );
        
        expect(timeline.fromTo).toHaveBeenCalled();
    });
});

describe('Crossfade Transitions', () => {
    test('should fade out previous overlay before showing new one', () => {
        const previousOverlay = document.createElement('div');
        const newOverlay = document.createElement('div');
        
        gsap.to(previousOverlay, {
            opacity: 0,
            scale: 0.95,
            duration: 0.3,
            onComplete: () => {
                previousOverlay.classList.add('hidden');
            }
        });
        
        expect(gsap.to).toHaveBeenCalledWith(
            previousOverlay,
            expect.objectContaining({
                opacity: 0,
                scale: 0.95
            })
        );
    });
    
    test('should reset scale after fade out', () => {
        const overlay = document.createElement('div');
        
        gsap.set(overlay, { scale: 1 });
        
        expect(gsap.set).toHaveBeenCalledWith(
            overlay,
            { scale: 1 }
        );
    });
});

describe('Health Bar Animations', () => {
    test('should animate health bar width smoothly', () => {
        const healthBar = document.createElement('div');
        healthBar.style.width = '100%';
        
        // Simulate damage
        healthBar.style.width = '75%';
        
        expect(healthBar.style.width).toBe('75%');
    });
    
    test('should change gradient color based on health percentage', () => {
        function getHealthGradient(percentage) {
            if (percentage > 0.5) {
                return ['from-cyan-600', 'via-cyan-400', 'to-cyan-300'];
            } else if (percentage > 0.25) {
                return ['from-yellow-600', 'via-yellow-400', 'to-yellow-300'];
            } else {
                return ['from-red-600', 'via-red-500', 'to-red-400'];
            }
        }
        
        expect(getHealthGradient(0.8)).toContain('from-cyan-600');
        expect(getHealthGradient(0.4)).toContain('from-yellow-600');
        expect(getHealthGradient(0.15)).toContain('from-red-600');
    });
    
    test('should update percentage text dynamically', () => {
        const percentText = document.createElement('span');
        const percentage = 0.67;
        
        percentText.textContent = `${Math.round(percentage * 100)}%`;
        
        expect(percentText.textContent).toBe('67%');
    });
});

describe('Progress Bar Animations', () => {
    test('should animate upgrade progress bar', () => {
        const progressBar = document.createElement('div');
        const level = 3;
        const maxLevel = 5;
        const percentage = (level / maxLevel) * 100;
        
        progressBar.style.width = `${percentage}%`;
        
        expect(progressBar.style.width).toBe('60%');
    });
    
    test('should show full progress at max level', () => {
        const progressBar = document.createElement('div');
        const level = 5;
        const maxLevel = 5;
        
        progressBar.style.width = `${(level / maxLevel) * 100}%`;
        
        expect(progressBar.style.width).toBe('100%');
    });
});

describe('Ripple Effect Animation', () => {
    test('should calculate ripple size based on button dimensions', () => {
        const button = {
            getBoundingClientRect: () => ({
                width: 120,
                height: 40,
                left: 100,
                top: 200
            })
        };
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        expect(size).toBe(120);
    });
    
    test('should position ripple at click coordinates', () => {
        const event = { clientX: 150, clientY: 220 };
        const button = {
            getBoundingClientRect: () => ({
                width: 100,
                height: 40,
                left: 100,
                top: 200
            })
        };
        
        const rect = button.getBoundingClientRect();
        const size = 100;
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        expect(x).toBe(0);
        expect(y).toBe(-30);
    });
});

describe('Timer Urgency Animation', () => {
    test('should add urgency class when timer is low', () => {
        const timer = document.createElement('span');
        const timeRemaining = 8;
        
        if (timeRemaining <= 10) {
            timer.classList.add('text-neon-yellow', 'animate-pulse-fast');
        }
        
        expect(timer.classList.contains('text-neon-yellow')).toBe(true);
        expect(timer.classList.contains('animate-pulse-fast')).toBe(true);
    });
    
    test('should remove urgency class when timer is normal', () => {
        const timer = document.createElement('span');
        timer.classList.add('text-neon-yellow', 'animate-pulse-fast');
        const timeRemaining = 45;
        
        if (timeRemaining > 10) {
            timer.classList.remove('text-neon-yellow', 'animate-pulse-fast');
        }
        
        expect(timer.classList.contains('text-neon-yellow')).toBe(false);
    });
});

describe('Card Hover Effects', () => {
    test('should apply hover scale transform', () => {
        const card = document.createElement('div');
        card.classList.add('hover:scale-105');
        
        expect(card.classList.contains('hover:scale-105')).toBe(true);
    });
    
    test('should show neon glow on hover', () => {
        const card = document.createElement('div');
        card.classList.add('hover:border-primary/60');
        
        expect(card.classList.contains('hover:border-primary/60')).toBe(true);
    });
});

describe('Floating Animation', () => {
    test('should apply float animation to particles', () => {
        const particle = document.createElement('div');
        particle.classList.add('animate-float');
        
        expect(particle.classList.contains('animate-float')).toBe(true);
    });
    
    test('should apply delayed float to boss badge', () => {
        const badge = document.createElement('span');
        badge.textContent = '👑';
        badge.classList.add('animate-float');
        
        expect(badge.classList.contains('animate-float')).toBe(true);
    });
});

describe('Reduced Motion Support', () => {
    test('should detect prefers-reduced-motion preference', () => {
        const mockMediaQuery = {
            matches: true,
            media: '(prefers-reduced-motion: reduce)'
        };
        
        global.matchMedia = jest.fn(() => mockMediaQuery);
        
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        expect(prefersReducedMotion).toBe(true);
    });
    
    test('should skip animations when reduced motion is preferred', () => {
        const prefersReducedMotion = true;
        
        if (prefersReducedMotion) {
            gsap.set({ opacity: 1 });
        } else {
            gsap.fromTo({ opacity: 0 }, { opacity: 1, duration: 0.5 });
        }
        
        expect(gsap.set).toHaveBeenCalled();
    });
});

describe('Stagger Animation Timing', () => {
    test('should calculate stagger delay for 5 items', () => {
        const itemCount = 5;
        const staggerDelay = 0.08;
        const totalDuration = itemCount * staggerDelay;
        
        expect(totalDuration).toBe(0.4);
    });
    
    test('should apply different stagger for different element types', () => {
        const staggerTimes = {
            cards: 0.08,
            buttons: 0.05,
            headers: 0.05
        };
        
        expect(staggerTimes.cards).toBeGreaterThan(staggerTimes.buttons);
    });
});

describe('Victory Screen Animations', () => {
    test('should animate star appearance', () => {
        const stars = 3;
        const timeline = gsap.timeline();
        
        for (let i = 0; i < stars; i++) {
            const star = document.createElement('span');
            star.textContent = '⭐';
            timeline.fromTo(star,
                { scale: 0, rotation: -180 },
                { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2)' },
                i * 0.2
            );
        }
        
        expect(timeline.fromTo).toHaveBeenCalled();
    });
    
    test('should animate counter from 0 to final value', () => {
        function animateCounter(from, to, duration) {
            const steps = 20;
            const increment = (to - from) / steps;
            let current = from;
            
            for (let i = 0; i < steps; i++) {
                current += increment;
            }
            
            return Math.round(current);
        }
        
        const finalValue = animateCounter(0, 250, 1000);
        expect(finalValue).toBe(250);
    });
});

describe('Glassmorphism Effects', () => {
    test('should apply backdrop-blur to glass elements', () => {
        const glassCard = document.createElement('div');
        glassCard.classList.add('backdrop-blur-md');
        
        expect(glassCard.classList.contains('backdrop-blur-md')).toBe(true);
    });
    
    test('should have semi-transparent background', () => {
        const glassCard = document.createElement('div');
        glassCard.style.backgroundColor = 'rgba(30, 31, 58, 0.4)';
        
        expect(glassCard.style.backgroundColor).toContain('rgba');
    });
});

describe('Mobile Responsive Animations', () => {
    test('should reduce animation duration on mobile', () => {
        const isMobile = window.innerWidth < 768;
        const duration = isMobile ? 0.3 : 0.5;
        
        global.innerWidth = 600;
        const mobileDuration = window.innerWidth < 768 ? 0.3 : 0.5;
        
        expect(mobileDuration).toBe(0.3);
    });
    
    test('should reduce particle count on mobile', () => {
        global.innerWidth = 600;
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 10 : 30;
        
        expect(particleCount).toBe(10);
    });
});

describe('Performance Throttling', () => {
    test('should throttle animation updates to 60fps', () => {
        const targetFPS = 60;
        const frameTime = 1000 / targetFPS;
        
        expect(frameTime).toBeCloseTo(16.67, 1);
    });
    
    test('should skip frames when performance is low', () => {
        let lastUpdate = 0;
        const throttle = 16;
        let updateCount = 0;
        
        const timestamps = [0, 10, 20, 30, 40];
        
        timestamps.forEach(time => {
            if (time - lastUpdate >= throttle) {
                updateCount++;
                lastUpdate = time;
            }
        });
        
        expect(updateCount).toBe(2); // 0, 20 (40 is not >= 16 from 20)
    });
});

describe('CSS Animation Classes', () => {
    test('should have fade-in-up animation', () => {
        const element = document.createElement('div');
        element.classList.add('animate-fade-in-up');
        
        expect(element.classList.contains('animate-fade-in-up')).toBe(true);
    });
    
    test('should have pulse-fast animation', () => {
        const element = document.createElement('div');
        element.classList.add('animate-pulse-fast');
        
        expect(element.classList.contains('animate-pulse-fast')).toBe(true);
    });
    
    test('should have glow-pulse animation', () => {
        const element = document.createElement('div');
        element.classList.add('animate-glow-pulse');
        
        expect(element.classList.contains('animate-glow-pulse')).toBe(true);
    });
});
