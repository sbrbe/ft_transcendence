import { acceptRequest, removeFriend, searchUser, sendFriendRequest, loadPendingRequest, rejectRequest, loadFriendsList } from "../api/friends";
import { clearStatusMessage, lockButton, setStatusMessage } from "../utils/ui";
import { getSavedUser, escapeHtml } from '../utils/ui';
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
		if (!saved) 
		{
			navigateTo('/connection');
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


		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
			<section class="lg:col-span-7 rounded-2xl border bg-white shadow-sm p-6">
				<h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">FRIENDS LIST</h2>
				<div>
					<!-- ~6 visibles ; au-delà = scroll -->
					<ul id="friends-list" class="space-y-3 pr-3 sm:pr-4 max-h-[392px] overflow-y-auto [scrollbar-gutter:stable]"></ul>
					<p id="friends-msg" class="text-sm mt-2 hidden" aria-live="polite"></p>
				</div>
			</section>


			<div class="lg:col-span-5 space-y-6">
				<section class="rounded-2xl border bg-white shadow-sm p-6">
					<h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Add a friend</h2>
					<form id="add-friend-form" class="flex items-center gap-2">
						<input id="Username" type="text" placeholder="Username"
									 class="flex-1 border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500">
						<button id="searchBtn" type="submit" class="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-sm">Search</button>
					</form>

					<p class="text-xs text-gray-500 mt-2">Enter the username to send a request</p>
					<p id="add-msg" class="text-sm mt-2 hidden" aria-live="polite"></p>

					<div id="search-results"
							class="mt-3 min-h-14 max-h-48 overflow-y-auto pr-3 sm:pr-4 [scrollbar-gutter:stable_both-edges]">
					</div>
				</section>


				<section class="rounded-2xl border bg-white shadow-sm p-6">
					<h2 class="text-sm uppercase tracking-wider text-gray-500 mb-3">Pending requests</h2>
					<div id="pending-box"
							class="h-40 overflow-y-auto pr-3 sm:pr-4 rounded-lg
											[scrollbar-gutter:stable_both-edges]">
						<ul id="pending-list" class="space-y-3"></ul>
					</div>
					<p id="pending-msg" class="text-sm min-h-5 hidden" aria-live="polite"></p>
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

	form.addEventListener('submit', async (e) => 
	{
		e.preventDefault();
		clearStatusMessage(addMsg);
		resultsEl.innerHTML = "";
		const username = usernameEl.value.trim();

		if (!username) 
		{
			return setStatusMessage(addMsg, 'Please enter a username', 'error');
		};

		if (username === saved.username) 
		{
			return setStatusMessage(addMsg, "You can't search yourself", 'error');
		}

		lockButton(searchBtn, true);

		try 
		{
			const res = await searchUser(username) as SearchUserResult;
			const searchedUserId = res.userId;
			const avatar = res.avatarPath || "/avatar/default.png";

			resultsEl.innerHTML = `
					<div class="flex items-center justify-between rounded-xl p-3">
						<div class="flex items-center gap-3 min-w-0">
							<img src="${escapeHtml(avatar)}" alt="" class="h-12 w-12 rounded-xl object-cover shrink-0">
							<div class="font-medium text-sm sm:text-base truncate">${escapeHtml(username)}</div>
						</div>
							<button id="addBtn" type="button"
								class="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm"
								data-user-id="${escapeHtml(searchedUserId)}" data-username="${escapeHtml(username)}">
								Add
							</button>
					</div>
				`;
				
			const addBtn = resultsEl.querySelector<HTMLButtonElement>('#addBtn')!;

			addBtn.addEventListener('click', async () => 
			{
				clearStatusMessage(addMsg);
				lockButton(addBtn, true);
				try 
				{
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

	async function renderPendingRequest(saved: AppUser) 
	{
		const list = document.querySelector('#pending-list')!;
		const msg = document.querySelector<HTMLParagraphElement>('#pending-msg')!;
		list.innerHTML = '';

		try {
			const res = await loadPendingRequest(saved.userId) as any[];

			const pending: PendingRequest[] = res.map((r: {id: number; friendId: string; friendUsername: string; friendAvatarPath: string; }) => ({
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
					<img src="${escapeHtml(p.friendAvatarPath || '/avatar/default.png')}"
						 class="h-9 w-9 rounded-xl ring-1 ring-black/10 object-cover" alt="">
					<div class="min-w-0 flex-1">
					<p class="font-medium truncate">${escapeHtml(p.friendUsername)}</p>
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

						if (!list.children.length) 
						{
							list.innerHTML = `<li class="text-sm text-gray-500">No pending request</li>`;
						}
						setStatusMessage(msg, `You're now friend with ${escapeHtml(p.friendUsername)}`, 'success');
					} 
					catch (error: any) {
						setStatusMessage(msg, error?.message || 'Failed to accept request', 'error');
					} 
					finally {
						renderFriendsList(saved);
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
						if (!list.children.length) 
						{
							list.innerHTML = `<li class="text-sm text-gray-500">No pending request</li>`;
						}
						setStatusMessage(msg, 'Friend request declined', 'success');
					} 
					catch (error: any) {
						setStatusMessage(msg, error?.message || 'Failed to decline request', 'error');
					} 
					finally {
						lockButton(btn, false);
					}
				});
				frag.appendChild(li);
			});
			list.appendChild(frag);
		} 
		catch (error: any) {
			setStatusMessage(msg, error?.message || "Can't load pending request", 'error');
			list.innerHTML = `<li class="text-sm text-gray-500">-</li>`;
		}
	};


	async function renderFriendsList(saved: AppUser) {
		const listEl = container.querySelector('#friends-list')!;
		const msg = container.querySelector<HTMLParagraphElement>('#friends-msg')!;
		let data: Friend[] = [];

		try {
			data = await loadFriendsList(saved.userId) as Friend[];
		} 
		catch (e: any) {
			setStatusMessage(msg, e?.message || "Can't load friends list", 'error');
			listEl.innerHTML = `<li class="text-sm text-gray-500">—</li>`;
			return;
		}

		if (!data.length) {
			listEl.innerHTML = `<li class="text-sm text-gray-500">No friends.</li>`;
			return;
		}

		let html = '';
		for (let i = 0; i < data.length; i++) {
			const p = data[i];
			html += `
				<li class="flex items-center gap-3 pr-2 py-2" data-id="${escapeHtml(p.friendId)}">
					<img src="${escapeHtml(p.friendAvatarPath || '/avatar/default.png')}"
							onerror="this.src='/avatar/default.png'"
							class="h-9 w-9 rounded-xl ring-1 ring-black/10 object-cover" alt="">
					<div class="min-w-0 flex-1">
						<p class="font-medium truncate">${escapeHtml(p.friendUsername)}</p>
					</div>
					<span class="inline-flex items-center gap-1 text-xs ${escapeHtml(p.isOnline ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100')} px-2 py-0.5 rounded-full">
						<span class="h-2 w-2 rounded-full ${escapeHtml(p.isOnline ? 'bg-green-500' : 'bg-gray-400')}"></span>
						${escapeHtml(p.isOnline ? 'Online' : 'Offline')}
					</span>
						<button class="profile px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-white-600">Profile</button>
						<button class="remove px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Remove</button>
				</li>
			`;
		}

		listEl.innerHTML = html;

		listEl.addEventListener('click', async (ev) => {
			const btn = (ev.target as HTMLElement).closest('button.remove') as HTMLButtonElement | null;

			if (!btn) 
				return;

			const li = btn.closest('li')!;
			const id = li.getAttribute('data-id')!;
			const friend = data.find(x => x.friendId === id);

			if (!friend) 
				return;

			lockButton(btn, true);
			clearStatusMessage(msg);
			try {
				await removeFriend(saved.userId, friend.friendUsername);
				data = data.filter(x => x.friendId !== id);
				setStatusMessage(msg, `You have removed ${escapeHtml(friend.friendUsername)} from your friends`, 'success');

				if (!data.length) {
					listEl.innerHTML = `<li class="text-sm text-gray-500">No friends.</li>`;
				} else {
					let html2 = '';
					for (let i = 0; i < data.length; i++) {
						const p = data[i];
						html2 += `
							<li class="flex items-center gap-3 pr-2 py-2" data-id="${escapeHtml(p.friendId)}">
								<img src="${escapeHtml(p.friendAvatarPath || '/avatar/default.png')}"
										onerror="this.src='/avatar/default.png'"
										class="h-9 w-9 rounded-xl ring-1 ring-black/10 object-cover" alt="">
								<div class="min-w-0 flex-1">
									<p class="font-medium truncate">${escapeHtml(p.friendUsername)}</p>
								</div>
								<span class="inline-flex items-center gap-1 text-xs ${escapeHtml(p.isOnline ? 'text-green-700 bg-green-100' : 'text-gray-700 bg-gray-100')} px-2 py-0.5 rounded-full">
									<span class="h-2 w-2 rounded-full ${escapeHtml(p.isOnline ? 'bg-green-500' : 'bg-gray-400')}"></span>
									${escapeHtml(p.isOnline ? 'Online' : 'Offline')}
								</span>
								<button class="profile px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-white-600">Profile</button>
								<button class="remove px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50 text-red-600">Remove</button>
							</li>
						`;

					}
					listEl.innerHTML = html2;
				}
			} 
			catch (err: any) {
				setStatusMessage(msg, err?.message || 'Failed to remove friend', 'error');
				lockButton(btn, false);
			}
		});

		listEl.addEventListener('click', (ev) => {
			const profileBtn = (ev.target as HTMLElement).closest('button.profile') as HTMLButtonElement | null;
				if (!profileBtn) return;

			const li = profileBtn.closest('li')!;
			const friendId = li.getAttribute('data-id')!;
			const friend = data.find(x => x.friendId === friendId);
			const friendUsername = friend?.friendUsername ?? '';

			navigateTo(`/friend-profile?friendId=${encodeURIComponent(friendId)}`);
		});
	}
}
export default friends;
