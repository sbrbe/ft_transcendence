const pong_local: (container: HTMLElement) => void = (container) => {
  container.innerHTML = `  
    <div class="text-center mt-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Mode Local</h1>
      <p class="text-lg text-gray-600 mb-6">
        Choisis ton type de partie et défie tes amis directement
      </p>
    </div>

    <div id="local-options" class="flex flex-row items-center justify-center space-x-10">
      <img id="nav-game-configplay" src="/site/casual_bouton.png" alt="Match Libre"
           class="cursor-pointer rounded-lg shadow-md hover:opacity-90"
           style="width: 200px; height: 280px;">
      <img id="nav-game-configtourn" src="/site/ranked_bouton.png" alt="Tournoi"
           class="cursor-pointer rounded-lg shadow-md hover:opacity-90"
           style="width: 200px; height: 280px;">
    </div> 
  `;
};

export default pong_local;
