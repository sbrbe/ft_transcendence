type Player = 'Player1' | 'Player2';

export class Tracker {
  private exchanges: number = 0;
  private totalExchanges : number = 0
  private maxRally: number = 0;
  private winner: string | null = null;

  recordHit() : void 
  {
    this.exchanges++;
    this.totalExchanges++;
    if (this.exchanges > this.maxRally)
      this.maxRally = this.exchanges;
  }

  setWinner(winner: string) : void
  {
    this.winner = winner; 
  }
  resetExchange () : void
  {
    this.exchanges = 0;
  }

  getStats() :{ winner: string | null;
  totalExchanges: number;
  maxRally: number;}
  { 
    return {
      winner: this.winner,
      totalExchanges: this.totalExchanges, 
      maxRally: this.maxRally,
    };
  }
}