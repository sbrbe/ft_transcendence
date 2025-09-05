import { ensurePongLayout } from "./layout";

function ensureGameCanvasStyle() {
	const STYLE_ID = "game-canvas-style";
	if (document.getElementById(STYLE_ID)) return;
  
	const css = `
	:root { --canvas-scale: 0.90; } /* 90% */
  
	/* Conteneur plein écran + centrage */
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
	  display: flex;
	  justify-content: center;
	  align-items: center;
	}
  
	/* Ton style demandé pour #gameCanvas */
	#gameCanvas {
	  background: #000;
	  border: 2px solid red;
	  z-index: 20;
	  aspect-ratio: 4 / 3;
  
	  /* 90% de l’espace utile, en respectant 4:3 */
	  width: min(calc(100vw * var(--canvas-scale)),
				 calc(100dvh * var(--canvas-scale) * 4 / 3));
	  height: auto;
	  max-height: calc(100dvh * var(--canvas-scale));
	  border-radius: .5rem; /* pour matcher "rounded-lg" si tu veux garder l'effet */
	  box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1);
	}
	`;
  
	const style = document.createElement("style");
	style.id = STYLE_ID;
	style.textContent = css;
	document.head.appendChild(style);
  }
  
  
  const game_canvas = (container: HTMLElement) => {
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
	`);
	}
  };
  
  export default game_canvas;
  