import { navigateTo } from '../router/router';
import { loginUser } from '../api/auth';
import { setPendingUserId } from '../utils/ui';
import { bindPasswordToggle, setStatusMessage, clearStatusMessage, lockButton } from '../utils/ui';

const Login: (container: HTMLElement) => void = (container) => {
	container.innerHTML = `
		<div class="container-page my-10">
			<div class="mx-auto max-w-md rounded-2xl border shadow-sm bg-white px-6 py-8">
				<h2 class="text-2xl font-semibold text-center text-gray-800">Login</h2>

				<form id="login-form" class="mt-6 space-y-4" novalidate>
					<label class="block">
						<span class="text-sm text-gray-700">Email</span>
						<input id="login_email" name="email" type="email" required autocomplete="email"
							class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@domaine.com">
					</label>

					<label class="block">
						<span class="text-sm text-gray-700">Password</span>
						<div class="relative">
							<input id="login_password" name="password" type="password" required minlength="6" autocomplete="current-password"
								class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500 pr-10" placeholder="******">
							<button type="button" id="togglePwd"
								class="absolute inset-y-0 right-0 my-auto mr-2 text-xs text-gray-500 hover:text-gray-700">Show</button>
						</div>
					</label>

					<button id="submitBtn" type="submit"
						class="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-lg transition">
						Login
					</button>

					<p id="formMsg" class="text-sm min-h-5" aria-live="polite"></p>

					<p class="text-center text-sm text-gray-500">
						No account ?
						<a href="#/register" data-route="/register" class="text-blue-600 hover:underline">Register</a>
					</p>
				</form>
			</div>
		</div>
	`;

	const form = container.querySelector<HTMLFormElement>('#login-form')!;
	const emailEl = container.querySelector<HTMLInputElement>('#login_email')!;
	const pwdEl = container.querySelector<HTMLInputElement>('#login_password')!;
	const msgEl = container.querySelector<HTMLParagraphElement>('#formMsg')!;
	const submitBtn = container.querySelector<HTMLButtonElement>('#submitBtn')!;
	const togglePwdBtn = container.querySelector<HTMLButtonElement>('#togglePwd')!;

	bindPasswordToggle(pwdEl, togglePwdBtn);

	form.addEventListener('click', (e) => {
		const a = (e.target as HTMLElement).closest('a[data-route]') as HTMLAnchorElement | null;
		if (!a) return;
		e.preventDefault();
		navigateTo(a.dataset.route || '/');
	});

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		clearStatusMessage(msgEl);

		const email = emailEl.value.trim();
		const password = pwdEl.value.trim();
		if (!email || !password) return setStatusMessage(msgEl, 'Please enter your email and password.', 'error');

		lockButton(submitBtn, true, 'Connecting…');

		try {
			const { userId } = await loginUser(email, password); 
			setPendingUserId(userId);
			navigateTo('/a2f');
		} catch (err: any) {
			setStatusMessage(msgEl, 'Connection failed', 'error');
		} finally {
			lockButton(submitBtn, false);
		}
	});
};

export default Login;
