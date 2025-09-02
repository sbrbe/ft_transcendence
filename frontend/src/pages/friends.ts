import { acceptRequest, removeFriend, searchUser, sendFriendRequest, loadPendingRequest } from "../api/friends";
import { clearStatusMessage, lockButton, setStatusMessage } from "../utils/ui";
import { getSavedUser, setLoggedInUser, AppUser } from '../api/auth';
import { navigateTo } from '../router/router';

type SearchUserResult = {
  userId: string;
  username?: string;
  avatarPath?: string;
};

const friends: (container: HTMLElement) => void = (container) => {
    const saved = getSavedUser<AppUser>();
    if (!saved) {
      navigateTo('/connexion');
      return;
    }

  container.innerHTML = `
    <div class="container-page my-10 space-y-6">
      <header class="rounded-2xl border bg-white shadow-sm px-6 py-5 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-semibold tracking-tight">Friends</h1>
          <p class="text-sm text-gray-600">Manage your contacts, find new friends</p>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

<!-- Colonne principale : Liste d'amis -->
        <section class="lg:col-span-2 rounded-2xl border bg-white shadow-sm p-6">
          <ul class="mt-5 divide-y divide-gray-100">

<!-- exemples statiques -->

            <li class="py-3 flex items-center gap-4">
              <img src="/avatar/avatar1.png" class="h-10 w-10 rounded-xl ring-1 ring-black/10 object-cover" alt="">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-medium truncate">Nora</p>
                  <span class="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <span class="h-2 w-2 rounded-full bg-green-500"></span> En ligne
                  </span>
                </div>
              </div>
              <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Delete</button>
            </li>

            <li class="py-3 flex items-center gap-4">
              <img src="/avatar/avatar2.png" class="h-10 w-10 rounded-xl ring-1 ring-black/10 object-cover" alt="">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-medium truncate">Luca</p>
                  <span class="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                    <span class="h-2 w-2 rounded-full bg-gray-400"></span> Hors ligne
                  </span>
                </div>
              </div>
              <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Delete</button>
            </li>

            <li class="py-3 flex items-center gap-4">
              <img src="/avatar/avatar3.png" class="h-10 w-10 rounded-xl ring-1 ring-black/10 object-cover" alt="">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-medium truncate">Maya</p>
                  <span class="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <span class="h-2 w-2 rounded-full bg-green-500"></span> En ligne
                  </span>
                </div>
              </div>
              <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Delete</button>
            </li>


            <li class="py-3 flex items-center gap-4">
              <img src="/avatar/avatar3.png" class="h-10 w-10 rounded-xl ring-1 ring-black/10 object-cover" alt="">
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-medium truncate">Maya</p>
                  <span class="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <span class="h-2 w-2 rounded-full bg-green-500"></span> En ligne
                  </span>
                </div>
              </div>
              <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Delete</button>
            </li>
          </ul>

          <div class="mt-4 flex justify-between items-center text-sm">
            <p class="text-gray-500">View 1–10</p>
            <div class="flex items-center gap-2">
              <button class="px-3 py-1.5 rounded-lg border hover:bg-gray-50">Previous</button>
              <button class="px-3 py-1.5 rounded-lg border hover:bg-gray-50">Next</button>
            </div>
          </div>
        </section>


      
        <div class="space-y-6">
<!-- Ajouter un ami -->
          <section class="rounded-2xl border bg-white shadow-sm p-6">
            <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Add a friend</h2>

            <form id="add-friend-form" class="flex items-center gap-2">
              <input id="Username" type="text" placeholder="Username"
                     class="flex-1 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
              <button id="searchBtn" type="submit"
                      class="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm">
                Search
              </button>
            </form>

            
            <p class="text-xs text-gray-500 mt-2">Enter the username to send a request</p>
            <p id="add-msg" class="text-sm min-h-5 mt-2" aria-live="polite"></p>
<!-- résultat user trouvé -->
            <div id="search-results" class="mt-3"></div>

          </section>

          <!-- Demandes en attente (exemples) -->
          <section class="rounded-2xl border bg-white shadow-sm p-6">
            <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Pending requests</h2>
            <ul class="space-y-3">
              <li class="flex items-center gap-3">
                <img src="/avatar/avatar2.png" class="h-9 w-9 rounded-xl ring-1 ring-black/10 object-cover" alt="">
                <div class="min-w-0 flex-1"><p class="font-medium truncate">Sam</p></div>
                <div class="flex items-center gap-2">
                  <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50">Accept</button>
                  <button class="px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Decline</button>
                </div>
              </li>
              <li class="flex items-center gap-3">
                <img src="/avatar/avatar1.png" class="h-9 w-9 rounded-xl ring-1 ring-black/10 object-cover" alt="">
                <div class="min-w-0 flex-1"><p class="font-medium truncate">Zoé</p></div>
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
  const resultsEl = container.querySelector<HTMLDivElement>('#search-results')!;


  const addBtn = container.querySelector<HTMLButtonElement>('#addBtn')!;
  const acceptBtn = container.querySelector<HTMLButtonElement>('#acceptBtn')!;
  const rejectBtn = container.querySelector<HTMLButtonElement>('#rejectBtn')!;
  const pendingMsg = container.querySelector<HTMLParagraphElement>('#pending-msg')!;
  const removeBtn = container.querySelector<HTMLButtonElement>('#acceptBtn')!;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatusMessage(addMsg);
    resultsEl.innerHTML = "";

    const username = usernameEl.value.trim();
    if (!username) {
      return setStatusMessage(addMsg, 'Please enter a username', 'error');
    };

    lockButton(searchBtn, true);

    try {
      const res = await searchUser(username) as Partial<SearchUserResult>;
      const userId = res.userId;
      const name = res.username || username;
      const avatar = res.avatarPath || "/avatar/default.png";

      resultsEl.innerHTML = `
          <div class="flex items-center justify-between rounded-xl p-3">
            <div class="flex items-center gap-3 min-w-0">
              <img src="${avatar}" alt="" class="h-12 w-12 rounded-xl object-cover shrink-0">
              <div class="font-medium text-sm sm:text-base truncate">${name}</div>
            </div>
              <button id="addBtn" type="button"
                      class="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm"
                      data-user-id="${userId}" data-username="${name}">
                Add
              </button>
          </div>
        `;
        
      const addBtn = resultsEl.querySelector<HTMLButtonElement>('#addBtn')!;
      addBtn.addEventListener('click', async () => {
        clearStatusMessage(addMsg);
        lockButton(addBtn, true);
        try {
          await sendFriendRequest(addBtn.dataset.userId!, addBtn.dataset.username!);
          setStatusMessage(addMsg, "Friend request sent", "success");
          addBtn.textContent = "Sent";
          addBtn.disabled = true;
          addBtn.className = "px-3 py-1.5 rounded-lg bg-gray-300 text-white text-sm cursor-not-allowed";
          } catch (err: any) {
          setStatusMessage(addMsg, err?.message || "Invitation échouée", "error");
          lockButton(addBtn, false);
        }
      });
        } catch (error: any) {
      setStatusMessage(addMsg, error.message || 'Player search failed', 'error');
    }
    finally {
      lockButton(searchBtn, false);
    }
  });

  addBtn.addEventListener('click', async (e) => {
    clearStatusMessage(addMsg);

    lockButton(addBtn, true);

    try {
      await sendFriendRequest(saved.userId, username);
    } catch (error: any) {
      setStatusMessage(addMsg, error.message || 'Failed to send invitation', 'error');
    }
    finally {
      lockButton(addBtn, false);
    }
  });

  acceptBtn.addEventListener('click', async (e) => {
    clearStatusMessage(addMsg);

    lockButton(acceptBtn, true);

    try {
      await acceptRequest(saved.userId, requestId);
    } catch (error: any) {
      setStatusMessage(addMsg, error.message || 'Failed to accept invitation', 'error');
    }
    finally {
      lockButton(acceptBtn, false);
    }
  });
  
  rejectBtn.addEventListener('click', async (e) => {
    clearStatusMessage(addMsg);

    lockButton(rejectBtn, true);

    try {
      await sendFriendRequest(saved.userId, requestId);
    } catch (error: any) {
      setStatusMessage(addMsg, error.message || 'Failed to send invitation', 'error');
    }
    finally {
      lockButton(rejectBtn, false);
    }
  });  

  removeBtn.addEventListener('click', async (e) => {
    clearStatusMessage(addMsg);

    lockButton(removeBtn, true);

    try {
      await removeFriend(saved.userId, targetName);
    } catch (error: any) {
      setStatusMessage(addMsg, error.message || 'Failed to send invitation', 'error');
    }
    finally {
      lockButton(removeBtn, false);
    }
  }); 

  async function renderPendingRequest() {
    const list = document.querySelector('#pending-list');
    if (!list) return;

    list.innerHTML = ''; // à voir si ça sert

    try {
      const pending = await loadPendingRequest(saved.userId);
      if (!pending.length) {
        list.innerHTML = `<li class="text-sm text-gray-500">Aucune demande en attente.</li>`;
        return;
      } 
    } catch (error) {
      
    }
  }





};

export default friends;
