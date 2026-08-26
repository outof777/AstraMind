// /core/TimeManager.js
class TimeManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.phases = ['MORNING', 'AFTERNOON', 'EVENING'];
    }

    advancePhase() {
        const currentPhaseIndex = this.phases.indexOf(this.gameState.calendar.phase);
        
        if (currentPhaseIndex === this.phases.length - 1) {
            // End of day
            this.gameState.calendar.phase = this.phases[0];
            this.gameState.calendar.day += 1;
            
            if (this.gameState.calendar.day % 7 === 0) {
                this.gameState.calendar.week += 1;
            }
            
            this.runNightResolution();
        } else {
            this.gameState.calendar.phase = this.phases[currentPhaseIndex + 1];
        }
    }

    runNightResolution() {
        // Trigger nightly events
        console.log('Night resolution triggered');
        // Call EconomyManager, EventManager, etc.
    }

    getCurrentPhase() {
        return this.gameState.calendar.phase;
    }

    getDay() {
        return this.gameState.calendar.day;
    }
}
