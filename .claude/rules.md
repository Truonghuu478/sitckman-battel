# Claude AI Agent Rules for Stickman Battle Arena

## Project Context

This is a 2D stickman fighting game built with vanilla JavaScript, HTML5 Canvas, and CSS. The game features combat mechanics, projectiles, power-ups, AI opponents, and a campaign mode.

## Architecture Overview

### Directory Structure

```
js/
├── constants/       # Game configuration and constants
├── core/           # Core game engine (Game loop, State management)
├── entities/       # Game entities (Player, Projectiles, PowerUps)
├── systems/        # Game systems (Physics, Collision, Rendering)
├── components/     # Reusable components (Health, Position, Velocity)
├── managers/       # High-level managers (Campaign, UI, Input)
└── utils/          # Utility functions (Math helpers, Validators)
```

## Code Style Guidelines

### 1. **File Organization**

- One class per file
- File name matches class name (e.g., `Player.js` for `Player` class)
- Use ES6 modules (export/import)
- Keep files under 300 lines when possible

### 2. **Naming Conventions**

- Classes: PascalCase (`Player`, `GameManager`)
- Functions/Methods: camelCase (`updatePosition`, `checkCollision`)
- Constants: UPPER_SNAKE_CASE (`MAX_HEALTH`, `JUMP_POWER`)
- Private methods: prefix with `_` (`_calculateDamage`)
- Boolean variables: use `is`, `has`, `can` prefix (`isGrounded`, `hasStone`, `canDash`)

### 3. **Code Documentation**

```javascript
/**
 * Brief description of the function/class
 *
 * @param {Type} paramName - Parameter description
 * @returns {Type} Return value description
 *
 * @example
 * const result = functionName(arg1, arg2);
 */
```

### 4. **Error Handling**

- Validate inputs at function entry
- Use descriptive error messages
- Fail gracefully with fallbacks
- Log errors for debugging

### 5. **Performance Best Practices**

- Avoid creating objects in game loop
- Use object pooling for projectiles/particles
- Cache DOM queries
- Minimize Canvas API calls
- Use `requestAnimationFrame` for rendering

### 6. **Testing Requirements**

- Write unit tests for all new features
- Test edge cases and boundaries
- Maintain >80% code coverage for logic
- Use Jest testing framework

## Specific Guidelines

### When Working with Player Class

- Movement logic should be in separate methods
- Combat logic should be modular
- State management should be clear (attacking, dashing, knocked down)
- Always check state before allowing actions

### When Working with Game Class

- Keep game loop clean and readable
- Separate update and render logic
- Use delta time for frame-independent physics
- Handle pause/resume properly

### When Adding New Features

1. Define constants in `GameConstants.js`
2. Create component/system if reusable
3. Write tests BEFORE implementation (TDD)
4. Update documentation
5. Test integration with existing features
6. Verify performance impact

### When Refactoring

- Don't break existing tests
- Maintain backward compatibility when possible
- Extract magic numbers to constants
- Simplify complex conditionals
- Reduce code duplication

## Common Patterns

### Component Pattern

```javascript
class HealthComponent {
  constructor(maxHealth) {
    this.current = maxHealth;
    this.max = maxHealth;
  }

  takeDamage(amount) {
    this.current = Math.max(0, this.current - amount);
    return this.current <= 0;
  }

  heal(amount) {
    this.current = Math.min(this.max, this.current + amount);
  }
}
```

### State Machine Pattern

```javascript
class StateMachine {
  constructor(initialState) {
    this.currentState = initialState;
    this.states = {};
  }

  addState(name, state) {
    this.states[name] = state;
  }

  transition(newState) {
    if (this.states[newState]) {
      this.currentState = newState;
      return true;
    }
    return false;
  }
}
```

### Object Pool Pattern

```javascript
class ObjectPool {
  constructor(createFn, resetFn, initialSize = 10) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.available = [];
    this.inUse = [];

    for (let i = 0; i < initialSize; i++) {
      this.available.push(this.createFn());
    }
  }

  acquire() {
    if (this.available.length === 0) {
      this.available.push(this.createFn());
    }
    const obj = this.available.pop();
    this.inUse.push(obj);
    return obj;
  }

  release(obj) {
    const index = this.inUse.indexOf(obj);
    if (index !== -1) {
      this.inUse.splice(index, 1);
      this.resetFn(obj);
      this.available.push(obj);
    }
  }
}
```

## Security Considerations

- Validate all user inputs
- Sanitize data before display
- Don't expose sensitive logic to client
- Use Content Security Policy
- Avoid eval() and Function() constructors

## Accessibility

- Keyboard navigation support
- Screen reader compatibility
- Color contrast compliance
- Resize handling
- Alternative text for visual elements

## Browser Compatibility

- Target: Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ features are okay
- Test on different screen sizes
- Handle requestAnimationFrame fallback
- Graceful degradation for older browsers

## Git Commit Messages

Format: `type(scope): description`

Types:

- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `test`: Adding tests
- `docs`: Documentation
- `style`: Code style changes
- `perf`: Performance improvements

Example: `feat(player): add dash ability with cooldown`

## When Asked to Add Features

1. Clarify requirements
2. Check for conflicts with existing features
3. Propose architecture changes if needed
4. Estimate complexity
5. Suggest testing strategy
6. Consider performance impact
7. Plan rollback strategy

## When Debugging

1. Reproduce the issue
2. Check console for errors
3. Verify state is correct
4. Test edge cases
5. Check recent changes
6. Use debugger breakpoints
7. Write test to prevent regression

## Questions to Ask

- "What is the expected behavior?"
- "Are there any edge cases to consider?"
- "How does this interact with existing features?"
- "What's the performance requirement?"
- "Should this be configurable?"
- "Do we need backward compatibility?"

## Priorities

1. **Correctness**: Code must work as intended
2. **Performance**: Maintain 60 FPS
3. **Maintainability**: Code should be easy to understand
4. **Testability**: Code should be easy to test
5. **Extensibility**: Easy to add features

## Anti-Patterns to Avoid

- ❌ Global variables
- ❌ Magic numbers
- ❌ Long functions (>50 lines)
- ❌ Deep nesting (>3 levels)
- ❌ Premature optimization
- ❌ Code duplication
- ❌ Tight coupling
- ❌ God objects

## Best Practices to Follow

- ✅ Single Responsibility Principle
- ✅ DRY (Don't Repeat Yourself)
- ✅ KISS (Keep It Simple, Stupid)
- ✅ YAGNI (You Aren't Gonna Need It)
- ✅ Composition over Inheritance
- ✅ Dependency Injection
- ✅ Interface Segregation

## Resources

- MDN Web Docs for Canvas API
- Jest documentation for testing
- ESLint for code quality
- Chrome DevTools for debugging
- Lighthouse for performance

## Current Feature Set

- Player movement (WASD/Arrows)
- Combat (Punch/Kick)
- Stone throwing projectiles
- Knockdown mechanics
- Dash ability
- Critical hits
- Combo system with slow-motion
- Power-ups (Health, Stones, Speed)
- AI opponents (4 difficulty levels)
- Campaign mode with upgrades
- Particle effects
- Screen shake
- HUD/UI system

## Roadmap (Future Features)

- Special moves
- Character customization
- More power-up types
- Environmental hazards
- Weather effects
- Multiplayer online
- Replay system
- Achievement system
- Tournament mode
- Stage variations

---

**Remember**: Always prioritize game feel and player experience. Code should be clean, but gameplay should be fun!
