import { GameRenderer } from './renderer.js'
import { OnlineClient } from './onlineClient.js';
import { type buildTournament } from '../../../../engine_play/src/tournament_logic.js';
import { TournamentPlayer } from '../UI/pong_lcl_conftourn.js';
import type { Disposable } from "./runtime.js";
type RoundSize = 8 | 4 | 2 | 1;

interface UIMatch {
	id: string;
	round: RoundSize;
	players: [string | null, string | null];
	winner?: 0 | 1 | null;
}

export interface ServerMatch { P1: string; P2: string; }

export class GameTournament implements Disposable{
	private canvas: HTMLCanvasElement;
	private renderer: GameRenderer; 
	private online: OnlineClient | null = null;
	private betweenStage: 'idle' | 'winner' |'next' | 'end' = 'idle';
	private _prevRunning: boolean | null = null;
	private conf: TournamentPlayer[];
	private configTournaments: buildTournament;
	private name: string | null;
	private bracketByRound = new Map<RoundSize, UIMatch[]>();
	private bracketRoundsOrder: RoundSize[] = [];

	constructor(conf: TournamentPlayer[]) {
		this.canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
		this.renderer = new GameRenderer(this.canvas);
		this.conf = conf;
		this.name = null;
		this.startTournament();
	}

	private keyDownHandler = (e: KeyboardEvent) => {
		const code = e.code;
		if (code === 'Space') {
			if (this.betweenStage === 'winner') {
				e.preventDefault();
				this.betweenStage = 'next';
				this.showNextMatchScreen();
				return;
			}
			if (this.betweenStage === 'next') {
				e.preventDefault();
				this.online?.sendContinue();
				this.betweenStage = 'idle';
				this.renderer?.clearRender();
				this.infoTourn();
				return;
			}
			if (this.betweenStage === 'end') {
				e.preventDefault();
				window.location.href = "/#/home";
				this.betweenStage = 'idle';
				return;
			}
		}
		if (code === 'ArrowUp' || code === 'ArrowDown') e.preventDefault();
	};
	
	private keyUpHandler = (e: KeyboardEvent) => {
		const code = e.code;
		if (code === 'Space' && (this.betweenStage === 'winner' || this.betweenStage === 'next' || this.betweenStage === 'end')) {
			e.preventDefault();
			return;
		}
		if (code === 'ArrowUp' || code === 'ArrowDown') e.preventDefault();
	};

	private recomputeRoundsOrder() {
		const present = Array.from(this.bracketByRound.keys()).sort((a,b) => b - a) as RoundSize[];
		const top = present[0];
		const chain: RoundSize[] =
			top === 8  ? [8, 4, 2, 1] :
			top === 4  ? [4, 2, 1] :
			top === 2  ? [2, 1] :
			top === 1  ? [1] : [];
		this.bracketRoundsOrder = chain.filter(r => this.bracketByRound.has(r));
	}

	private getAllUIMatches(): UIMatch[] {
		const res: UIMatch[] = [];
		for (const r of this.bracketRoundsOrder) {
			const arr = this.bracketByRound.get(r);
			if (arr) res.push(...arr);
		}
		return res;
	}

	private isRoundComplete(r: RoundSize): boolean {
		const arr = this.bracketByRound.get(r);
		return !!arr && arr.length > 0 && arr.every(m => m.winner != null);
	}

	private advanceRound(r: RoundSize): void {
		const arr = this.bracketByRound.get(r);
		if (!arr) return;
		const winners: (string | null)[] = arr.map(m => {
			if (m.winner === 0) return m.players[0] ?? null;
			if (m.winner === 1) return m.players[1] ?? null;
			return null;
		});
		const next = (r / 2) as RoundSize;
		if (next >= 1) {
			const nextMatches: UIMatch[] = [];
			for (let i = 0; i < winners.length; i += 2) {
				const a = winners[i] ?? null;
				const b = winners[i + 1] ?? null;
				nextMatches.push({
					id: `R${next}-M${i / 2 + 1}`,
					round: next,
					players: [a, b],
					winner: null,
				});
			}
			this.bracketByRound.set(next, nextMatches);
			this.recomputeRoundsOrder();
		}
		this.renderBracketFromState();
	}

