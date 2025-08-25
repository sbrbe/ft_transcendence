import { Player } from './player.js';
import { CPU } from './CPU';
export declare class Tracker {
    private exchanges;
    private totalExchanges;
    private maxRally;
    private winner;
    recordHit(): void;
    setWinner(winner: Player | CPU | null): void;
    resetExchange(): void;
    getStats(): {
        winner: Player | CPU | null;
        totalExchanges: number;
        maxRally: number;
    };
}
