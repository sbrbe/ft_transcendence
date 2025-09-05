const pong_local: (container: HTMLElement) => void = (container) => {
	container.innerHTML = `  
	<div id="local-options" class="flex flex-col items-center justify-center mt-8 space-y-4 space-x-4">
	  <button id="nav-game-configplay" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">🎮 Match Libre ⚡</button>
	  <button id="nav-game-configtourn" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">🎮 Tournois</button>
	</div>
	`;
};

export default pong_local;