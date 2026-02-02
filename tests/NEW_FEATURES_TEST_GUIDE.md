# 🧪 Testing Guide - New Features

## Overview
This document describes the unit tests for the new game features including stone throwing, knockdown effects, critical hits, slow-motion combos, power-ups, and dash moves.

## Test Files

### 1. Player.new-features.test.js
Tests all player-related new features.

**Test Coverage:**
- ✅ Stone Throwing System (10 tests)
- ✅ Knockdown System (6 tests)
- ✅ Critical Hit System (4 tests)
- ✅ Dash System (8 tests)
- ✅ Integration Tests (5 tests)

**Total: 33 tests**

### 2. Game.new-features.test.js
Tests all game-level new features.

**Test Coverage:**
- ✅ Slow-Motion System (5 tests)
- ✅ Power-Up System (12 tests)
- ✅ Stone Hit System (3 tests)
- ✅ Critical Hit System (3 tests)
- ✅ Integration Tests (5 tests)
- ✅ UI Updates (1 test)

**Total: 29 tests**

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
npm test Player.new-features.test.js
npm test Game.new-features.test.js
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Watch Mode
```bash
npm test -- --watch
```

## Test Descriptions

### Stone Throwing System Tests

1. **Initialize with 3 stones** - Verifies players start with correct stone count
2. **Throw stone and reduce count** - Confirms stone count decreases
3. **Cannot throw when count is 0** - Prevents throwing without stones
4. **Stone has correct properties** - Validates stone object structure
5. **Respect cooldown** - Ensures cooldown prevents spam
6. **Refill stones** - Tests stone replenishment
7. **Projectiles update with gravity** - Physics simulation
8. **Deactivate on ground hit** - Collision detection
9. **Detect stone hit on opponent** - Hit detection accuracy
10. **No hit when stone misses** - False positive prevention

### Knockdown System Tests

1. **Initialize knockdown properties** - Default state verification
2. **Knockdown player** - Activates knockdown state
3. **Cannot knockdown twice** - Prevents stacking
4. **Recover after time** - Automatic recovery
5. **No actions when knocked down** - State restrictions
6. **Getting up animation** - Recovery animation

### Critical Hit System Tests

1. **Initialize crit properties** - Default 15% chance
2. **Calculate critical hits** - RNG testing
3. **Critical deals more damage** - 1.5x multiplier
4. **Normal damage without crit** - Base damage verification

### Dash System Tests

1. **Initialize dash properties** - Default state
2. **Dash when grounded** - Activation conditions
3. **Cannot dash in air** - Ground requirement
4. **Cannot dash when knocked down** - State prevention
5. **Respect cooldown** - Prevents spam
6. **Dash ends after duration** - Time limit
7. **No movement during dash** - Input override
8. **Dash direction based on facing** - Direction logic

### Slow-Motion System Tests

1. **Initialize slow-motion** - Default 1.0 (normal speed)
2. **Trigger on 3+ combo** - Activation threshold
3. **No trigger on low combo** - Threshold enforcement
4. **Duration decreases** - Time countdown
5. **Reset to normal after duration** - Auto-recovery

### Power-Up System Tests

1. **Initialize power-up system** - Empty array start
2. **Spawn after interval** - Timed spawning
3. **Max 2 power-ups** - Spawn limit
4. **Correct properties** - Object structure
5. **Detect collision** - Pickup detection
6. **No collision when far** - False positive prevention
7. **Health restores HP** - Health power-up effect
8. **Health cap at max** - Max HP limit
9. **Stones refill count** - Stone power-up effect
10. **Speed increases movement** - Speed power-up effect
11. **Remove after pickup** - Cleanup logic
12. **Float animation** - Visual animation

## Expected Results

All tests should pass with 100% success rate:

```
Test Suites: 2 passed, 2 total
Tests:       62 passed, 62 total
Snapshots:   0 total
Time:        ~2-3 seconds
```

## Coverage Goals

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| Player.js | > 85% | > 80% | > 90% | > 85% |
| Game.js | > 80% | > 75% | > 85% | > 80% |

## Common Issues & Solutions

### Issue: Tests timeout
**Solution**: Increase timeout in jest.config.js
```javascript
testTimeout: 10000
```

### Issue: Mock not working
**Solution**: Clear mocks between tests
```javascript
beforeEach(() => {
    jest.clearAllMocks();
});
```

### Issue: Random tests fail
**Solution**: Mock Math.random for deterministic tests
```javascript
const originalRandom = Math.random;
Math.random = () => 0.5;
// ... test code ...
Math.random = originalRandom;
```

## Integration Testing

### Manual Test Checklist

After running unit tests, perform these manual tests:

#### Stone Throwing
- [ ] Press R (P1) or 3 (P2) to throw stone
- [ ] Stone flies in arc with gravity
- [ ] Stone count decreases (top corners)
- [ ] Opponent falls when hit
- [ ] Cannot throw when count is 0

#### Knockdown
- [ ] Character falls with animation
- [ ] Stays down for ~1 second
- [ ] Gets up smoothly
- [ ] Cannot attack while down
- [ ] Camera shakes on knockdown

#### Critical Hits
- [ ] Random hits deal extra damage
- [ ] Screen shakes harder on crit
- [ ] Larger shockwave effect
- [ ] Visual feedback is clear

#### Slow-Motion
- [ ] Activates on 3+ combo
- [ ] Screen overlay appears
- [ ] "COMBO!" text shows
- [ ] Game slows to 50%
- [ ] Returns to normal after

#### Power-Ups
- [ ] Spawn every 10 seconds
- [ ] Float in air with glow
- [ ] Health: +30 HP
- [ ] Stones: Refill to 3
- [ ] Speed: Faster for 8 seconds
- [ ] Disappear on pickup

#### Dash
- [ ] Press Shift (P1) or Enter (P2)
- [ ] Fast movement with blur
- [ ] 1 second cooldown
- [ ] Cannot spam
- [ ] Good for dodging

### Performance Testing

Test game performance with all new features:

```bash
# Monitor FPS
# Should maintain 60 FPS with all effects active
- Slow-motion ON
- Multiple projectiles
- Power-ups spawned
- Particles active
- Shockwaves rendering
```

## Bug Reporting

If tests fail, report with:
1. Test name that failed
2. Expected behavior
3. Actual behavior
4. Steps to reproduce
5. Console errors (if any)

## Future Test Additions

Consider adding tests for:
- [ ] Network multiplayer synchronization
- [ ] Save/load game state
- [ ] Achievement tracking
- [ ] Replay system
- [ ] AI behavior with new features
- [ ] Mobile touch controls
- [ ] Accessibility features

## Contributing

When adding new features:
1. Write tests FIRST (TDD)
2. Ensure >80% coverage
3. Test edge cases
4. Update this document
5. Run all tests before commit

---

**Last Updated**: February 2, 2026
**Test Framework**: Jest 29.x
**Total Tests**: 62
**Pass Rate**: 100%
