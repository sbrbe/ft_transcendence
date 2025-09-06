// src/pages/pong_lcl_conftourn.ts
const pong_lcl_conftourn: (container: HTMLElement) => void = (container) => {
	container.innerHTML = `  
	  <div id="pong_lcl_conftourn" class="tournois-config">
		<h1>PONG TOURNOIS</h1>
  
		<!-- Choix du nombre de joueurs -->
		<div class="config-section">
		  <label for="tournamentSize"><strong>Nombre de joueurs :</strong></label>
		  <fieldset id="tournamentSize" class="player-count" style="border: 0; padding: 0; margin: 10px 0;">
			<label class="radio-chip" style="margin-right: 10px;">
			  <input type="radio" name="tournamentSize" id="size4" value="4" checked>
			  <span>4 joueurs</span>
			</label>
			<label class="radio-chip" style="margin-right: 10px;">
			  <input type="radio" name="tournamentSize" id="size8" value="8">
			  <span>8 joueurs</span>
			</label>
			<label class="radio-chip">
			  <input type="radio" name="tournamentSize" id="size16" value="16">
			  <span>16 joueurs</span>
			</label>
		  </fieldset>
		</div>
  
		<!-- Noms des joueurs -->
		<div id="tournamentPlayers" class="config-section player-list">
		  ${Array.from({ length: 16 }, (_, i) => {
			const index = i + 1;
			return `
			  <div class="player-row" data-index="${index}" style="${index > 4 ? "display:none;" : ""}">
				<label for="playerName${index}">Joueur ${index} :</label>
				<input
				  id="playerName${index}"
				  name="playerName${index}"
				  type="text"
				  class="input-style"
				  value="Joueur ${index}">
			  </div>
			`;
		  }).join("")}
		</div>
  
		<!-- Lancement du tournoi -->
		<div style="margin-top: 20px;">
		  <button id="startTournamentBtn" class="btn-style">🚀 Lancer le tournoi</button>
		</div>
	  </div>
	`;
  
	const radios = container.querySelectorAll<HTMLInputElement>('input[name="tournamentSize"]');
	const playerRows = container.querySelectorAll<HTMLDivElement>(".player-row");
  
	function updatePlayers(count: number) {
	  playerRows.forEach((row) => {
		const index = parseInt(row.dataset.index || "0", 10);
		row.style.display = index <= count ? "block" : "none";
	  });
	}
  
	updatePlayers(4);
  
	radios.forEach((radio) => {
	  radio.addEventListener("change", () => {
		updatePlayers(parseInt(radio.value, 10));
	  });
	});
  };
  
  export default pong_lcl_conftourn;
  
  export interface TournamentPlayer {
	id: number;
	name: string;
  }
  
  export function readTournamentConfig(container: HTMLElement): TournamentPlayer[] {
	const fs = container.querySelector<HTMLFieldSetElement>("#tournamentSize");
	const checked = fs?.querySelector<HTMLInputElement>('input[name="tournamentSize"]:checked');
	const size = checked ? parseInt(checked.value, 10) : 4;
  
	const inputs = Array.from(
	  container.querySelectorAll<HTMLInputElement>('#tournamentPlayers input[type="text"]')
	);
  
	const players: TournamentPlayer[] = inputs.slice(0, size).map((inp, i) => {
	  const raw = (inp.value ?? "").trim();
	  const name = raw.length > 0 ? raw : `Joueur ${i + 1}`;
	  return { id: i + 1, name };
	});
  
	return (players);
  }
  
