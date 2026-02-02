/**
 * Game Constants
 * Central location for all game configuration values
 */

export const GAME_CONFIG = {
  // Canvas dimensions
  WIDTH: 800,
  HEIGHT: 500,

  // Physics
  GRAVITY: 0.6,
  FRICTION: 0.85,

  // Frame rate
  TARGET_FPS: 60,

  // Timer
  TIME_LIMIT: 99,
};

export const GROUND_CONFIG = {
  OFFSET: 50,
  get Y() {
    return GAME_CONFIG.HEIGHT - this.OFFSET;
  },
};

export const PLAYER_CONFIG = {
  // Dimensions
  WIDTH: 20,
  HEIGHT: 80,

  // Movement
  SPEED: 5,
  JUMP_POWER: 15,

  // Health
  MAX_HEALTH: 100,
  INITIAL_HEALTH: 100,

  // Combat
  PUNCH_DAMAGE: 8,
  KICK_DAMAGE: 12,
  PUNCH_COOLDOWN: 20,
  KICK_COOLDOWN: 30,
  HIT_STUN_DURATION: 15,
  HIT_FLASH_DURATION: 10,

  // Animation
  ANIMATION_SPEED: 0.15,
};

export const STONE_CONFIG = {
  // Capacity
  MAX_STONES: 3,
  INITIAL_COUNT: 3,

  // Physics
  SIZE: 8,
  VELOCITY_X: 12,
  VELOCITY_Y: -3,
  GRAVITY: 0.4,
  ROTATION_SPEED: 0.3,

  // Combat
  DAMAGE: 10,
  COOLDOWN: 40,

  // Knockdown
  KNOCKDOWN_DURATION: 60, // 1 second at 60fps
  KNOCKDOWN_VELOCITY_Y: -8,
  KNOCKDOWN_VELOCITY_X: 5,
  GET_UP_DURATION: 20,
};

export const DASH_CONFIG = {
  SPEED: 15,
  DURATION: 10,
  COOLDOWN: 60, // 1 second at 60fps
};

export const CRITICAL_HIT_CONFIG = {
  CHANCE: 0.15, // 15%
  DAMAGE_MULTIPLIER: 1.5,
  SHAKE_AMOUNT: 15,
  SHOCKWAVE_RADIUS: 80,
};

export const COMBO_CONFIG = {
  SLOW_MOTION_THRESHOLD: 3,
  SLOW_MOTION_SPEED: 0.5,
  SLOW_MOTION_DURATION: 20,
  NOTIFICATION_THRESHOLD: 5,
};

export const POWER_UP_CONFIG = {
  // Spawn
  SPAWN_INTERVAL: 600, // 10 seconds at 60fps
  MAX_ON_SCREEN: 2,

  // Types
  TYPES: ["health", "stones", "speed"],

  // Effects
  HEALTH_AMOUNT: 30,
  SPEED_BOOST: 1,
  JUMP_BOOST: 2,
  SPEED_DURATION: 8000, // 8 seconds

  // Visual
  SIZE: 30,
};

export const VISUAL_CONFIG = {
  // Camera shake
  KICK_SHAKE: 10,
  PUNCH_SHAKE: 5,
  CRIT_SHAKE: 15,
  STONE_SHAKE: 12,
  SHAKE_DECAY: 0.9,

  // Shockwave
  KICK_SHOCKWAVE: 60,
  CRIT_SHOCKWAVE: 80,
  STONE_SHOCKWAVE: 70,

  // Particles
  HIT_PARTICLE_COUNT: 15,
  SPARK_COUNT: 8,
};

export const AI_CONFIG = {
  // Difficulty presets
  EASY: {
    reactionTime: 30,
    accuracy: 0.4,
    aggression: 0.3,
    defenseSkill: 0.2,
    comboLength: 2,
  },
  MEDIUM: {
    reactionTime: 20,
    accuracy: 0.6,
    aggression: 0.5,
    defenseSkill: 0.4,
    comboLength: 3,
  },
  HARD: {
    reactionTime: 10,
    accuracy: 0.8,
    aggression: 0.7,
    defenseSkill: 0.6,
    comboLength: 4,
  },
  EXPERT: {
    reactionTime: 5,
    accuracy: 0.95,
    aggression: 0.85,
    defenseSkill: 0.8,
    comboLength: 5,
  },
};

export const UPGRADE_CONFIG = {
  // Attack power
  ATTACK_POWER_BOOST: 2, // +2 damage per level

  // Defense
  DEFENSE_REDUCTION: 0.1, // 10% per level

  // Speed
  SPEED_BOOST: 0.5, // +0.5 speed per level

  // Health
  MAX_HEALTH_BOOST: 20, // +20 max HP per level
};

export const CAMPAIGN_CONFIG = {
  // Currency
  STAGE_REWARD: 100,
  PERFECT_BONUS: 50,
  SPEED_BONUS: 25,

  // Upgrade costs
  UPGRADE_BASE_COST: 50,
  UPGRADE_COST_MULTIPLIER: 1.5,
};

// Export all constants as a single object for convenience
export default {
  GAME_CONFIG,
  GROUND_CONFIG,
  PLAYER_CONFIG,
  STONE_CONFIG,
  DASH_CONFIG,
  CRITICAL_HIT_CONFIG,
  COMBO_CONFIG,
  POWER_UP_CONFIG,
  VISUAL_CONFIG,
  AI_CONFIG,
  UPGRADE_CONFIG,
  CAMPAIGN_CONFIG,
};
