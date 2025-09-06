// src/pages/pong_lcl_conftourn.ts
const pong_lcl_conftourn: (container: HTMLElement) => void = (container) => {
  container.innerHTML = `
    <div class="min-h-[70vh] w-full flex items-center justify-center py-10">
      <div id="pong_lcl_conftourn"
           class="w-full max-w-xl rounded-2xl border bg-white shadow-sm p-6 sm:p-8">

        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold tracking-tight">PONG – RANKED</h1>
          <p class="text-sm text-gray-500 mt-1">Set up your local tournament before starting it</p>
        </div>

        <!-- Choix du nombre de joueurs -->
        <section class="mb-6">
          <fieldset class="space-y-3">
            <legend class="text-sm font-medium text-gray-700">Number of players</legend>
            <div class="flex flex-wrap gap-2">
              <label class="cursor-pointer">
                <input type="radio" name="tournamentSize" value="4" class="sr-only peer" checked>
                <span class="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm
                              text-gray-700 bg-white hover:bg-gray-50
                              peer-checked:border-blue-600 peer-checked:text-blue-700 peer-checked:bg-blue-50">
                  4 players
                </span>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="tournamentSize" value="8" class="sr-only peer">
                <span class="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm
                              text-gray-700 bg-white hover:bg-gray-50
                              peer-checked:border-blue-600 peer-checked:text-blue-700 peer-checked:bg-blue-50">
                  8 players
                </span>
              </label>
              <label class="cursor-pointer">
                <input type="radio" name="tournamentSize" value="16" class="sr-only peer">
                <span class="inline-flex items-center justify-center rounded-lg border px-3 py-1.5 text-sm
                              text-gray-700 bg-white hover:bg-gray-50
                              peer-checked:border-blue-600 peer-checked:text-blue-700 peer-checked:bg-blue-50">
                  16 players
                </span>
              </label>
            </div>
          </fieldset>
        </section>

        <!-- Noms des joueurs -->
        <section>
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Participants</h2>
          <div id="tournamentPlayers" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${Array.from({ length: 16 }, (_, i) => {
              const index = i + 1;
              
              const hidden = index > 4 ? 'hidden' : '';
              return `
                <div class="player-row ${hidden}" data-index="${index}">
                  <label for="playerName${index}" class="text-sm text-gray-700 block mb-1">Player ${index}</label>
                  <input
                    id="playerName${index}"
                    name="playerName${index}"
                    type="text"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    value="Player ${index}">
                </div>
              `;
            }).join("")}
          </div>
        </section>

        <!-- Actions -->
        <div class="pt-6 flex items-center justify-center">
          <button id="startTournamentBtn"
                  class="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
            Start the tournament
          </button>
        </div>
      </div>
    </div>
  `;

  // ⚡ Gestion dynamique des joueurs
  const radios = container.querySelectorAll<HTMLInputElement>('input[name="tournamentSize"]');
  const playerRows = container.querySelectorAll<HTMLDivElement>(".player-row");

  function updatePlayers(count: number) {
    playerRows.forEach((row) => {
      const index = parseInt(row.dataset.index || "0", 10);
      if (index <= count) {
        row.classList.remove("hidden");
      } else {
        row.classList.add("hidden");
      }
    });
  }

  // Valeur initiale = radio checked (par défaut 4)
  const checked = Array.from(radios).find(r => r.checked)?.value ?? "4";
  updatePlayers(parseInt(checked, 10));

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      updatePlayers(parseInt(radio.value, 10));
    });
  });
};

export default pong_lcl_conftourn;
