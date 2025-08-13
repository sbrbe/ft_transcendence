import { friendsAPI } from "../api/friends";
import { profileAPI, type UserProfile } from "../api/profile";
import { BaseComponent } from "./BaseComponent";
import { Toast } from "./Toast";

export class UserSearchModal extends BaseComponent {
  private isSearching = false;
  private searchResults: UserProfile[] = [];
  private searchTimeout: number | null = null;
  private friendshipStatuses = new Map<number, string | null>();
  private searchInput: HTMLInputElement | null = null;
  private resultsContainer: HTMLElement | null = null;
  private handleInputBound = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const query = target.value.trim();
    this.handleSearch(query);
  };

  constructor() {
    super(
      "div",
      "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 hidden"
    );

    this.init();
    this.attachEventListeners();
  }

  protected init(): void {
    this.element.innerHTML = `
      <div class="card w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div class="card-header flex-row justify-between items-center">
          <h3 class="card-title">Search Users</h3>
          <button id="close-search-modal" class="btn btn-ghost btn-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div class="px-6 pb-6">
          <div class="mb-6">
            <div class="relative">
              <input
                type="text"
                id="user-search-input"
                class="input w-full pl-10"
                placeholder="Rechercher un utilisateur..."
                autocomplete="off"
              />
              <div id="search-spinner" class="absolute inset-y-0 right-0 pr-3 flex items-center hidden">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            </div>
          </div>

          <div id="search-results" class="max-h-96 overflow-y-auto">
            ${this.renderInitialState()}
          </div>
        </div>
      </div>
    `;

    this.searchInput = this.element.querySelector("#user-search-input") as HTMLInputElement;
    this.resultsContainer = this.element.querySelector("#search-results") as HTMLElement;
  }

  private attachEventListeners(): void {
    this.element.addEventListener("click", (e) => this.handleClick(e));
    
    this.element.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  public open(): void {
    this.element.classList.remove("hidden");
    
    this.searchInput = this.element.querySelector("#user-search-input") as HTMLInputElement;
    this.resultsContainer = this.element.querySelector("#search-results") as HTMLElement;
    
    if (!this.searchInput || !this.resultsContainer) {
      this.init();
      this.searchInput = this.element.querySelector("#user-search-input") as HTMLInputElement;
      this.resultsContainer = this.element.querySelector("#search-results") as HTMLElement;
    }
    
    this.searchResults = [];
    this.isSearching = false;
    
    if (this.searchInput) {
      this.searchInput.value = "";
    }
    
    this.updateSearchResults();

    setTimeout(() => {
      if (this.searchInput) {
        const parent = this.searchInput.parentElement;
        const newInput = document.createElement("input");
        newInput.type = "text";
        newInput.id = "user-search-input";
        newInput.className = "input w-full pl-10";
        newInput.autocomplete = "off";
        
        if (parent) {
          parent.replaceChild(newInput, this.searchInput);
          this.searchInput = newInput;
        }
        
        this.searchInput.focus();
        
        this.searchInput.removeEventListener("input", this.handleInputBound);
        this.searchInput.addEventListener("input", this.handleInputBound);
        
        const inputId = Math.random().toString(36);
        this.searchInput.dataset.debugId = inputId;
        
        this.searchInput.addEventListener("keydown", (e) => {
          
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            const currentValue = this.searchInput?.value || '';
            const newValue = currentValue + e.key;
            if (this.searchInput) {
              this.searchInput.value = newValue;
              const inputEvent = new Event('input', { bubbles: true });
              this.searchInput.dispatchEvent(inputEvent);
            }
          }
          
          if (e.key === 'Backspace') {
            e.preventDefault();
            const currentValue = this.searchInput?.value || '';
            const newValue = currentValue.slice(0, -1);
            if (this.searchInput) {
              this.searchInput.value = newValue;
              const inputEvent = new Event('input', { bubbles: true });
              this.searchInput.dispatchEvent(inputEvent);
            }
          }
        });
      }
    }, 100);
  }

  public close(): void {
    this.element.classList.add("hidden");
    this.searchResults = [];
    this.isSearching = false;
    
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = null;
    }
    
    if (this.searchInput) {
      this.searchInput.value = "";
      this.searchInput.removeEventListener("input", this.handleInputBound);
    }
  }

  private renderInitialState(): string {
    return `
      <div class="text-center py-8 text-muted-foreground">
        <svg class="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        <p>Start typing to search for users</p>
      </div>
    `;
  }

  private renderSearchResults(): string {
    if (this.isSearching) {
      return `
        <div class="flex justify-center py-8">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p class="text-muted-foreground">Searching...</p>
          </div>
        </div>
      `;
    }

    if (this.searchResults.length === 0) {
      return this.renderInitialState();
    }

    return `
      <div class="space-y-2">
        ${this.searchResults
          .map(
            (user) => `
          <div class="flex items-center space-x-4 p-4 hover:bg-muted rounded-lg cursor-pointer user-result" data-user-id="${user.id}">
            <img
              src="${user.avatar_url || profileAPI.getDefaultAvatarUrl(user.display_name)}"
              alt="Avatar of ${user.display_name}"
              class="w-12 h-12 rounded-full object-cover border-2 border-border"
            />
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <h4 class="font-semibold text-foreground">${user.display_name}</h4>
                ${user.is_verified ? this.renderVerifiedIcon() : ""}
              </div>
              <p class="text-sm text-muted-foreground">Click to view profile</p>
            </div>
            <svg class="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </div>
        `
          )
          .join("")}
      </div>
    `;
  }

  private renderVerifiedIcon(): string {
    return `
      <svg class="w-4 h-4 text-success" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
      </svg>
    `;
  }

  private handleClick(e: Event) {
    const target = e.target as HTMLElement;

    if (target.closest("#close-search-modal")) {
      this.close();
    }
    else if (target.closest(".user-result")) {
      const userId = target.closest<HTMLElement>(".user-result")?.dataset.userId;
      if (userId) {
        this.close();
        window.location.hash = `#/profile/${userId}`;
        window.dispatchEvent(new CustomEvent("hashchange"));
      }
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if ((e.target as HTMLElement).id === "user-search-input" && e.key === "Escape") {
      this.close();
    }
  }

  private handleSearch(query: string): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    
    if (!query || query.length < 2) {
      this.searchResults = [];
      this.updateSearchResults();
      return;
    }
    
    this.searchTimeout = window.setTimeout(async () => {
      await this.performSearch(query);
    }, 300);
  }

  private async performSearch(query: string): Promise<void> {
    if (this.isSearching) return;
    
    this.isSearching = true;
    this.updateLoadingState(true);
    this.updateSearchResults();
    
    try {
      const response = await profileAPI.searchUsers(query, 20);
      this.searchResults = response.users;
      await this.loadFriendshipStatuses();
    } catch (error) {
      console.error("Search error:", error);
      Toast.error("Error searching users");
      this.searchResults = [];
    } finally {
      this.isSearching = false;
      this.updateLoadingState(false);
      this.updateSearchResults();
    }
  }

  private async loadFriendshipStatuses(): Promise<void> {
    const statusPromises = this.searchResults.map(async (user) => {
      try {
        const response = await friendsAPI.getFriendshipStatus(user.id);
        this.friendshipStatuses.set(user.id, response.status);
      } catch {
        this.friendshipStatuses.set(user.id, null);
      }
    });
    await Promise.all(statusPromises);
  }

  private updateLoadingState(isLoading: boolean): void {
    const spinner = this.element.querySelector("#search-spinner");
    if (spinner) {
      spinner.classList.toggle("hidden", !isLoading);
    }
  }

  private updateSearchResults(): void {
    if (this.resultsContainer) {
      this.resultsContainer.innerHTML = this.renderSearchResults();
    }
  }
}

export const userSearchModal = new UserSearchModal();