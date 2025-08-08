import { Game } from './game.js';

type PlayerType = "human" | "cpu" | null;
type GameMode = "1v1" | "2v2";

const menuGameConfig = document.getElementById('menu-game-config')!;
const startBtn = document.getElementById('startBtn')!;
const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
const modeSelect = document.getElementById('modeSelect') as HTMLSelectElement;
const customConfigDiv_2vs2 = document.getElementById('custom-config_2vs2')!;
const customConfigDiv_1vs1 = document.getElementById('custom-config_1vs1')!;

document.getElementById('nav-game-config')?.addEventListener('click', () => {
  currentGame?.quitToMenu();
  currentGame = null;
  showView('nav-home');
  menuGameConfig.style.display = 'block';
  canvas.style.display = 'none';
});

let currentGame: Game | null = null;

document.getElementById('nav-home')?.addEventListener('click', () => {
  currentGame?.quitToMenu();
  currentGame = null;
});

modeSelect.addEventListener('change', () => {
  customConfigDiv_2vs2.style.display = modeSelect.value === '2v2' ? 'block' : 'none';
  customConfigDiv_1vs1.style.display = modeSelect.value === '1v1' ? 'block' : 'none';
});

function getCustomPlayers(mode: GameMode): PlayerType[] {
  if (mode === '1v1') {
    const p1 = (document.getElementById('player1-1v1') as HTMLSelectElement).value as PlayerType;
    const p2 = (document.getElementById('player2-1v1') as HTMLSelectElement).value as PlayerType;
    return [p1, p2];
  } else {
    return ['player1','player2','player3','player4'].map(
      id => (document.getElementById(id) as HTMLSelectElement).value as PlayerType
    );
  }
}

function showView(viewId: string) {
  ['view-home','view-game','view-register'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === viewId ? 'block' : 'none';
  });
}

startBtn.addEventListener('click', () => {
  const mode = modeSelect.value as GameMode;
  const config = { mode, playerSetup: getCustomPlayers(mode) };

  // 🔴 tue la partie précédente si elle existe
  currentGame?.quitToMenu();
  currentGame = null;

  menuGameConfig.style.display = 'none';
  canvas.style.display = 'block';
  showView('view-game');

  // ✅ garde la nouvelle référence
  currentGame = new Game(canvas, config);
  currentGame.start();
});
