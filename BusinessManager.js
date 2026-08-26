// /economy/BusinessManager.js
class BusinessManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    createBusiness(type, ownerId) {
        const business = {
            id: Date.now(),
            ownerId: ownerId,
            type: type,
            stage: 'startup',
            capital: 0,
            price: this.getDefaultPrice(type),
            quality: 50,
            inventory: 0,
            demand: 0,
            satisfaction: 50,
            marketingReach: 0,
            cashFlow: 0,
            employees: [],
            location: null,
            suppliers: [],
            permits: [],
            history: []
        };
        
        this.gameState.businesses.push(business);
        return business;
    }

    getDefaultPrice(type) {
        const prices = {
            'tutoring': 500, // BDT per session
            'food_delivery': 50, // BDT per delivery
            'tech_service': 1000 // BDT per service
        };
        return prices[type] || 100;
    }

    simulateTick(business, world) {
        // Calculate demand
        business.demand = this.computeDemand(business, world);
        
        // Calculate units sold
        const unitsSold = Math.min(business.demand, business.inventory || business.demand);
        
        // Calculate cash flow
        const revenue = unitsSold * business.price;
        const costs = this.computeCosts(business);
        business.cashFlow = revenue - costs;
        
        // Update capital
        business.capital += business.cashFlow;
        
        // Update satisfaction
        this.updateSatisfaction(business);
        
        // Log transaction
        business.history.push({
            day: this.gameState.calendar.day,
            revenue: revenue,
            costs: costs,
            cashFlow: business.cashFlow
        });
        
        return business.cashFlow;
    }

    computeDemand(business, world) {
        const baseMarket = {
            'tutoring': 50,
            'food_delivery': 100,
            'tech_service': 30
        }[business.type] || 20;
        
        const priceFit = this.calculatePriceFit(business);
        const qualityFactor = business.quality / 100;
        const marketingMultiplier = 1 + (business.marketingReach / 100);
        const seasonalModifier = this.getSeasonalModifier(world);
        const competitorPressure = this.getCompetitorPressure(business);
        
        return Math.max(0, baseMarket * priceFit * qualityFactor * marketingMultiplier * seasonalModifier - competitorPressure);
    }

    calculatePriceFit(business) {
        const optimalPrice = {
            'tutoring': 500,
            'food_delivery': 50,
            'tech_service': 1000
        }[business.type] || 100;
        
        const priceDiff = Math.abs(business.price - optimalPrice) / optimalPrice;
        return Math.max(0, 1 - priceDiff);
    }

    getSeasonalModifier(world) {
        // Seasonal effects on demand
        const seasonalModifiers = {
            'summer': 1.2, // More tutoring demand in summer
            'monsoon': 0.8, // Less outdoor activity
            'winter': 1.0,
            'spring': 1.1
        };
        return seasonalModifiers[world.season] || 1.0;
    }

    getCompetitorPressure(business) {
        // Simplified competitor pressure
        return this.gameState.businesses
            .filter(b => b.id !== business.id && b.type === business.type)
            .reduce((pressure, competitor) => {
                return pressure + (competitor.quality / 100) * 10;
            }, 0);
    }

    computeCosts(business) {
        const operatingCosts = {
            'tutoring': 100,
            'food_delivery': 20,
            'tech_service': 200
        }[business.type] || 50;
        
        const employeeCosts = business.employees.reduce((total, emp) => total + emp.salary, 0);
        
        return operatingCosts + employeeCosts;
    }

    updateSatisfaction(business) {
        const targetSatisfaction = business.quality;
        business.satisfaction += (targetSatisfaction - business.satisfaction) * 0.1;
    }
}
