// /index.js
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// Import game modules
const GameState = require('./core/GameState');
const TimeManager = require('./core/TimeManager');
const PlayerStats = require('./player/PlayerStats');
const BusinessManager = require('./economy/BusinessManager');
const DialogueManager = require('./social/DialogueManager');
const EventManager = require('./world/EventManager');

// Initialize game
const gameState = new GameState();
const timeManager = new TimeManager(gameState);
const businessManager = new BusinessManager(gameState);
const dialogueManager = new DialogueManager(gameState);
const eventManager = new EventManager(gameState);

// Create player
gameState.player = new PlayerStats('Rahim', 23, 'Business');
gameState.player.stats.money = 500; // Starting money

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Player connected');
    
    // Send initial game state
    socket.emit('gameState', gameState.save());
    
    // Handle activity selection
    socket.on('selectActivity', (activityId) => {
        // Resolve activity
        const activity = getActivityById(activityId);
        if (activity) {
            resolveActivity(activity, socket);
        }
    });
    
    // Handle dialogue choices
    socket.on('dialogueChoice', (data) => {
        const result = dialogueManager.chooseOption(
            data.node,
            data.optionIndex,
            gameState.player,
            getNpcById(data.npcId)
        );
        socket.emit('dialogueResult', result);
    });
    
    // Handle pitch
    socket.on('pitch', (data) => {
        const result = dialogueManager.resolvePitch(
            data.product,
            getNpcById(data.npcId),
            gameState.player
        );
        socket.emit('pitchResult', result);
    });
});

function resolveActivity(activity, socket) {
    // Apply activity costs
    if (activity.costs.energy) {
        gameState.player.stats.energy -= activity.costs.energy;
    }
    
    if (activity.costs.money) {
        gameState.player.stats.money -= activity.costs.money;
    }
    
    // Apply effects
    if (activity.effects.statDeltas) {
        gameState.player.applyDelta({ stats: activity.effects.statDeltas });
    }
    
    if (activity.effects.moneyDelta) {
        gameState.player.stats.money += activity.effects.moneyDelta;
    }
    
    // Advance time
    timeManager.advancePhase();
    
    // Check for daily events
    if (timeManager.getCurrentPhase() === 'MORNING') {
        const event = eventManager.rollDailyEvent();
        if (event) {
            const eventResult = eventManager.applyEvent(event);
            socket.emit('event', eventResult);
        }
    }
    
    // Send updated state
    socket.emit('gameState', gameState.save());
}

// Define activities
const activities = [
    {
        id: 'attend_class',
        name: 'Attend Class',
        location: 'university',
        phase: 'MORNING',
        costs: { energy: 15 },
        effects: {
            knowledge: { business: 5 },
            statDeltas: { stress: 5 }
        }
    },
    {
        id: 'tutoring_job',
        name: 'Tutoring Session',
        location: 'university',
        phase: 'AFTERNOON',
        costs: { energy: 20 },
        effects: {
            moneyDelta: 300,
            knowledge: { communication: 2 }
        }
    },
    {
        id: 'tea_stall',
        name: 'Visit Tea Stall',
        location: 'tea_stall',
        phase: 'EVENING',
        costs: { energy: 5, money: 20 },
        effects: {
            statDeltas: { stress: -15, hunger: -20 }
        }
    }
];

function getActivityById(id) {
    return activities.find(a => a.id === id);
}

function getNpcById(id) {
    // Return NPC from game state
    return gameState.npcs.find(npc => npc.id === id);
}

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Game server running on port ${PORT}`);
});
