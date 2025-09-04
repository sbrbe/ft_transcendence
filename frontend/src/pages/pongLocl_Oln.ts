const pong: (container: HTMLElement) => void = (container) => {
  container.innerHTML = `
   <div id="pong-options" class="flex flex-col items-center justify-center mt-8 space-y-4 space-x-4">
    <button id="pong-local" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg w-48">Local</button>
    <button id="pong-online" class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg text-lg w-48">En ligne</button>
  </div>

  <div id="local-options" class="hidden flex flex-col items-center justify-center mt-8 space-y-4 space-x-4">
    <button id="nav-game-config" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">🎮 Match Libre ⚡</button>
    <button id="nav-game-tournois" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">🎮 Tournois</button>
  </div>

  <div id="online-options" class="hidden flex flex-col items-center justify-center mt-8 space-y-4 space-x-4">
    <button id="nav-game-online" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded" >1 vs 1 Online 🌍</button>
  </div>    

  
<!-- Bloc de configuration du TOURNOIS -->
<div id="Tournois" class="tournois-config" style="display: none;">
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

  <!-- Noms des joueurs (5..16 masqués par défaut, à gérer en JS selon 4/8/16) -->
  <div id="tournamentPlayers" class="config-section player-list">
    <div class="player-row" data-index="1">
      <label for="playerName1">Joueur 1 :</label>
      <input
        id="playerName1"
        name="playerName1"
        type="text"
        class="input-style"
        placeholder="Joueur 1 (connecté)"
        value=""
      >
    </div>

    <div class="player-row" data-index="2">
      <label for="playerName2">Joueur 2 :</label>
      <input id="playerName2" name="playerName2" type="text" class="input-style" value="Joueur 2">
    </div>

    <div class="player-row" data-index="3">
      <label for="playerName3">Joueur 3 :</label>
      <input id="playerName3" name="playerName3" type="text" class="input-style" value="Joueur 3">
    </div>

    <div class="player-row" data-index="4">
      <label for="playerName4">Joueur 4 :</label>
      <input id="playerName4" name="playerName4" type="text" class="input-style" value="Joueur 4">
    </div>

    <div class="player-row" data-index="5" style="display: none;">
      <label for="playerName5">Joueur 5 :</label>
      <input id="playerName5" name="playerName5" type="text" class="input-style" value="Joueur 5">
    </div>

    <div class="player-row" data-index="6" style="display: none;">
      <label for="playerName6">Joueur 6 :</label>
      <input id="playerName6" name="playerName6" type="text" class="input-style" value="Joueur 6">
    </div>

    <div class="player-row" data-index="7" style="display: none;">
      <label for="playerName7">Joueur 7 :</label>
      <input id="playerName7" name="playerName7" type="text" class="input-style" value="Joueur 7">
    </div>

    <div class="player-row" data-index="8" style="display: none;">
      <label for="playerName8">Joueur 8 :</label>
      <input id="playerName8" name="playerName8" type="text" class="input-style" value="Joueur 8">
    </div>

    <div class="player-row" data-index="9" style="display: none;">
      <label for="playerName9">Joueur 9 :</label>
      <input id="playerName9" name="playerName9" type="text" class="input-style" value="Joueur 9">
    </div>

    <div class="player-row" data-index="10" style="display: none;">
      <label for="playerName10">Joueur 10 :</label>
      <input id="playerName10" name="playerName10" type="text" class="input-style" value="Joueur 10">
    </div>

    <div class="player-row" data-index="11" style="display: none;">
      <label for="playerName11">Joueur 11 :</label>
      <input id="playerName11" name="playerName11" type="text" class="input-style" value="Joueur 11">
    </div>

    <div class="player-row" data-index="12" style="display: none;">
      <label for="playerName12">Joueur 12 :</label>
      <input id="playerName12" name="playerName12" type="text" class="input-style" value="Joueur 12">
    </div>

    <div class="player-row" data-index="13" style="display: none;">
      <label for="playerName13">Joueur 13 :</label>
      <input id="playerName13" name="playerName13" type="text" class="input-style" value="Joueur 13">
    </div>

    <div class="player-row" data-index="14" style="display: none;">
      <label for="playerName14">Joueur 14 :</label>
      <input id="playerName14" name="playerName14" type="text" class="input-style" value="Joueur 14">
    </div>

    <div class="player-row" data-index="15" style="display: none;">
      <label for="playerName15">Joueur 15 :</label>
      <input id="playerName15" name="playerName15" type="text" class="input-style" value="Joueur 15">
    </div>

    <div class="player-row" data-index="16" style="display: none;">
      <label for="playerName16">Joueur 16 :</label>
      <input id="playerName16" name="playerName16" type="text" class="input-style" value="Joueur 16">
    </div>
  </div>

  <!-- Lancement du tournoi -->
  <div style="margin-top: 20px;">
    <button id="startTournamentBtn" class="btn-style">🚀 Lancer le tournoi</button>
  </div>
</div>

<div id="menu-game-config" style="display: none;" class="menu-game-config">
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
    <button id="startBtn" class="btn-style">🚀 Lancer la partie</button>
  </div>

</div>



  <div id="messageBox"></div>

  <div id="view-home" class="p-8 text-center">
    <h1 class="text-4xl font-bold text-blue-700 mb-2">Bienvenue sur Pong</h1>
    <p class="text-lg">Cliquer sur "Jouer" pour commencer.</p>
  </div>

  <div id="view-game" class="flex justify-center items-center">
    <div id="canvas-wrapper">  
      <canvas id="gameCanvas" width="800" height="600" class="rounded-lg shadow-lg"></canvas>
    </div>

    <div id="mobile-controls">
      <button id="btn-up" class="text-3xl p-4 bg-blue-500 text-white rounded-full shadow">⬆️</button>
      <button id="btn-down" class="text-3xl p-4 bg-blue-500 text-white rounded-full shadow">⬇️</button>
    </div>
  </div>

  
  `;
};

export default pong;
