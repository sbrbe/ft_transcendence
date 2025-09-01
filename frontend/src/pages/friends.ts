import { searchUser } from "../api/friends";
import { clearStatusMessage, lockButton, setStatusMessage } from "../utils/ui";

const friends: (container: HTMLElement) => void = (container) => {
  container.innerHTML = `
    <div class="container-page my-10 space-y-6">

<!-- En-tête -->
      <header class="rounded-2xl border bg-white shadow-sm px-6 py-5 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Friends</h1>
          <p class="text-sm text-gray-600">Manage your contacts, find new friends</p>
        </div>
        <div class="text-right">
          <div class="text-sm text-gray-600">Total</div>
          <div class="text-2xl font-semibold"><span id="friends-count">12</span></div>
        </div>
      </header>

      
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
<!-- Colonne principale : Liste d'amis -->
        <section class="lg:col-span-2 rounded-2xl border bg-white shadow-sm p-6">

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
<!-- Barre Recherche -->
            <div class="relative w-full sm:w-72">
              <input
                type="search"
                placeholder="Search for a friend…"
                class="w-full border rounded-xl pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                aria-label="Search for a friend…">
              <svg viewBox="0 0 20 20" class="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" aria-hidden="true">
                <path fill="currentColor" d="M13.9 12.5l3.3 3.3-1.4 1.4-3.3-3.3a7 7 0 1 1 1.4-1.4zM8.5 13a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z"/>
              </svg>
            </div>
          </div>


          <ul class="mt-5 divide-y divide-gray-100">
<!-- Ami en ligne -->

<!-- Ami n°1 -->
            <li class="py-3 flex items-center gap-4">
              <img src="/avatar/avatar1.png" alt="" class="h-10 w-10 rounded-xl ring-1 ring-black/10 object-cover">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-medium truncate">Nora</p>
                  <span class="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <span class="h-2 w-2 rounded-full bg-green-500"></span> En ligne
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Delete</button>
              </div>
            </li>
<!-- Ami n°2 hors ligne -->
            <li class="py-3 flex items-center gap-4">
              <img src="/avatar/avatar2.png" alt="" class="h-10 w-10 rounded-xl ring-1 ring-black/10 object-cover">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-medium truncate">Luca</p>
                  <span class="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                    <span class="h-2 w-2 rounded-full bg-gray-400"></span> Hors ligne
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Delete</button>
              </div>
            </li>
<!-- Ami n°3 -->
            <li class="py-3 flex items-center gap-4">
              <img src="/avatar/avatar3.png" alt="" class="h-10 w-10 rounded-xl ring-1 ring-black/10 object-cover">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-medium truncate">Maya</p>
                  <span class="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <span class="h-2 w-2 rounded-full bg-green-500"></span> En ligne
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Delete</button>
              </div>
            </li>
          </ul>

<!-- Pagination -->
          <div class="mt-4 flex justify-between items-center text-sm">
            <p class="text-gray-500">View 1–10</p>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1.5 rounded-lg border hover:bg-gray-50">Previous</button>
              <button class="px-3 py-1.5 rounded-lg border hover:bg-gray-50">Next</button>
            </div>
          </div>
        </section>


<!-- Colonne droite : Ajout / Suggestions / Demandes -->
        <div class="space-y-6">
          <!-- Ajouter un ami -->
          <section class="rounded-2xl border bg-white shadow-sm p-6">
            <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Add a friend</h2>
            <form id="add-friend-form" class="flex items-center gap-2">
              <input id="Username"
                type="text"
                placeholder="Username"
                class="flex-1 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">

                <p id="add-msg" class="text-sm min-h-5" aria-live="polite"></p>

                <button id="searchBtn" type="submit"
                 class="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm">Search
                </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">Enter the username to send a request</p>
          </section>



<!-- Demandes en attente -->
          <section class="rounded-2xl border bg-white shadow-sm p-6">
            <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Pending requests</h2>
            <ul class="space-y-3">
              <li class="flex items-center gap-3">
                <img src="/avatar/avatar2.png" class="h-9 w-9 rounded-xl ring-1 ring-black/10 object-cover" alt="">
                <div class="min-w-0 flex-1">
                  <p class="font-medium truncate">Sam</p>
                </div>
                <div class="flex items-center gap-2">
                  <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50">Accept</button>
                  <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Decline</button>
                </div>
              </li>
              <li class="flex items-center gap-3">
                <img src="/avatar/avatar1.png" class="h-9 w-9 rounded-xl ring-1 ring-black/10 object-cover" alt="">
                <div class="min-w-0 flex-1">
                  <p class="font-medium truncate">Zoé</p>
                </div>
                <div class="flex items-center gap-2">
                  <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50">Accept</button>
                  <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Decline</button>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  `;

  const form = container.querySelector<HTMLFormElement>('#add-friend-form')!;
  const usernameEl = container.querySelector<HTMLInputElement>('#Username')!;
  const addMsg = container.querySelector<HTMLParagraphElement>('#add-msg')!;
  const searchBtn = container.querySelector<HTMLButtonElement>('#searchBtn')!;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatusMessage(addMsg);
    const username = usernameEl.value.trim();
    if (!username){
      return setStatusMessage(addMsg, 'Please enter a username', 'error');
    }

    lockButton(searchBtn, true);

    try {
      const { userId, avatarPath } = await searchUser(username);
    } catch (error: any) {
      setStatusMessage(addMsg, error.message || 'Player search failed', 'error');
    }
    finally {
      lockButton(searchBtn, false);
    }
  });
};

export default friends;
