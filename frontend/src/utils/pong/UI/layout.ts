export function ensurePongLayout(container: HTMLElement) {
	if (!container.querySelector("#view-game")) {
	  container.innerHTML = `
		<div id="view-game" class="relative flex flex-col items-center gap-4">
		  <div id="ui-layer"></div>
		  <div id="canvas-layer"></div>
		</div>
	  `;
	}
  }
  