	private markWinnerByName(winnerName: string): void {
		if (!winnerName) return;
		for (const r of this.bracketRoundsOrder) {
			const arr = this.bracketByRound.get(r);
			if (!arr) continue;
			const idx = arr.findIndex(m =>
				m.winner == null && (m.players[0] === winnerName || m.players[1] === winnerName)
			);
			if (idx >= 0) {
				const m = arr[idx];
				m.winner = (m.players[0] === winnerName) ? 0 : 1;
				this.renderBracketFromState();
				if (this.isRoundComplete(r)) {
					this.advanceRound(r);
				}
				break;
			}
		}
	}

	private buildBracketFromConf(): { firstRoundMatches: RoundSize; matches: UIMatch[] } {
		const rawNames = (this.conf ?? []).map((p, i) => (p?.name || `Player ${i + 1}`).trim());
		const clampTo = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
		const maxPlayers = clampTo(rawNames.length, 2, 32);
		let p2 = 1;
		while (p2 * 2 <= maxPlayers) p2 *= 2;
		const names = rawNames.slice(0, p2);
		const firstRoundMatches = (p2 / 2) as RoundSize;
		const matches: UIMatch[] = [];
		for (let i = 0; i < firstRoundMatches; i++) {
			const a = names[i * 2] ?? null;
			const b = names[i * 2 + 1] ?? null;
			matches.push({
				id: `R${firstRoundMatches}-M${i + 1}`,
				round: firstRoundMatches,
				players: [a, b],
			});
		}
		return { firstRoundMatches, matches };
	}

	private mergeServerRound(list: ServerMatch[]): void {
		if (!list || list.length === 0) return;
		const r = list.length as RoundSize;
		const prev = this.bracketByRound.get(r) ?? [];
		const ui: UIMatch[] = list.map((m, i) => {
			const old = prev[i];
			return {
				id: `R${r}-M${i + 1}`,
				round: r,
				players: [m.P1 ?? null, m.P2 ?? null],
				winner: old?.winner ?? null,
			};
		});
		this.bracketByRound.set(r, ui);
		this.recomputeRoundsOrder();
	}

	private renderBracketFromState(): void {
		if (this.bracketRoundsOrder.length === 0) return;
		const firstRound = this.bracketRoundsOrder[0] as RoundSize;
		this.renderBracket(firstRound, this.getAllUIMatches());
	}

	private async infoTourn() {
		if (this.name) {
			this.markWinnerByName(this.name);
		}
		const list = await this.online?.getInfoTournament();
		if (list && list.length > 0) {
			this.mergeServerRound(list);
			this.renderBracketFromState();
		}
	}

	private async showNextMatchScreen() {
		const label = await this.online?.sendInfoPlayers();
		this.renderer?.clearRender();
		this.renderer?.drawMessage(`${label}\n\n[SPACE] to start`);
	}

	private isMovementKey(code: string) {
		return code === 'ArrowUp' || code === 'ArrowDown' || code === 'KeyW' || code === 'KeyS';
	}
	
	private localKeysHandler?: (e: KeyboardEvent) => void;
	private bracketRoot: HTMLDivElement | null = null;

	private truncateName(s: string | null, n = 20): string {
		if (!s) return "";
		const t = s.trim();
		return t.length > n ? t.slice(0, n - 1) + "…" : t;
	}

	private computeRounds(firstRoundMatches: number): RoundSize[] {
		const start = Math.max(1, Math.min(8, firstRoundMatches));
		const possible: RoundSize[] = [8, 4, 2, 1];
		const idx = possible.indexOf(start as RoundSize);
		if (idx === -1) {
			if (start >= 8) return [8, 4, 2, 1];
			if (start >= 4) return [4, 2, 1];
			if (start >= 2) return [2, 1];
			return [1];
		}
		return possible.slice(idx);
	}

	private roundLabel(r: RoundSize): string {
		switch (r) {
			case 8: return "1/8 of final";
			case 4: return "Quarter-final";
			case 2: return "Semi-final";
			case 1: return "Final";
		}
	}

