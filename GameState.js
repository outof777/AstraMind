// /core/GameState.js
class GameState {
    constructor() {
        this.player = null;
        this.businesses = [];
        this.npcs = [];
        this.marketResearch = [];
        this.calendar = {
            day: 1,
            week: 1,
            season: 'summer',
            phase: 'MORNING'
        };
        this.flags = {};
        this.stage = 'SURVIVAL';
    }

    save() {
        return JSON.stringify({
            player: this.player,
            businesses: this.businesses,
            npcs: this.npcs,
            marketResearch: this.marketResearch,
            calendar: this.calendar,
            flags: this.flags,
            stage: this.stage
        });
    }

    load(jsonData) {
        const data = JSON.parse(jsonData);
        Object.assign(this, data);
        return this;
    }
}
