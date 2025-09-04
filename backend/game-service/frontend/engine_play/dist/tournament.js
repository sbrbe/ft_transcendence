import { GameLogic } from "./game_logic.js";
export class Tournament {
    constructor(canvasW, canvasH, info) {
        this.finish = false;
        this.matchs = [];
        this.confs = [];
        this.currentMatchId = 0;
        this.winner = [];
        this.launch = false;
        //this.id =
        this.canvasH = canvasH;
        this.canvasW = canvasW;
        this.buildConfs(info.players);
        this.startMatchs(this.currentMatchId);
    }
    startMatchs(id) {
        this.matchs[id] = new GameLogic(this.canvasW, this.canvasH, this.confs[id]);
    }
    buildConfs(list) {
        this.currentMatchId = 0;
        this.confs = [];
        this.winner = [];
        this.matchs = [];
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
        if (info.running == false && this.launch) {
            let win = info.tracker.winner;
            if (win)
                this.appendWinner(win);
            this.currentMatchId++;
            if (this.currentMatchId >= this.confs.length && this.winner.length > 1) {
                this.buildConfs(this.winner);
                this.startMatchs(this.currentMatchId);
            }
            else if (this.currentMatchId < this.confs.length)
                this.startMatchs(this.currentMatchId);
        }
        return info;
    }
    getNextMatch() {
        let P1 = null;
        let P2 = null;
        if (this.currentMatchId < this.confs.length - 1) {
            P1 = this.confs[this.currentMatchId + 1].playerSetup[0].name;
            P2 = this.confs[this.currentMatchId + 1].playerSetup[1].name;
        }
        else {
            if (this.winner.length > 1) {
                P1 = this.winner[0].name;
                P2 = this.winner[1].name;
            }
            else if (this.currentMatchId > 0 && this.winner.length > 0) {
                let win = this.matchs[this.currentMatchId].getGameState().tracker.winner?.name;
                if (win)
                    P2 = win;
                P1 = this.winner[0].name;
            }
            else {
                let win = this.matchs[this.currentMatchId].getGameState().tracker.winner?.name;
                if (win)
                    P2 = win;
            }
        }
        return [P1, P2];
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
        return (this.finish == true && this.confs.length == 1);
    }
}
