const game_canvas: (container: HTMLElement) => void = (container) => {
	container.innerHTML = `  
	<div id="game_canvas" class="flex justify-center items-center">
    <div id="canvas-wrapper">  
      <canvas id="gameCanvas" width="800" height="600" class="rounded-lg shadow-lg"></canvas>
    </div>
	`;
};

export default game_canvas;