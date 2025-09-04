import pong_local from "../utils/pong/pong_local";
import pong_lcl_conftourn from "../utils/pong/pong_lcl_conftourn";
import pong_lcl_confplay from "../utils/pong/pong_lcl_confplay";
import mobile_controls from "../utils/pong/pong_mobile_control";
import game_canvas from "../utils/pong/pong_game_canva";


const pong: (container: HTMLElement) => void = (container) => {
  container.innerHTML = `
    <div id="pong-options" class="flex flex-col items-center justify-center mt-8 space-y-4">
      <button id="pong-local"  class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg text-lg w-48">Local</button>
      <button id="pong-online" class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg text-lg w-48">En ligne</button>
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
