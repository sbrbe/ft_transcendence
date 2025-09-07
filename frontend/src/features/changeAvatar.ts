import { getSavedUser, setLoggedInUser, setStatusMessage,escapeHtml } from "../utils/ui";
import type { AppUser } from "../utils/interface";
import { updateUser } from "../api/users";

export type ChangeAvatarOptions = {
	grid: HTMLElement;
	previewImg: HTMLImageElement;
	messageEl: HTMLElement;
	avatars: string[];
};

export function initChangeAvatar(opts: ChangeAvatarOptions) {
	const { grid, previewImg, messageEl, avatars } = opts;

	const saved = getSavedUser<AppUser>();
	if (!saved) return;

	// capture des valeurs non null
	const userId = saved.userId;
	const currentAvatar = saved.avatarPath || undefined;

	grid.classList.add('justify-items-center');

	const unique = Array.from(new Set(avatars));
	grid.innerHTML = unique.map((src) => `
		<button type="button"
			class="group relative inline-flex h-16 w-16 items-center justify-center
			rounded-xl overflow-hidden ring-1 ring-black/10 hover:ring-blue-300"
			data-avatar="${escapeHtml(src)}" aria-pressed="false">
			<img src="${src}" alt="" class="absolute inset-0 h-full w-full object-cover" />
			<span class="pointer-events-none absolute inset-0 rounded-xl"></span>
		</button>`).join("");

	function markSelected(src: string) {
		grid.querySelectorAll("button[data-avatar]").forEach((btn) => {
		const isSel = btn.getAttribute("data-avatar") === src;
		btn.setAttribute("aria-pressed", String(isSel));
		const ring = btn.querySelector("span");
		if (ring) {
			ring.classList.toggle("ring-2", isSel);
			ring.classList.toggle("ring-blue-600", isSel);
			if (!isSel) ring.classList.remove("ring-2", "ring-blue-600");
		}
	});
}

	async function saveAvatar(src: string) {
		try {
			await updateUser(userId, { avatarPath: src });

			const nextUser = { ...saved, avatarPath: src } as AppUser;
			setLoggedInUser(nextUser);
			window.dispatchEvent(new CustomEvent("auth:changed", { detail: nextUser }));

			previewImg.src = src;
			markSelected(src);
			setStatusMessage(messageEl, "✅ Avatar updated", "success");
		} catch (err: any) {
			setStatusMessage(messageEl, `❌ ${err?.message || "Error updating avatar"}`, "error");
		}
	}

	grid.addEventListener("click", (e) => {
		const btn = (e.target as HTMLElement).closest("button[data-avatar]") as HTMLButtonElement | null;
		if (!btn) return;
		const src = btn.getAttribute("data-avatar");
		if (src) saveAvatar(src);
	});

	const initial = currentAvatar || unique[0];
	previewImg.src = initial;
	markSelected(initial);
}
