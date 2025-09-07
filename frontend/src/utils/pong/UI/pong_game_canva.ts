import { ensurePongLayout } from "./layout";

function ensureGameCanvasStyle() {
  const STYLE_ID = "game-canvas-style";
  if (document.getElementById(STYLE_ID)) return;

  const css = `
  :root { --canvas-scale: 0.90; }

  #game_canvas {
    position: relative;
    min-height: 100dvh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 12px;
    box-sizing: border-box;
    overflow: hidden;
  }

  #canvas-wrapper {
    position: relative; /* important pour l'overlay */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  #gameCanvas {
    background: #000;
    border: 2px solid red;
    z-index: 20;
    aspect-ratio: 4 / 3;
    width: min(calc(100vw * var(--canvas-scale)),
               calc(100dvh * var(--canvas-scale) * 4 / 3));
    height: auto;
    max-height: calc(100dvh * var(--canvas-scale));
    border-radius: .5rem;
    box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1);
  }

  /* Overlay légende touches */
  #controls-legend {
    position: absolute;
    left: 8px;
    right: 8px;
    bottom: 8px;
    z-index: 30;
    pointer-events: none; /* ne bloque pas les clics/gestes sur le canvas */
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    font-size: 12px;
    line-height: 1.35;
    color: #e5e7eb; /* gris clair */
  }
  #controls-legend .panel {
    display: inline-block;
    background: rgba(0,0,0,0.65);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    padding: 8px 10px;
    backdrop-filter: blur(2px);
  }
  #controls-legend .title {
    font-weight: 700;
    color: #f3f4f6;
    margin-bottom: 4px;
    display: block;
  }
  #controls-legend .row {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 12px;
    white-space: nowrap;
  }
  #controls-legend kbd {
    display: inline-block;
    padding: 1px 6px;
    border: 1px solid rgba(255,255,255,0.25);
    border-bottom-width: 2px;
    border-radius: 6px;
    background: rgba(17,24,39,0.7);
    color: #f9fafb;
    font-weight: 600;
    margin-left: 6px;
  }

  @media (max-width: 520px) {
    #controls-legend { font-size: 11px; }
  }
  `;
  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

function legendForMode(mode: number) {
  // mode 0: J1 Z/S — J2 ↑/↓
  // mode 1: J1 ↑/↓ (solo ? ou switch ?) -> d'après ta demande: "jouer 1 flèche/fleche"
  // mode 2: J1 Z/S — J2 ↑/↓ — J3 I/K — J4 R/F
  switch (mode) {
    case 0:
      return `
        <span class="title">Contrôles</span>
        <div class="row"><span>Joueur 1</span><span><kbd>Z</kbd> / <kbd>S</kbd></span></div>
        <div class="row"><span>Joueur 2</span><span><kbd>Flèche ↑</kbd> / <kbd>Flèche ↓</kbd></span></div>
      `;
    case 1:
      return `
        <span class="title">Contrôles</span>
        <div class="row"><span>Joueur 1</span><span><kbd>Flèche ↑</kbd> / <kbd>Flèche ↓</kbd></span></div>
      `;
    case 2:
      return `
        <span class="title">Contrôles</span>
        <div class="row"><span>Joueur 1</span><span><kbd>Z</kbd> / <kbd>S</kbd></span></div>
        <div class="row"><span>Joueur 2</span><span><kbd>Flèche ↑</kbd> / <kbd>Flèche ↓</kbd></span></div>
        <div class="row"><span>Joueur 3</span><span><kbd>E</kbd> / <kbd>D</kbd></span></div>
        <div class="row"><span>Joueur 4</span><span><kbd>I</kbd> / <kbd>K</kbd></span></div>
      `;
  }
}

function upsertLegend(container: HTMLElement, mode: number) {
  const wrapper = container.querySelector("#canvas-wrapper") as HTMLElement | null;
  if (!wrapper) return;
  let legend = wrapper.querySelector("#controls-legend") as HTMLDivElement | null;
  if (!legend) {
    legend = document.createElement("div");
    legend.id = "controls-legend";
    legend.innerHTML = `<div class="panel">${legendForMode(mode)}</div>`;
    wrapper.appendChild(legend);
  } else {
    legend.innerHTML = `<div class="panel">${legendForMode(mode)}</div>`;
  }
}

const game_canvas = (container: HTMLElement, mode: number) => {
  ensureGameCanvasStyle();
  ensurePongLayout(container);

  const layer = container.querySelector("#canvas-layer") as HTMLElement;
  if (!layer.querySelector("#game_canvas")) {
    layer.insertAdjacentHTML(
      "beforeend",
      `
      <div id="game_canvas">
        <div id="canvas-wrapper">
          <canvas id="gameCanvas" width="800" height="600"></canvas>
        </div>
      </div>
      `
    );
  }

  // Met à jour la légende des touches selon le mode
  upsertLegend(layer, mode);
};

export default game_canvas;