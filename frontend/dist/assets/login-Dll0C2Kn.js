import{n as u,a as g}from"./index-CRZkJy2F.js";import{s as f}from"./A2F-CUNc8p4k.js";import{b,c as x,s as d,l as c}from"./ui-BDQzTN5a.js";const h=e=>{e.innerHTML=`
    <div class="container-page my-10">
      <div class="mx-auto max-w-md rounded-2xl border shadow-sm bg-white px-6 py-8">
        <h2 class="text-2xl font-semibold text-center text-gray-800">Connexion</h2>

        <form id="login-form" class="mt-6 space-y-4" novalidate>
          <label class="block">
            <span class="text-sm text-gray-700">Email</span>
            <input id="login_email" name="email" type="email" required autocomplete="email"
              class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500" placeholder="email@domaine.com">
          </label>

          <label class="block">
            <span class="text-sm text-gray-700">Mot de passe</span>
            <div class="relative">
              <input id="login_password" name="password" type="password" required minlength="6" autocomplete="current-password"
                class="mt-1 w-full border px-3 py-2 rounded outline-none focus:ring-2 focus:ring-blue-500 pr-10" placeholder="******">
              <button type="button" id="togglePwd"
                class="absolute inset-y-0 right-0 my-auto mr-2 text-xs text-gray-500 hover:text-gray-700">Afficher</button>
            </div>
          </label>

          <button id="submitBtn" type="submit"
            class="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-lg transition">
            Se connecter
          </button>

          <p id="formMsg" class="text-sm min-h-5" aria-live="polite"></p>

          <p class="text-center text-sm text-gray-500">
            Pas de compte ?
            <a href="#/inscription" data-route="/inscription" class="text-blue-600 hover:underline">S'enregistrer</a>
          </p>
        </form>
      </div>
    </div>
  `;const r=e.querySelector("#login-form"),m=e.querySelector("#login_email"),l=e.querySelector("#login_password"),a=e.querySelector("#formMsg"),n=e.querySelector("#submitBtn"),p=e.querySelector("#togglePwd");b(l,p),r.addEventListener("click",o=>{const t=o.target.closest("a[data-route]");t&&(o.preventDefault(),u(t.dataset.route||"/"))}),r.addEventListener("submit",async o=>{o.preventDefault(),x(a);const t=m.value.trim(),i=l.value.trim();if(!t||!i)return d(a,"Veuillez saisir email et mot de passe.","error");c(n,!0,"Connexion…");try{const{userId:s}=await g(t,i);f(String(s)),u("/a2f")}catch(s){d(a,(s==null?void 0:s.message)||"Connexion échouée","error")}finally{c(n,!1)}})};export{h as default};
