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
    border: 2px solid blue;
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
	switch (mode) {
		case 0:
		  return `
			<span class="inline-flex items-center gap-2 mr-4 whitespace-nowrap text-xs">
			  <span>Player 1:</span> <kbd class="px-1 border rounded">Z</kbd> / <kbd class="px-1 border rounded">S</kbd>
			</span>
			<span class="inline-flex items-center gap-2 mr-4 whitespace-nowrap text-xs">
			  <span>Player 2:</span> <kbd class="px-1 border rounded">↑</kbd> / <kbd class="px-1 border rounded">↓</kbd>
			</span>
		  `;
		case 1:
		  return `
			<span class="inline-flex items-center gap-2 mr-4 whitespace-nowrap text-xs">
      <span>Player 1:</span>
        <kbd class="px-1 border rounded">↑</kbd>/<kbd class="px-1 border rounded">↓</kbd>
      <span class="opacity-60">ou</span>
        <kbd class="px-1 border rounded">Z</kbd>/<kbd class="px-1 border rounded">S</kbd>
      </span>
		  `;
		case 2:
		  return `
			<span class="inline-flex items-center gap-2 mr-4 whitespace-nowrap text-xs">
			  <span>Player 1:</span> <kbd class="px-1 border rounded">Z</kbd> / <kbd class="px-1 border rounded">S</kbd>
			</span>
			<span class="inline-flex items-center gap-2 mr-4 whitespace-nowrap text-xs">
			  <span>Player 2:</span> <kbd class="px-1 border rounded">↑</kbd> / <kbd class="px-1 border rounded">↓</kbd>
			</span>
			<span class="inline-flex items-center gap-2 mr-4 whitespace-nowrap text-xs">
			  <span>Player 3:</span> <kbd class="px-1 border rounded">E</kbd> / <kbd class="px-1 border rounded">D</kbd>
			</span>
			<span class="inline-flex items-center gap-2 mr-4 whitespace-nowrap text-xs">
			  <span>Player 4:</span> <kbd class="px-1 border rounded">I</kbd> / <kbd class="px-1 border rounded">K</kbd>
			</span>
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

  upsertLegend(layer, mode);
  const wrapper = document.getElementById("game_canvas");
  if (wrapper) {
    wrapper.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

export default game_canvas;