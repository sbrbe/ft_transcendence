import { authAPI } from "../api/auth";
import { gameAPI } from "../api/game";
import { BaseComponent } from "../components/BaseComponent";
import { Toast } from "../components/Toast";
import { navigateToView, ViewType } from "../utils/navigation";

interface WaitingGame {
  gameId: string;
  createdAt: string;
  playersCount: number;
}

export class PlayMenuPage extends BaseComponent {
  private waitingGames: WaitingGame[] = [];
  private refreshInterval: number = 0;

  constructor() {
    super("div", "min-h-screen bg-background");
  }

  protected init(): void {
    this.renderPage();
    this.loadWaitingGames();
    this.startAutoRefresh();
  }

  private renderPage(): void {
    this.element.innerHTML = `
      <div class="container-responsive py-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-foreground mb-4">Play Pong</h1>
          <p class="text-muted-foreground text-lg">Choose your game mode</p>
        </div>

        <div class="max-w-4xl mx-auto">
          <div class="grid md:grid-cols-2 gap-8 mb-8">
            <div class="card">
              <div class="card-content text-center">
              <div class="flex flex-row gap-2 items-center justify-center">
              <svg viewBox="0 0 24 24" id="Layer_1" fill="currentColor" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" class="size-8 mt-1"><path d="M21.261,2.739A9.836,9.836,0,0,0,8.3,2.114,4.489,4.489,0,1,0,4.134,8.963a9.415,9.415,0,0,0,.842,5.668.5.5,0,0,1-.07.564L2,16.945A3.743,3.743,0,0,0,3.735,24a3.891,3.891,0,0,0,.457-.027,3.705,3.705,0,0,0,2.725-1.735l2.068-3.127a.5.5,0,0,1,.575-.089,9.663,9.663,0,0,0,11.315-2.147A10.5,10.5,0,0,0,24,9.758,9.409,9.409,0,0,0,21.261,2.739ZM2,4.5A2.5,2.5,0,1,1,4.5,7,2.5,2.5,0,0,1,2,4.5Zm8.44,12.726a2.494,2.494,0,0,0-3.017.632c-.024.029-.046.059-.067.09L5.229,21.166A1.742,1.742,0,0,1,2.02,20a1.76,1.76,0,0,1,.961-1.312l3.041-1.831a.956.956,0,0,0,.126-.09,2.49,2.49,0,0,0,.623-3.016,7.331,7.331,0,0,1-.693-4.259l8.433,8.433A7.31,7.31,0,0,1,10.44,17.226Zm9.021-1.765a8.871,8.871,0,0,1-2.732,1.865c-.009-.01-.012-.023-.022-.033L7.36,7.945A4.473,4.473,0,0,0,9,4.5c0-.119-.026-.231-.035-.347a8.01,8.01,0,0,1,10.882,0A7.423,7.423,0,0,1,22,9.7,8.506,8.506,0,0,1,19.461,15.461Z"/></svg>
                <h3 class="card-title">Local Game</h3>
                </div>
                <p class="card-description mb-4">Play with a friend on the same device</p>
                <ul class="text-sm text-muted-foreground mb-4 text-left space-y-1">
                  <li>• Player 1: W/S keys</li>
                  <li>• Player 2: ↑/↓ arrow keys</li>
                  <li>• First to 11 points wins</li>
                </ul>
                <button id="local-game-btn" class="btn btn-primary w-full font-semibold">
                  Start Local Game
                </button>
              </div>
            </div>

            <div class="card">
              <div class="card-content text-center">
              <div class="flex flex-row gap-2 items-center justify-center">
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-globe-icon lucide-globe"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
<h3 class="card-title">Online Game</h3>
</div>
                <p class="card-description mb-4">Play against other players online</p>
                <ul class="text-sm text-muted-foreground mb-4 text-left space-y-1">
                  <li>• Real-time multiplayer</li>
                  <li>• Server-side game logic</li>
                  <li>• Competitive scoring</li>
                </ul>
                <div class="space-y-3">
                  <button id="create-game-btn" class="btn btn-success w-full font-semibold">
                    Create Online Game
                  </button>
                  <button id="refresh-games-btn" class="btn btn-secondary w-full text-sm">
                    Refresh Games List
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="card-header">
              <div class="flex items-center justify-between">
                <h3 class="card-title">Join Existing Games</h3>
                <span id="games-count" class="text-sm text-muted-foreground">0 games waiting</span>
              </div>
            </div>
            <div class="card-content">
              <div id="waiting-games-list" class="space-y-3">
                <div class="text-center text-muted-foreground py-8">
                  <p>No games waiting for players</p>
                  <p class="text-sm">Create a new game or refresh the list</p>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center mt-8">
            <button id="back-btn" class="btn btn-secondary font-semibold">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    `;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const localGameBtn = this.element.querySelector(
      "#local-game-btn"
    ) as HTMLButtonElement;
    const createGameBtn = this.element.querySelector(
      "#create-game-btn"
    ) as HTMLButtonElement;
    const refreshGamesBtn = this.element.querySelector(
      "#refresh-games-btn"
    ) as HTMLButtonElement;
    const backBtn = this.element.querySelector(
      "#back-btn"
    ) as HTMLButtonElement;

    localGameBtn.addEventListener("click", () => this.startLocalGame());
    createGameBtn.addEventListener("click", () => this.createOnlineGame());
    refreshGamesBtn.addEventListener("click", () => this.loadWaitingGames());
    backBtn.addEventListener("click", () => this.goBack());
  }

