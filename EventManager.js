// /world/EventManager.js
class EventManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.events = [
            {
                id: 'rain_delay',
                type: 'weather',
                probability: 0.1,
                effects: {
                    statDeltas: { energy: -5 },
                    message: 'Heavy rain delayed your activities'
                }
            },
            {
                id: 'sick_day',
                type: 'health',
                probability: 0.05,
                effects: {
                    statDeltas: { energy: -20, stress: 10 },
                    message: 'You caught a cold and feel weak'
                }
            },
            {
                id: 'surprise_expense',
                type: 'financial',
                probability: 0.08,
                effects: {
                    moneyDelta: -200,
                    message: 'Unexpected expense: Phone repair needed'
                }
            },
            {
                id: 'good_news',
                type: 'opportunity',
                probability: 0.06,
                effects: {
                    statDeltas: { stress: -10 },
                    reputationDelta: { local: 5 },
                    message: 'Good news spreads about your work'
                }
            }
        ];
    }

    rollDailyEvent() {
        const random = Math.random();
        let cumulativeProbability = 0;
        
        for (const event of this.events) {
            cumulativeProbability += event.probability;
            if (random < cumulativeProbability) {
                return event;
            }
        }
        
        return null;
    }

    applyEvent(event) {
        if (!event) return;
        
        const player = this.gameState.player;
        
        if (event.effects.statDeltas) {
            player.applyDelta({ stats: event.effects.statDeltas });
        }
        
        if (event.effects.moneyDelta) {
            player.stats.money += event.effects.moneyDelta;
        }
        
        if (event.effects.reputationDelta) {
            player.applyDelta({ reputation: event.effects.reputationDelta });
        }
        
        return {
            message: event.effects.message,
            eventId: event.id
        };
    }
}
