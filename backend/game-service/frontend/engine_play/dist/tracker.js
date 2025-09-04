export class Tracker {
    constructor() {
        this.exchanges = 0;
        this.totalExchanges = 0;
        this.maxRally = 0;
        this.winner = null;
    }
    recordHit() {
        this.exchanges++;
        this.totalExchanges++;
        if (this.exchanges > this.maxRally)
            this.maxRally = this.exchanges;
    }
    setWinner(winner) {
        this.winner = winner;
    }
    resetExchange() {
        this.exchanges = 0;
    }
    getStats() {
        return {
            winner: this.winner,
            totalExchanges: this.totalExchanges,
            maxRally: this.maxRally,
        };
    }
}
