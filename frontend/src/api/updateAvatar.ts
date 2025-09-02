import { getPendingUserId } from "../utils/ui";

const fileInput = document.getElementById('file-input') as HTMLInputElement;
const changeBtn = document.getElementById('change-btn') as HTMLButtonElement;
const avatarImg = document.getElementById('avatar-img') as HTMLImageElement;
const errorEl = document.getElementById('error') as HTMLParagraphElement;

const progressWrap = document.getElementById('progress-wrap') as HTMLDivElement;
const progressBar = document.getElementById('progress-bar') as HTMLDivElement;
const progressLabel = document.getElementById('progress-label') as HTMLParagraphElement;

// Si tu as déjà l'URL en base (ex: /static/avatars/abc.webp) tu peux l’injecter ici :
const initialUrlFromServer: string | null = null;
if (initialUrlFromServer) avatarImg.src = initialUrlFromServer;

changeBtn.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
	const file = fileInput.files?.[0];
	if (!file) return;

	// Validation côté client
	if (!file.type.startsWith('image/')) {
		return showError('Veuillez sélectionner une image.');
	}
	if (file.size > 5 * 1024 * 1024) {
		return showError('Fichier trop volumineux (max 5MB).');
	}

	// Aperçu instantané (Object URL)
	const objectUrl = URL.createObjectURL(file);
	avatarImg.src = objectUrl;

	hideError();

	try {
	// Choix 1 : upload via fetch (sans progression)
	const userId = getPendingUserId();
	const { avatarUrl, etag } = await uploadWithFetch(file, userId!);

	// Choix 2 : upload via XHR pour barre de progression
	//const { avatarPath, etag } = await uploadWithProgress(file, (p) => {
		//progressWrap.classList.remove('hidden');
		//progressBar.style.width = `${p}%`;
		//progressLabel.textContent = `${p}%`;
	//});

	// Replace l’aperçu par l’URL finale (WebP traitée côté serveur)
	// + cache-busting avec l’ETag renvoyé
		const cacheBusted = etag ? `${avatarUrl}?v=${encodeURIComponent(etag)}` : avatarUrl;
		avatarImg.src = cacheBusted;
	} catch (err: any) {
			showError(err?.message || 'Échec de l’upload.');
	} finally {
	URL.revokeObjectURL(objectUrl);
	setTimeout(() => {
		progressWrap.classList.add('hidden');
			progressBar.style.width = '0%';
		progressLabel.textContent = '0%';
	}, 700);
	// Réinitialise l’input pour permettre de re-choisir le même fichier
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
	if (!res.ok) throw new Error('Upload refusé par le serveur.');
	return res.json();
}