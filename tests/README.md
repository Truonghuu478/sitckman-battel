# Test Documentation

## Running Tests

### Install Dependencies
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

## Test Coverage

The test suite covers the following modules:

### 1. Player.test.js
- ✅ Player initialization
- ✅ Movement (left, right, jump, crouch)
- ✅ Combat (punch, kick, damage, hitbox collision)
- ✅ Physics (gravity, friction, ground collision)
- ✅ Upgrades (attack power, speed, defense, max health)
- ✅ Animation states

### 2. AIController.test.js
- ✅ AI initialization with different difficulties
- ✅ Decision making (approach, attack, dodge, retreat)
- ✅ Action execution
- ✅ Difficulty levels (easy, medium, hard, boss)
- ✅ Combat behavior
- ✅ Reset functionality

### 3. CampaignManager.test.js
- ✅ Campaign initialization
- ✅ Stage management (progression, selection)
- ✅ Upgrade system (purchase, cost calculation)
- ✅ Player stats (coins, victories, progression)
- ✅ Save/Load functionality
- ✅ Damage calculations
- ✅ Game completion detection

### 4. ParticleSystem.test.js
- ✅ Particle system initialization
- ✅ Particle creation (hit effects, dust, sparks)
- ✅ Particle lifecycle (update, death)
- ✅ Shockwave effects
- ✅ Motion trails
- ✅ Physics (gravity, friction)

### 5. InputHandler.test.js
- ✅ Input initialization
- ✅ Key tracking
- ✅ Player 1 controls (WASD + FG)
- ✅ Player 2 controls (Arrows + 12)
- ✅ Input handling for movement and attacks
- ✅ Reset functionality

## Test Structure

```
tests/
├── setup.js                    # Test environment setup
├── Player.test.js             # Player class tests
├── AIController.test.js       # AI behavior tests
├── CampaignManager.test.js    # Campaign logic tests
├── ParticleSystem.test.js     # Visual effects tests
└── InputHandler.test.js       # Input system tests
```

## Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

## Mocked APIs

The test environment mocks the following:
- Canvas 2D context
- localStorage
- requestAnimationFrame
- DOM elements
- Date.now()

## Writing New Tests

Example test structure:
```javascript
describe('Feature Name', () => {
    let instance;
    
    beforeEach(() => {
        instance = new Class();
    });
    
    test('should do something', () => {
        // Arrange
        const input = 'test';
        
        // Act
        const result = instance.method(input);
        
        // Assert
        expect(result).toBe('expected');
    });
});
```

## CI/CD Integration

Tests can be integrated into GitHub Actions:
```yaml
- name: Run Tests
  run: npm test
  
- name: Upload Coverage
  run: npm run test:coverage
```
