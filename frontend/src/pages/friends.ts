import { acceptRequest, removeFriend, searchUser, sendFriendRequest, loadPendingRequest, rejectRequest, loadFriendsList } from "../api/friends";
import { clearStatusMessage, lockButton, setStatusMessage } from "../utils/ui";
import { getSavedUser, setLoggedInUser } from '../utils/ui';
import { AppUser } from "../utils/interface";
import { navigateTo } from '../router/router';

type SearchUserResult = {
  userId: string;
  username: string;
  avatarPath: string;
};

type PendingRequest = {
  requestId: number;
  friendId: string;
  friendUsername: string;
  friendAvatarPath?: string;
};

type Friend = {
  requestId: number;
  friendId: string;
  friendUsername: string;
  friendAvatarPath: string;
  isOnline: boolean;
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
      <section class="rounded-2xl border bg-white shadow-sm p-6">
         <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">FRIENDS LIST</h2>

        <ul id="friends-list" class="space-y-3"></ul>
        <p id="friends-msg" class="text-sm mt-2 min-h-5" aria-live="polite"></p>

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

          <!-- Demandes en attente -->
          <section class="rounded-2xl border bg-white shadow-sm p-6">
            <h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Pending requests</h2>
            <ul id="pending-list" class="space-y-3"></ul>
            <p id="pending-msg" class="text-sm min-h-5 mt-2" aria-live="polite"></p>
          </section>
        </div>
      </div>
    </div>
  `;

  renderPendingRequest(saved);
  renderFriendsList(saved);

  const form = container.querySelector<HTMLFormElement>('#add-friend-form')!;
  const usernameEl = container.querySelector<HTMLInputElement>('#Username')!;
  const addMsg = container.querySelector<HTMLParagraphElement>('#add-msg')!;
  const searchBtn = container.querySelector<HTMLButtonElement>('#searchBtn')!;
  const resultsEl = container.querySelector<HTMLDivElement>('#search-results')!;

//  const acceptBtn = container.querySelector<HTMLButtonElement>('#acceptBtn')!;
//  const rejectBtn = container.querySelector<HTMLButtonElement>('#rejectBtn')!;
//  const pendingMsg = container.querySelector<HTMLParagraphElement>('#pending-msg')!;
//  const removeBtn = container.querySelector<HTMLButtonElement>('#acceptBtn')!;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearStatusMessage(addMsg);
    resultsEl.innerHTML = "";

    const username = usernameEl.value.trim();
    if (!username) {
      return setStatusMessage(addMsg, 'Please enter a username', 'error');
    };

    if (username === saved.username) {
      return setStatusMessage(addMsg, "You can't search yourself", 'error');
    }

    lockButton(searchBtn, true);

    try {
      const res = await searchUser(username) as SearchUserResult;
      const searchedUserId = res.userId;
      const avatar = res.avatarPath || "/avatar/default.png";

      resultsEl.innerHTML = `
          <div class="flex items-center justify-between rounded-xl p-3">
            <div class="flex items-center gap-3 min-w-0">
              <img src="${avatar}" alt="" class="h-12 w-12 rounded-xl object-cover shrink-0">
              <div class="font-medium text-sm sm:text-base truncate">${username}</div>
            </div>
              <button id="addBtn" type="button"
                      class="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm"
                      data-user-id="${searchedUserId}" data-username="${username}">
                Add
              </button>
          </div>
        `;
        
      const addBtn = resultsEl.querySelector<HTMLButtonElement>('#addBtn')!;
      addBtn.addEventListener('click', async () => {
        clearStatusMessage(addMsg);
        lockButton(addBtn, true);
        try {
          await sendFriendRequest(saved.userId, addBtn.dataset.username!);
          setStatusMessage(addMsg, "Friend request sent", "success");
          addBtn.textContent = "Sent";
          addBtn.disabled = true;
          addBtn.className = "px-3 py-1.5 rounded-lg bg-gray-300 text-white text-sm cursor-not-allowed";
          } catch (err: any) {
          setStatusMessage(addMsg, err?.message || "Friend request failed", "error");
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

  /*
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
*/

  async function renderPendingRequest(saved: AppUser) {
    const list = document.querySelector('#pending-list')!;
    const msg = document.querySelector<HTMLParagraphElement>('#pending-msg')!;

    list.innerHTML = ''; // à voir si ça sert

    try {
      const res = await loadPendingRequest(saved.userId) as any[];

      const pending: PendingRequest[] = res.map((r: {
        id: number;
        friendId: string;
        friendUsername: string;
        friendAvatarPath: string;
      }) => ({
        requestId: r.id,
        friendId: r.friendId,
        friendUsername: r.friendUsername,
       friendAvatarPath: r.friendAvatarPath
      }));
      if (!pending.length) {
        list.innerHTML = `<li class="text-sm text-gray-500">No pending request.</li>`;
        return;
      }

      const frag = document.createDocumentFragment();

      pending.forEach((p) => {
        const li = document.createElement('li');
        li.className = 'flex items-center gap-3';

        li.innerHTML = `
          <img src="${p.friendAvatarPath || '/avatar/default.png'}"
             class="h-9 w-9 rounded-xl ring-1 ring-black/10 object-cover" alt="">
          <div class="min-w-0 flex-1">
          <p class="font-medium truncate">${p.friendUsername}</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="accept px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50">Accept</button>
            <button class="decline px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Decline</button>
          </div>
      `;

      li.querySelector<HTMLButtonElement>('button.accept')!.addEventListener('click', async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        lockButton(btn, true);
        clearStatusMessage(msg);
        try {
          await acceptRequest(saved.userId, p.requestId);
          li.remove();
          if (!list.children.length) {
            list.innerHTML = `<li class="text-sm text-gray-500">No pending request</li>`;
          }
          setStatusMessage(msg, `You're now friend with ${p.friendUsername}`, 'success');
        } catch (error: any) {
          setStatusMessage(msg, error?.message || 'Failed to accept request', 'error');
        } finally {
          lockButton(btn, false);
          renderFriendsList(saved);
        }
      });


      li.querySelector<HTMLButtonElement>('button.decline')!.addEventListener('click', async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        lockButton(btn, true);
        clearStatusMessage(msg);
        try {
          await rejectRequest(saved.userId, p.requestId);
          li.remove();
          if (!list.children.length) {
            list.innerHTML = `<li class="text-sm text-gray-500">No pending request</li>`;
          }
          setStatusMessage(msg, 'Friend request declined', 'success');
        } catch (error: any) {
          setStatusMessage(msg, error?.message || 'Failed to decline request', 'error');
        } finally {
          lockButton(btn, false);
        }
      });

      frag.appendChild(li);
      });

      list.appendChild(frag);
    } catch (error: any) {
      setStatusMessage(msg, error?.message || "Can't load pending request", 'error');
      list.innerHTML = `<li class="text-sm text-gray-500">-</li>`;
    }
  };

  async function renderFriendsList(saved: AppUser) {
    const list = document.querySelector('#friends-list')!;
    const msg = document.querySelector<HTMLParagraphElement>('#friends-msg')!;
    const loading = document.querySelector('#friends-loading')!;

    list.innerHTML= '';
    
    try {
      const res = await loadFriendsList(saved.userId) as Friend[];

       if (!res.length) {
         list.innerHTML = `<li class="text-sm text-gray-500">No friends.</li>`;
          return;
      }
      const frag = document.createDocumentFragment();
      res.forEach((p) => {
        const li = document.createElement('li');
        li.className = 'flex items-center gap-3';
        li.dataset.friendId = p.friendId;

        li.innerHTML = `
          <img src="${p.friendAvatarPath}" class="h-9 w-9 rounded-xl ring-1 ring-black/10 object-cover" alt="">
          <div class="min-w-0 flex-1">
            <p class="font-medium truncate">${p.friendUsername}</p>
          </div>
          <div class="shrink-0">
            ${statusBadge(p.isOnline)}
          </div>
          <!-- Boutons optionnels, mêmes styles que pending -->
          <div class="flex items-center gap-2">
            <button class="remove px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Remove</button>
          </div>
        `;

        li.querySelector<HTMLButtonElement>('button.remove')!.addEventListener('click', async (e) => {
        const btn = e.currentTarget as HTMLButtonElement;
        lockButton(btn, true);
        clearStatusMessage(msg);
        try {
          await removeFriend(saved.userId, p.friendUsername);
          li.remove();
          if (!list.children.length) {
            list.innerHTML = `<li class="text-sm text-gray-500">No pending request</li>`;
          }
          setStatusMessage(msg, `You have removed ${p.friendUsername} from your friends`, 'success');
        } catch (error: any) {
          setStatusMessage(msg, error?.message || 'Failed to remove friend', 'error');
        } finally {
          lockButton(btn, false);
        }
      });

        frag.appendChild(li);
    });

    list.appendChild(frag);
    } catch (error: any) {
      setStatusMessage(msg, error?.message || "Can't load friends list");
      list.innerHTML = `<li class="text-sm text-gray-500">—</li>`; 
    }
  };

  const statusBadge = (isOnline: boolean) => isOnline
  ? `
  <span class="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
    <span class="h-2 w-2 rounded-full bg-green-500"></span> En ligne
  </span>`
  : `
  <span class="inline-flex items-center gap-1 text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
    <span class="h-2 w-2 rounded-full bg-gray-400"></span> Hors ligne
  </span>`;

};

export default friends;
