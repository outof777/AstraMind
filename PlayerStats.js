// /player/PlayerStats.js
class PlayerStats {
    constructor(name, age, major) {
        this.id = Date.now();
        this.name = name;
        this.age = age || 23;
        this.major = major || 'Business';
        this.stats = {
            energy: 100,
            hunger: 0, // 0 = full, 100 = starving
            money: 500, // Starting money in BDT
            stress: 0
        };
        this.knowledge = {
            business: 0,
            marketing: 0,
            finance: 0,
            tech: 0,
            communication: 0
        };
        this.reputation = {
            local: 0,
            academic: 0,
            business: 0
        };
        this.relationships = {}; // npcId: value
        this.location = 'mess';
        this.inventoryItems = [];
        this.skills = [];
    }

    applyDelta(deltas) {
        if (deltas.stats) {
            for (const [key, value] of Object.entries(deltas.stats)) {
                this.stats[key] = this.clamp(this.stats[key] + value, 0, 100);
            }
        }
        
        if (deltas.knowledge) {
            for (const [key, value] of Object.entries(deltas.knowledge)) {
                this.knowledge[key] = Math.max(0, this.knowledge[key] + value);
            }
        }
        
        if (deltas.reputation) {
            for (const [key, value] of Object.entries(deltas.reputation)) {
                this.reputation[key] = this.clamp(this.reputation[key] + value, -100, 100);
            }
        }
        
        this.checkThresholds();
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    checkThresholds() {
        if (this.stats.energy <= 0) {
            console.log('Player exhausted - forced rest');
        }
        
        if (this.stats.stress >= 80) {
            console.log('Burnout warning!');
        }
        
        if (this.stats.hunger >= 90) {
            this.stats.energy -= 10;
            console.log('Starvation penalty applied');
        }
    }
}