	private ensureBracketPanel() {
		if (this.bracketRoot && document.body.contains(this.bracketRoot)) return;
		const wrapper = this.canvas.closest('#game_canvas') as HTMLElement;
		if (wrapper) {
			wrapper.style.display = 'flex';
			wrapper.style.flexDirection = 'column';
			wrapper.style.alignItems = 'center';
		}
		const root = document.createElement('div');
		root.id = 'tournament-bracket';
		root.className = [
			"mt-6 w-full max-w-5xl rounded-2xl border border-gray-200 bg-gray-50",
			"p-4 md:p-6 text-sm text-gray-800"
		].join(' ');
		const header = document.createElement('div');
		header.className = "mb-4 flex items-center justify-between";
		header.innerHTML = `
			<div class="flex items-center gap-2">
				<span class="inline-flex h-2 w-2 rounded-full animate-pulse bg-blue-500/70"></span>
				<span class="uppercase tracking-wider text-xs text-gray-500">Tournoi</span>
			</div>
			<div class="text-xs text-gray-400">Real-time updates</div>
		`;
		const cols = document.createElement('div');
		cols.className = "grid gap-x-8";
		cols.setAttribute("data-bracket-cols", "");
		root.appendChild(header);
		root.appendChild(cols);
		(wrapper ?? document.body).appendChild(root);
		this.bracketRoot = root;
	}

	private renderBracket(firstRoundMatches: number, allMatches: UIMatch[]) {
		this.ensureBracketPanel();
		if (!this.bracketRoot) return;
		const cols = this.bracketRoot.querySelector('[data-bracket-cols]') as HTMLElement;
		if (!cols) return;
		const rounds = this.computeRounds(firstRoundMatches);
		const N0 = rounds[0];
		const byCols: Record<number, string> = {
			1: "grid-cols-1",
			2: "grid-cols-2",
			3: "grid-cols-3",
			4: "grid-cols-4",
		};
		cols.className = `grid ${byCols[rounds.length] || "grid-cols-4"} gap-x-8`;
		cols.innerHTML = "";
		const byRound = new Map<RoundSize, UIMatch[]>();
		for (const r of rounds) byRound.set(r, []);
		for (const m of allMatches) if (byRound.has(m.round)) byRound.get(m.round)!.push(m);
		const CARD_H_BY_COL = [100, 100, 100, 100];
		const GAP_Y_BY_COL  = [18, 1, 1, 1];
		const SLOT0 = CARD_H_BY_COL[0] + GAP_Y_BY_COL[0];
		const TOTAL_H = N0 * SLOT0;
		const spacer = (h: number) => {
			const s = document.createElement('div');
			s.style.height = `${Math.max(0, Math.round(h))}px`;
			return s;
		};
		rounds.forEach((r, k) => {
			const roundMatches = byRound.get(r)!;
			const expectedCount = r;
			const col = document.createElement('div');
			col.className = "flex flex-col";
			const h = document.createElement('div');
			h.className = "mb-2 text-center text-[11px] uppercase tracking-wider text-gray-500";
			h.textContent = this.roundLabel(r);
			col.appendChild(h);
			const stack = document.createElement('div');
			stack.className = "flex flex-col";
			stack.style.height = `${TOTAL_H}px`;
			col.appendChild(stack);
			const CARD_H = CARD_H_BY_COL[k] ?? 64;
			const GAP_Y  = GAP_Y_BY_COL[k] ?? 14;
			const SLOT   = CARD_H + GAP_Y;
			const block = SLOT * Math.pow(2, k);
			const offsetTop = block / 2 - SLOT / 2;
		                         const between = block - SLOT;
			const used = offsetTop + expectedCount * SLOT + (expectedCount - 1) * between;
			const bottomPad = Math.max(0, TOTAL_H - used);
			if (offsetTop > 0) stack.appendChild(spacer(offsetTop));
			for (let i = 0; i < expectedCount; i++) {
				const m = roundMatches[i] ?? { id: `R${r}-P${i+1}`, round: r, players: [null, null] } as UIMatch;
				const [a, b] = m.players;
				const pA = this.truncateName(a, k === 0 ? 24 : 20);
				const pB = this.truncateName(b, k === 0 ? 24 : 20);
				const winnerA = m.winner === 0;
				const winnerB = m.winner === 1;
				const card = document.createElement('div');
				card.setAttribute('data-match-id', m.id);
				card.className = "rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm hover:shadow transition-shadow";
				card.style.height = `${CARD_H}px`;
				card.style.display = 'flex';
				card.style.flexDirection = 'column';
				card.style.justifyContent = 'center';
				card.style.boxSizing = 'border-box';
				card.style.overflow = 'hidden';
				if (k === 0) {
					card.className += " min-w-[220px] md:min-w-[240px]";
					card.style.whiteSpace = "normal";
				}
				card.innerHTML = `
					<div class="mb-1 flex items-center justify-between text-[11px] text-gray-400">
						<span>${m.id}</span>
						<span class="text-gray-400">${this.roundLabel(r)}</span>
					</div>
					<div class="flex flex-col gap-1">
						<div class="flex items-center justify-between rounded-lg bg-white px-3 h-8 border border-gray-200">
							<span class="text-[13px] ${winnerA ? "font-semibold text-blue-600" : "text-gray-700"}">${pA}</span>
							${winnerA ? '<span class="rounded-full px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700">WIN</span>' : ""}
						</div>
						<div class="flex items-center justify-between rounded-lg bg-white px-3 h-8 border border-gray-200">
							<span class="text-[13px] ${winnerB ? "font-semibold text-blue-600" : "text-gray-700"}">${pB}</span>
							${winnerB ? '<span class="rounded-full px-2 py-0.5 text-[10px] bg-blue-100 text-blue-700">WIN</span>' : ""}
						</div>
					</div>
				`;
				stack.appendChild(card);
				if (i < expectedCount - 1 && between > 0) {
					stack.appendChild(spacer(between));
				}
			}
			if (bottomPad > 0) stack.appendChild(spacer(bottomPad));
			cols.appendChild(col);
		});
	}

