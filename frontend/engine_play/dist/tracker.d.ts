export declare class Tracker {
    private exchanges;
    private totalExchanges;
    private maxRally;
    private winner;
    recordHit(): void;
    setWinner(winner: string): void;
    resetExchange(): void;
    getStats(): {
        winner: string | null;
        totalExchanges: number;
        maxRally: number;
    };
}
