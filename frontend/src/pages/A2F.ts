import { navigateTo } from '../router/router';
import { setLoggedInUser } from '../utils/ui';
import { AppUser } from '../utils/interface';
import { verify2FA, fetchUser } from '../api/A2F';
import { getPendingUserId, clearPendingUserId} from '../utils/ui';
import { setStatusMessage, clearStatusMessage, lockButton } from '../utils/ui';


const A2F: (container: HTMLElement) => void = (container) => {
	const pendingUserId = getPendingUserId() || '';

	container.innerHTML = `
    <div class="container-page my-10">
      <div class="mx-auto max-w-md rounded-2xl border shadow-sm bg-white px-6 py-8">
        <h2 class="text-2xl font-semibold text-center text-gray-800">Checking 2FA</h2>

        <form id="a2f-form" class="mt-6 space-y-4" novalidate>
          <label class="block">
            <span class="text-sm text-gray-700">6 digits code</span>
            <input id="code_2fa" inputmode="numeric" pattern="\\d{6}" maxlength="6" required
              class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest text-xl"
              placeholder="••••••">
          </label>

          <button id="verifyBtn" type="submit"
            class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg transition">
            Submit
          </button>

          <p id="formMsg" class="text-sm min-h-5" aria-live="polite"></p>
        </form>
      </div>
    </div>
  `;

	const form = container.querySelector<HTMLFormElement>('#a2f-form')!;
	const codeEl = container.querySelector<HTMLInputElement>('#code_2fa')!;
	const msgEl = container.querySelector<HTMLParagraphElement>('#formMsg')!;
	const verifyBtn = container.querySelector<HTMLButtonElement>('#verifyBtn')!;

	if (!pendingUserId) setStatusMessage(msgEl, 'Session expired. Please login again.', 'error');
	setTimeout(() => codeEl.focus(), 0);

	// Force 6 chiffres
	codeEl.addEventListener('input', () => 
	{
		codeEl.value = codeEl.value.replace(/\D/g, '').slice(0, 6);
	});

	form.addEventListener('submit', async (e) => 
	{
		e.preventDefault();
		clearStatusMessage(msgEl);

		if (!pendingUserId) {
			setStatusMessage(msgEl, 'Session expired. Please login again.', 'error');
		}

		const code = codeEl.value.trim();
		if (code.length !== 6) {
			return setStatusMessage(msgEl, 'Enter a 6 digits code.', 'error');
		} 

		lockButton(verifyBtn, true, 'Checking…');

		try 
		{
			await verify2FA(pendingUserId, code);

			const user = await fetchUser(pendingUserId) as AppUser;
			setLoggedInUser(user);

			// Notifie la navbar (si elle écoute `auth:changed`)
			window.dispatchEvent(new CustomEvent('auth:changed', { detail: user }));

			clearPendingUserId();
			navigateTo('/home');
		} 
		catch (err: any) 
		{
			setStatusMessage(msgEl, err?.message || 'Checking 2FA failed', 'error');
		} 
		finally 
		{
			lockButton(verifyBtn, false);
		}
	});
};

export default A2F;