  private startLocalGame(): void {
    navigateToView(ViewType.PLAY_LOCAL);
  }

  private async createOnlineGame(): Promise<void> {
    if (!authAPI.isAuthenticated()) {
      Toast.error("You must be logged in to play online");
      return;
    }

    const createBtn = this.element.querySelector(
      "#create-game-btn"
    ) as HTMLButtonElement;
    createBtn.disabled = true;
    createBtn.textContent = "Creating...";

    try {
      const result = await gameAPI.createGame();
      Toast.success("Game created successfully!");

      sessionStorage.setItem("currentGameId", result.gameId);
      navigateToView(ViewType.PLAY_ONLINE);
    } catch (error: any) {
      console.error("Failed to create game:", error);
      Toast.error(error.message || "Failed to create game");
    } finally {
      createBtn.disabled = false;
      createBtn.textContent = "Create Online Game";
    }
  }

  private async loadWaitingGames(): Promise<void> {
    if (!authAPI.isAuthenticated()) {
      this.renderWaitingGames([]);
      return;
    }

    try {
      const result = await gameAPI.getWaitingGames();
      this.waitingGames = result.games;
      this.renderWaitingGames(this.waitingGames);
    } catch (error: any) {
      console.error("Failed to load waiting games:", error);
      this.renderWaitingGames([]);
    }
  }

  private renderWaitingGames(games: WaitingGame[]): void {
    const gamesList = this.element.querySelector(
      "#waiting-games-list"
    ) as HTMLElement;
    const gamesCount = this.element.querySelector(
      "#games-count"
    ) as HTMLElement;

    gamesCount.textContent = `${games.length} games waiting`;

    if (games.length === 0) {
      gamesList.innerHTML = `
        <div class="text-center text-muted-foreground py-8">
          <p>No games waiting for players</p>
          <p class="text-sm">Create a new game to start playing</p>
        </div>
      `;
      return;
    }

    gamesList.innerHTML = games
      .map(
        (game) => `
      <div class="card">
        <div class="card-content">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3">
                <div class="text-success">●</div>
                <div>
                  <p class="font-medium text-foreground">Game ${game.gameId.substring(
                    0,
                    8
                  )}...</p>
                  <p class="text-sm text-muted-foreground">
                    Created ${this.formatTimeAgo(game.createdAt)} • ${
          game.playersCount
        }/2 players
                  </p>
                </div>
              </div>
            </div>
            <button
              class="join-game-btn btn btn-primary text-sm font-medium"
              data-game-id="${game.gameId}"
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    `
      )
      .join("");

    const joinButtons = gamesList.querySelectorAll(".join-game-btn");
    joinButtons.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const gameId = (e.target as HTMLElement).getAttribute("data-game-id");
        if (gameId) this.joinGame(gameId);
      });
    });
  }

  private async joinGame(gameId: string): Promise<void> {
    if (!authAPI.isAuthenticated()) {
      Toast.error("You must be logged in to join games");
      return;
    }

    const button = this.element.querySelector(
      `[data-game-id="${gameId}"]`
    ) as HTMLButtonElement;
    button.disabled = true;
    button.textContent = "Joining...";

    try {
      await gameAPI.joinGame(gameId);
      Toast.success("Joined game successfully!");

      sessionStorage.setItem("currentGameId", gameId);
      navigateToView(ViewType.PLAY_ONLINE);
    } catch (error: any) {
      Toast.error(error.message || "Failed to join game");
      button.disabled = false;
      button.textContent = "Join Game";
    }
  }

  private formatTimeAgo(dateString: string): string {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffMinutes < 1) return "just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return created.toLocaleDateString();
  }

  private startAutoRefresh(): void {
    this.refreshInterval = window.setInterval(() => {
      if (authAPI.isAuthenticated()) {
        this.loadWaitingGames();
      }
    }, 5000);
  }

  private goBack(): void {
    navigateToView(ViewType.DASHBOARD);
  }

  public destroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    super.destroy();
  }
}

export async function createPlayMenuPage(): Promise<HTMLElement> {
  const page = new PlayMenuPage();
  return page.render();
}
