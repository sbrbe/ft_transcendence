import { GameLogic } from "../engine_play/dist/game_logic.js";
export class Tournament {
    constructor(canvasW, canvasH, info) {
        this.matchs = [];
        this.confs = [];
        this.currentMatchId = 0;
        this.winner = [];
        this.canvasH = canvasH;
        this.canvasW = canvasW;
        this.buildConfs(info.players);
        this.startTour();
    }
    startTour() {
        this.matchs = this.confs.map(conf => new GameLogic(this.canvasW, this.canvasH, conf));
        this.currentMatchId = 0;
        this.winner = [];
    }
    buildConfs(list) {
        this.confs = [];
        for (let i = 0; i < list.length; i += 2) {
            if (i + 1 < list.length) {
                this.confs.push({
                    playerSetup: [
                        { type: "human", playerId: list[i].id, name: list[i].name }, // joueur A
                        { playerId: list[i + 1].id, type: "human", name: list[i + 1].name }, // joueur B
                    ],
                    mode: "1v1"
                });
            }
        }
    }
    playLocal() {
        this.matchs[this.currentMatchId].update();
        let info = this.matchs[this.currentMatchId].getGameState();
        if (info.running == false) {
            let win = info.tracker.winner;
            if (win) {
                this.appendWinner(win);
            }
            this.currentMatchId++;
            if (this.currentMatchId >= this.matchs.length) {
                if (this.winner.length > 1) {
                    // préparer le tour suivant
                    console.log(this.winner.length);
                    this.buildConfs(this.winner);
                    this.startTour();
                }
                else
                    console.log('finit gg');
            }
        }
        return info;
    }
    redirectTournament(key, isPressed) {
        this.matchs[this.currentMatchId].setPlayerInput(key, isPressed);
    }
    appendWinner(winner) {
        const conf = this.confs[this.currentMatchId];
        if (!conf)
            return;
        // Trouver l'index 0/1 du gagnant dans playerSetup
        let idx = -1;
        if (typeof winner === 'string') {
            // selon ton GameLogic: "A"/"B" ou "left"/"right"
            const w = winner.toLowerCase();
            idx = (w === 'a' || w === 'left' || w === 'l') ? 0 : 1;
        }
        else {
            // Essayer via playerId puis via name
            const pid = winner.playerId ?? winner.id;
            const wname = winner.name;
            if (pid != null) {
                idx = conf.playerSetup.findIndex(p => p.playerId === pid);
            }
            if (idx < 0 && wname) {
                idx = conf.playerSetup.findIndex(p => p.name === wname);
            }
            if (idx < 0)
                idx = 0; // fallback
        }
        const p = conf.playerSetup[idx];
        if (p) {
            this.winner.push({ id: p.playerId, name: p.name ?? `Player ${p.playerId}` });
        }
    }
    isFinished() {
        return (this.winner.length == 1 && this.currentMatchId == this.matchs.length);
    }
}
