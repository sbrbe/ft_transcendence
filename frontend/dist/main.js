var _a, _b;
import { Game } from './game.js';
const menuGameConfig = document.getElementById('menu-game-config');
const startBtn = document.getElementById('startBtn');
const canvas = document.getElementById('gameCanvas');
const modeSelect = document.getElementById('modeSelect');
const customConfigDiv_2vs2 = document.getElementById('custom-config_2vs2');
const customConfigDiv_1vs1 = document.getElementById('custom-config_1vs1');
(_a = document.getElementById('nav-game-config')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => {
    currentGame === null || currentGame === void 0 ? void 0 : currentGame.quitToMenu();
    currentGame = null;
    showView('nav-home');
    menuGameConfig.style.display = 'block';
    canvas.style.display = 'none';
});
let currentGame = null;
(_b = document.getElementById('nav-home')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => {
    currentGame === null || currentGame === void 0 ? void 0 : currentGame.quitToMenu();
    currentGame = null;
});
modeSelect.addEventListener('change', () => {
    customConfigDiv_2vs2.style.display = modeSelect.value === '2v2' ? 'block' : 'none';
    customConfigDiv_1vs1.style.display = modeSelect.value === '1v1' ? 'block' : 'none';
});
function getCustomPlayers(mode) {
    if (mode === '1v1') {
        const p1 = document.getElementById('player1-1v1').value;
        const p2 = document.getElementById('player2-1v1').value;
        return [p1, p2];
    }
    else {
        return ['player1', 'player2', 'player3', 'player4'].map(id => document.getElementById(id).value);
    }
}
function showView(viewId) {
    ['view-home', 'view-game', 'view-register'].forEach(id => {
        const el = document.getElementById(id);
        if (el)
            el.style.display = id === viewId ? 'block' : 'none';
    });
}
startBtn.addEventListener('click', () => {
    const mode = modeSelect.value;
    const config = { mode, playerSetup: getCustomPlayers(mode) };
    // 🔴 tue la partie précédente si elle existe
    currentGame === null || currentGame === void 0 ? void 0 : currentGame.quitToMenu();
    currentGame = null;
    menuGameConfig.style.display = 'none';
    canvas.style.display = 'block';
    showView('view-game');
    // ✅ garde la nouvelle référence
    currentGame = new Game(canvas, config);
    currentGame.start();
});
