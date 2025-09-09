import { navigateTo } from '../router/router';
import { createAuthAccount, deleteAuthAccount } from '../api/auth';
import { createUserProfile } from '../api/users';
import { RegisterFormData } from '../utils/interface';
import { bindPasswordToggle, setStatusMessage, clearStatusMessage, lockButton } from '../utils/ui';
import { getInputValue } from '../utils/dom';
import { validateRegister, casing } from '../api/validateData';

const Register: (container: HTMLElement) => void = (container) => {
	container.innerHTML = `
		<div class="container-page my-10">
			<div class="mx-auto max-w-md rounded-2xl border shadow-sm bg-white px-6 py-8">
				<h2 class="text-2xl font-semibold text-center text-gray-800">Create an user</h2>

				<form id="register-form" class="mt-6 space-y-4" novalidate>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<label class="block">
							<span class="text-sm text-gray-700">Firstname</span>
							<input id="firstName" name="firstName" type="text" required
								class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Firstname">
						<div id="firstName-help" class="mt-1 text-xs text-gray-500 space-y-1" aria-live="polite"></div>
						
						</label>
						<label class="block">
							<span class="text-sm text-gray-700">Lastname</span>
							<input id="lastName" name="lastName" type="text" required
								class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Lastname">
						<div id="lastName-help" class="mt-1 text-xs text-gray-500 space-y-1" aria-live="polite"></div>
						
						</label>
					</div>

					<label class="block">
						<span class="text-sm text-gray-700">Username</span>
						<input id="username" name="username" type="text" required
							class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="john_doe">
						<div id="username-help" class="mt-1 text-xs text-gray-500 space-y-1" aria-live="polite"></div>
						
					</label>

					<label class="block">
						<span class="text-sm text-gray-700">Email</span>
						<input id="email" name="email" type="email" required
							class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@domain.com" autocomplete="email">
						<div id="email-help" class="mt-1 text-xs text-gray-500 space-y-1" aria-live="polite"></div>
						
					</label>

					<label class="block">
						<span class="text-sm text-gray-700">Password</span>
						<div class="relative">
							<input id="password" name="password" type="password" required minlength="8"
								class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500 pr-10" placeholder="******" autocomplete="new-password">
							<button type="button" id="togglePwd"
								class="absolute inset-y-0 right-0 my-auto mr-2 text-xs text-gray-500 hover:text-gray-700">Show</button>
						</div>
						<div id="password-help" class="mt-1 text-xs text-gray-500 space-y-1" aria-live="polite"></div>
						
					</label>

					<label class="block">
						<span class="text-sm text-gray-700">Confirm password</span>
						<div class="relative">
							<input id="confirmPassword" name="confirmPassword" type="password" required minlength="8"
								class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500 pr-10" placeholder="******" autocomplete="new-password">
							<button type="button" id="toggleConfPwd"
								class="absolute inset-y-0 right-0 my-auto mr-2 text-xs text-gray-500 hover:text-gray-700">Show</button>
						</div>
						<div id="confirmPassword-help" class="mt-1 text-xs text-gray-500 space-y-1" aria-live="polite"></div>
						
					</label>

					<button id="submitBtn" type="submit"
						class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition">
						Create account
					</button>

					<p id="formMsg" class="text-sm min-h-5" aria-live="polite"></p>
				</form>
			</div>
		</div>
	`;

	const form = container.querySelector<HTMLFormElement>('#register-form')!;
	const msgEl = container.querySelector<HTMLParagraphElement>('#formMsg')!;
	const submitBtn = container.querySelector<HTMLButtonElement>('#submitBtn')!;
	const togglePwdBtn = container.querySelector<HTMLButtonElement>('#togglePwd')!;
	const pwd1 = container.querySelector<HTMLInputElement>('#password')!;
	const pwd2 = container.querySelector<HTMLInputElement>('#confirmPassword')!;

	bindPasswordToggle(pwd1, togglePwdBtn);
	bindPasswordToggle(pwd2, togglePwdBtn);

	type Rule = { id: string; label: string; test: (v: string) => boolean };

	const nameRules: Rule[] = [
		{ id: "len",     label: "2–30 characters",									test: v => v.trim().length >= 2 && v.trim().length <= 30 },
		{ id: "charset", label: "No digits, special chars", 						test: v => /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?:[ '\-][A-Za-zÀ-ÖØ-öø-ÿ]+)*$/.test(v.trim()) },
	//	{ id: "trim",    label: "No leading/trailing spaces",						test: v => v === v.trim() },
	];

	const usernameRules: Rule[] = [
		{
			id: "base",
			label: "3–20 characters & starts with a letter",						test: v => v.length >= 3 && v.length <= 20 && /^\p{L}/u.test(v)
		},
		{
			id: "allowed",
			label: "Letters (incl. accents), digits, '.', '_' or '-'",				test: v => /^[\p{L}\p{M}0-9._-]+$/u.test(v)
		},
		{
			id: "dots",
			label: "No '..' or '__'; not at start; ends with letter/digit",			test: v => !(/(\.{2,}|__{2,}|^[._-]|[^\p{L}\p{M}0-9]$)/u.test(v))
		},
	];

	const passwordRules: Rule[] = [
		{ id: "len", label: "At least 8 characters",								test: v => v.length >= 8 },
		{
			id: "variety",
			label: "Contains lowercase, uppercase, digit, and special character",	test: v => /[a-z]/
																					.test(v) && /[A-Z]/
																					.test(v) && /\d/.test(v) && /[^A-Za-z0-9]/
																					.test(v),
		},
		{ id: "space", label: "No spaces",											test: v => !/\s/.test(v) },
	];

	const confirmPasswordRule: Rule[] = [
		{ id: "match", label: "Matching passwords",									test: () => !!pwd1 && !!pwd2 && pwd2.value === pwd1.value }
	];

	function mountRules(fieldId: string, rules: Rule[]) {
		const input = container.querySelector<HTMLInputElement>(`#${fieldId}`);
		const help  = container.querySelector<HTMLElement>(`#${fieldId}-help`);
		if (!input || !help) return;

		help.innerHTML = rules.map(r => `
			<div data-rule="${r.id}" class="flex items-center gap-2 transition-colors">
				<span class="icon inline-block w-4 text-gray-400">•</span>
				<span class="label">${r.label}</span>
			</div>
		`).join("");

		const update = () => {
			const v = input.value;
			rules.forEach(r => {
				const row  = help.querySelector<HTMLElement>(`[data-rule="${r.id}"]`);
				const icon = row?.querySelector<HTMLElement>(".icon");
				if (!row || !icon) return;

				if (!v) {
					row.classList.remove("text-green-600","text-red-600");
					row.classList.add("text-gray-500");
					icon.textContent = "•";
					icon.classList.remove("text-green-600","text-red-600");
					icon.classList.add("text-gray-400");
					return;
				}

				const ok = r.test(v);
				row.classList.toggle("text-green-600", ok);
				row.classList.toggle("text-red-600", !ok);
				row.classList.remove("text-gray-500");

				icon.textContent = ok ? "✓" : "✗";
				icon.classList.toggle("text-green-600", ok);
				icon.classList.toggle("text-red-600", !ok);
				icon.classList.remove("text-gray-400");
			});
		};

		input.addEventListener("input", update);
		input.addEventListener("blur", update);
		update();
	}

	mountRules("firstName", nameRules);
	mountRules("lastName",  nameRules);
	mountRules("username",  usernameRules);
	mountRules("password",  passwordRules);
	mountRules("confirmPassword", confirmPasswordRule);

	form.addEventListener('submit', async (e) => 
	{
		e.preventDefault();
		clearStatusMessage(msgEl);

		 const data: RegisterFormData = 
		 {
			 firstName: getInputValue(container, '#firstName'),
			 lastName:	getInputValue(container, '#lastName'),
			 username:	getInputValue(container, '#username'),
			 email:		 getInputValue(container, '#email'),
			 password:	getInputValue(container, '#password'),
			 confirmPassword : getInputValue(container, '#confirmPassword'),
		 };

		if (!data.firstName || !data.lastName || !data.username || !data.email || !data.password || !data.confirmPassword) 
		{
			return setStatusMessage(msgEl, 'Please complete all fields.', 'error');
		}

		const { ok, errors, cleaned } = validateRegister({
			firstName: data.firstName,
			lastName: data.lastName,
			username: data.username,
		});
		 if (!ok) {
			const errMsg = errors.firstName || errors.lastName || errors.username || 'Fields invalids';
			setStatusMessage(msgEl, errMsg, 'error');
			return;
		}

		if (data.password.length < 8) 
		{
			return setStatusMessage(msgEl, 'Password must have at least 8 characters.', 'error');
		}

		

		data.firstName = casing(cleaned.firstName);
		data.lastName = casing(cleaned.lastName);

		lockButton(submitBtn, true, 'Creating…');

		let createdUserId = '';
		try 
		{
			createdUserId = await createAuthAccount(data.email, data.password);
			await createUserProfile(createdUserId, data);

			setStatusMessage(msgEl, 'Account created. You can log in', 'success');
			setTimeout(() => navigateTo('/connection'), 400);
		} 
		catch (err: any) 
		{
			if (createdUserId) await deleteAuthAccount(createdUserId);
			setStatusMessage(msgEl, (err.message || `Failed to create account`), 'error');
		} 
		finally 
		{
			lockButton(submitBtn, false);
		}
	});

};

export default Register;
