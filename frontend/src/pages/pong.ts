import pong_local from "../utils/pong/pong_local";
import pong_lcl_conftourn from "../utils/pong/pong_lcl_conftourn";
import pong_lcl_confplay from "../utils/pong/pong_lcl_confplay";
import mobile_controls from "../utils/pong/pong_mobile_control";
import game_canvas from "../utils/pong/pong_game_canva";


const pong: (container: HTMLElement) => void = (container) => {
  container.innerHTML = `
    <div class="text-center mt-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Jouer au Pong</h1>
      <p class="text-lg text-gray-600 mb-6">
        Sélectionne ton mode de jeu préféré et commence à surprendre tes adversaires
      </p>
    </div>

    <div id="pong-options" class="flex flex-row items-center justify-center space-x-10">
      <img id="pong-local" src="/site/local_bouton.png" alt="Local mode"
           class="cursor-pointer rounded-lg shadow-md hover:opacity-90"
           style="width: 200px; height: 280px;">
      <img id="pong-online" src="/site/online_bouton.png" alt="Online mode"
           class="cursor-pointer rounded-lg shadow-md hover:opacity-90"
           style="width: 200px; height: 280px;">
    </div>
  `;

  container.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;

    if (target.closest("#pong-local")) {
      pong_local(container);
      return;
    }
    if (target.closest("#nav-game-configplay")) {
      pong_lcl_confplay(container);
      return;
    }
    if (target.closest("#nav-game-configtourn")) {
      pong_lcl_conftourn(container);
      return;
    }
    if (target.closest("#pong-online")) {
      mobile_controls(container);
      return;
    }
    if (target.closest("#startBtn_lcl_play") || target.closest("#pong-online") || target.closest("#startTournamentBtn")) {
      game_canvas(container);
      return;
    }
  });
};

export default pong;
