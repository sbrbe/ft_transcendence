import { GameLogic } from "./game_logic.js";
import type { GameState, gameConfig } from './types.js'
import { Tracker } from './tracker.js';
import { Player } from './player.js';
import { CPU } from './CPU.js';

export interface contender{
    id: string | null;
    name: string;
}

export interface buildTournament {
    players: contender[];
}

export interface infoMatch {
    tracked: Tracker[]
}

export class Tournament {
   // private id: UUID
    private canvasH: number;
    private canvasW: number;
    private finish: boolean = false;
    private matchs: GameLogic[] = [];
    private confs: gameConfig[] = [];
    private currentMatchId: number =0;
    private winner: contender[] = [];
    public launch: boolean = false;

    constructor(canvasW: number, canvasH:number, info: buildTournament)
    {
        //this.id =
        this.canvasH = canvasH;
        this.canvasW = canvasW;
        this.buildConfs(info.players);
        this.startMatchs(this.currentMatchId);
    }
    
    private startMatchs(id: number)
    {
        this.matchs[id] = new GameLogic(this.canvasW, this.canvasH, this.confs[id]);
    }

    private buildConfs(list: contender[])
    {
        this.currentMatchId = 0;
        this.confs = [];
        this.winner = [];
        this.matchs = [];
        for (let i = 0; i < list.length; i += 2) {
            if (i + 1 < list.length) {
                this.confs.push({
                    playerSetup: [
                        {  type: "human", playerId: list[i].id, name: list[i].name},   // joueur A
                        { playerId: list[i + 1].id, type: "human", name: list[i + 1].name }, // joueur B
                    ],
                    mode: "1v1" 
                });
            }
        }
    }
    
    public playLocal(): GameState
    {
        this.matchs[this.currentMatchId].update();
        let info = this.matchs[this.currentMatchId].getGameState();
      
        if (info.running == false && this.launch) 
        {
            let win = info.tracker.winner
            if (win)
                this.appendWinner(win);
            this.currentMatchId++;

            if (this.currentMatchId >= this.confs.length && this.winner.length > 1)
            {
                this.buildConfs(this.winner);
                this.startMatchs(this.currentMatchId);
            }
            else if (this.currentMatchId < this.confs.length)
                this.startMatchs(this.currentMatchId);
        }
        return info;
    }

    public getNextMatch() : [string | null, string | null]
    {
        let P1: string | null = null;
        let P2: string | null = null;
        if (this.currentMatchId < this.confs.length - 1)
        {
            P1 = this.confs[this.currentMatchId + 1].playerSetup[0].name;
            P2 = this.confs[this.currentMatchId + 1].playerSetup[1].name;
        }
        else
        {
            if (this.winner.length > 1)
            {
                P1 = this.winner[0].name;
                P2 = this.winner[1].name;
            }
            else if (this.winner.length == 1)
            {
                let win = this.matchs[this.currentMatchId].getGameState().tracker.winner?.name;
                if (win)
                    P2 = win;
                P1 = this.winner[0].name;
            }
            else
            {
                let win = this.matchs[this.currentMatchId].getGameState().tracker.winner?.name;
                if (win)
                    P2 = win;
            }

        }
        return [P1,P2];
    }

	public redirectTournament(key: string, isPressed: boolean)
	{
		this.matchs[this.currentMatchId].setPlayerInput(key, isPressed);
	}

    public appendWinner(winner: Player | CPU | string) {
		const conf = this.confs[this.currentMatchId];
		if (!conf) return;
		// Trouver l'index 0/1 du gagnant dans playerSetup
		let idx = -1;
		if (typeof winner === 'string') {
		  // selon ton GameLogic: "A"/"B" ou "left"/"right"
		  const w = winner.toLowerCase();
		  idx = (w === 'a' || w === 'left' || w === 'l') ? 0 : 1;
		} else {
		  // Essayer via playerId puis via name
		  const pid = (winner as any).playerId ?? (winner as any).id;
		  const wname = (winner as any).name as string | undefined;
	  
		  if (pid != null) {
			idx = conf.playerSetup.findIndex(p => p.playerId === pid);
		  }
		  if (idx < 0 && wname) {
			idx = conf.playerSetup.findIndex(p => p.name === wname);
		  }
		  if (idx < 0) idx = 0; // fallback
		}
		const p = conf.playerSetup[idx];
		if (p) {
		  this.winner.push({ id: p.playerId, name: p.name ?? `Player ${p.playerId}` });
		}
	  }
}