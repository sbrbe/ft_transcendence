// src/pages/register.ts
import { navigateTo } from '../router/router';
import { createAuthAccount, deleteAuthAccount } from '../api/auth';
import { createUserProfile, type RegisterFormData } from '../api/users';
import { bindPasswordToggle, setStatusMessage, clearStatusMessage, lockButton } from '../utils/ui';
import { getInputValue } from '../utils/dom';

/**
 * [UI][ROUTER] Register :
 * Rend le formulaire de création de compte, gère l’UI (toggle password),
 * valide les champs et orchestre l’enchaînement des appels API :
 * 1) création compte auth → 2) création profil users → redirection /connexion.
 * En cas d’échec en 2), effectue un rollback en supprimant le compte auth.
 */
const Register: (container: HTMLElement) => void = (container) => {
  container.innerHTML = `
    <div class="container-page my-10">
      <div class="mx-auto max-w-md rounded-2xl border shadow-sm bg-white px-6 py-8">
        <h2 class="text-2xl font-semibold text-center text-gray-800">Créer un utilisateur</h2>

        <form id="register-form" class="mt-6 space-y-4" novalidate>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label class="block">
              <span class="text-sm text-gray-700">Prénom</span>
              <input id="firstName" name="firstName" type="text" required
                class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Prénom">
            </label>
            <label class="block">
              <span class="text-sm text-gray-700">Nom</span>
              <input id="lastName" name="lastName" type="text" required
                class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nom">
            </label>
          </div>

          <label class="block">
            <span class="text-sm text-gray-700">Nom d'utilisateur</span>
            <input id="username" name="username" type="text" required
              class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="john_doe">
          </label>

          <label class="block">
            <span class="text-sm text-gray-700">Email</span>
            <input id="email" name="email" type="email" required
              class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@domaine.com" autocomplete="email">
          </label>

          <label class="block">
            <span class="text-sm text-gray-700">Mot de passe</span>
            <div class="relative">
              <input id="password" name="password" type="password" required minlength="6"
                class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500 pr-10" placeholder="******" autocomplete="new-password">
              <button type="button" id="togglePwd"
                class="absolute inset-y-0 right-0 my-auto mr-2 text-xs text-gray-500 hover:text-gray-700">Afficher</button>
            </div>
          </label>

          <button id="submitBtn" type="submit"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition">
            Créer le compte
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
  const pwdInput = container.querySelector<HTMLInputElement>('#password')!;

  bindPasswordToggle(pwdInput, togglePwdBtn);

  /**
   * [UI][API][ROUTER] Soumission du formulaire :
   * - Valide les champs
   * - Crée le compte auth, puis le profil users
   * - Sur échec profil : rollback du compte auth créé
   * - Affiche les messages et redirige vers /connexion en succès
   */
  form.addEventListener('submit', async (e) => 
  {
    e.preventDefault();
    clearStatusMessage(msgEl);

     const data: RegisterFormData = 
     {
       firstName: getInputValue(container, '#firstName'),
       lastName:  getInputValue(container, '#lastName'),
       username:  getInputValue(container, '#username'),
       email:     getInputValue(container, '#email'),
       password:  getInputValue(container, '#password'),
     };

    if (!data.firstName || !data.lastName || !data.username || !data.email || !data.password) 
    {
      return setStatusMessage(msgEl, 'Veuillez remplir tous les champs.', 'error');
    }
    if (data.password.length < 6) 
    {
      return setStatusMessage(msgEl, 'Le mot de passe doit contenir au moins 6 caractères.', 'error');
    }

    lockButton(submitBtn, true, 'Création en cours…');

    let createdUserId = '';
    try 
    {
      createdUserId = await createAuthAccount(data.email, data.password);
      await createUserProfile(createdUserId, data);

      setStatusMessage(msgEl, 'Compte créé avec succès. Vous pouvez vous connecter.', 'success');
      setTimeout(() => navigateTo('/connexion'), 400);
    } 
    catch (err: any) 
    {
      if (createdUserId) await deleteAuthAccount(createdUserId);
      setStatusMessage(msgEl, `Erreur : ${err?.message ?? 'échec de création'}`, 'error');
    } 
    finally 
    {
      lockButton(submitBtn, false);
    }
  });
};

export default Register;
