const pong_lcl_confplay: (container: HTMLElement) => void = (container) => {
	container.innerHTML = `  
	  <div id="pong_lcl_confplay" class="menu-game-config">
		<h1>PONG</h1>
  
		<label for="modeSelect">🎮 Mode de jeu :</label>
		<select id="modeSelect" class="select-style">
		  <option value="2v2" selected>2 vs 2</option>
		  <option value="1v1">1 vs 1</option>
		</select>
  
		<!-- Configuration 2v2 -->
		<div id="custom-config_2vs2" class="config-section">
		  <p>Configurer les paddles <strong>2 vs 2</strong> :</p>
		  <label>Paddle 1 :</label>
		  <select id="player1" class="select-style">
			<option value="human" selected>Humain</option>
			<option value="cpu">Bot</option>
		  </select><br />
		  <label>Paddle 2 :</label>
		  <select id="player2" class="select-style">
			<option value="human">Humain</option>
			<option value="cpu" selected>Bot</option>
		  </select><br />
		  <label>Paddle 3 :</label>
		  <select id="player3" class="select-style">
			<option value="human">Humain</option>
			<option value="cpu" selected>Bot</option>
		  </select><br />
		  <label>Paddle 4 :</label>
		  <select id="player4" class="select-style">
			<option value="human">Humain</option>
			<option value="cpu" selected>Bot</option>
		  </select>
		</div>
  
		<!-- Configuration 1v1 -->
		<div id="custom-config_1vs1" class="config-section" style="display: none;">
		  <p>Configurer les paddles <strong>1 vs 1</strong> :</p>
		  <label>Paddle 1 :</label>
		  <select id="player1-1v1" class="select-style">
			<option value="human" selected>Humain</option>
			<option value="cpu">Bot</option>
		  </select><br />
		  <label>Paddle 2 :</label>
		  <select id="player2-1v1" class="select-style">
			<option value="human">Humain</option>
			<option value="cpu" selected>Bot</option>
		  </select>
		</div>
  
		<div style="margin-top: 20px;">
		  <button id="startBtn_lcl_play" class="btn-style">🚀 Lancer la partie</button>
		</div>
	  </div>
	`;
  
	const modeSelect = container.querySelector<HTMLSelectElement>("#modeSelect")!;
	const config2v2  = container.querySelector<HTMLDivElement>("#custom-config_2vs2")!;
	const config1v1  = container.querySelector<HTMLDivElement>("#custom-config_1vs1")!;
  
	modeSelect.addEventListener("change", () => {
	  if (modeSelect.value === "1v1") {
		config2v2.style.display = "none";
		config1v1.style.display = "block";
	  } else {
		config1v1.style.display = "none";
		config2v2.style.display = "block";
	  }
	});
  };
  
  export default pong_lcl_confplay;
  

type Mode = "1v1" | "2v2";
type PlayerKind = "human" | "cpu";

export interface LocalPlayConfig {
  mode: Mode;
  players: PlayerKind[];
}

export function readLocalPlayConfig(container: HTMLElement): LocalPlayConfig {
  const mode = (container.querySelector("#modeSelect") as HTMLSelectElement)?.value as Mode;

  if (mode === "1v1") {
    const p1 = (container.querySelector("#player1-1v1") as HTMLSelectElement)?.value as PlayerKind;
    const p2 = (container.querySelector("#player2-1v1") as HTMLSelectElement)?.value as PlayerKind;
    return { mode, players: [p1 ?? "human", p2 ?? "cpu"] };
  } else {
    const p1 = (container.querySelector("#player1") as HTMLSelectElement)?.value as PlayerKind;
    const p2 = (container.querySelector("#player2") as HTMLSelectElement)?.value as PlayerKind;
    const p3 = (container.querySelector("#player3") as HTMLSelectElement)?.value as PlayerKind;
    const p4 = (container.querySelector("#player4") as HTMLSelectElement)?.value as PlayerKind;
    return { mode, players: [p1 ?? "human", p2 ?? "cpu", p3 ?? "cpu", p4 ?? "cpu"] };
  }
}
