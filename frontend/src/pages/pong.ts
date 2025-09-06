import pong_local from "../utils/pong/UI/pong_local";
import pong_lcl_conftourn, {TournamentPlayer, readTournamentConfig} from "../utils/pong/UI/pong_lcl_conftourn";
import pong_lcl_confplay, { readLocalPlayConfig, LocalPlayConfig } from "../utils/pong/UI/pong_lcl_confplay";
import { showMobileControls, hideMobileControls } from "../utils/pong/UI/pong_mobile_control";
import game_canvas from "../utils/pong/UI/pong_game_canva";
import { GameLocal } from "../utils/pong/launchers/local"
import { GameApp } from "../utils/pong/launchers/online"
import { GameTournament } from "../utils/pong/launchers/tournament"
import { GAME_RUNTIME } from "../utils/pong/launchers/runtime";

const PONG_ABORT = Symbol("pongAbort");

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

  (container as any)[PONG_ABORT]?.abort();

  const ac = new AbortController();
  (container as any)[PONG_ABORT] = ac;

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;

    if (target.closest("#pong-local")) {
      GAME_RUNTIME.stop();
      pong_local(container);
      return;
    }
    if (target.closest("#nav-game-configplay")) {
      GAME_RUNTIME.stop();
      pong_lcl_confplay(container);
      return;
    }
    if (target.closest("#nav-game-configtourn")) {
      GAME_RUNTIME.stop();
      pong_lcl_conftourn(container);
      return;
    }
    if (target.closest("#startTournamentBtn")) {
      const conf: TournamentPlayer[] = readTournamentConfig(container);
    //  hideMobileControls(container);
      game_canvas(container);
      const mount = container.querySelector("#game_canvas") as HTMLElement;
      const game = new GameTournament(conf);
      GAME_RUNTIME.start(game, mount);
      return;
    }
    if (target.closest("#pong-online")) {
    //  showMobileControls(container);
      game_canvas(container);
      const mount = container.querySelector("#game_canvas") as HTMLElement;
      const game = new GameApp();
      GAME_RUNTIME.start(game, mount);
      return;
    }
    if (target.closest("#startBtn_lcl_play")) {
      const conf: LocalPlayConfig = readLocalPlayConfig(container);
    //  hideMobileControls(container);
      game_canvas(container);
      const mount = container.querySelector("#game_canvas") as HTMLElement;
      const game = new GameLocal(conf);
      GAME_RUNTIME.start(game, mount);
      return;
    }
  };

  container.addEventListener("click", onClick, { signal: ac.signal });
};
export default pong;