	private startTournament() {
		this.configTournaments = { players: this.conf };
		window.removeEventListener('keydown', this.keyDownHandler as any);
		window.removeEventListener('keyup', this.keyUpHandler as any);
		window.addEventListener('keydown', this.keyDownHandler, { passive: false });
		window.addEventListener('keyup', this.keyUpHandler, { passive: false });
		(document.activeElement as HTMLElement)?.blur?.();
		this.canvas.tabIndex = 0;
		this.canvas.focus();
		const { firstRoundMatches, matches } = this.buildBracketFromConf();
		this.bracketByRound.clear();
		this.bracketByRound.set(firstRoundMatches, matches);
		this.recomputeRoundsOrder();
		this.renderBracket(firstRoundMatches, matches);
		this.attachLocalAuthoritativeInputs();
		this.online?.dispose();
		this.online = new OnlineClient(
			(snap) => {
				if (!this.renderer) return;
				this.renderer.draw(snap);
				if (this._prevRunning === true && snap.running === false) {
					this.renderer.endScreen(snap);
					this.betweenStage = 'winner';
					this.name = snap.tracker?.winner?.name;
					console.log(this.name);
				}
				this._prevRunning = !!snap.running;
			},
			(msg) => {
				if (msg.type === 'tournament_end') {
					this.betweenStage = 'end';
					this.renderer.clearRender();
					this.renderer.drawMessage('Tournoi finished, winner: ' + this.name + '!\n\n\n\nPress [SPACE] to QUIT !');
					this.infoTourn();
				}
			},
			'/game/tournament'
		); 
		this.online.connect().then(() => {
			if (this.configTournaments)
				this.online!.sendConfTournament(this.configTournaments);
		});
	}
	
	private attachLocalAuthoritativeInputs() {
		this.detachLocalAuthoritativeInputs();
		this.localKeysHandler = (e: KeyboardEvent) => {
			const code = e.code;
			if (!this.isMovementKey(code)) return;
			e.preventDefault();
			const isDown = e.type === 'keydown';
			this.online?.sendKey(code, isDown);
		};
		window.addEventListener('keydown', this.localKeysHandler, { passive: false });
		window.addEventListener('keyup', this.localKeysHandler, { passive: false });
	}
	
	private detachLocalAuthoritativeInputs() {
		if (this.localKeysHandler) {
			window.removeEventListener('keydown', this.localKeysHandler);
			window.removeEventListener('keyup', this.localKeysHandler);
			this.localKeysHandler = undefined;
		}
	}

	public dispose() {
		this.detachLocalAuthoritativeInputs();
		window.removeEventListener('keydown', this.keyDownHandler as any);
		window.removeEventListener('keyup', this.keyUpHandler as any);
		this.online?.dispose();
		this.online = null;
		if (this.renderer) this.renderer.clearRender();
	}
}
