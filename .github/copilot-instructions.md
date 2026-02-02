# GitHub Copilot Instructions for Stickman Battle Arena

## Project Summary

A 2D stickman fighting game with combat mechanics, projectiles, power-ups, and AI. Built with vanilla JS, HTML5 Canvas.

## Key Technologies

- JavaScript ES6+
- HTML5 Canvas API
- Jest for testing
- No frameworks/libraries

## Code Style

### Prefer

```javascript
// ES6 classes
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

// Arrow functions for callbacks
setTimeout(() => this.update(), 16);

// Template literals
console.log(`Player at (${x}, ${y})`);

// Destructuring
const { x, y, width, height } = this.hitbox;

// Const/let, never var
const MAX_HEALTH = 100;
let health = MAX_HEALTH;
```

### Avoid

```javascript
// Don't use var
var x = 10; // ❌

// Don't use function constructors
var Player = function () {}; // ❌

// Don't concatenate strings
"Player at (" + x + ", " + y + ")"; // ❌
```

## Common Patterns

### Adding a new feature

```javascript
// 1. Add constants
export const FEATURE_CONFIG = {
    VALUE: 10,
    COOLDOWN: 60,
};

// 2. Add state to Player/Game
this.featureActive = false;
this.featureCooldown = 0;

// 3. Add method
activateFeature() {
    if (this.featureCooldown <= 0 && !this.featureActive) {
        this.featureActive = true;
        this.featureCooldown = FEATURE_CONFIG.COOLDOWN;
    }
}

// 4. Update in game loop
if (this.featureCooldown > 0) this.featureCooldown--;

// 5. Write test
test('feature activates correctly', () => {
    player.activateFeature();
    expect(player.featureActive).toBe(true);
});
```

### Collision detection

```javascript
checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}
```

### State checks before actions

```javascript
canPerformAction() {
    return !this.isAttacking &&
           !this.isKnockedDown &&
           this.hitStun <= 0 &&
           this.cooldown <= 0;
}

performAction() {
    if (!this.canPerformAction()) return;
    // ... action logic
}
```

## File Structure Hints

### When creating entities

```javascript
// js/entities/EntityName.js
import { ENTITY_CONFIG } from "../constants/GameConstants.js";

export class EntityName {
  constructor() {
    // Use constants
    this.property = ENTITY_CONFIG.VALUE;
  }
}
```

### When creating systems

```javascript
// js/systems/SystemName.js
export class SystemName {
  update(entities, deltaTime) {
    entities.forEach((entity) => {
      // System logic
    });
  }
}
```

### When creating components

```javascript
// js/components/ComponentName.js
export class ComponentName {
  constructor(initialValue) {
    this.value = initialValue;
  }

  update(deltaTime) {
    // Component logic
  }
}
```

## Testing Patterns

### Unit test structure

```javascript
describe("FeatureName", () => {
  let instance;

  beforeEach(() => {
    instance = new FeatureName();
  });

  test("should do something", () => {
    // Arrange
    const expected = 10;

    // Act
    const result = instance.doSomething();

    // Assert
    expect(result).toBe(expected);
  });
});
```

## Canvas Drawing Patterns

### Drawing with state management

```javascript
drawEntity(ctx, entity) {
    ctx.save();

    // Apply transforms
    ctx.translate(entity.x, entity.y);
    ctx.rotate(entity.rotation);

    // Draw
    ctx.fillStyle = entity.color;
    ctx.fillRect(-entity.width/2, -entity.height/2, entity.width, entity.height);

    ctx.restore();
}
```

## Performance Tips

### Use object pooling

```javascript
// Instead of: new Particle() every frame
// Use: this.particlePool.acquire()
```

### Cache calculations

```javascript
// Instead of: Math.sqrt(x*x + y*y) multiple times
// Use: const distance = Math.sqrt(x*x + y*y); (once)
```

### Batch canvas operations

```javascript
// Instead of: setting fillStyle for each particle
// Group by color and draw in batches
```

## Common Mistakes to Avoid

### Don't modify arrays while iterating

```javascript
// ❌ Wrong
for (let i = 0; i < array.length; i++) {
  if (condition) array.splice(i, 1);
}

// ✅ Correct
for (let i = array.length - 1; i >= 0; i--) {
  if (condition) array.splice(i, 1);
}
```

### Don't forget to update cooldowns

```javascript
// ✅ Always in update()
if (this.cooldown > 0) this.cooldown--;
```

### Don't create objects in game loop

```javascript
// ❌ Creates garbage
update() {
    const tempObj = { x: 0, y: 0 }; // Every frame!
}

// ✅ Reuse objects
constructor() {
    this.tempObj = { x: 0, y: 0 };
}
update() {
    this.tempObj.x = 0;
    this.tempObj.y = 0;
}
```

## Quick Reference

### Player States

- `isGrounded` - on ground
- `isJumping` - in air from jump
- `isAttacking` - performing attack
- `isDashing` - dashing
- `isKnockedDown` - knocked down
- `isCrouching` - crouching

### Common Methods

- `update(groundY, opponent)` - main update loop
- `draw(ctx)` - render entity
- `checkHit(opponent)` - collision check
- `takeDamage(amount)` - receive damage
- `onHit(opponent)` - deal damage

### Input Keys

- Player 1: WASD + F/G + R + Shift
- Player 2: Arrows + 1/2 + 3 + Enter

## Documentation Format

```javascript
/**
 * Brief one-line description
 *
 * @param {Type} name - Description
 * @returns {Type} Description
 */
```

## When in doubt

- Check existing similar code
- Follow established patterns
- Keep it simple
- Write tests
- Ask for clarification

---

**Context**: This is a fun stickman fighting game. Focus on gameplay feel, smooth animations, and responsive controls!
