import{c as p,n as g,d as b}from"./index-CRZkJy2F.js";import{c as f}from"./users-BHhFmrZ9.js";import{b as x,c as y,s as l,l as n}from"./ui-BDQzTN5a.js";function a(e,o){var t;return(((t=e.querySelector(o))==null?void 0:t.value)||"").trim()}const N=e=>{e.innerHTML=`
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
  `;const o=e.querySelector("#register-form"),t=e.querySelector("#formMsg"),u=e.querySelector("#submitBtn"),m=e.querySelector("#togglePwd"),c=e.querySelector("#password");x(c,m),o.addEventListener("submit",async d=>{d.preventDefault(),y(t);const s={firstName:a(e,"#firstName"),lastName:a(e,"#lastName"),username:a(e,"#username"),email:a(e,"#email"),password:a(e,"#password")};if(!s.firstName||!s.lastName||!s.username||!s.email||!s.password)return l(t,"Veuillez remplir tous les champs.","error");if(s.password.length<6)return l(t,"Le mot de passe doit contenir au moins 6 caractères.","error");n(u,!0,"Création en cours…");let r="";try{r=await p(s.email,s.password),await f(r,s),l(t,"Compte créé avec succès. Vous pouvez vous connecter.","success"),setTimeout(()=>g("/connexion"),400)}catch(i){r&&await b(r),l(t,`Erreur : ${(i==null?void 0:i.message)??"échec de création"}`,"error")}finally{n(u,!1)}})};export{N as default};
