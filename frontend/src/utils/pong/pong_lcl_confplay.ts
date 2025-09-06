const pong_lcl_confplay: (container: HTMLElement) => void = (container) => {
	container.innerHTML = `  
	      <div class="min-h-[70vh] w-full flex items-center justify-center py-10">
      <div id="pong_lcl_confplay"
           class="w-full max-w-xl rounded-2xl border bg-white shadow-sm p-6 sm:p-8">

        <!-- Header -->
        <div class="text-center mb-6">
          <h1 class="text-2xl font-bold tracking-tight">PONG - CASUAL</h1>
          <p class="text-sm text-gray-500 mt-1">Set up your local match before starting the game</p>
        </div>

        <!-- Mode de jeu -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center mb-6">
          <label for="modeSelect" class="text-sm font-medium text-gray-700 sm:col-span-1">
            Game mode
          </label>
          <div class="sm:col-span-2">
            <select id="modeSelect"
                    class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="2v2" selected>2 vs 2</option>
              <option value="1v1">1 vs 1</option>
            </select>
          </div>
        </div>

        <!-- Configuration 2v2 -->
        <section id="custom-config_2vs2" class="mb-6">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Setup  2 vs 2</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-700 block mb-1">Paddle 1</label>
              <select id="player1"
                      class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="human" selected>Human</option>
                <option value="cpu">AI</option>
              </select>
            </div>
            <div>
              <label class="text-sm text-gray-700 block mb-1">Paddle 2</label>
              <select id="player2"
                      class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="human">Human</option>
                <option value="cpu" selected>AI</option>
              </select>
            </div>
            <div>
              <label class="text-sm text-gray-700 block mb-1">Paddle 3</label>
              <select id="player3"
                      class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="human">Human</option>
                <option value="cpu" selected>AI</option>
              </select>
            </div>
            <div>
              <label class="text-sm text-gray-700 block mb-1">Paddle 4</label>
              <select id="player4"
                      class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="human">Human</option>
                <option value="cpu" selected>AI</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Configuration 1v1 -->
        <section id="custom-config_1vs1" class="mb-6 hidden">
          <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Setup 1 vs 1</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-700 block mb-1">Paddle 1</label>
              <select id="player1-1v1"
                      class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="human" selected>Human</option>
                <option value="cpu">AI</option>
              </select>
            </div>
            <div>
              <label class="text-sm text-gray-700 block mb-1">Paddle 2</label>
              <select id="player2-1v1"
                      class="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="human">Human</option>
                <option value="cpu" selected>AI</option>
              </select>
            </div>
          </div>
        </section>

        <!-- Actions -->
        <div class="pt-2 flex items-center justify-center">
          <button id="startBtn_lcl_play"
                  class="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1">
            Start the game
          </button>
        </div>
      </div>
    </div>
  `;
  
	const modeSelect = container.querySelector<HTMLSelectElement>("#modeSelect")!;
	const config2v2  = container.querySelector<HTMLDivElement>("#custom-config_2vs2")!;
	const config1v1  = container.querySelector<HTMLDivElement>("#custom-config_1vs1")!;
  
	modeSelect.addEventListener("change", () => {
	  if (modeSelect.value === "1v1") {
		config2v2.style.display = "none";
		config1v1.style.display = "block";
	  } else {
		config1v1.style.display = "none";
		config2v2.style.display = "block";
	  }
	});
  };
  
  export default pong_lcl_confplay;
  