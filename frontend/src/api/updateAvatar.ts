import { getPendingUserId } from "../utils/ui";

const fileInput = document.getElementById('file-input') as HTMLInputElement;
const changeBtn = document.getElementById('change-btn') as HTMLButtonElement;
const avatarImg = document.getElementById('avatar-img') as HTMLImageElement;
const errorEl = document.getElementById('error') as HTMLParagraphElement;

const progressWrap = document.getElementById('progress-wrap') as HTMLDivElement;
const progressBar = document.getElementById('progress-bar') as HTMLDivElement;
const progressLabel = document.getElementById('progress-label') as HTMLParagraphElement;

const initialUrlFromServer: string | null = null;
if (initialUrlFromServer) avatarImg.src = initialUrlFromServer;

changeBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
	const file = fileInput.files?.[0];
	if (!file) return;

	if (!file.type.startsWith('image/')) {
		return showError('Please choose an picture.');
	}
	if (file.size > 5 * 1024 * 1024) {
		return showError('File too heavy (max 5MB).');
	}

	const objectUrl = URL.createObjectURL(file);
	avatarImg.src = objectUrl;

	hideError();

	try {
	const userId = getPendingUserId();
	const { avatarUrl, etag } = await uploadWithFetch(file, userId!);

		const cacheBusted = etag ? `${avatarUrl}?v=${encodeURIComponent(etag)}` : avatarUrl;
		avatarImg.src = cacheBusted;
	} catch (err: any) {
			showError(err?.message || 'Failed to upload.');
	} finally {
	URL.revokeObjectURL(objectUrl);
	setTimeout(() => {
		progressWrap.classList.add('hidden');
			progressBar.style.width = '0%';
		progressLabel.textContent = '0%';
	}, 700);
	fileInput.value = '';
	}
});

function showError(msg: string) {
	errorEl.textContent = msg;
	errorEl.classList.remove('hidden');
}
function hideError() {
	errorEl.textContent = '';
	errorEl.classList.add('hidden');
}

async function uploadWithFetch(file: File, userId: string): Promise<{ avatarUrl: string; etag: string }> {
	const form = new FormData();
	form.append('avatar', file);
	const res = await fetch(`/users/uploadAvatar/${encodeURIComponent(userId)}`, { method: 'POST', body: form });
	if (!res.ok) throw new Error('Upload refused.');
	return res.json();
}