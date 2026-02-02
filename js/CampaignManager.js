class CampaignManager {
    constructor() {
        this.currentStage = 1;
        this.maxStage = 10;
        this.playerStats = this.loadPlayerStats();
        this.stages = this.initializeStages();
    }
    
    initializeStages() {
        return [
            {
                id: 1,
                name: "Tập Luyện Cơ Bản",
                opponent: {
                    name: "Dummy",
                    color: "#888888",
                    difficulty: "easy",
                    health: 80
                },
                reward: 100,
                story: "Bạn bắt đầu hành trình của mình. Hãy chứng minh sức mạnh với Dummy!"
            },
            {
                id: 2,
                name: "Chiến Binh Làng",
                opponent: {
                    name: "Village Fighter",
                    color: "#8b4513",
                    difficulty: "easy",
                    health: 100
                },
                reward: 150,
                story: "Một chiến binh từ làng bên muốn thử sức với bạn."
            },
            {
                id: 3,
                name: "Sát Thủ Bóng Đêm",
                opponent: {
                    name: "Shadow Ninja",
                    color: "#1a1a1a",
                    difficulty: "medium",
                    health: 100
                },
                reward: 200,
                story: "Một ninja bí ẩn xuất hiện. Hắn rất nhanh và nguy hiểm!"
            },
            {
                id: 4,
                name: "Đấu Sĩ Đường Phố",
                opponent: {
                    name: "Street Brawler",
                    color: "#ff6600",
                    difficulty: "medium",
                    health: 120
                },
                reward: 250,
                story: "Tên đấu sĩ đường phố này chưa bao giờ thua. Bạn có thể phá kỷ lục?"
            },
            {
                id: 5,
                name: "BOSS: Võ Sư Lửa",
                opponent: {
                    name: "Fire Master",
                    color: "#ff0000",
                    difficulty: "hard",
                    health: 150,
                    isBoss: true
                },
                reward: 500,
                story: "Võ Sư Lửa - Bậc thầy võ thuật với sức mạnh hủy diệt. Đây là thử thách lớn đầu tiên!"
            },
            {
                id: 6,
                name: "Chiến Binh Sấm Sét",
                opponent: {
                    name: "Thunder Warrior",
                    color: "#ffff00",
                    difficulty: "hard",
                    health: 130
                },
                reward: 300,
                story: "Sau khi đánh bại Võ Sư Lửa, bạn gặp chiến binh sấm sét..."
            },
            {
                id: 7,
                name: "Hiệp Sĩ Băng",
                opponent: {
                    name: "Ice Knight",
                    color: "#00ffff",
                    difficulty: "hard",
                    health: 140
                },
                reward: 350,
                story: "Hiệp sĩ băng giá với phòng thủ cực mạnh đang chờ đợi."
            },
            {
                id: 8,
                name: "Samurai Huyền Thoại",
                opponent: {
                    name: "Legendary Samurai",
                    color: "#8b008b",
                    difficulty: "hard",
                    health: 150
                },
                reward: 400,
                story: "Samurai huyền thoại với kỹ thuật hoàn hảo. Trận chiến sẽ rất khó khăn!"
            },
            {
                id: 9,
                name: "BOSS: Quỷ Vương Bóng Tối",
                opponent: {
                    name: "Dark Lord",
                    color: "#4b0082",
                    difficulty: "boss",
                    health: 200,
                    isBoss: true
                },
                reward: 800,
                story: "Quỷ Vương Bóng Tối - kẻ thù nguy hiểm nhất. Trận chiến cuối cùng!"
            },
            {
                id: 10,
                name: "FINAL BOSS: Thần Chiến",
                opponent: {
                    name: "War God",
                    color: "#ffd700",
                    difficulty: "boss",
                    health: 250,
                    isBoss: true
                },
                reward: 1500,
                story: "Thần Chiến - Đỉnh cao võ thuật! Chỉ có người mạnh nhất mới chiến thắng!"
            }
        ];
    }
    
    loadPlayerStats() {
        const saved = localStorage.getItem('stickman_campaign');
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            currentStage: 1,
            maxStageReached: 1,
            coins: 0,
            upgrades: {
                maxHealth: 0,  // +10 health per level
                attackPower: 0, // +2 damage per level
                speed: 0,       // +0.5 speed per level
                defense: 0      // -10% damage taken per level
            },
            victories: 0
        };
    }
    
    savePlayerStats() {
        localStorage.setItem('stickman_campaign', JSON.stringify(this.playerStats));
    }
    
    getCurrentStage() {
        return this.stages[this.currentStage - 1];
    }
    
    completeStage() {
        const stage = this.getCurrentStage();
        this.playerStats.coins += stage.reward;
        this.playerStats.victories++;
        
        if (this.currentStage >= this.playerStats.maxStageReached) {
            this.playerStats.maxStageReached = this.currentStage + 1;
        }
        
        this.savePlayerStats();
        return stage.reward;
    }
    
    nextStage() {
        if (this.currentStage < this.maxStage) {
            this.currentStage++;
            return true;
        }
        return false;
    }
    
    selectStage(stageId) {
        if (stageId <= this.playerStats.maxStageReached && stageId <= this.maxStage) {
            this.currentStage = stageId;
            return true;
        }
        return false;
    }
    
    canUpgrade(upgradeType) {
        const costs = {
            maxHealth: 200,
            attackPower: 250,
            speed: 150,
            defense: 300
        };
        
        const currentLevel = this.playerStats.upgrades[upgradeType];
        const cost = costs[upgradeType] * (currentLevel + 1);
        
        return this.playerStats.coins >= cost && currentLevel < 5;
    }
    
    purchaseUpgrade(upgradeType) {
        if (!this.canUpgrade(upgradeType)) return false;
        
        const costs = {
            maxHealth: 200,
            attackPower: 250,
            speed: 150,
            defense: 300
        };
        
        const currentLevel = this.playerStats.upgrades[upgradeType];
        const cost = costs[upgradeType] * (currentLevel + 1);
        
        this.playerStats.coins -= cost;
        this.playerStats.upgrades[upgradeType]++;
        this.savePlayerStats();
        
        return true;
    }
    
    getUpgradeCost(upgradeType) {
        const costs = {
            maxHealth: 200,
            attackPower: 250,
            speed: 150,
            defense: 300
        };
        
        const currentLevel = this.playerStats.upgrades[upgradeType];
        return costs[upgradeType] * (currentLevel + 1);
    }
    
    applyUpgradesToPlayer(player) {
        const upgrades = this.playerStats.upgrades;
        
        // Max health
        player.maxHealth = 100 + (upgrades.maxHealth * 10);
        player.health = player.maxHealth;
        
        // Speed
        player.speed = 5 + (upgrades.speed * 0.5);
        
        // Store upgrade levels for damage calculation
        player.attackPowerLevel = upgrades.attackPower;
        player.defenseLevel = upgrades.defense;
    }
    
    calculateDamage(baseDamage, attackerLevel) {
        return baseDamage + (attackerLevel * 2);
    }
    
    calculateDefense(damage, defenseLevel) {
        const reduction = defenseLevel * 0.1; // 10% per level
        return Math.ceil(damage * (1 - reduction));
    }
    
    reset() {
        this.playerStats = {
            currentStage: 1,
            maxStageReached: 1,
            coins: 0,
            upgrades: {
                maxHealth: 0,
                attackPower: 0,
                speed: 0,
                defense: 0
            },
            victories: 0
        };
        this.savePlayerStats();
        this.currentStage = 1;
    }
    
    isGameCompleted() {
        return this.playerStats.maxStageReached > this.maxStage;
    }
}