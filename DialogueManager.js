// /social/DialogueManager.js
class DialogueManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.dialogueTrees = {};
    }

    loadDialogueTree(npcId, treeId) {
        // Load dialogue tree from database or file
        return this.dialogueTrees[treeId] || null;
    }

    getNode(npc, player, nodeId) {
        const tree = this.loadDialogueTree(npc.id, npc.dialogueTreeId);
        if (!tree) return null;
        
        const node = tree.nodes[nodeId || 'start'];
        
        // Check conditions
        if (node.conditions) {
            if (node.conditions.minRelationship && 
                player.relationships[npc.id] < node.conditions.minRelationship) {
                return this.getFallbackNode(tree);
            }
        }
        
        return node;
    }

    getFallbackNode(tree) {
        return tree.nodes[tree.fallbackNode] || null;
    }

    chooseOption(node, optionIndex, player, npc) {
        const option = node.options[optionIndex];
        if (!option) return null;
        
        const effects = {
            relationshipDelta: option.effects.relationshipDelta || 0,
            statDeltas: option.effects.statDeltas || {},
            unlockFlag: option.effects.unlockFlag,
            marketResearchEntryId: option.effects.marketResearchEntryId
        };
        
        // Apply relationship changes
        if (effects.relationshipDelta) {
            player.relationships[npc.id] = (player.relationships[npc.id] || 0) + effects.relationshipDelta;
        }
        
        // Apply stat changes
        if (effects.statDeltas) {
            player.applyDelta({ stats: effects.statDeltas });
        }
        
        // Unlock flags
        if (effects.unlockFlag) {
            this.gameState.flags[effects.unlockFlag] = true;
        }
        
        return {
            effects: effects,
            nextNodeId: option.nextNodeId
        };
    }

    resolvePitch(product, npc, player) {
        const commSkill = player.knowledge.communication || 0;
        const productMarketFit = this.calculateProductMarketFit(product, npc);
        const trust = player.relationships[npc.id] || 0;
        const timingFit = this.calculateTimingFit();
        const priceFit = this.calculatePitchPriceFit(product);
        const reputation = player.reputation.business || 0;
        
        const successChance = this.clamp(
            commSkill * 0.25 + 
            productMarketFit * 0.30 + 
            trust * 0.20 + 
            timingFit * 0.10 + 
            priceFit * 0.10 + 
            reputation * 0.05,
            0, 1
        );
        
        const success = Math.random() < successChance;
        
        return {
            success: success,
            chance: successChance,
            effects: success ? this.getPitchSuccessEffects() : this.getPitchFailureEffects()
        };
    }

    calculateProductMarketFit(product, npc) {
        // Simplified market fit calculation
        return 0.5; // Base fit
    }

    calculateTimingFit() {
        // Check if timing is good (not during exams, etc.)
        return 0.7;
    }

    calculatePitchPriceFit(product) {
        // Check if price is reasonable for target segment
        return 0.6;
    }

    getPitchSuccessEffects() {
        return {
            reputationDelta: { business: 5 },
            relationshipDelta: 10,
            moneyDelta: 1000
        };
    }

    getPitchFailureEffects() {
        return {
            reputationDelta: { business: -2 },
            relationshipDelta: -5
        };
    }

    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }
}
